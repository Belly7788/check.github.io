<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Exceptions\PostTooLargeException;

class CustomValidatePostSize
{
    public function handle($request, Closure $next)
    {
        $max = 100 * 1024 * 1024 * 1024; // 100GB in bytes
        if ($request->server('CONTENT_LENGTH') > $max) {
            throw new PostTooLargeException('The POST data is too large.');
        }
        return $next($request);
    }
}
