<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    public function up(): void
    {
        Schema::create('proximity_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->geography('location', 'point')->nullable();
            $table->float('accuracy')->nullable();
            $table->float('distance_meters')->nullable();
            $table->foreignUuid('nearby_user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('event_type')->default('update'); // update, alarm_triggered
            $table->timestamp('recorded_at');
            $table->timestamps();

            $table->index('user_id');
            $table->index('nearby_user_id');
            $table->spatialIndex('location');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proximity_events');
    }
};
