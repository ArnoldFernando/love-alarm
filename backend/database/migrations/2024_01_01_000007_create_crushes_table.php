```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crushes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('from_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignUuid('to_user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['from_user_id', 'to_user_id']);
            $table->index('from_user_id');
            $table->index('to_user_id');
        });

        DB::statement(
            'CREATE INDEX crushes_pair_idx ON crushes
             (LEAST(from_user_id, to_user_id), GREATEST(from_user_id, to_user_id))'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('crushes');
    }
};
