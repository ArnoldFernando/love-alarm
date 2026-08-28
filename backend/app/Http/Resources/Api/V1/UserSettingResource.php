<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'love_alarm_enabled' => $this->love_alarm_enabled,
            'alarm_radius_meters' => $this->alarm_radius_meters,
            'notify_crush_nearby' => $this->notify_crush_nearby,
            'notify_mutual_crush_nearby' => $this->notify_mutual_crush_nearby,
            'notify_new_match' => $this->notify_new_match,
            'notify_messages' => $this->notify_messages,
            'background_detection_enabled' => $this->background_detection_enabled,
            'profile_visible' => $this->profile_visible,
            'show_online_status' => $this->show_online_status,
        ];
    }
}
