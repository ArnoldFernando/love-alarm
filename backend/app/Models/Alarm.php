<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class Alarm extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'triggered_by_user_id',
        'type',
        'status',
        'triggered_at',
        'acknowledged_at',
        'expires_at',
    ];

    protected $casts = [
        'triggered_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function triggeredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triggered_by_user_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'detected');
    }

    public function scopeAcknowledged($query)
    {
        return $query->where('status', 'acknowledged');
    }
}
