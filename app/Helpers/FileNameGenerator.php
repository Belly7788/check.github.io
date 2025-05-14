<?php

namespace App\Helpers;

use Illuminate\Support\Str;

class FileNameGenerator
{
    public static function generate($extension)
    {
        $datetime = now()->format('Ymd_His');
        $randomString = Str::random(100);
        return "{$datetime}_{$randomString}.{$extension}";
    }
}
