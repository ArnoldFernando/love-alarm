<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAccountActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || in_array($user->account_status, ['suspended', 'banned'])) {
            $status = $user?->account_status ?? 'inactive';
            $message = match ($status) {
                'suspended' => 'Account suspended.',
                'banned' => 'Account banned.',
                default => 'Account inactive.',
            };

            return response()->json(['success' => false, 'message' => $message], 403);
        }

        return $next($request);
    }
}
