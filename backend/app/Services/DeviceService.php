<?php

namespace App\Services;

use App\Models\Device;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class DeviceService
{
    public function registerDevice(User $user, array $data): Device
    {
        $device = Device::updateOrCreate(
            [
                'user_id' => $user->id,
                'fcm_token' => $data['fcm_token'],
            ],
            [
                'platform' => $data['platform'],
                'device_model' => $data['device_model'] ?? null,
                'os_version' => $data['os_version'] ?? null,
                'app_version' => $data['app_version'] ?? null,
                'last_active_at' => now(),
            ]
        );

        return $device;
    }

    public function removeDevice(User $user, string $deviceId): bool
    {
        $device = Device::where('id', $deviceId)
            ->where('user_id', $user->id)
            ->first();

        if (! $device) {
            return false;
        }

        $device->delete();
        return true;
    }

    public function getUserDevices(User $user): Collection
    {
        return Device::where('user_id', $user->id)->get();
    }
}
