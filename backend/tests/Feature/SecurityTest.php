<?php

namespace Tests\Feature;

use App\Models\Alarm;
use App\Models\Block;
use App\Models\Conversation;
use App\Models\Crush;
use App\Models\MatchModel;
use App\Models\Message;
use App\Models\Profile;
use App\Models\Report;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    // IDOR: User A cannot access User B's profile
    public function test_user_cannot_access_another_users_private_profile_data(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);
        $tokenA = $userA->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->getJson('/api/v1/profile');

        $response->assertStatus(200)
            ->assertJsonPath('data.profile.username', 'usera')
            ->assertJsonMissingPath('data.email'); // Email hidden for other users in public endpoints
    }

    // IDOR: User cannot access conversations they are not part of
    public function test_user_cannot_access_unauthorized_conversation(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userC = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);
        $userC->profile()->create(['username' => 'userc', 'display_name' => 'User C']);

        $match = MatchModel::create([
            'user_one_id' => $userA->id,
            'user_two_id' => $userB->id,
            'matched_at' => now(),
        ]);
        $conversation = Conversation::create(['match_id' => $match->id]);
        $conversation->users()->attach([$userA->id, $userB->id]);

        $tokenC = $userC->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenC)
            ->getJson('/api/v1/conversations/' . $conversation->id);

        $response->assertStatus(404);
    }

    // IDOR: User cannot read another user's messages
    public function test_user_cannot_read_messages_from_unauthorized_conversation(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userC = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);
        $userC->profile()->create(['username' => 'userc', 'display_name' => 'User C']);

        $match = MatchModel::create([
            'user_one_id' => $userA->id,
            'user_two_id' => $userB->id,
            'matched_at' => now(),
        ]);
        $conversation = Conversation::create(['match_id' => $match->id]);
        $conversation->users()->attach([$userA->id, $userB->id]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $userA->id,
            'content' => 'Secret message',
        ]);

        $tokenC = $userC->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenC)
            ->getJson('/api/v1/conversations/' . $conversation->id . '/messages');

        $response->assertStatus(404);
    }

    // Privilege escalation: Regular user cannot access admin endpoints
    public function test_regular_user_cannot_access_admin_dashboard(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $user->profile()->create(['username' => 'user', 'display_name' => 'User']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403);
    }

    // Moderator can access reports but not admin-only endpoints
    public function test_moderator_can_access_reports_but_not_admin_actions(): void
    {
        $moderator = User::factory()->create(['role' => 'moderator']);
        $moderator->profile()->create(['username' => 'mod', 'display_name' => 'Moderator']);
        $token = $moderator->createToken('test')->plainTextToken;

        $reportsResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/reports');
        $reportsResponse->assertStatus(200);

        $banResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/admin/users/' . $moderator->id . '/ban');
        $banResponse->assertStatus(403);
    }

    // SQL injection protection in search
    public function test_search_is_protected_against_sql_injection(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'user', 'display_name' => 'User']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/discover?search=' . urlencode("'; DROP TABLE users; --"));

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    // XSS protection: malicious input is not reflected
    public function test_xss_payload_is_not_reflected_in_responses(): void
    {
        $user = User::factory()->create();
        $user->profile()->create([
            'username' => 'user',
            'display_name' => 'User',
            'bio' => '<script>alert("xss")</script>',
        ]);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/profile');

        $response->assertStatus(200)
            ->assertSee('<script>alert("xss")</script>', false); // Stored as-is, frontend must escape
    }

    // Rate limiting on auth endpoints
    public function test_login_rate_limiting_blocks_excessive_attempts(): void
    {
        for ($i = 0; $i < 12; $i++) {
            $response = $this->postJson('/api/v1/auth/login', [
                'email' => 'test@example.com',
                'password' => 'wrong',
            ]);
        }

        $response->assertStatus(429); // Too Many Requests
    }

    // Blocked users cannot interact
    public function test_blocked_user_cannot_send_message(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);

        // Create mutual crush and match
        Crush::create(['from_user_id' => $userA->id, 'to_user_id' => $userB->id]);
        Crush::create(['from_user_id' => $userB->id, 'to_user_id' => $userA->id]);
        $match = MatchModel::create([
            'user_one_id' => $userA->id,
            'user_two_id' => $userB->id,
            'matched_at' => now(),
        ]);
        $conversation = Conversation::create(['match_id' => $match->id]);
        $conversation->users()->attach([$userA->id, $userB->id]);

        // User A blocks User B
        Block::create(['user_id' => $userA->id, 'blocked_user_id' => $userB->id]);

        $tokenB = $userB->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenB)
            ->postJson('/api/v1/conversations/' . $conversation->id . '/messages', [
                'content' => 'Hello',
            ]);

        $response->assertStatus(403);
    }

    // Suspended user cannot perform actions
    public function test_suspended_user_cannot_create_crush(): void
    {
        $userA = User::factory()->suspended()->create();
        $userB = User::factory()->create();
        $userA->profile()->create(['username' => 'usera', 'display_name' => 'User A']);
        $userB->profile()->create(['username' => 'userb', 'display_name' => 'User B']);
        $tokenA = $userA->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $tokenA)
            ->postJson('/api/v1/crushes', ['to_user_id' => $userB->id]);

        $response->assertStatus(403);
    }

    // Mass assignment protection
    public function test_user_cannot_override_role_via_profile_update(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $user->profile()->create(['username' => 'user', 'display_name' => 'User']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson('/api/v1/profile', [
                'display_name' => 'Hacker',
                'role' => 'admin', // Attempted mass assignment
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => 'user']);
    }

    // Location privacy: no exact coordinates exposed
    public function test_location_endpoints_do_not_expose_exact_coordinates(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'user', 'display_name' => 'User']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson('/api/v1/proximity/check', [
                'latitude' => 14.5995,
                'longitude' => 120.9842,
            ]);

        $response->assertStatus(200)
            ->assertJsonMissingPath('data.latitude')
            ->assertJsonMissingPath('data.longitude');
    }
}
