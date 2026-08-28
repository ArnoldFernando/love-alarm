<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ReportRequest;
use App\Http\Resources\Api\V1\ReportResource;
use App\Services\ReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct(private ReportService $reportService)
    {
    }

    public function store(ReportRequest $request): JsonResponse
    {
        $result = $this->reportService->createReport(
            $request->user(),
            $request->validated()
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse(
            new ReportResource($result['report']),
            'Report submitted successfully.',
            201
        );
    }

    public function index(Request $request): JsonResponse
    {
        $reports = $this->reportService->getUserReports($request->user());

        return $this->successResponse(ReportResource::collection($reports));
    }
}
