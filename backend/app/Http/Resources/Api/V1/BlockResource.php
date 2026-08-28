<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlockResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'blocked_user' => new DiscoverUserResource($this->whenLoaded('blockedUser')),
            'created_at' => $this->created_at,
        ];
    }
}
