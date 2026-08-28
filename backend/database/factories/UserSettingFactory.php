<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class UserSettingFactory extends Factory
{
    protected $model = UserSetting::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid(),
            'user_id' => User::factory(),
            'love_alarm_enabled' => true,
            'alarm_radius_meters' => fake()->randomElement([5, 10, 20, 50]),
            'notify_crush_nearby' => true,
            'notify_mutual_crush_nearby' => true,
            'notify_new_match' => true,
            'notify_messages' => true,
            'background_detection_enabled' => true,
            'profile_visible' => true,
            'show_online_status' => true,
        ];
    }
}
