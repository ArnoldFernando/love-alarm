<?php

namespace App\Services;

use App\Models\Report;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class AdminReportService
{
    public function getReports(array $filters = []): LengthAwarePaginator
    {
        $query = Report::with(['reporter.profile', 'reportedUser.profile', 'reviewer'])
            ->orderBy('created_at', 'desc');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['reason'])) {
            $query->where('reason', $filters['reason']);
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    public function getReport(string $reportId): ?Report
    {
        return Report::with(['reporter.profile', 'reportedUser.profile', 'reviewer'])
            ->find($reportId);
    }

    public function assignToModerator(User $moderator, string $reportId): array
    {
        $report = Report::find($reportId);

        if (! $report) {
            return ['success' => false, 'message' => 'Report not found.'];
        }

        $report->update([
            'status' => 'under_review',
            'reviewed_by' => $moderator->id,
        ]);

        AuditService::log(
            'REPORT_ASSIGNED',
            Report::class,
            $report->id,
            ['assigned_to' => $moderator->id],
            null,
            $moderator->id
        );

        return ['success' => true, 'report' => $report];
    }

    public function resolveReport(User $moderator, string $reportId, ?string $notes = null): array
    {
        $report = Report::find($reportId);

        if (! $report) {
            return ['success' => false, 'message' => 'Report not found.'];
        }

        $report->update([
            'status' => 'resolved',
            'reviewed_by' => $moderator->id,
            'reviewed_at' => now(),
        ]);

        AuditService::log(
            'REPORT_RESOLVED',
            Report::class,
            $report->id,
            ['resolved_by' => $moderator->id, 'notes' => $notes],
            null,
            $moderator->id
        );

        return ['success' => true, 'report' => $report];
    }

    public function dismissReport(User $moderator, string $reportId, ?string $notes = null): array
    {
        $report = Report::find($reportId);

        if (! $report) {
            return ['success' => false, 'message' => 'Report not found.'];
        }

        $report->update([
            'status' => 'dismissed',
            'reviewed_by' => $moderator->id,
            'reviewed_at' => now(),
        ]);

        AuditService::log(
            'REPORT_DISMISSED',
            Report::class,
            $report->id,
            ['dismissed_by' => $moderator->id, 'notes' => $notes],
            null,
            $moderator->id
        );

        return ['success' => true, 'report' => $report];
    }
}
