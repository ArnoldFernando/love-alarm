<?php

namespace Database\Seeders;

use App\Models\Interest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class InterestSeeder extends Seeder
{
    public function run(): void
    {
        $interests = [
            'Music', 'Movies', 'Reading', 'Gaming', 'Travel',
            'Photography', 'Cooking', 'Fitness', 'Art', 'Technology',
            'Sports', 'Dancing', 'Writing', 'Hiking', 'Yoga',
            'Fashion', 'Science', 'Politics', 'Anime', 'K-pop',
        ];

        foreach ($interests as $name) {
            Interest::firstOrCreate(
                ['slug' => Str::slug($name)],
                ['id' => Str::uuid(), 'name' => $name]
            );
        }
    }
}
