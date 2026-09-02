<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AdminService
{
    public function getDashboardStats(): array
    {
        $now = now();
        $today = $now->copy()->startOfDay();
        $weekAgo = $now->copy()->subWeek();

        return [
            'users' => [
                'total' => User::count(),
                'active' => User::where('account_status', 'active')->count(),
                'new_today' => User::where('created_at', '>=', $today)->count(),
                'new_this_week' => User::where('created_at', '>=', $weekAgo)->count(),
                'suspended' => User::where('account_status', 'suspended')->count(),
                'banned' => User::where('account_status', 'banned')->count(),
            ],
            'matches' => [
                'total' => DB::table('matches')->count(),
                'today' => DB::table('matches')->where('matched_at', '>=', $today)->count(),
                'this_week' => DB::table('matches')->where('matched_at', '>=', $weekAgo)->count(),
            ],
            'crushes' => [
                'total' => DB::table('crushes')->count(),
                'today' => DB::table('crushes')->where('created_at', '>=', $today)->count(),
            ],
            'alarms' => [
                'total' => DB::table('alarms')->count(),
                'today' => DB::table('alarms')->where('triggered_at', '>=', $today)->count(),
            ],
            'reports' => [
                'total' => DB::table('reports')->count(),
                'pending' => DB::table('reports')->where('status', 'pending')->count(),
                'under_review' => DB::table('reports')->where('status', 'under_review')->count(),
                'resolved' => DB::table('reports')->where('status', 'resolved')->count(),
            ],
            'online_users' => DB::table('sessions')
                ->where('last_activity', '>=', now()->subMinutes(5)->getTimestamp())
                ->distinct('user_id')
                ->count('user_id') ?? 0,
        ];
    }

    public function getUsers(array $filters = []): LengthAwarePaginator
    {
        $query = User::with('profile')
            ->orderBy('created_at', 'desc');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('email', 'ILIKE', "%{$search}%")
                    ->orWhereHas('profile', function ($pq) use ($search) {
                        $pq->where('username', 'ILIKE', "%{$search}%")
                            ->orWhere('display_name', 'ILIKE', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (! empty($filters['status'])) {
            $query->where('account_status', $filters['status']);
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function getUserDetail(string $userId): ?User
    {
        return User::with(['profile', 'profile.photos', 'settings', 'auditLogs'])
            ->find($userId);
    }

    public function suspendUser(User $admin, string $userId, ?string $reason = null): array
    {
        $user = User::find($userId);

        if (! $user) {
            return ['success' => false, 'message' => 'User not found.'];
        }

        if ($user->role === 'admin') {
            return ['success' => false, 'message' => 'Cannot suspend admin users.'];
        }

        $user->update([
            'account_status' => 'suspended',
            'suspended_until' => now()->addDays(30),
        ]);

        AuditService::log(
            'USER_SUSPENDED',
            User::class,
            $user->id,
            ['reason' => $reason, 'suspended_by' => $admin->id],
            null,
            $admin->id
        );

        return ['success' => true, 'message' => 'User suspended.'];
    }

    public function banUser(User $admin, string $userId, ?string $reason = null): array
    {
        $user = User::find($userId);

        if (! $user) {
            return ['success' => false, 'message' => 'User not found.'];
        }

        if ($user->role === 'admin') {
            return ['success' => false, 'message' => 'Cannot ban admin users.'];
        }

        $user->update([
            'account_status' => 'banned',
            'suspended_until' => null,
        ]);

        // Revoke all tokens
        $user->tokens()->delete();

        AuditService::log(
            'USER_BANNED',
            User::class,
            $user->id,
            ['reason' => $reason, 'banned_by' => $admin->id],
            null,
            $admin->id
        );

        return ['success' => true, 'message' => 'User banned.'];
    }

    public function reactivateUser(User $admin, string $userId): array
    {
        $user = User::find($userId);

        if (! $user) {
            return ['success' => false, 'message' => 'User not found.'];
        }

        $user->update([
            'account_status' => 'active',
            'suspended_until' => null,
        ]);

        AuditService::log(
            'USER_REACTIVATED',
            User::class,
            $user->id,
            ['reactivated_by' => $admin->id],
            null,
            $admin->id
        );

        return ['success' => true, 'message' => 'User reactivated.'];
    }

    public function getAnalytics(string $period = '30d'): array
    {
        $days = match ($period) {
            '7d' => 7,
            '90d' => 90,
            default => 30,
        };

        $startDate = now()->subDays($days)->startOfDay();

        $userGrowth = DB::table('users')
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', $startDate)
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        $dailyActive = DB::table('sessions')
            ->selectRaw('DATE(FROM_UNIXTIME(last_activity)) as date, COUNT(DISTINCT user_id) as count')
            ->where('last_activity', '>=', $startDate->getTimestamp())
            ->groupByRaw('DATE(FROM_UNIXTIME(last_activity))')
            ->orderBy('date')
            ->get();

        $matchesPerDay = DB::table('matches')
            ->selectRaw('DATE(matched_at) as date, COUNT(*) as count')
            ->where('matched_at', '>=', $startDate)
            ->groupByRaw('DATE(matched_at)')
            ->orderBy('date')
            ->get();

        $alarmsPerDay = DB::table('alarms')
            ->selectRaw('DATE(triggered_at) as date, COUNT(*) as count')
            ->where('triggered_at', '>=', $startDate)
            ->groupByRaw('DATE(triggered_at)')
            ->orderBy('date')
            ->get();

        $reportsPerDay = DB::table('reports')
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', $startDate)
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        return [
            'period' => $period,
            'user_growth' => $userGrowth,
            'daily_active_users' => $dailyActive,
            'matches_per_day' => $matchesPerDay,
            'alarms_per_day' => $alarmsPerDay,
            'reports_per_day' => $reportsPerDay,
        ];
    }

    public function getAuditLogs(array $filters = []): LengthAwarePaginator
    {
        $query = AuditLog::with('actor')
            ->orderBy('created_at', 'desc');

        if (! empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (! empty($filters['actor_id'])) {
            $query->where('actor_id', $filters['actor_id']);
        }

        return $query->paginate($filters['per_page'] ?? 50);
    }

    public function getMatches(array $filters = []): LengthAwarePaginator
    {
        $query = DB::table('matches')
            ->join('users as user1', 'matches.user_one_id', '=', 'user1.id')
            ->join('users as user2', 'matches.user_two_id', '=', 'user2.id')
            ->leftJoin('profiles as profile1', 'user1.id', '=', 'profile1.user_id')
            ->leftJoin('profiles as profile2', 'user2.id', '=', 'profile2.user_id')
            ->select(
                'matches.id',
                'matches.user_one_id as user1_id',
                'matches.user_two_id as user2_id',
                'matches.matched_at',
                DB::raw('true as chat_enabled'),
                'user1.email as user1_email',
                'user2.email as user2_email',
                'profile1.display_name as user1_display_name',
                'profile1.username as user1_username',
                'profile2.display_name as user2_display_name',
                'profile2.username as user2_username'
            )
            ->orderBy('matches.matched_at', 'desc');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('user1.email', 'ILIKE', "%{$search}%")
                    ->orWhere('user2.email', 'ILIKE', "%{$search}%")
                    ->orWhere('profile1.username', 'ILIKE', "%{$search}%")
                    ->orWhere('profile2.username', 'ILIKE', "%{$search}%")
                    ->orWhere('profile1.display_name', 'ILIKE', "%{$search}%")
                    ->orWhere('profile2.display_name', 'ILIKE', "%{$search}%");
            });
        }

        $matches = $query->paginate($filters['per_page'] ?? 20);

        // Transform the data to match frontend expectations
        $matches->getCollection()->transform(function ($match) {
            return [
                'id' => $match->id,
                'user1_id' => $match->user1_id,
                'user2_id' => $match->user2_id,
                'matched_at' => $match->matched_at,
                'chat_enabled' => $match->chat_enabled,
                'user1' => [
                    'email' => $match->user1_email,
                    'profile' => [
                        'display_name' => $match->user1_display_name,
                        'username' => $match->user1_username,
                    ],
                ],
                'user2' => [
                    'email' => $match->user2_email,
                    'profile' => [
                        'display_name' => $match->user2_display_name,
                        'username' => $match->user2_username,
                    ],
                ],
            ];
        });

        return $matches;
    }

    public function getAlarms(array $filters = []): LengthAwarePaginator
    {
        $query = DB::table('alarms')
            ->join('users as sender', 'alarms.triggered_by_user_id', '=', 'sender.id')
            ->join('users as recipient', 'alarms.user_id', '=', 'recipient.id')
            ->leftJoin('profiles as sender_profile', 'sender.id', '=', 'sender_profile.user_id')
            ->leftJoin('profiles as recipient_profile', 'recipient.id', '=', 'recipient_profile.user_id')
            ->select(
                'alarms.id',
                'alarms.triggered_by_user_id as sender_id',
                'alarms.user_id as recipient_id',
                'alarms.triggered_at',
                DB::raw('NULL as distance_meters'),
                'sender.email as sender_email',
                'recipient.email as recipient_email',
                'sender_profile.display_name as sender_display_name',
                'sender_profile.username as sender_username',
                'recipient_profile.display_name as recipient_display_name',
                'recipient_profile.username as recipient_username'
            )
            ->orderBy('alarms.triggered_at', 'desc');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('sender.email', 'ILIKE', "%{$search}%")
                    ->orWhere('recipient.email', 'ILIKE', "%{$search}%")
                    ->orWhere('sender_profile.username', 'ILIKE', "%{$search}%")
                    ->orWhere('recipient_profile.username', 'ILIKE', "%{$search}%")
                    ->orWhere('sender_profile.display_name', 'ILIKE', "%{$search}%")
                    ->orWhere('recipient_profile.display_name', 'ILIKE', "%{$search}%");
            });
        }

        $alarms = $query->paginate($filters['per_page'] ?? 20);

        // Transform the data to match frontend expectations
        $alarms->getCollection()->transform(function ($alarm) {
            return [
                'id' => $alarm->id,
                'sender_id' => $alarm->sender_id,
                'recipient_id' => $alarm->recipient_id,
                'triggered_at' => $alarm->triggered_at,
                'distance_meters' => $alarm->distance_meters,
                'sender' => [
                    'email' => $alarm->sender_email,
                    'profile' => [
                        'display_name' => $alarm->sender_display_name,
                        'username' => $alarm->sender_username,
                    ],
                ],
                'recipient' => [
                    'email' => $alarm->recipient_email,
                    'profile' => [
                        'display_name' => $alarm->recipient_display_name,
                        'username' => $alarm->recipient_username,
                    ],
                ],
            ];
        });

        return $alarms;
    }

    public function getSettings(): array
    {
        // Return default settings or from a settings table/cache
        // For now, return hardcoded defaults
        return [
            'alarm_radius_meters' => 1000,
            'alarm_cooldown_seconds' => 300,
            'max_active_alarms_per_user' => 100,
            'proximity_check_interval_seconds' => 60,
            'max_distance_km' => 100,
        ];
    }

    public function updateSettings(array $settings): array
    {
        // Here you would save settings to database/cache
        // For now, just return success
        // In production, you might want to store these in a settings table or config cache

        // Example: Store in cache
        cache()->put('admin_settings', $settings, now()->addYears(1));

        return ['success' => true, 'message' => 'Settings updated successfully'];
    }
}
