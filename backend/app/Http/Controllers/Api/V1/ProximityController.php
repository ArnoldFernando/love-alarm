<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ProximityRequest;
use App\Services\ProximityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProximityController extends Controller
{
    public function __construct(private ProximityService $proximityService) {}

    public function update(ProximityRequest $request): JsonResponse
    {
        $data = $request->validated();

        $this->proximityService->updateLocation(
            $request->user(),
            (float) $data['latitude'],
            (float) $data['longitude'],
            isset($data['accuracy']) ? (float) $data['accuracy'] : null
        );

        return $this->successResponse(message: 'Location updated.');
    }

    public function check(ProximityRequest $request): JsonResponse
    {
        $data = $request->validated();

        $result = $this->proximityService->checkProximity(
            $request->user(),
            (float) $data['latitude'],
            (float) $data['longitude'],
            isset($data['accuracy']) ? (float) $data['accuracy'] : null
        );

        return $this->successResponse($result);
    }

    public function radar(ProximityRequest $request): JsonResponse
    {
        $data = $request->validated();

        $results = $this->proximityService->radarScan(
            $request->user(),
            (float) $data['latitude'],
            (float) $data['longitude'],
            30
        );

        return $this->successResponse(['users' => $results]);
    }
}
