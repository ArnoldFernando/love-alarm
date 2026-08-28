<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class ProximityEvent extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'location',
        'accuracy',
        'distance_meters',
        'nearby_user_id',
        'event_type',
        'recorded_at',
    ];

    protected $casts = [
        'recorded_at' => 'datetime',
        'accuracy' => 'float',
        'distance_meters' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function nearbyUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'nearby_user_id');
    }
}
