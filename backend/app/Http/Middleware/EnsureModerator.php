<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureModerator
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isModerator()) {
            return response()->json(['success' => false, 'message' => 'Forbidden. Moderator access required.'], 403);
        }

        return $next($request);
    }
}
