<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\DiscoverRequest;
use App\Http\Resources\Api\V1\DiscoverUserResource;
use App\Http\Resources\Api\V1\PublicProfileResource;
use App\Services\DiscoverService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DiscoverController extends Controller
{
    public function __construct(private DiscoverService $discoverService)
    {
    }

    public function index(DiscoverRequest $request): JsonResponse
    {
        $users = $this->discoverService->discover(
            $request->user(),
            $request->validated()
        );

        return $this->successResponse([
            'data' => DiscoverUserResource::collection($users),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $user = $this->discoverService->getUserProfile($request->user(), $id);

        if (! $user) {
            return $this->errorResponse('User not found.', 404);
        }

        return $this->successResponse(new DiscoverUserResource($user));
    }
}
