<?php

namespace App\Services;

use App\Models\Alarm;
use App\Models\Crush;
use App\Models\MatchModel;
use App\Models\Report;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class AnalyticsService
{
    public function getUserRegistrationStats(int $days = 30): Collection
    {
        return User::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    public function getDailyActiveUsers(int $days = 30): Collection
    {
        // Simplified: based on proximity events as proxy for activity
        return \App\Models\ProximityEvent::select(
            DB::raw('DATE(recorded_at) as date'),
            DB::raw('COUNT(DISTINCT user_id) as count')
        )
            ->where('recorded_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    public function getMatchesPerDay(int $days = 30): Collection
    {
        return MatchModel::select(
            DB::raw('DATE(matched_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('matched_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    public function getAlarmsPerDay(int $days = 30): Collection
    {
        return Alarm::select(
            DB::raw('DATE(triggered_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('triggered_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    public function getReportsPerDay(int $days = 30): Collection
    {
        return Report::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', now()->subDays($days))
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    public function getCrushStats(): array
    {
        return [
            'total_crushes' => Crush::count(),
            'crushes_today' => Crush::whereDate('created_at', today())->count(),
            'mutual_matches' => MatchModel::count(),
            'conversion_rate' => Crush::count() > 0
                ? round((MatchModel::count() / Crush::count()) * 100, 2)
                : 0,
        ];
    }

    public function getUserStatusDistribution(): Collection
    {
        return User::select('account_status', DB::raw('COUNT(*) as count'))
            ->groupBy('account_status')
            ->get();
    }

    public function getReportStatusDistribution(): Collection
    {
        return Report::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get();
    }
}
