<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DiscoverService
{
    public function discover(User $user, array $filters = []): LengthAwarePaginator
    {
        $perPage = $filters['per_page'] ?? 20;

        // Users the current user has blocked or been blocked by
        $blockedIds = DB::table('blocks')
            ->where('user_id', $user->id)
            ->orWhere('blocked_user_id', $user->id)
            ->pluck('user_id', 'blocked_user_id')
            ->flatten()
            ->unique()
            ->values()
            ->all();

        $query = User::query()
            ->where('users.id', '!=', $user->id)
            ->where('users.account_status', 'active')
            ->where('users.email_verified_at', '!=', null)
            ->whereNotIn('users.id', $blockedIds)
            ->whereHas('settings', function (Builder $q) {
                $q->where('profile_visible', true);
            })
            ->whereHas('profile')
            ->with(['profile', 'interests', 'photos']);

        // Age range filter
        if (! empty($filters['min_age']) || ! empty($filters['max_age'])) {
            $query->whereHas('profile', function (Builder $q) use ($filters) {
                if (! empty($filters['min_age'])) {
                    $q->whereRaw('date_of_birth <= ?', [now()->subYears((int) $filters['min_age'])->format('Y-m-d')]);
                }
                if (! empty($filters['max_age'])) {
                    $q->whereRaw('date_of_birth >= ?', [now()->subYears((int) $filters['max_age'])->format('Y-m-d')]);
                }
            });
        }

        // Gender filter
        if (! empty($filters['gender'])) {
            $query->whereHas('profile', function (Builder $q) use ($filters) {
                $q->where('gender', $filters['gender']);
            });
        }

        // School filter
        if (! empty($filters['school'])) {
            $query->whereHas('profile', function (Builder $q) use ($filters) {
                $q->where('school', 'ILIKE', '%' . $filters['school'] . '%');
            });
        }

        // Course filter
        if (! empty($filters['course'])) {
            $query->whereHas('profile', function (Builder $q) use ($filters) {
                $q->where('course', 'ILIKE', '%' . $filters['course'] . '%');
            });
        }

        // Interests filter
        if (! empty($filters['interests']) && is_array($filters['interests'])) {
            $query->whereHas('interests', function (Builder $q) use ($filters) {
                $q->whereIn('interests.id', $filters['interests']);
            });
        }

        $crushesSentMap = $user->crushesSent()->pluck('id', 'to_user_id');

        $users = $query->paginate($perPage);

        Log::info('crushesSentMap', $crushesSentMap->toArray());
        Log::info('discover user ids', $users->pluck('id')->toArray());

        $users->getCollection()->transform(function ($u) use ($crushesSentMap) {
            $u->already_liked = $crushesSentMap->has($u->id);
            $u->crush_id = $crushesSentMap->get($u->id);
            return $u;
        });

        return $users;
    }
}
