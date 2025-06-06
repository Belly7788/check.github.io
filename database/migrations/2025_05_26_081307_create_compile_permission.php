<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('compile_permission', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('permission_id')->nullable();
            $table->unsignedBigInteger('sub_permission_id')->nullable();
            $table->unsignedBigInteger('check_permission_id');
            $table->foreign('role_id')->references('id')->on('tbrole')->onDelete('cascade');
            $table->foreign('permission_id')->references('id')->on('tbpermission')->onDelete('cascade');
            $table->foreign('sub_permission_id')->references('id')->on('sub_permission')->onDelete('cascade');
            $table->foreign('check_permission_id')->references('id')->on('check_permission')->onDelete('cascade');
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('compile_permission');
    }
};
