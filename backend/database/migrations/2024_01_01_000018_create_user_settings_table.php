<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->boolean('love_alarm_enabled')->default(true);
            $table->integer('alarm_radius_meters')->default(30);
            $table->boolean('notify_crush_nearby')->default(true);
            $table->boolean('notify_mutual_crush_nearby')->default(true);
            $table->boolean('notify_new_match')->default(true);
            $table->boolean('notify_messages')->default(true);
            $table->boolean('background_detection_enabled')->default(true);
            $table->boolean('profile_visible')->default(true);
            $table->boolean('show_online_status')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_settings');
    }
};
