<?php

namespace App\Services;

use Illuminate\Support\Str;
use App\Models\Conversation;
use App\Models\Crush;
use App\Models\MatchModel;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class CrushService
{
    public function createCrush(User $fromUser, string $toUserId): array
    {
        if ($fromUser->id === $toUserId) {
            return [
                'success' => false,
                'message' => 'You cannot like yourself.',
            ];
        }

        $toUser = User::where('id', $toUserId)
            ->where('account_status', 'active')
            ->first();

        if (! $toUser) {
            return [
                'success' => false,
                'message' => 'User not found or inactive.',
            ];
        }

        // Check if blocked
        $blocked = DB::table('blocks')
            ->where(function ($q) use ($fromUser, $toUserId) {
                $q->where('user_id', $fromUser->id)->where('blocked_user_id', $toUserId);
            })
            ->orWhere(function ($q) use ($fromUser, $toUserId) {
                $q->where('user_id', $toUserId)->where('blocked_user_id', $fromUser->id);
            })
            ->exists();

        if ($blocked) {
            return [
                'success' => false,
                'message' => 'Unable to like this user.',
            ];
        }

        $existingCrush = Crush::where('from_user_id', $fromUser->id)
            ->where('to_user_id', $toUserId)
            ->first();

        if ($existingCrush) {
            return [
                'success' => false,
                'message' => 'You have already liked this user.',
            ];
        }

        try {
            $result = DB::transaction(function () use ($fromUser, $toUser, $toUserId) {
                $crush = Crush::create([
                    'from_user_id' => $fromUser->id,
                    'to_user_id' => $toUserId,
                ]);

                // Check for mutual crush
                $reverseCrush = Crush::where('from_user_id', $toUserId)
                    ->where('to_user_id', $fromUser->id)
                    ->first();

                $match = null;
                $conversation = null;

                if ($reverseCrush) {
                    // Create match atomically
                    $match = MatchModel::firstOrCreate(
                        [
                            'user_one_id' => min($fromUser->id, $toUserId),
                            'user_two_id' => max($fromUser->id, $toUserId),
                        ],
                        ['matched_at' => now()]
                    );

                    // Create conversation if not exists
                    $conversation = Conversation::firstOrCreate(
                        ['match_id' => $match->id],
                        ['last_message_at' => null]
                    );

                    // Attach users to conversation
                    $conversation->users()->syncWithoutDetaching([
                        $fromUser->id => ['id' => (string) Str::uuid(), 'last_read_at' => null],
                        $toUserId => ['id' => (string) Str::uuid(), 'last_read_at' => null],
                    ]);

                    // Create notifications
                    Notification::create([
                        'user_id' => $fromUser->id,
                        'type' => 'match_created',
                        'title' => "It's a Match!",
                        'body' => 'You have a new match.',
                        'data' => ['match_id' => $match->id],
                    ]);

                    Notification::create([
                        'user_id' => $toUserId,
                        'type' => 'match_created',
                        'title' => "It's a Match!",
                        'body' => 'You have a new match.',
                        'data' => ['match_id' => $match->id],
                    ]);

                    AuditService::log(
                        'MATCH_CREATED',
                        MatchModel::class,
                        $match->id,
                        ['user_one_id' => $fromUser->id, 'user_two_id' => $toUserId]
                    );
                }

                return [
                    'crush' => $crush,
                    'match' => $match,
                    'conversation' => $conversation,
                ];
            });
        } catch (\Illuminate\Database\QueryException $e) {
            if (in_array($e->getCode(), ['23505', '25P02'])) {
                return [
                    'success' => false,
                    'message' => 'You have already liked this user.',
                ];
            }
            throw $e;
        }

        return [
            'success' => true,
            'message' => $result['match'] ? "It's a match!" : 'Crush created successfully.',
            'data' => [
                'crush' => $result['crush'],
                'match_created' => ! is_null($result['match']),
                'match' => $result['match'],
            ],
        ];
    }
    public function getUserCrushes(User $user): Collection
    {
        return Crush::where('from_user_id', $user->id)
            ->with('toUser.profile', 'toUser.photos')
            ->get();
    }

    public function getCrushesReceived(User $user): Collection
    {
        return Crush::where('to_user_id', $user->id)
            ->with('fromUser.profile', 'fromUser.photos')
            ->get();
    }
}
