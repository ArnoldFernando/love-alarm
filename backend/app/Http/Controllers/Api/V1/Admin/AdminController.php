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
}
