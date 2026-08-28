<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Admin\ReviewReportRequest;
use App\Http\Resources\Api\V1\Admin\AdminReportResource;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ModerationController extends Controller
{
    public function __construct(private ReportService $reportService)
    {
    }

    public function reports(Request $request): JsonResponse
    {
        $reports = $this->reportService->getPendingReports(
            $request->input('per_page', 20)
        );

        return $this->successResponse([
            'data' => AdminReportResource::collection($reports),
            'pagination' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    public function reviewReport(ReviewReportRequest $request, string $id): JsonResponse
    {
        $report = $this->reportService->reviewReport(
            $request->user(),
            $id,
            $request->validated('status'),
            $request->validated('notes')
        );

        if (! $report) {
            return $this->errorResponse('Report not found.', 404);
        }

        return $this->successResponse(
            new AdminReportResource($report),
            'Report reviewed successfully.'
        );
    }
}
