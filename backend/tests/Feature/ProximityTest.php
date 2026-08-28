<?php

namespace Tests\Feature;

use App\Models\Alarm;
use App\Models\Crush;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

class ProximityTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Redis::flushAll();
    }

    public function test_user_can_update_location(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'user', 'display_name' => 'User']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
                'accuracy' => 10.0,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('proximity_events', [
            'user_id' => $user->id,
            'event_type' => 'update',
        ]);
    }

    public function test_proximity_check_finds_nearby_crush(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);

        // User A likes User B
        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);

        $tokenA = $userA->createToken('test')->plainTextToken;
        $tokenB = $userB->createToken('test')->plainTextToken;

        // Both users report same location (0m apart)
        $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/proximity/check', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.proximity_enabled', true)
            ->assertJsonPath('data.radius_meters', 10)
            ->assertJsonCount(1, 'data.alarms');

        $this->assertDatabaseHas('alarms', [
            'user_id' => $userA->id,
            'type' => 'crush_nearby',
            'status' => 'detected',
        ]);
    }

    public function test_proximity_check_respects_radius(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);

        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);

        $tokenA = $userA->createToken('test')->plainTextToken;
        $tokenB = $userB->createToken('test')->plainTextToken;

        // User B at a location ~50m away from User A
        $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        // Default radius is 10m, so this should NOT trigger
        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/proximity/check', [
                'latitude' => 14.59995,
                'longitude' => 120.9842,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.proximity_enabled', true)
            ->assertJsonCount(0, 'data.alarms');
    }

    public function test_alarm_cooldown_prevents_spam(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);

        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);

        $tokenA = $userA->createToken('test')->plainTextToken;
        $tokenB = $userB->createToken('test')->plainTextToken;

        // Both at same location
        $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        // First check triggers alarm
        $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/proximity/check', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ])
            ->assertJsonCount(1, 'data.alarms');

        // Second check immediately after should not trigger (cooldown)
        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/proximity/check', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data.alarms');
    }

    public function test_mutual_crush_triggers_mutual_alarm(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);

        // Mutual crush
        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);
        Crush::create(['from_user_id' => $userB->id, 'to_user_id' => $userA->id]);

        $tokenA = $userA->createToken('test')->plainTextToken;
        $tokenB = $userB->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/proximity/check', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.alarms.0.type', 'mutual_crush_nearby');
    }

    public function test_blocked_users_do_not_trigger_alarms(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);

        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);

        // User B blocks User A
        \App\Models\Block::create([
            'user_id' => $userB->id,
            'blocked_user_id' => $userA->id,
        ]);

        $tokenA = $userA->createToken('test')->plainTextToken;
        $tokenB = $userB->createToken('test')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/proximity/check', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data.alarms');
    }

    public function test_user_can_list_alarms(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'user', 'display_name' => 'User']);
        $token = $user->createToken('test')->plainTextToken;

        Alarm::create([
            'user_id' => $user->id,
            'triggered_by_user_id' => $user->id,
            'type' => 'crush_nearby',
            'status' => 'detected',
            'triggered_at' => now(),
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/alarms');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.data');
    }

    public function test_user_can_acknowledge_alarm(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'user', 'display_name' => 'User']);
        $token = $user->createToken('test')->plainTextToken;

        $alarm = Alarm::create([
            'user_id' => $user->id,
            'triggered_by_user_id' => $user->id,
            'type' => 'crush_nearby',
            'status' => 'detected',
            'triggered_at' => now(),
            'expires_at' => now()->addDay(),
        ]);

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/alarms/' . $alarm->id . '/acknowledge');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('alarms', [
            'id' => $alarm->id,
            'status' => 'acknowledged',
        ]);
    }
}
