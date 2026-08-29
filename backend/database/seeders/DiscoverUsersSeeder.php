<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DiscoverUsersSeeder extends Seeder
{
    public function run(): void
    {
        $schools = ['CSU Lucena', 'Manuel S. Enverga University', 'Southern Luzon State University'];
        $courses = ['BSIT', 'BSCS', 'BSN', 'BSBA', 'BSED'];
        $yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

        $names = [
            ['Alex Rivera', 'male'],
            ['Jamie Cruz', 'female'],
            ['Taylor Santos', 'male'],
            ['Morgan Reyes', 'female'],
            ['Jordan Dela Cruz', 'male'],
            ['Casey Bautista', 'female'],
            ['Riley Garcia', 'male'],
            ['Skyler Ramos', 'female'],
            ['Avery Torres', 'male'],
            ['Peyton Flores', 'female'],
            ['Charlie Mendoza', 'male'],
            ['Drew Aquino', 'female'],
            ['Rowan Villanueva', 'male'],
            ['Sam Castillo', 'female'],
            ['Kai Navarro', 'male'],
        ];

        foreach ($names as [$name, $gender]) {
            $username = Str::slug($name, '') . rand(100, 999);
            $email = strtolower(str_replace(' ', '.', $name)) . '@example.com';

            $user = User::create([
                'email' => $email,
                'password' => Hash::make('password123'),
                'role' => 'user',
                'account_status' => 'active',
                'email_verified_at' => now(),
            ]);

            Profile::create([
                'user_id' => $user->id,
                'username' => $username,
                'display_name' => $name,
                'date_of_birth' => now()->subYears(rand(18, 28))->subDays(rand(0, 365)),
                'gender' => $gender,
                'bio' => fake()->sentence(8),
                'school' => $schools[array_rand($schools)],
                'course' => $courses[array_rand($courses)],
                'year_level' => $yearLevels[array_rand($yearLevels)],
            ]);
        }

        $this->command->info('Seeded ' . count($names) . ' discover-ready users.');
    }
}
