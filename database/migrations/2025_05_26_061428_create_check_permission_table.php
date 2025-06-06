<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_permission', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->text('note')->nullable();
            $table->unsignedBigInteger('permission_id')->nullable();
            $table->unsignedBigInteger('sub_permission_id')->nullable();
            $table->foreign('permission_id')->references('id')->on('tbpermission')->onDelete('cascade');
            $table->foreign('sub_permission_id')->references('id')->on('sub_permission')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_permission');
    }
};
