<?php

namespace App\Console\Commands;

use App\Services\ProximityService;
use Illuminate\Console\Command;

class CleanupExpiredLocations extends Command
{
    protected $signature = 'proximity:cleanup';
    protected $description = 'Clean up expired temporary location data from Redis and database';

    public function handle(ProximityService $proximityService): int
    {
        $deleted = $proximityService->cleanupExpiredLocations();
        $this->info("Cleaned up {$deleted} expired location entries.");
        return Command::SUCCESS;
    }
}
