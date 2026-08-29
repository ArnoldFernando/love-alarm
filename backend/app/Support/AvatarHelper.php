<?php

namespace App\Support;

class AvatarHelper
{
    private const DEFAULT_AVATARS = [
        'https://i.pravatar.cc/500?img=12',
        'https://i.pravatar.cc/500?img=33',
        'https://i.pravatar.cc/500?img=47',
        'https://i.pravatar.cc/500?img=58',
        'https://i.pravatar.cc/500?img=65',
    ];

    public static function defaultFor(string $userId): string
    {
        $index = crc32($userId) % count(self::DEFAULT_AVATARS);

        return self::DEFAULT_AVATARS[$index];
    }
}