<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\DeviceRequest;
use App\Http\Resources\Api\V1\DeviceResource;
use App\Services\DeviceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function __construct(private DeviceService $deviceService)
    {
    }

    public function store(DeviceRequest $request): JsonResponse
    {
        $device = $this->deviceService->registerDevice(
            $request->user(),
            $request->validated()
        );

        return $this->successResponse(
            new DeviceResource($device),
            'Device registered successfully.',
            201
        );
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $removed = $this->deviceService->removeDevice($request->user(), $id);

        if (! $removed) {
            return $this->errorResponse('Device not found.', 404);
        }

        return $this->successResponse(message: 'Device removed successfully.');
    }

    public function index(Request $request): JsonResponse
    {
        $devices = $this->deviceService->getUserDevices($request->user());

        return $this->successResponse(DeviceResource::collection($devices));
    }
}
