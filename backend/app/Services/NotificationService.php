<?php

namespace App\Services;

use App\Models\Device;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Log;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Exception\MessagingException;
use Kreait\Firebase\Messaging\CloudMessage;

class NotificationService
{
    public function __construct(private ?Messaging $messaging = null)
    {
    }

    public function createInAppNotification(
        string $userId,
        string $type,
        string $title,
        string $body,
        ?array $data = null
    ): Notification {
        $notification = Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'sent_at' => now(),
        ]);

        $this->sendPushNotification($userId, $title, $body, $data ?? []);

        return $notification;
    }

    public function sendPushNotification(string $userId, string $title, string $body, array $data = []): void
    {
        if (! $this->messaging) {
            try {
                $this->messaging = app(Messaging::class);
            } catch (\Throwable $e) {
                Log::warning('Firebase Messaging not configured', ['error' => $e->getMessage()]);
                return;
            }
        }

        $devices = Device::where('user_id', $userId)->get();

        if ($devices->isEmpty()) {
            return;
        }

        foreach ($devices as $device) {
            $message = CloudMessage::withTarget('token', $device->fcm_token)
                ->withNotification([
                    'title' => $title,
                    'body' => $body,
                ])
                ->withData($this->sanitizeData($data));

            try {
                $this->messaging->send($message);
                $device->update(['last_active_at' => now()]);
            } catch (MessagingException $e) {
                Log::error('FCM send failed', [
                    'token' => substr($device->fcm_token, 0, 20) . '...',
                    'error' => $e->getMessage(),
                ]);

                // Remove invalid tokens
                if (str_contains($e->getMessage(), 'registration-token-not-registered') ||
                    str_contains($e->getMessage(), 'invalid-registration-token')) {
                    $device->delete();
                }
            }
        }
    }

    public function getUserNotifications(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function markAsRead(User $user, string $notificationId): bool
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $user->id)
            ->first();

        if (! $notification) {
            return false;
        }

        $notification->markAsRead();
        return true;
    }

    public function markAllAsRead(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();
    }

    public function deleteNotification(User $user, string $notificationId): bool
    {
        $notification = Notification::where('id', $notificationId)
            ->where('user_id', $user->id)
            ->first();

        if (! $notification) {
            return false;
        }

        $notification->delete();
        return true;
    }

    private function sanitizeData(array $data): array
    {
        return collect($data)->mapWithKeys(function ($value, $key) {
            return [(string) $key => is_array($value) ? json_encode($value) : (string) $value];
        })->all();
    }
}
