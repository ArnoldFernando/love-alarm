<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\BlockRequest;
use App\Http\Resources\Api\V1\BlockResource;
use App\Services\BlockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlockController extends Controller
{
    public function __construct(private BlockService $blockService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $blocks = $this->blockService->getBlockedUsers($request->user());

        return $this->successResponse(BlockResource::collection($blocks));
    }

    public function store(BlockRequest $request): JsonResponse
    {
        $result = $this->blockService->blockUser(
            $request->user(),
            $request->validated('blocked_user_id')
        );

        if (! $result['success']) {
            return $this->errorResponse($result['message'], 422);
        }

        return $this->successResponse(message: $result['message']);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $removed = $this->blockService->unblockUser($request->user(), $id);

        if (! $removed) {
            return $this->errorResponse('Block not found.', 404);
        }

        return $this->successResponse(message: 'User unblocked successfully.');
    }
}
