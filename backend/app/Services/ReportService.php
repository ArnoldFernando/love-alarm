<?php

namespace App\Services;

use App\Models\Report;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ReportService
{
    public function createReport(User $reporter, array $data): array
    {
        if ($reporter->id === $data['reported_user_id']) {
            return ['success' => false, 'message' => 'You cannot report yourself.'];
        }

        $reportedUser = User::where('id', $data['reported_user_id'])
            ->where('account_status', 'active')
            ->first();

        if (! $reportedUser) {
            return ['success' => false, 'message' => 'User not found.'];
        }

        $report = Report::create([
            'reporter_id' => $reporter->id,
            'reported_user_id' => $data['reported_user_id'],
            'reason' => $data['reason'],
            'description' => $data['description'] ?? null,
            'status' => 'pending',
        ]);

        AuditService::log(
            'REPORT_CREATED',
            Report::class,
            $report->id,
            ['reported_user_id' => $data['reported_user_id'], 'reason' => $data['reason']]
        );

        return ['success' => true, 'report' => $report];
    }

    public function getUserReports(User $user): Collection
    {
        return Report::where('reporter_id', $user->id)
            ->with('reportedUser.profile')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getPendingReports(int $perPage = 20): LengthAwarePaginator
    {
        return Report::with(['reporter.profile', 'reportedUser.profile'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function reviewReport(User $moderator, string $reportId, string $status, ?string $notes = null): ?Report
    {
        $report = Report::find($reportId);

        if (! $report) {
            return null;
        }

        $report->update([
            'status' => $status,
            'reviewed_by' => $moderator->id,
            'reviewed_at' => now(),
        ]);

        AuditService::log(
            'REPORT_REVIEWED',
            Report::class,
            $report->id,
            ['status' => $status, 'reviewer_id' => $moderator->id, 'notes' => $notes]
        );

        return $report;
    }
}
