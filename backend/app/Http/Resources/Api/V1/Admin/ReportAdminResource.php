<?php

namespace App\Http\Resources\Api\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReportAdminResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reason' => $this->reason,
            'description' => $this->description,
            'status' => $this->status,
            'reporter' => $this->whenLoaded('reporter', function () {
                return [
                    'id' => $this->reporter->id,
                    'display_name' => $this->reporter->profile?->display_name,
                    'username' => $this->reporter->profile?->username,
                ];
            }),
            'reported_user' => $this->whenLoaded('reportedUser', function () {
                return [
                    'id' => $this->reportedUser->id,
                    'display_name' => $this->reportedUser->profile?->display_name,
                    'username' => $this->reportedUser->profile?->username,
                ];
            }),
            'reviewer' => $this->whenLoaded('reviewer', function () {
                return [
                    'id' => $this->reviewer->id,
                    'display_name' => $this->reviewer->profile?->display_name,
                ];
            }),
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
