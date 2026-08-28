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

        if (! $user || ! $user->isActive()) {
            $status = $user?->account_status ?? 'inactive';
            $message = match ($status) {
                'suspended' => 'Account suspended.',
                'banned' => 'Account banned.',
                'pending_verification' => 'Email not verified.',
                default => 'Account inactive.',
            };

            return response()->json(['success' => false, 'message' => $message], 403);
        }

        return $next($request);
    }
}
