<?php

namespace Tests\Feature;

use App\Models\Interest;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    public function test_user_can_view_own_profile(): void
    {
        $user = User::factory()->create();
        $user->profile()->create([
            'username' => 'testuser',
            'display_name' => 'Test User',
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/profile');

        $response->assertStatus(200)
            ->assertJsonPath('data.profile.username', 'testuser');
    }

    public function test_user_can_update_profile(): void
    {
        $user = User::factory()->create();
        $user->profile()->create([
            'username' => 'oldname',
            'display_name' => 'Old Name',
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/profile', [
                'display_name' => 'New Name',
                'bio' => 'Hello world',
                'school' => 'Test University',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.profile.display_name', 'New Name')
            ->assertJsonPath('data.profile.bio', 'Hello world');

        $this->assertDatabaseHas('profiles', [
            'user_id' => $user->id,
            'display_name' => 'New Name',
        ]);
    }

    public function test_user_can_update_interests(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'testuser', 'display_name' => 'Test']);
        $interest = Interest::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/profile', [
                'interests' => [$interest->id],
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('user_interests', [
            'user_id' => $user->id,
            'interest_id' => $interest->id,
        ]);
    }

    public function test_user_can_update_settings(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'testuser', 'display_name' => 'Test']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/profile/settings', [
                'love_alarm_enabled' => false,
                'alarm_radius_meters' => 50,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.love_alarm_enabled', false)
            ->assertJsonPath('data.alarm_radius_meters', 50);
    }
}
