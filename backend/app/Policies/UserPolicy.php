<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isModerator();
    }

    public function view(User $user, User $model): bool
    {
        return $user->isModerator() || $user->id === $model->id;
    }

    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id;
    }

    public function delete(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->isAdmin();
    }

    public function suspend(User $user): bool
    {
        return $user->isAdmin();
    }

    public function ban(User $user): bool
    {
        return $user->isAdmin();
    }
}
