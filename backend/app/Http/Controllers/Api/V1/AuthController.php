<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ChangePasswordRequest;
use App\Http\Requests\Api\V1\DeleteAccountRequest;
use App\Http\Requests\Api\V1\ForgotPasswordRequest;
use App\Http\Requests\Api\V1\LoginRequest;
use App\Http\Requests\Api\V1\RegisterRequest;
use App\Http\Requests\Api\V1\ResetPasswordRequest;
use App\Http\Resources\Api\V1\UserResource;
use App\Services\AuthService;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        return $this->successResponse(
            new UserResource($user),
            'Registration successful.',
            201
        );
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->only('email', 'password'),
            $request->input('device_name', 'api')
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], 401);
        }

        return $this->successResponse([
            'user' => new UserResource($result['user']),
            'token' => $result['token'],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return $this->successResponse(new UserResource($request->user()->load('profile', 'settings')));
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return $this->successResponse(message: 'Logged out successfully.');
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $this->authService->logoutAllDevices($request->user());

        return $this->successResponse(message: 'Logged out from all devices.');
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = $this->authService->sendPasswordResetLink($request->validated('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return $this->successResponse(message: 'Password reset link sent.');
        }

        return $this->errorResponse('Unable to send reset link.', 400);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = $this->authService->resetPassword($request->validated());

        if ($status === Password::PASSWORD_RESET) {
            return $this->successResponse(message: 'Password reset successfully.');
        }

        return $this->errorResponse('Invalid token or email.', 400);
    }

    public function verifyEmail(Request $request, int $id, string $hash): JsonResponse
    {
        $user = Auth::loginUsingId($id);

        if (! $user) {
            return $this->errorResponse('Invalid user.', 404);
        }

        $verified = $this->authService->verifyEmail($user, $id, $hash);

        if (! $verified) {
            return $this->errorResponse('Invalid verification link.', 403);
        }

        return $this->successResponse(message: 'Email verified successfully.');
    }

    public function resendVerification(Request $request): JsonResponse
    {
        $this->authService->resendVerification($request->user());

        return $this->successResponse(message: 'Verification link sent.');
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $changed = $this->authService->changePassword(
            $request->user(),
            $request->validated('current_password'),
            $request->validated('password')
        );

        if (! $changed) {
            return $this->errorResponse('Current password is incorrect.', 403);
        }

        return $this->successResponse(message: 'Password changed successfully.');
    }

    public function deleteAccount(DeleteAccountRequest $request): JsonResponse
    {
        $deleted = $this->authService->deleteAccount(
            $request->user(),
            $request->validated('password')
        );

        if (! $deleted) {
            return $this->errorResponse('Password is incorrect.', 403);
        }

        return $this->successResponse(message: 'Account deleted successfully.');
    }
}
