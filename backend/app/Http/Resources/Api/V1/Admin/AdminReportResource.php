<?php

namespace App\Http\Resources\Api\V1\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reason' => $this->reason,
            'description' => $this->description,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'reporter' => [
                'id' => $this->reporter?->id,
                'display_name' => $this->reporter?->profile?->display_name,
            ],
            'reported_user' => [
                'id' => $this->reportedUser?->id,
                'display_name' => $this->reportedUser?->profile?->display_name,
                'account_status' => $this->reportedUser?->account_status,
            ],
            'reviewer' => $this->when($this->reviewer, [
                'id' => $this->reviewer?->id,
                'display_name' => $this->reviewer?->profile?->display_name,
            ]),
            'reviewed_at' => $this->reviewed_at,
        ];
    }
}
