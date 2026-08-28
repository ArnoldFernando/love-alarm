<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'username' => $this->username,
            'display_name' => $this->display_name,
            'age' => $this->age,
            'gender' => $this->gender,
            'bio' => $this->bio,
            'school' => $this->school,
            'course' => $this->course,
            'year_level' => $this->year_level,
            'photos' => ProfilePhotoResource::collection($this->whenLoaded('photos')),
            'interests' => InterestResource::collection($this->whenLoaded('interests')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
