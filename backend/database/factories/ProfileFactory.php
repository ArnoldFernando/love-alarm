<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProfileFactory extends Factory
{
    protected $model = Profile::class;

    public function definition(): array
    {
        return [
            'id' => Str::uuid(),
            'user_id' => User::factory(),
            'username' => fake()->unique()->userName(),
            'display_name' => fake()->name(),
            'date_of_birth' => fake()->dateTimeBetween('-30 years', '-18 years')->format('Y-m-d'),
            'gender' => fake()->randomElement(['male', 'female', 'non_binary', 'prefer_not_to_say']),
            'bio' => fake()->optional()->sentence(),
            'school' => fake()->optional()->company() . ' University',
            'course' => fake()->optional()->jobTitle(),
            'year_level' => fake()->optional()->randomElement(['1st', '2nd', '3rd', '4th', '5th']),
        ];
    }
}
