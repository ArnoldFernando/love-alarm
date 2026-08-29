<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Database\Seeder;

class UserSettingSeeder extends Seeder
{
    public function run(): void
    {
        $usersWithoutSettings = User::whereDoesntHave('settings')->get();

        foreach ($usersWithoutSettings as $user) {
            UserSetting::create([
                'user_id' => $user->id,
                'profile_visible' => true,
            ]);
        }

        $this->command->info("Created settings for {$usersWithoutSettings->count()} users.");
    }
}
