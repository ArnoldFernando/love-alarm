<?php

namespace Tests\Feature;

use App\Models\Crush;
use App\Models\MatchModel;
use App\Models\Profile;
use App\Models\User;
use Tests\TestCase;

class CrushMatchTest extends TestCase
{
    public function test_user_can_create_crush(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);
        $token = $userA->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/crushes', [
                'to_user_id' => $userB->id,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.match_created', false);

        $this->assertDatabaseHas('crushes', [
            'from_user_id' => $userA->id,
            'to_user_id' => $userB->id,
        ]);
    }

    public function test_mutual_crush_creates_match(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);

        $tokenA = $userA->createToken('test')->plainTextToken;
        $tokenB = $userB->createToken('test')->plainTextToken;

        // User A likes User B
        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/crushes', ['to_user_id' => $userB->id])
            ->assertStatus(200)
            ->assertJsonPath('data.match_created', false);

        // User B likes User A -> match created
        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->postJson('/api/v1/crushes', ['to_user_id' => $userA->id]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.match_created', true);

        $this->assertDatabaseHas('matches', [
            'user_one_id' => $userA->id,
            'user_two_id' => $userB->id,
        ]);

        $this->assertDatabaseHas('conversations', [
            'match_id' => MatchModel::first()->id,
        ]);
    }

    public function test_duplicate_crush_is_prevented(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);
        $token = $userA->createToken('test')->plainTextToken;

        // First crush
        $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/crushes', ['to_user_id' => $userB->id])
            ->assertStatus(200);

        // Duplicate crush
        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/crushes', ['to_user_id' => $userB->id]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_self_crush_is_prevented(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'selfuser', 'display_name' => 'Self']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/crushes', ['to_user_id' => $user->id]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_blocked_user_cannot_crush(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);

        // User A blocks User B
        \App\Models\Block::create([
            'user_id' => $userA->id,
            'blocked_user_id' => $userB->id,
        ]);

        $token = $userA->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/crushes', ['to_user_id' => $userB->id]);

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_user_can_list_crushes(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'user', 'display_name' => 'User']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/crushes');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_user_can_list_matches(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);

        // Create mutual crush -> match
        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);
        Crush::create(['from_user_id' => $userB->id, 'to_user_id' => $userA->id]);

        MatchModel::create([
            'user_one_id' => $userA->id,
            'user_two_id' => $userB->id,
            'matched_at' => now(),
        ]);

        $token = $userA->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/matches');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.data');
    }
}
