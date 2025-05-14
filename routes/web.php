<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ListPOController;
use App\Http\Controllers\PIController;
use App\Http\Controllers\POController;
use App\Http\Controllers\ProductController;
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

    // route product
    Route::get('/product/productlist', [ProductController::class, 'index'])->name('products.index');
    Route::post('/product', [ProductController::class, 'store'])->name('products.store');
    Route::get('/product/{id}', [ProductController::class, 'show'])->name('products.show');
    Route::put('/product/{id}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/product/{id}', [ProductController::class, 'destroy'])->name('products.destroy');
    Route::get('/product/images/{productId}', [ProductController::class, 'getImages'])->name('products.images');
    Route::get('/product/videos/{productId}', [ProductController::class, 'getVideos'])->name('products.videos');
    Route::get('/products/all', [ProductController::class, 'getAllProducts'])->name('products.all');


    //route create pi
    Route::get('/pi/create', [PIController::class, 'create'])->name('pi.create');
    Route::post('/pi/store', [PIController::class, 'store'])->name('pi.store');
    Route::get('/products/search', [PIController::class, 'searchProducts'])->name('products.search');
    Route::get('/companies/search', [PIController::class, 'searchCompanies'])->name('companies.search');
    Route::get('/pi-number/validate', [PIController::class, 'validatePiNumber'])->name('pi.validate');


    // Routes for PO
    Route::get('/po/create', [POController::class, 'create'])->name('po.create');
    Route::post('/po/store', [POController::class, 'store'])->name('po.store');
    Route::get('/products/search', [POController::class, 'searchProducts'])->name('products.search');


    Route::get('/po/list', [ListPOController::class, 'index'])->name('po.list');
    Route::put('/po/{poDetail}', [ListPOController::class, 'update'])->name('po.update');
    Route::delete('/po/{poDetail}', [ListPOController::class, 'destroy'])->name('po.destroy');
    Route::post('/po/{poDetail}/toggle-order', [ListPOController::class, 'toggleOrder'])->name('po.toggle-order');

});


// Route::get('/po/list', function () {
//     // sleep(1);
//     return inertia('PO/List-PO');
// })->middleware('auth');





