<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public $withinTransaction = false;
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_one_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('user_two_id')->constrained('users')->onDelete('cascade');
            $table->timestamp('matched_at');
            $table->timestamps();

            $table->unique(['user_one_id', 'user_two_id']);
            $table->index('user_one_id');
            $table->index('user_two_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matches');
    }
};
