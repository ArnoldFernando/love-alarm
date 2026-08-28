<?php

namespace Database\Factories;

use App\Models\Interest;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class InterestFactory extends Factory
{
    protected $model = Interest::class;

    public function definition(): array
    {
        $name = fake()->unique()->word();
        return [
            'id' => Str::uuid(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
        ];
    }
}
