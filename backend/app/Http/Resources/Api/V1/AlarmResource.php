<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlarmResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'status' => $this->status,
            'triggered_by_user' => $this->whenLoaded('triggeredBy', function () {
                return [
                    'id' => $this->triggeredBy->id,
                    'display_name' => $this->triggeredBy->profile?->display_name,
                    'username' => $this->triggeredBy->profile?->username,
                ];
            }),
            'triggered_at' => $this->triggered_at,
            'acknowledged_at' => $this->acknowledged_at,
            'expires_at' => $this->expires_at,
            'created_at' => $this->created_at,
        ];
    }
}
