<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'username' => $this->username,
            'display_name' => $this->display_name,
            'age' => $this->age,
            'gender' => $this->gender,
            'bio' => $this->bio,
            'school' => $this->school,
            'course' => $this->course,
            'year_level' => $this->year_level,
        ];
    }
}
