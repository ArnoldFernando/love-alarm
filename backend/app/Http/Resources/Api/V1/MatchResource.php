<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $authId = $request->user()->id;
        $otherUser = $this->user_one_id === $authId ? $this->userTwo : $this->userOne;

        return [
            'id' => $this->id,
            'matched_at' => $this->matched_at,
            'matched_user' => new DiscoverUserResource($otherUser),
            'conversation_id' => $this->conversation?->id,
            'created_at' => $this->created_at,
        ];
    }
}
