<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(private AnalyticsService $analyticsService)
    {
    }

    public function userRegistration(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);
        $stats = $this->analyticsService->getUserRegistrationStats($days);

        return $this->successResponse($stats);
    }

    public function dailyActiveUsers(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);
        $stats = $this->analyticsService->getDailyActiveUsers($days);

        return $this->successResponse($stats);
    }

    public function matches(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);
        $stats = $this->analyticsService->getMatchesPerDay($days);

        return $this->successResponse($stats);
    }

    public function alarms(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);
        $stats = $this->analyticsService->getAlarmsPerDay($days);

        return $this->successResponse($stats);
    }

    public function reports(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);
        $stats = $this->analyticsService->getReportsPerDay($days);

        return $this->successResponse($stats);
    }

    public function crushStats(): JsonResponse
    {
        $stats = $this->analyticsService->getCrushStats();

        return $this->successResponse($stats);
    }

    public function userStatusDistribution(): JsonResponse
    {
        $stats = $this->analyticsService->getUserStatusDistribution();

        return $this->successResponse($stats);
    }

    public function reportStatusDistribution(): JsonResponse
    {
        $stats = $this->analyticsService->getReportStatusDistribution();

        return $this->successResponse($stats);
    }
}
