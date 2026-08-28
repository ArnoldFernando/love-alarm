<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class UserSetting extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'love_alarm_enabled',
        'alarm_radius_meters',
        'notify_crush_nearby',
        'notify_mutual_crush_nearby',
        'notify_new_match',
        'notify_messages',
        'background_detection_enabled',
        'profile_visible',
        'show_online_status',
    ];

    protected $casts = [
        'love_alarm_enabled' => 'boolean',
        'alarm_radius_meters' => 'integer',
        'notify_crush_nearby' => 'boolean',
        'notify_mutual_crush_nearby' => 'boolean',
        'notify_new_match' => 'boolean',
        'notify_messages' => 'boolean',
        'background_detection_enabled' => 'boolean',
        'profile_visible' => 'boolean',
        'show_online_status' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
