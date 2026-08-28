<?php

namespace App\Services;

use App\Models\Block;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class BlockService
{
    public function blockUser(User $user, string $blockedUserId): array
    {
        if ($user->id === $blockedUserId) {
            return ['success' => false, 'message' => 'You cannot block yourself.'];
        }

        $blockedUser = User::where('id', $blockedUserId)
            ->where('account_status', 'active')
            ->first();

        if (! $blockedUser) {
            return ['success' => false, 'message' => 'User not found.'];
        }

        $existing = Block::where('user_id', $user->id)
            ->where('blocked_user_id', $blockedUserId)
            ->first();

        if ($existing) {
            return ['success' => false, 'message' => 'User is already blocked.'];
        }

        Block::create([
            'user_id' => $user->id,
            'blocked_user_id' => $blockedUserId,
        ]);

        return ['success' => true, 'message' => 'User blocked successfully.'];
    }

    public function unblockUser(User $user, string $blockId): bool
    {
        $block = Block::where('id', $blockId)
            ->where('user_id', $user->id)
            ->first();

        if (! $block) {
            return false;
        }

        $block->delete();
        return true;
    }

    public function getBlockedUsers(User $user): Collection
    {
        return Block::where('user_id', $user->id)
            ->with('blockedUser.profile', 'blockedUser.photos')
            ->get();
    }

    public function isBlocked(User $userA, User $userB): bool
    {
        return Block::where(function ($q) use ($userA, $userB) {
            $q->where('user_id', $userA->id)->where('blocked_user_id', $userB->id);
        })
            ->orWhere(function ($q) use ($userA, $userB) {
                $q->where('user_id', $userB->id)->where('blocked_user_id', $userA->id);
            })
            ->exists();
    }
}
