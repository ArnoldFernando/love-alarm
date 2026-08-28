<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        $admin = User::create([
            'id' => Str::uuid(),
            'email' => env('DEV_ADMIN_EMAIL', 'admin@lovealarm.dev'),
            'email_verified_at' => now(),
            'password' => Hash::make(env('DEV_ADMIN_PASSWORD', 'password')),
            'role' => 'admin',
            'account_status' => 'active',
        ]);
        Profile::create([
            'id' => Str::uuid(),
            'user_id' => $admin->id,
            'username' => 'admin',
            'display_name' => 'Administrator',
        ]);
        UserSetting::create(['user_id' => $admin->id]);

        // Moderator
        $moderator = User::create([
            'id' => Str::uuid(),
            'email' => env('DEV_MODERATOR_EMAIL', 'moderator@lovealarm.dev'),
            'email_verified_at' => now(),
            'password' => Hash::make(env('DEV_MODERATOR_PASSWORD', 'password')),
            'role' => 'moderator',
            'account_status' => 'active',
        ]);
        Profile::create([
            'id' => Str::uuid(),
            'user_id' => $moderator->id,
            'username' => 'moderator',
            'display_name' => 'Moderator',
        ]);
        UserSetting::create(['user_id' => $moderator->id]);

        // Test user
        $user = User::create([
            'id' => Str::uuid(),
            'email' => env('DEV_USER_EMAIL', 'user@lovealarm.dev'),
            'email_verified_at' => now(),
            'password' => Hash::make(env('DEV_USER_PASSWORD', 'password')),
            'role' => 'user',
            'account_status' => 'active',
        ]);
        Profile::create([
            'id' => Str::uuid(),
            'user_id' => $user->id,
            'username' => 'testuser',
            'display_name' => 'Test User',
        ]);
        UserSetting::create(['user_id' => $user->id]);

        // Random users
        User::factory()
            ->count(20)
            ->has(Profile::factory())
            ->has(UserSetting::factory())
            ->create();
    }
}
