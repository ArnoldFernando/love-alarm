<?php

namespace App\Http\Resources\Api\V1;

use App\Support\AvatarHelper;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DiscoverUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'profile' => new PublicProfileResource($this->whenLoaded('profile')),
            'interests' => InterestResource::collection($this->whenLoaded('interests')),
            'photos' => ProfilePhotoResource::collection($this->photos),
        ];
    }
}
