<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\UpdateProfileRequest;
use App\Http\Requests\Api\V1\UploadPhotoRequest;
use App\Http\Resources\Api\V1\ProfileResource;
use App\Http\Resources\Api\V1\ProfilePhotoResource;
use App\Http\Resources\Api\V1\UserSettingResource;
use App\Services\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private ProfileService $profileService)
    {
    }

    public function show(Request $request): JsonResponse
    {
        $profile = $this->profileService->getProfile($request->user());

        return $this->successResponse(new ProfileResource($profile));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $profile = $this->profileService->updateProfile(
            $request->user(),
            $request->validated()
        );

        return $this->successResponse(
            new ProfileResource($profile),
            'Profile updated successfully.'
        );
    }

    public function uploadPhoto(UploadPhotoRequest $request): JsonResponse
    {
        $photo = $this->profileService->uploadPhoto(
            $request->user(),
            $request->file('photo'),
            $request->boolean('is_primary', false)
        );

        return $this->successResponse(
            new ProfilePhotoResource($photo),
            'Photo uploaded successfully.',
            201
        );
    }

    public function deletePhoto(Request $request, string $id): JsonResponse
    {
        $this->profileService->deletePhoto($request->user(), $id);

        return $this->successResponse(message: 'Photo deleted successfully.');
    }

    public function setPrimaryPhoto(Request $request, string $id): JsonResponse
    {
        $photo = $this->profileService->setPrimaryPhoto($request->user(), $id);

        return $this->successResponse(new ProfilePhotoResource($photo));
    }

    public function settings(Request $request): JsonResponse
    {
        $settings = $this->profileService->getUserSettings($request->user());

        return $this->successResponse(new UserSettingResource($settings));
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $settings = $this->profileService->updateSettings(
            $request->user(),
            $request->only([
                'love_alarm_enabled',
                'alarm_radius_meters',
                'notify_crush_nearby',
                'notify_mutual_crush_nearby',
                'notify_new_match',
                'notify_messages',
                'background_detection_enabled',
                'profile_visible',
                'show_online_status',
            ])
        );

        return $this->successResponse(
            new UserSettingResource($settings),
            'Settings updated successfully.'
        );
    }
}
