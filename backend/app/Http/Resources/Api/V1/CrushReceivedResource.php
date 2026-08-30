<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CrushReceivedResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'from_user' => new DiscoverUserResource($this->whenLoaded('fromUser')),
            'created_at' => $this->created_at,
        ];
    }
}