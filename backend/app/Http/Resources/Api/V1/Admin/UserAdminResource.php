<?php

namespace App\Http\Resources\Api\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserAdminResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'role' => $this->role,
            'account_status' => $this->account_status,
            'email_verified_at' => $this->email_verified_at,
            'suspended_until' => $this->suspended_until,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'profile' => $this->whenLoaded('profile', function () {
                return [
                    'username' => $this->profile->username,
                    'display_name' => $this->profile->display_name,
                    'age' => $this->profile->age,
                    'gender' => $this->profile->gender,
                    'school' => $this->profile->school,
                ];
            }),
            'settings' => $this->whenLoaded('settings', function () {
                return [
                    'love_alarm_enabled' => $this->settings->love_alarm_enabled,
                    'profile_visible' => $this->settings->profile_visible,
                ];
            }),
            'photos_count' => $this->whenLoaded('photos', fn () => $this->photos->count()),
        ];
    }
}
