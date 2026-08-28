<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        App\Models\User::class => App\Policies\UserPolicy::class,
        App\Models\Profile::class => App\Policies\ProfilePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
