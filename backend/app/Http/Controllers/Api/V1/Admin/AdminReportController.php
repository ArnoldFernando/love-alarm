<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Admin\ReportAdminResource;
use App\Services\AdminReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    public function __construct(private AdminReportService $adminReportService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $reports = $this->adminReportService->getReports($request->only([
            'status', 'reason', 'per_page'
        ]));

        return $this->successResponse([
            'data' => ReportAdminResource::collection($reports),
            'pagination' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
            ],
        ]);
    }

    public function show(string $id): JsonResponse
    {
        $report = $this->adminReportService->getReport($id);

        if (! $report) {
            return $this->errorResponse('Report not found.', 404);
        }

        return $this->successResponse(new ReportAdminResource($report));
    }

    public function assign(Request $request, string $id): JsonResponse
    {
        $result = $this->adminReportService->assignToModerator($request->user(), $id);

        if (! $result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse(message: 'Report assigned successfully.');
    }

    public function resolve(Request $request, string $id): JsonResponse
    {
        $result = $this->adminReportService->resolveReport(
            $request->user(),
            $id,
            $request->input('notes')
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse(message: 'Report resolved.');
    }

    public function dismiss(Request $request, string $id): JsonResponse
    {
        $result = $this->adminReportService->dismissReport(
            $request->user(),
            $id,
            $request->input('notes')
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse(message: 'Report dismissed.');
    }
}
