<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\NotificationResource;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private NotificationService $notificationService) {}

    public function index(Request $request): JsonResponse
    {
        $notifications = $this->notificationService->getUserNotifications($request->user());

        return $this->successResponse([
            'data' => NotificationResource::collection($notifications)->collection,
            'pagination' => [
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
        ]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $marked = $this->notificationService->markAsRead($request->user(), $id);

        if (! $marked) {
            return $this->errorResponse('Notification not found.', 404);
        }

        return $this->successResponse(message: 'Notification marked as read.');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $count = $this->notificationService->markAllAsRead($request->user());

        return $this->successResponse(['marked_count' => $count], 'All notifications marked as read.');
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->notificationService->getUnreadCount($request->user());

        return $this->successResponse(['unread_count' => $count]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $deleted = $this->notificationService->deleteNotification($request->user(), $id);

        if (! $deleted) {
            return $this->errorResponse('Notification not found.', 404);
        }

        return $this->successResponse(message: 'Notification deleted.');
    }
}
