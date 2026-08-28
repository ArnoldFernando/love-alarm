<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Love Alarm API' => config('app.version', '1.0.0')];
});
