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

    private function createProximityUser(string $username, string $displayName): User
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => $username, 'display_name' => $displayName]);
        $user->settings()->create([
            'love_alarm_enabled' => true,
            'alarm_radius_meters' => 10,
        ]);

        return $user;
    }

    private function withAccessToken(string $token): static
    {
        $this->app['auth']->forgetGuards();

        return $this->withHeader('Authorization', 'Bearer ' . $token);
    }

    public function test_user_can_update_location(): void
    {
        $user = $this->createProximityUser('user', 'User');
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withAccessToken($token)
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

    public function test_authenticated_user_can_clear_proximity_location(): void
    {
        $user = $this->createProximityUser('user', 'User');
        $token = $user->createToken('test')->plainTextToken;

        $this->withAccessToken($token)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ])
            ->assertStatus(200);

        $this->assertTrue((bool) Redis::exists('proximity:' . $user->id));
        $this->assertDatabaseHas('proximity_events', [
            'user_id' => $user->id,
            'event_type' => 'update',
        ]);

        $response = $this->withAccessToken($token)
            ->postJson('/api/v1/proximity/clear');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Location cleared.');

        $this->assertFalse((bool) Redis::exists('proximity:' . $user->id));
        $this->assertDatabaseMissing('proximity_events', [
            'user_id' => $user->id,
            'event_type' => 'update',
        ]);
    }

    public function test_cleared_location_is_not_used_by_database_fallback(): void
    {
        $userA = $this->createProximityUser('usera', 'User A');
        $userB = $this->createProximityUser('userb', 'User B');
        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);

        $tokenA = $userA->createToken('test')->plainTextToken;
        $tokenB = $userB->createToken('test')->plainTextToken;

        $this->withAccessToken($tokenB)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ])
            ->assertStatus(200);

        $this->withAccessToken($tokenB)
            ->postJson('/api/v1/proximity/clear')
            ->assertStatus(200);

        $response = $this->withAccessToken($tokenA)
            ->postJson('/api/v1/proximity/check', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data.alarms');
    }

    public function test_unauthenticated_user_cannot_clear_proximity_location(): void
    {
        $this->postJson('/api/v1/proximity/clear')
            ->assertStatus(401);
    }

    public function test_proximity_check_finds_nearby_crush(): void
    {
        $userA = $this->createProximityUser('usera', 'User A');
        $userB = $this->createProximityUser('userb', 'User B');

        // User A likes User B
        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);

        $tokenA = $userA->createToken('test')->plainTextToken;
        $tokenB = $userB->createToken('test')->plainTextToken;

        // Both users report same location (0m apart)
        $this->withAccessToken($tokenB)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response = $this->withAccessToken($tokenA)
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
        $userA = $this->createProximityUser('usera', 'User A');
        $userB = $this->createProximityUser('userb', 'User B');

        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);

        $tokenA = $userA->createToken('test')->plainTextToken;
        $tokenB = $userB->createToken('test')->plainTextToken;

        // User B at a location ~50m away from User A
        $this->withAccessToken($tokenB)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        // Default radius is 10m, so this should NOT trigger
        $response = $this->withAccessToken($tokenA)
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
        $userA = $this->createProximityUser('usera', 'User A');
        $userB = $this->createProximityUser('userb', 'User B');

        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);

        $tokenA = $userA->createToken('test')->plainTextToken;
        $tokenB = $userB->createToken('test')->plainTextToken;

        // Both at same location
        $this->withAccessToken($tokenB)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        // First check triggers alarm
        $this->withAccessToken($tokenA)
            ->postJson('/api/v1/proximity/check', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ])
            ->assertJsonCount(1, 'data.alarms');

        // Second check immediately after should not trigger (cooldown)
        $response = $this->withAccessToken($tokenA)
            ->postJson('/api/v1/proximity/check', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data.alarms');
    }

    public function test_mutual_crush_triggers_mutual_alarm(): void
    {
        $userA = $this->createProximityUser('usera', 'User A');
        $userB = $this->createProximityUser('userb', 'User B');

        // Mutual crush
        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);
        Crush::create(['from_user_id' => $userB->id, 'to_user_id' => $userA->id]);

        $tokenA = $userA->createToken('test')->plainTextToken;
        $tokenB = $userB->createToken('test')->plainTextToken;

        $this->withAccessToken($tokenB)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response = $this->withAccessToken($tokenA)
            ->postJson('/api/v1/proximity/check', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.alarms.0.type', 'mutual_crush_nearby');
    }

    public function test_blocked_users_do_not_trigger_alarms(): void
    {
        $userA = $this->createProximityUser('usera', 'User A');
        $userB = $this->createProximityUser('userb', 'User B');

        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);

        // User B blocks User A
        \App\Models\Block::create([
            'user_id' => $userB->id,
            'blocked_user_id' => $userA->id,
        ]);

        $tokenA = $userA->createToken('test')->plainTextToken;
        $tokenB = $userB->createToken('test')->plainTextToken;

        $this->withAccessToken($tokenB)
            ->postJson('/api/v1/proximity/update', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response = $this->withAccessToken($tokenA)
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

        $response = $this->withAccessToken($token)
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

        $response = $this->withAccessToken($token)
            ->postJson('/api/v1/alarms/' . $alarm->id . '/acknowledge');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('alarms', [
            'id' => $alarm->id,
            'status' => 'acknowledged',
        ]);
    }
}
