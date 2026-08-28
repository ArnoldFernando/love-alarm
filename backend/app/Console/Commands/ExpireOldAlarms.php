<?php

namespace App\Console\Commands;

use App\Models\Alarm;
use Illuminate\Console\Command;

class ExpireOldAlarms extends Command
{
    protected $signature = 'alarms:expire';
    protected $description = 'Mark expired alarms as expired';

    public function handle(): int
    {
        $count = Alarm::where('status', '!=', 'expired')
            ->where('expires_at', '<', now())
            ->update(['status' => 'expired']);

        $this->info("Expired {$count} alarms.");
        return Command::SUCCESS;
    }
}
