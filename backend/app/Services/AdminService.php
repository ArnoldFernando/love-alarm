<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class AdminService
{
    public function getDashboardStats(): array
    {
        $now = now();
        $today = $now->copy()->startOfDay();
        $weekAgo = $now->copy()->subWeek();

        return [
            'users' => [
                'total' => User::count(),
                'active' => User::where('account_status', 'active')->count(),
                'new_today' => User::where('created_at', '>=', $today)->count(),
                'new_this_week' => User::where('created_at', '>=', $weekAgo)->count(),
                'suspended' => User::where('account_status', 'suspended')->count(),
                'banned' => User::where('account_status', 'banned')->count(),
            ],
            'matches' => [
                'total' => DB::table('matches')->count(),
                'today' => DB::table('matches')->where('matched_at', '>=', $today)->count(),
                'this_week' => DB::table('matches')->where('matched_at', '>=', $weekAgo)->count(),
            ],
            'crushes' => [
                'total' => DB::table('crushes')->count(),
                'today' => DB::table('crushes')->where('created_at', '>=', $today)->count(),
            ],
            'alarms' => [
                'total' => DB::table('alarms')->count(),
                'today' => DB::table('alarms')->where('triggered_at', '>=', $today)->count(),
            ],
            'reports' => [
                'total' => DB::table('reports')->count(),
                'pending' => DB::table('reports')->where('status', 'pending')->count(),
                'under_review' => DB::table('reports')->where('status', 'under_review')->count(),
                'resolved' => DB::table('reports')->where('status', 'resolved')->count(),
            ],
            'online_users' => DB::table('sessions')
                ->where('last_activity', '>=', now()->subMinutes(5)->getTimestamp())
                ->distinct('user_id')
                ->count('user_id'),
        ];
    }

    public function getUsers(array $filters = []): LengthAwarePaginator
    {
        $query = User::with('profile')
            ->orderBy('created_at', 'desc');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('email', 'ILIKE', "%{$search}%")
                    ->orWhereHas('profile', function ($pq) use ($search) {
                        $pq->where('username', 'ILIKE', "%{$search}%")
                            ->orWhere('display_name', 'ILIKE', "%{$search}%");
                    });
            });
        }

        if (! empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (! empty($filters['status'])) {
            $query->where('account_status', $filters['status']);
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function getUserDetail(string $userId): ?User
    {
        return User::with(['profile', 'profile.photos', 'settings', 'auditLogs'])
            ->find($userId);
    }

    public function suspendUser(User $admin, string $userId, ?string $reason = null): array
    {
        $user = User::find($userId);

        if (! $user) {
            return ['success' => false, 'message' => 'User not found.'];
        }

        if ($user->role === 'admin') {
            return ['success' => false, 'message' => 'Cannot suspend admin users.'];
        }

        $user->update([
            'account_status' => 'suspended',
            'suspended_until' => now()->addDays(30),
        ]);

        AuditService::log(
            'USER_SUSPENDED',
            User::class,
            $user->id,
            ['reason' => $reason, 'suspended_by' => $admin->id],
            null,
            $admin->id
        );

        return ['success' => true, 'message' => 'User suspended.'];
    }

    public function banUser(User $admin, string $userId, ?string $reason = null): array
    {
        $user = User::find($userId);

        if (! $user) {
            return ['success' => false, 'message' => 'User not found.'];
        }

        if ($user->role === 'admin') {
            return ['success' => false, 'message' => 'Cannot ban admin users.'];
        }

        $user->update([
            'account_status' => 'banned',
            'suspended_until' => null,
        ]);

        // Revoke all tokens
        $user->tokens()->delete();

        AuditService::log(
            'USER_BANNED',
            User::class,
            $user->id,
            ['reason' => $reason, 'banned_by' => $admin->id],
            null,
            $admin->id
        );

        return ['success' => true, 'message' => 'User banned.'];
    }

    public function reactivateUser(User $admin, string $userId): array
    {
        $user = User::find($userId);

        if (! $user) {
            return ['success' => false, 'message' => 'User not found.'];
        }

        $user->update([
            'account_status' => 'active',
            'suspended_until' => null,
        ]);

        AuditService::log(
            'USER_REACTIVATED',
            User::class,
            $user->id,
            ['reactivated_by' => $admin->id],
            null,
            $admin->id
        );

        return ['success' => true, 'message' => 'User reactivated.'];
    }

    public function getAnalytics(string $period = '30d'): array
    {
        $days = match ($period) {
            '7d' => 7,
            '90d' => 90,
            default => 30,
        };

        $startDate = now()->subDays($days)->startOfDay();

        $userGrowth = DB::table('users')
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', $startDate)
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        $dailyActive = DB::table('sessions')
            ->selectRaw('DATE(FROM_UNIXTIME(last_activity)) as date, COUNT(DISTINCT user_id) as count')
            ->where('last_activity', '>=', $startDate->getTimestamp())
            ->groupByRaw('DATE(FROM_UNIXTIME(last_activity))')
            ->orderBy('date')
            ->get();

        $matchesPerDay = DB::table('matches')
            ->selectRaw('DATE(matched_at) as date, COUNT(*) as count')
            ->where('matched_at', '>=', $startDate)
            ->groupByRaw('DATE(matched_at)')
            ->orderBy('date')
            ->get();

        $alarmsPerDay = DB::table('alarms')
            ->selectRaw('DATE(triggered_at) as date, COUNT(*) as count')
            ->where('triggered_at', '>=', $startDate)
            ->groupByRaw('DATE(triggered_at)')
            ->orderBy('date')
            ->get();

        $reportsPerDay = DB::table('reports')
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', $startDate)
            ->groupByRaw('DATE(created_at)')
            ->orderBy('date')
            ->get();

        return [
            'period' => $period,
            'user_growth' => $userGrowth,
            'daily_active_users' => $dailyActive,
            'matches_per_day' => $matchesPerDay,
            'alarms_per_day' => $alarmsPerDay,
            'reports_per_day' => $reportsPerDay,
        ];
    }

    public function getAuditLogs(array $filters = []): LengthAwarePaginator
    {
        $query = AuditLog::with('actor')
            ->orderBy('created_at', 'desc');

        if (! empty($filters['action'])) {
            $query->where('action', $filters['action']);
        }

        if (! empty($filters['actor_id'])) {
            $query->where('actor_id', $filters['actor_id']);
        }

        return $query->paginate($filters['per_page'] ?? 50);
    }
}
