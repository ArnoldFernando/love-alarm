<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Model;

class MatchModel extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'matches';

    protected $fillable = [
        'user_one_id',
        'user_two_id',
        'matched_at',
    ];

    protected $casts = [
        'matched_at' => 'datetime',
    ];

    public function userOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    public function userTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class, 'match_id');
    }
}
