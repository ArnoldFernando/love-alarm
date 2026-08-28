<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\CrushRequest;
use App\Http\Resources\Api\V1\CrushResource;
use App\Services\CrushService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CrushController extends Controller
{
    public function __construct(private CrushService $crushService)
    {
    }

    public function store(CrushRequest $request): JsonResponse
    {
        $result = $this->crushService->createCrush(
            $request->user(),
            $request->validated('to_user_id')
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        $code = $result['data']['match_created'] ? 201 : 200;

        return $this->successResponse(
            $result['data'],
            $result['message'],
            $code
        );
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $removed = $this->crushService->removeCrush($request->user(), $id);

        if (! $removed) {
            return $this->errorResponse('Crush not found.', 404);
        }

        return $this->successResponse(message: 'Crush removed successfully.');
    }

    public function index(Request $request): JsonResponse
    {
        $crushes = $this->crushService->getUserCrushes($request->user());

        return $this->successResponse(CrushResource::collection($crushes));
    }
}
