<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeviceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'platform' => $this->platform,
            'device_model' => $this->device_model,
            'os_version' => $this->os_version,
            'app_version' => $this->app_version,
            'last_active_at' => $this->last_active_at,
            'created_at' => $this->created_at,
        ];
    }
}
