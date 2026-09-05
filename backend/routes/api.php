<?php

use App\Http\Controllers\Api\V1\Admin\AdminController;
use App\Http\Controllers\Api\V1\Admin\AdminReportController;
use App\Http\Controllers\Api\V1\AlarmController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BlockController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\CrushController;
use App\Http\Controllers\Api\V1\DeviceController;
use App\Http\Controllers\Api\V1\DiscoverController;
use App\Http\Controllers\Api\V1\MatchController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\ProximityController;
use App\Http\Controllers\Api\V1\ReportController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {


    Route::get('debug/header', function (\Illuminate\Http\Request $request) {
        return response()->json([
            'request_authorization' => $request->header('Authorization'),
            'server_http_authorization' => $_SERVER['HTTP_AUTHORIZATION'] ?? null,
            'server_redirect_http_authorization' => $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? null,
            'bearer_token' => $request->bearerToken(),
        ]);
    });



    // Public auth routes
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);
    Route::post('auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);
    Route::get('auth/verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
        ->middleware(['signed'])
        ->name('verification.verify');

    // Authenticated routes
    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        // Auth
        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::post('auth/logout-all', [AuthController::class, 'logoutAll']);
        Route::post('auth/resend-verification', [AuthController::class, 'resendVerification']);
        Route::post('auth/change-password', [AuthController::class, 'changePassword']);
        Route::post('auth/delete-account', [AuthController::class, 'deleteAccount']);

        // Profile
        Route::get('profile', [ProfileController::class, 'show']);
        Route::put('profile', [ProfileController::class, 'update']);
        Route::post('profile/photos', [ProfileController::class, 'uploadPhoto']);
        Route::delete('profile/photos/{id}', [ProfileController::class, 'deletePhoto']);
        Route::post('profile/photos/{id}/primary', [ProfileController::class, 'setPrimaryPhoto']);
        Route::get('profile/settings', [ProfileController::class, 'settings']);
        Route::put('profile/settings', [ProfileController::class, 'updateSettings']);

        // Discover
        Route::get('discover', [DiscoverController::class, 'index']);
        Route::get('users/{id}', [DiscoverController::class, 'show']);

        // Crush
        Route::get('crushes', [CrushController::class, 'index']);
        Route::post('crushes', [CrushController::class, 'store'])->middleware('throttle:crush');
        Route::delete('crushes/{id}', [CrushController::class, 'destroy']);
        Route::get('crushes/received', [CrushController::class, 'received']);

        // Matches
        Route::get('matches', [MatchController::class, 'index']);
        Route::get('matches/{id}', [MatchController::class, 'show']);

        // Proximity
        // Proximity
        Route::post('proximity/update', [ProximityController::class, 'update'])
            ->middleware('throttle:location')
            ->withoutMiddleware('throttle:api');
        Route::post('proximity/check', [ProximityController::class, 'check'])
            ->middleware('throttle:location')
            ->withoutMiddleware('throttle:api');
        Route::post('proximity/radar', [ProximityController::class, 'radar'])
            ->middleware('throttle:location')
            ->withoutMiddleware('throttle:api');
        Route::post('proximity/clear', [ProximityController::class, 'clear'])
            ->middleware('throttle:location')
            ->withoutMiddleware('throttle:api');
        // Alarms
        Route::get('alarms', [AlarmController::class, 'index']);
        Route::get('alarms/{id}', [AlarmController::class, 'show']);
        Route::post('alarms/{id}/acknowledge', [AlarmController::class, 'acknowledge']);

        // Notifications
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);

        // Chat
        Route::get('conversations', [ChatController::class, 'conversations']);
        Route::get('conversations/{id}', [ChatController::class, 'showConversation']);
        Route::get('conversations/{id}/messages', [ChatController::class, 'messages']);
        Route::post('conversations/{id}/messages', [ChatController::class, 'sendMessage']);
        Route::post('conversations/{id}/read', [ChatController::class, 'markAsRead']);
        Route::delete('conversations/{conversationId}/messages/{messageId}', [ChatController::class, 'deleteMessage']);

        // Blocks
        Route::get('blocks', [BlockController::class, 'index']);
        Route::post('blocks', [BlockController::class, 'store']);
        Route::delete('blocks/{id}', [BlockController::class, 'destroy']);

        // Reports
        Route::get('reports', [ReportController::class, 'index']);
        Route::post('reports', [ReportController::class, 'store']);

        // Devices
        Route::get('devices', [DeviceController::class, 'index']);
        Route::post('devices', [DeviceController::class, 'store']);
        Route::delete('devices/{id}', [DeviceController::class, 'destroy']);

        // Admin routes
        Route::middleware('role:admin,moderator')->prefix('admin')->group(function () {
            Route::get('dashboard', [AdminController::class, 'dashboard']);
            Route::get('users', [AdminController::class, 'users']);
            Route::get('users/{id}', [AdminController::class, 'userDetail']);
            Route::get('matches', [AdminController::class, 'matches']);
            Route::get('alarms', [AdminController::class, 'alarms']);
            Route::get('analytics', [AdminController::class, 'analytics']);
            Route::get('audit-logs', [AdminController::class, 'auditLogs']);
            Route::get('settings', [AdminController::class, 'getSettings']);
            Route::put('settings', [AdminController::class, 'updateSettings']);

            // Moderator can review reports
            Route::get('reports', [AdminReportController::class, 'index']);
            Route::get('reports/{id}', [AdminReportController::class, 'show']);
        });

        // Admin-only routes
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::post('users/{id}/suspend', [AdminController::class, 'suspendUser']);
            Route::post('users/{id}/ban', [AdminController::class, 'banUser']);
            Route::post('users/{id}/reactivate', [AdminController::class, 'reactivateUser']);

            Route::post('reports/{id}/assign', [AdminReportController::class, 'assign']);
            Route::post('reports/{id}/resolve', [AdminReportController::class, 'resolve']);
            Route::post('reports/{id}/dismiss', [AdminReportController::class, 'dismiss']);
        });
    });
});
