<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $authId = $request->user()->id;
        $otherUser = $this->users->first(fn ($u) => $u->id !== $authId);

        $lastMessage = $this->messages->first();

        return [
            'id' => $this->id,
            'match_id' => $this->match_id,
            'other_user' => $otherUser ? new DiscoverUserResource($otherUser) : null,
            'last_message' => $lastMessage ? new MessageResource($lastMessage) : null,
            'last_message_at' => $this->last_message_at,
            'unread_count' => $this->messages
                ->where('sender_id', '!=', $authId)
                ->whereNull('read_at')
                ->count(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
