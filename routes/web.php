<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\FetchPiController;
use App\Http\Controllers\ListPiController;
use App\Http\Controllers\ListPOController;
use App\Http\Controllers\MethodController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PaymentManageController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PIController;
use App\Http\Controllers\PiDetailController;
use App\Http\Controllers\PiExcelController;
use App\Http\Controllers\POController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    // sleep(1);
    return inertia('Home/Home');
})->middleware('auth');

Route::get('/product/product_cost', function () {
    // sleep(1);
    return inertia('Products/Product-costing');
})->middleware('auth');


// route payment
Route::middleware('auth')->group(function () {
    Route::get('/payment', [PaymentController::class, 'index'])->name('payment.index');
    Route::get('/fetch-pi/{companyId}', [FetchPiController::class, 'index'])->name('fetch.pi');
    Route::get('/check-payment-number/{number}', [FetchPiController::class, 'checkPaymentNumber'])->name('check.payment.number');
    Route::post('/payment/create', [PaymentController::class, 'store'])->name('payment.create');
    Route::get('/payment/fetch/payment/{id}', [PaymentController::class, 'fetchPayment'])->name('payment.fetch');
    Route::post('/payment/update/{id}', [PaymentController::class, 'update'])->name('payment.update');
    Route::post('/payment/approve/{id}', [PaymentController::class, 'approve'])->name('payment.approve'); // New route
    Route::delete('/payment/delete/{id}', [PaymentController::class, 'destroy'])->name('payment.delete'); // New delete route
});


// profile route
Route::middleware('auth')->group(function () {
    // Existing routes...
    Route::get('/settings/profile', [ProfileController::class, 'index'])->name('settings.profile');
    Route::post('/settings/profile/image', [ProfileController::class, 'updateProfileImage'])->name('settings.profile.image');
    Route::post('/settings/profile/cover', [ProfileController::class, 'updateCoverImage'])->name('settings.profile.cover');
    Route::post('/settings/profile', [ProfileController::class, 'updateProfile'])->name('settings.profile.update');
    Route::post('/settings/password', [ProfileController::class, 'updatePassword'])->name('settings.password.update');

    // New route for username availability check
    Route::get('/check-username/{username}', [ProfileController::class, 'checkUsername'])->name('check.username');
});


// login route
Route::get('/login', [LoginController::class, 'show'])->name('login');
Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout'])->middleware('auth');

// route permission check
Route::post('/check-permission', [PermissionController::class, 'checkPermission'])->middleware('auth');


// route pi 
Route::middleware('auth')->group(function () {
    Route::get('/pi/list', [ListPiController::class, 'index'])->name('pi.list');
    Route::get('/pi/{piId}/reference-photos', [ListPiController::class, 'getReferencePhotos'])->name('pi.reference-photos');
    Route::get('/pi/{piId}/product-details', [ListPiController::class, 'getProductDetails'])->name('pi.product-details');
    Route::delete('/pi/{piId}', [ListPiController::class, 'destroy'])->name('pi.destroy');
    Route::post('/pi/{piId}/update', [ListPiController::class, 'update'])->name('pi.update');
    Route::get('/pi/{piId}/edit-data', [ListPiController::class, 'getEditData'])->name('pi.edit-data');
    Route::get('/pi/{piId}/download-excel', [PiExcelController::class, 'downloadExcel']);
    Route::get('/api/pi-detail/{id}', [PiDetailController::class, 'show']);
    Route::post('/api/pi-detail/update/{id}', [PiDetailController::class, 'update']);

});

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

    // Route CRUD for branch
    Route::get('/settings/status/branch', [BranchController::class, 'index'])->name('branch.index');
    Route::post('/settings/status/branch', [BranchController::class, 'store'])->name('branch.store');
    Route::get('/settings/status/branch/{id}', [BranchController::class, 'show'])->name('branch.show');
    Route::put('/settings/status/branch/{id}', [BranchController::class, 'update'])->name('branch.update');
    Route::delete('/settings/status/branch/{id}', [BranchController::class, 'destroy'])->name('branch.destroy');

    // Route CRUD for company
    Route::get('/settings/status/company', [CompanyController::class, 'index'])->name('company.index');
    Route::post('/settings/status/company', [CompanyController::class, 'store'])->name('company.store');
    Route::get('/settings/status/company/{id}', [CompanyController::class, 'show'])->name('company.show');
    Route::put('/settings/status/company/{id}', [CompanyController::class, 'update'])->name('company.update');
    Route::delete('/settings/status/company/{id}', [CompanyController::class, 'destroy'])->name('company.destroy');

    // Route CRUD for shipment
    Route::get('/settings/status/shipment', [ShipmentController::class, 'index'])->name('shipment.index');
    Route::post('/settings/status/shipment', [ShipmentController::class, 'store'])->name('shipment.store');
    Route::get('/settings/status/shipment/{id}', [ShipmentController::class, 'show'])->name('shipment.show');
    Route::put('/settings/status/shipment/{id}', [ShipmentController::class, 'update'])->name('shipment.update');
    Route::delete('/settings/status/shipment/{id}', [ShipmentController::class, 'destroy'])->name('shipment.destroy');

    // Route CRUD for method
    Route::get('/settings/status/method', [MethodController::class, 'index'])->name('method.index');
    Route::post('/settings/status/method', [MethodController::class, 'store'])->name('method.store');
    Route::get('/settings/status/method/{id}', [MethodController::class, 'show'])->name('method.show');
    Route::put('/settings/status/method/{id}', [MethodController::class, 'update'])->name('method.update');
    Route::delete('/settings/status/method/{id}', [MethodController::class, 'destroy'])->name('method.destroy');

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

    // route list po
    Route::get('/po/list', [ListPOController::class, 'index'])->name('po.list');
    Route::put('/po/{poDetail}', [ListPOController::class, 'update'])->name('po.update');
    Route::delete('/po/{poDetail}', [ListPOController::class, 'destroy'])->name('po.destroy');
    Route::post('/po/{poDetail}/toggle-order', [ListPOController::class, 'toggleOrder'])->name('po.toggle-order');

});






