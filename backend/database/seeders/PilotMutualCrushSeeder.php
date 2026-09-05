<?php

namespace Database\Seeders;

use App\Models\Conversation;
use App\Models\Crush;
use App\Models\MatchModel;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class PilotMutualCrushSeeder extends Seeder
{
    public function run(): void
    {
        // Create (or reuse) two dedicated test accounts so this is repeatable
        $userA = User::firstOrCreate(
            ['email' => 'pilot.a@lovealarm.dev'],
            [
                'id' => Str::uuid(),
                'password' => Hash::make('password123'),
                'role' => 'user',
                'account_status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $userB = User::firstOrCreate(
            ['email' => 'pilot.b@lovealarm.dev'],
            [
                'id' => Str::uuid(),
                'password' => Hash::make('password123'),
                'role' => 'user',
                'account_status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        Profile::firstOrCreate(
            ['user_id' => $userA->id],
            ['username' => 'pilota', 'display_name' => 'Pilot A']
        );
        Profile::firstOrCreate(
            ['user_id' => $userB->id],
            ['username' => 'pilotb', 'display_name' => 'Pilot B']
        );

        UserSetting::firstOrCreate(
            ['user_id' => $userA->id],
            ['love_alarm_enabled' => true]
        );
        UserSetting::firstOrCreate(
            ['user_id' => $userB->id],
            ['love_alarm_enabled' => true]
        );

        // Mutual crush, both directions — same as the real endpoint requires
        Crush::firstOrCreate([
            'from_user_id' => $userA->id,
            'to_user_id' => $userB->id,
        ]);
        Crush::firstOrCreate([
            'from_user_id' => $userB->id,
            'to_user_id' => $userA->id,
        ]);

        // Match — normalize ordering the same way your app does elsewhere
        [$one, $two] = $userA->id < $userB->id ? [$userA, $userB] : [$userB, $userA];

        $match = MatchModel::firstOrCreate([
            'user_one_id' => $one->id,
            'user_two_id' => $two->id,
        ], [
            'matched_at' => now(),
        ]);

        $conversation = Conversation::firstOrCreate(['match_id' => $match->id]);
        foreach ([$userA->id, $userB->id] as $uid) {
            $exists = DB::table('conversation_users')
                ->where('conversation_id', $conversation->id)
                ->where('user_id', (string) $uid)
                ->exists();

            if (! $exists) {
                DB::table('conversation_users')->insert([
                    'id' => Str::uuid(),
                    'conversation_id' => $conversation->id,
                    'user_id' => (string) $uid,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('Pilot mutual crush + match + conversation seeded for pilot.a@lovealarm.dev / pilot.b@lovealarm.dev');
    }
}
