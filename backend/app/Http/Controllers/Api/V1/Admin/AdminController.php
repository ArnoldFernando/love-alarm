<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Admin\UserAdminResource;
use App\Http\Resources\Api\V1\Admin\AuditLogResource;
use App\Services\AdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(private AdminService $adminService)
    {
    }

    public function dashboard(): JsonResponse
    {
        $stats = $this->adminService->getDashboardStats();
        return $this->successResponse($stats);
    }

    public function users(Request $request): JsonResponse
    {
        $users = $this->adminService->getUsers($request->only([
            'search', 'role', 'status', 'per_page'
        ]));

        return $this->successResponse([
            'data' => UserAdminResource::collection($users),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function userDetail(string $id): JsonResponse
    {
        $user = $this->adminService->getUserDetail($id);

        if (! $user) {
            return $this->errorResponse('User not found.', 404);
        }

        return $this->successResponse(new UserAdminResource($user));
    }

    public function suspendUser(Request $request, string $id): JsonResponse
    {
        $result = $this->adminService->suspendUser(
            $request->user(),
            $id,
            $request->input('reason')
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse(message: $result['message']);
    }

    public function banUser(Request $request, string $id): JsonResponse
    {
        $result = $this->adminService->banUser(
            $request->user(),
            $id,
            $request->input('reason')
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse(message: $result['message']);
    }

    public function reactivateUser(string $id): JsonResponse
    {
        $result = $this->adminService->reactivateUser(
            request()->user(),
            $id
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse(message: $result['message']);
    }

    public function analytics(Request $request): JsonResponse
    {
        $data = $this->adminService->getAnalytics($request->input('period', '30d'));
        return $this->successResponse($data);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $logs = $this->adminService->getAuditLogs($request->only([
            'action', 'actor_id', 'per_page'
        ]));

        return $this->successResponse([
            'data' => AuditLogResource::collection($logs),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }

    public function matches(Request $request): JsonResponse
    {
        $matches = $this->adminService->getMatches($request->only([
            'search', 'per_page', 'page'
        ]));

        return $this->successResponse([
            'data' => $matches->items(),
            'pagination' => [
                'current_page' => $matches->currentPage(),
                'last_page' => $matches->lastPage(),
                'per_page' => $matches->perPage(),
                'total' => $matches->total(),
                'from' => $matches->firstItem(),
                'to' => $matches->lastItem(),
            ],
        ]);
    }

    public function alarms(Request $request): JsonResponse
    {
        $alarms = $this->adminService->getAlarms($request->only([
            'search', 'per_page', 'page'
        ]));

        return $this->successResponse([
            'data' => $alarms->items(),
            'pagination' => [
                'current_page' => $alarms->currentPage(),
                'last_page' => $alarms->lastPage(),
                'per_page' => $alarms->perPage(),
                'total' => $alarms->total(),
                'from' => $alarms->firstItem(),
                'to' => $alarms->lastItem(),
            ],
        ]);
    }

    public function getSettings(): JsonResponse
    {
        $settings = $this->adminService->getSettings();
        return $this->successResponse($settings);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'alarm_radius_meters' => 'required|integer|min:50|max:10000',
            'alarm_cooldown_seconds' => 'required|integer|min:60|max:86400',
            'max_active_alarms_per_user' => 'required|integer|min:1|max:1000',
            'proximity_check_interval_seconds' => 'required|integer|min:10|max:3600',
            'max_distance_km' => 'required|integer|min:1|max:500',
        ]);

        $result = $this->adminService->updateSettings($validated);

        if (!$result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse(message: 'Settings updated successfully');
    }
}
