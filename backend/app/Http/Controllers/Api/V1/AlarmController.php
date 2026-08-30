<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\AlarmResource;
use App\Models\Alarm;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlarmController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $alarms = Alarm::where('user_id', $request->user()->id)
            ->with('triggeredBy.profile', 'triggeredBy.photos')
            ->orderBy('triggered_at', 'desc')
            ->paginate(20);

        return $this->successResponse([
            'data' => AlarmResource::collection($alarms),
            'pagination' => [
                'current_page' => $alarms->currentPage(),
                'last_page' => $alarms->lastPage(),
                'per_page' => $alarms->perPage(),
                'total' => $alarms->total(),
            ],
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $alarm = Alarm::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->with('triggeredBy.profile', 'triggeredBy.photos')
            ->firstOrFail();

        return $this->successResponse(new AlarmResource($alarm));
    }

    public function acknowledge(Request $request, string $id): JsonResponse
    {
        $alarm = Alarm::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $alarm->update([
            'status' => 'acknowledged',
            'acknowledged_at' => now(),
        ]);

        return $this->successResponse(message: 'Alarm acknowledged.');
    }
}
