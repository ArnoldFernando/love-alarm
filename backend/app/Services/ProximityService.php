<?php

namespace App\Services;

use App\Models\Alarm;
use App\Models\Notification;
use App\Models\Crush;
use App\Models\ProximityEvent;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class ProximityService
{
    private const REDIS_PREFIX = 'proximity:';
    private const COOLDOWN_PREFIX = 'alarm:cooldown:';

    public function updateLocation(User $user, float $latitude, float $longitude, ?float $accuracy = null): void
    {
        $settings = $user->settings;

        if (! $settings || ! $settings->love_alarm_enabled) {
            return;
        }

        // Store temporary location in Redis with TTL
        $ttlSeconds = (int) config('app.location_retention_minutes', 30) * 60;
        $key = self::REDIS_PREFIX . $user->id;
        $locationData = json_encode([
            'lat' => $latitude,
            'lng' => $longitude,
            'accuracy' => $accuracy,
            'timestamp' => now()->toIso8601String(),
        ]);

        Redis::setex($key, $ttlSeconds, $locationData);

        // Store approximate event in database for analytics (without exact coordinates)
        ProximityEvent::create([
            'user_id' => $user->id,
            'location' => DB::raw("ST_SetSRID(ST_MakePoint({$longitude}, {$latitude}), 4326)"),
            'accuracy' => $accuracy,
            'event_type' => 'update',
            'recorded_at' => now(),
        ]);
    }

    public function checkProximity(User $user, float $latitude, float $longitude, ?float $accuracy = null): array
    {
        $settings = $user->settings;

        if (! $settings || ! $settings->love_alarm_enabled) {
            return ['proximity_enabled' => false, 'alarms' => []];
        }

        $radius = $settings->alarm_radius_meters ?? config('app.alarm_radius_meters', 10);

        // Get users the current user has crushes on
        $crushIds = Crush::where('from_user_id', $user->id)
            ->pluck('to_user_id')
            ->all();

        if (empty($crushIds)) {
            return ['proximity_enabled' => true, 'alarms' => []];
        }

        // Get blocked user IDs
        $blockedIds = $this->getBlockedUserIds($user);
        $eligibleIds = array_diff($crushIds, $blockedIds);

        if (empty($eligibleIds)) {
            return ['proximity_enabled' => true, 'alarms' => []];
        }

        // Find nearby users using Redis first (fast path)
        $nearbyUsers = $this->findNearbyUsersFromRedis($eligibleIds, $latitude, $longitude, $radius);

        // If Redis doesn't have data, fall back to recent database events
        if (empty($nearbyUsers)) {
            $nearbyUsers = $this->findNearbyUsersFromDatabase($eligibleIds, $latitude, $longitude, $radius);
        }

        $alarms = [];
        foreach ($nearbyUsers as $nearby) {
            $alarmResult = $this->triggerAlarmIfNeeded($user, $nearby);
            if ($alarmResult) {
                $alarms[] = $alarmResult;
            }
        }

        return [
            'proximity_enabled' => true,
            'radius_meters' => $radius,
            'alarms' => $alarms,
        ];
    }

    private function findNearbyUsersFromRedis(array $userIds, float $lat, float $lng, float $radius): array
    {
        $nearby = [];

        foreach ($userIds as $targetId) {
            $data = Redis::get(self::REDIS_PREFIX . $targetId);
            if (! $data) {
                continue;
            }

            $location = json_decode($data, true);
            $distance = $this->haversineDistance($lat, $lng, $location['lat'], $location['lng']);

            if ($distance <= $radius) {
                $nearby[] = [
                    'user_id' => $targetId,
                    'distance' => $distance,
                    'accuracy' => $location['accuracy'] ?? null,
                ];
            }
        }

        return $nearby;
    }

    private function findNearbyUsersFromDatabase(array $userIds, float $lat, float $lng, float $radius): array
    {
        $recentWindow = now()->subMinutes((int) config('app.location_retention_minutes', 30));

        $results = ProximityEvent::whereIn('user_id', $userIds)
            ->where('recorded_at', '>=', $recentWindow)
            ->whereNotNull('location')
            ->select(
                'user_id',
                'accuracy',
                DB::raw("ST_DistanceSphere(location, ST_SetSRID(ST_MakePoint({$lng}, {$lat}), 4326)) as distance")
            )
            ->orderBy('recorded_at', 'desc')
            ->get()
            ->unique('user_id');

        $nearby = [];
        foreach ($results as $row) {
            if ($row->distance <= $radius) {
                $nearby[] = [
                    'user_id' => $row->user_id,
                    'distance' => (float) $row->distance,
                    'accuracy' => $row->accuracy,
                ];
            }
        }

        return $nearby;
    }

    private function triggerAlarmIfNeeded(User $user, array $nearby): ?array
    {
        $targetId = $nearby['user_id'];
        $distance = $nearby['distance'];

        // Check cooldown
        if ($this->isOnCooldown($user->id, $targetId)) {
            return null;
        }

        // Check mutual crush
        $isMutual = Crush::where('from_user_id', $targetId)
            ->where('to_user_id', $user->id)
            ->exists();

        $alarmType = $isMutual ? 'mutual_crush_nearby' : 'crush_nearby';

        // Verify target user settings
        $targetUser = User::with('settings')->find($targetId);
        if (! $targetUser || ! $targetUser->isActive()) {
            return null;
        }

        $targetSettings = $targetUser->settings;
        if (! $targetSettings || ! $targetSettings->love_alarm_enabled) {
            return null;
        }

        // Create alarm
        $alarm = Alarm::create([
            'user_id' => $user->id,
            'triggered_by_user_id' => $targetId,
            'type' => $alarmType,
            'status' => 'detected',
            'triggered_at' => now(),
            'expires_at' => now()->addHours(24),
        ]);

        // Set cooldown
        $this->setCooldown($user->id, $targetId);

        // Dispatch notification job
        dispatch(function () use ($user, $alarm, $alarmType, $targetId) {
            $title = $alarmType === 'mutual_crush_nearby'
                ? 'Mutual crush nearby!'
                : 'Someone you like is nearby.';

            Notification::create([
                'user_id' => $user->id,
                'type' => $alarmType,
                'title' => $title,
                'body' => '&#9829; ' . $title,
                'data' => ['alarm_id' => $alarm->id, 'triggered_by' => $targetId],
            ]);
        })->afterCommit();

        return [
            'alarm_id' => $alarm->id,
            'type' => $alarmType,
            'distance_meters' => round($distance, 1),
        ];
    }

    private function isOnCooldown(string $userA, string $userB): bool
    {
        $key = $this->getCooldownKey($userA, $userB);
        return (bool) Redis::exists($key);
    }

    private function setCooldown(string $userA, string $userB): void
    {
        $minutes = (int) config('app.alarm_cooldown_minutes', 10);
        $key = $this->getCooldownKey($userA, $userB);
        Redis::setex($key, $minutes * 60, '1');
    }

    private function getCooldownKey(string $userA, string $userB): string
    {
        $pair = [strtolower($userA), strtolower($userB)];
        sort($pair);
        return self::COOLDOWN_PREFIX . implode(':', $pair);
    }

    private function getBlockedUserIds(User $user): array
    {
        return DB::table('blocks')
            ->where('user_id', $user->id)
            ->orWhere('blocked_user_id', $user->id)
            ->pluck('user_id')
            ->merge(
                DB::table('blocks')
                    ->where('user_id', $user->id)
                    ->orWhere('blocked_user_id', $user->id)
                    ->pluck('blocked_user_id')
            )
            ->unique()
            ->values()
            ->all();
    }

    private function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // meters

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    public function cleanupExpiredLocations(): int
    {
        $keys = Redis::keys(self::REDIS_PREFIX . '*');
        $deleted = 0;

        foreach ($keys as $key) {
            if (! Redis::ttl($key)) {
                Redis::del($key);
                $deleted++;
            }
        }

        return $deleted;
    }


    public function radarScan(User $user, float $latitude, float $longitude, float $radius = 30): array
    {
        $blockedIds = $this->getBlockedUserIds($user);

        $candidateKeys = Redis::keys(self::REDIS_PREFIX . '*');
        $nearby = [];

        $redisKeyPrefix = config('database.redis.options.prefix', '');

        foreach ($candidateKeys as $key) {
            $targetId = str_replace($redisKeyPrefix . self::REDIS_PREFIX, '', $key);

            if ($targetId === $user->id || in_array($targetId, $blockedIds)) {
                continue;
            }

            $data = Redis::get(self::REDIS_PREFIX . $targetId);
            if (! $data) {
                continue;
            }

            $location = json_decode($data, true);
            $distance = $this->haversineDistance($latitude, $longitude, $location['lat'], $location['lng']);

            if ($distance > $radius) {
                continue;
            }

            $targetUser = User::with(['settings', 'profile'])->find($targetId);
            if (! $targetUser || ! $targetUser->isActive()) {
                continue;
            }

            $settings = $targetUser->settings;
            if (! $settings || ! $settings->profile_visible || ! $settings->show_online_status) {
                continue;
            }

            $nearby[] = [
                'user_id' => $targetUser->id,
                'display_name' => $targetUser->profile->display_name ?? 'Someone',
                'distance_meters' => round($distance, 1),
            ];
        }

        usort($nearby, fn($a, $b) => $a['distance_meters'] <=> $b['distance_meters']);

        return $nearby;
    }
}
