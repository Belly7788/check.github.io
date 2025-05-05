<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // sleep(1);
    return inertia('Home/Home');
})->middleware('auth');

Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth');



Route::get('/product/productlist', function () {
    // sleep(1);
    return inertia('Products/ProductList');
})->middleware('auth');

Route::middleware('auth')->group(function () {

    // route role
    Route::get('/settings/role/role-management', [RoleController::class, 'index'])->name('role.index');
    Route::post('/settings/role', [RoleController::class, 'store'])->name('role.store');
    Route::get('/settings/role/{role}', [RoleController::class, 'show'])->name('role.show');
    Route::put('/settings/role/{role}', [RoleController::class, 'update'])->name('role.update');
    Route::delete('/settings/role/{role}', [RoleController::class, 'destroy'])->name('role.destroy');

    // route crud user
    Route::get('/settings/user/user-management', [UserController::class, 'index'])->name('user.index');
    Route::post('/settings/user/user-management', [UserController::class, 'store'])->name('user.store');
    Route::get('/settings/user/user-management/{id}', [UserController::class, 'show'])->name('user.show');
    Route::put('/settings/user/user-management/{id}', [UserController::class, 'update'])->name('user.update');
    Route::put('/settings/user/user-management/{id}/status', [UserController::class, 'updateStatus'])->name('user.status');
    Route::get('/settings/user/search', [UserController::class, 'search'])->name('user.search');

});



