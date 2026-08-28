<?php

namespace Tests\Feature;

use App\Models\Report;
use App\Models\User;
use Tests\TestCase;

class AdminTest extends TestCase
{
    public function test_admin_can_access_dashboard(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->profile()->create(['username' => 'admin', 'display_name' => 'Admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data.total_users', 'data.active_users', 'data.total_matches']);
    }

    public function test_non_admin_cannot_access_dashboard(): void
    {
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'user', 'display_name' => 'User']);
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/dashboard');

        $response->assertStatus(403);
    }

    public function test_admin_can_list_users(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->profile()->create(['username' => 'admin', 'display_name' => 'Admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/users');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data.data']);
    }

    public function test_admin_can_suspend_user(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->profile()->create(['username' => 'admin', 'display_name' => 'Admin']);
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'target', 'display_name' => 'Target']);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/admin/users/{$user->id}/status", [
                'status' => 'suspended',
                'reason' => 'Violation of terms',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.account_status', 'suspended');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'account_status' => 'suspended',
        ]);
    }

    public function test_admin_can_ban_user(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->profile()->create(['username' => 'admin', 'display_name' => 'Admin']);
        $user = User::factory()->create();
        $user->profile()->create(['username' => 'target', 'display_name' => 'Target']);
        $user->createToken('existing');

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/admin/users/{$user->id}/status", [
                'status' => 'banned',
                'reason' => 'Severe violation',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.account_status', 'banned');

        $this->assertDatabaseCount('personal_access_tokens', 1); // Only admin token remains
    }

    public function test_admin_can_reactivate_user(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->profile()->create(['username' => 'admin', 'display_name' => 'Admin']);
        $user = User::factory()->suspended()->create();
        $user->profile()->create(['username' => 'target', 'display_name' => 'Target']);

        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/admin/users/{$user->id}/status", [
                'status' => 'active',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.account_status', 'active');
    }

    public function test_admin_can_view_audit_logs(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->profile()->create(['username' => 'admin', 'display_name' => 'Admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/audit-logs');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonStructure(['data.data']);
    }

    public function test_moderator_can_view_reports(): void
    {
        $moderator = User::factory()->moderator()->create();
        $moderator->profile()->create(['username' => 'mod', 'display_name' => 'Moderator']);

        $reporter = User::factory()->create();
        $reporter->profile()->create(['username' => 'reporter', 'display_name' => 'Reporter']);
        $reported = User::factory()->create();
        $reported->profile()->create(['username' => 'reported', 'display_name' => 'Reported']);

        Report::create([
            'reporter_id' => $reporter->id,
            'reported_user_id' => $reported->id,
            'reason' => 'spam',
            'status' => 'pending',
        ]);

        $token = $moderator->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson('/api/v1/admin/reports');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.data');
    }

    public function test_moderator_can_review_report(): void
    {
        $moderator = User::factory()->moderator()->create();
        $moderator->profile()->create(['username' => 'mod', 'display_name' => 'Moderator']);

        $reporter = User::factory()->create();
        $reporter->profile()->create(['username' => 'reporter', 'display_name' => 'Reporter']);
        $reported = User::factory()->create();
        $reported->profile()->create(['username' => 'reported', 'display_name' => 'Reported']);

        $report = Report::create([
            'reporter_id' => $reporter->id,
            'reported_user_id' => $reported->id,
            'reason' => 'harassment',
            'status' => 'pending',
        ]);

        $token = $moderator->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson("/api/v1/admin/reports/{$report->id}/review", [
                'status' => 'resolved',
                'notes' => 'Verified violation',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'resolved');

        $this->assertDatabaseHas('reports', [
            'id' => $report->id,
            'status' => 'resolved',
            'reviewed_by' => $moderator->id,
        ]);
    }

    public function test_admin_can_access_analytics(): void
    {
        $admin = User::factory()->admin()->create();
        $admin->profile()->create(['username' => 'admin', 'display_name' => 'Admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $endpoints = [
            '/api/v1/admin/analytics/user-registration',
            '/api/v1/admin/analytics/daily-active-users',
            '/api/v1/admin/analytics/matches',
            '/api/v1/admin/analytics/alarms',
            '/api/v1/admin/analytics/reports',
            '/api/v1/admin/analytics/crush-stats',
            '/api/v1/admin/analytics/user-status-distribution',
            '/api/v1/admin/analytics/report-status-distribution',
        ];

        foreach ($endpoints as $endpoint) {
            $response = $this->withHeader('Authorization', 'Bearer ' . $token)
                ->getJson($endpoint);
            $response->assertStatus(200)->assertJsonPath('success', true);
        }
    }
}
