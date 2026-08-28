<?php

namespace App\Services;

use App\Models\MatchModel;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MatchService
{
    public function getUserMatches(User $user, int $perPage = 20): LengthAwarePaginator
    {
        return MatchModel::where(function ($q) use ($user) {
            $q->where('user_one_id', $user->id)
              ->orWhere('user_two_id', $user->id);
        })
            ->with(['userOne.profile', 'userTwo.profile', 'userOne.photos', 'userTwo.photos', 'conversation'])
            ->orderBy('matched_at', 'desc')
            ->paginate($perPage);
    }

    public function getMatch(User $user, string $matchId): ?MatchModel
    {
        $match = MatchModel::where('id', $matchId)
            ->with(['userOne.profile', 'userTwo.profile', 'conversation'])
            ->first();

        if (! $match) {
            return null;
        }

        if ($match->user_one_id !== $user->id && $match->user_two_id !== $user->id) {
            return null;
        }

        return $match;
    }

    public function getMatchBetweenUsers(string $userA, string $userB): ?MatchModel
    {
        return MatchModel::where(function ($q) use ($userA, $userB) {
            $q->where('user_one_id', $userA)->where('user_two_id', $userB);
        })
            ->orWhere(function ($q) use ($userA, $userB) {
                $q->where('user_one_id', $userB)->where('user_two_id', $userA);
            })
            ->first();
    }
}
