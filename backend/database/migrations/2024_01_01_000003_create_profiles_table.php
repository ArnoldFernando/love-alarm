<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->onDelete('cascade');
            $table->string('username')->unique();
            $table->string('display_name');
            $table->date('date_of_birth')->nullable();
            $table->string('gender')->nullable();
            $table->text('bio')->nullable();
            $table->string('school')->nullable();
            $table->string('course')->nullable();
            $table->string('year_level')->nullable();
            $table->timestamps();

            $table->index('username');
            $table->index('school');
            $table->index('course');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
