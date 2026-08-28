<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Tests\TestCase;

class DiscoverTest extends TestCase
{
    public function test_user_can_discover_other_users(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'viewer', 'display_name' => 'Viewer']);

        $otherUser = User::factory()->create();
        $otherUser->profile()->create(['username' => 'discoverable', 'display_name' => 'Discoverable']);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/discover');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data.data']);
    }

    public function test_blocked_users_are_hidden_from_discovery(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'viewer', 'display_name' => 'Viewer']);

        $blockedUser = User::factory()->create();
        $blockedUser->profile()->create(['username' => 'blocked', 'display_name' => 'Blocked']);

        \App\Models\Block::create([
            'user_id' => $user->id,
            'blocked_user_id' => $blockedUser->id,
        ]);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/discover');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $ids = array_column($data, 'id');
        $this->assertNotContains($blockedUser->id, $ids);
    }

    public function test_user_can_view_another_user_profile(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'viewer', 'display_name' => 'Viewer']);

        $otherUser = User::factory()->create();
        $otherUser->profile()->create(['username' => 'target', 'display_name' => 'Target']);

        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/users/' . $otherUser->id);

        $response->assertStatus(200)
            ->assertJsonPath('data.profile.username', 'target');
    }
}
