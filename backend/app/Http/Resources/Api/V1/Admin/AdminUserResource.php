<?php

namespace App\Http\Resources\Api\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'role' => $this->role,
            'account_status' => $this->account_status,
            'suspended_until' => $this->suspended_until,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'profile' => $this->whenLoaded('profile', function () {
                return [
                    'username' => $this->profile->username,
                    'display_name' => $this->profile->display_name,
                    'age' => $this->profile->age,
                    'school' => $this->profile->school,
                ];
            }),
            'stats' => [
                'crushes_sent' => $this->whenCounted('crushesSent'),
                'matches' => $this->whenCounted('matches'),
                'reports_received' => $this->whenCounted('reportsReceived'),
            ],
        ];
    }
}
