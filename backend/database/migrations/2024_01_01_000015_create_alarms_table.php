<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alarms', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('triggered_by_user_id')->constrained('users')->onDelete('cascade');
            $table->string('type'); // crush_nearby, mutual_crush_nearby, match_created, system_notification
            $table->string('status')->default('detected'); // detected, triggered, delivered, acknowledged, expired
            $table->timestamp('triggered_at');
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index('user_id');
            $table->index('triggered_by_user_id');
            $table->index('status');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alarms');
    }
};
