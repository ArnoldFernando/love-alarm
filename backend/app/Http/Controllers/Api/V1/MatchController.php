<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\MatchResource;
use App\Services\MatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    public function __construct(private MatchService $matchService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $matches = $this->matchService->getUserMatches($request->user());

        return $this->successResponse([
            'data' => MatchResource::collection($matches),
            'pagination' => [
                'current_page' => $matches->currentPage(),
                'last_page' => $matches->lastPage(),
                'per_page' => $matches->perPage(),
                'total' => $matches->total(),
            ],
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $match = $this->matchService->getMatch($request->user(), $id);

        if (! $match) {
            return $this->errorResponse('Match not found.', 404);
        }

        return $this->successResponse(new MatchResource($match));
    }
}
