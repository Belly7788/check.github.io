<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('tbproduct', function (Blueprint $table) {
            $table->id();
            $table->string('product_code', 100)->nullable();
            $table->string('name_kh', 100)->nullable();
            $table->string('name_en', 100)->nullable();
            $table->string('name_cn', 100)->nullable();
            $table->text('image')->nullable();
            $table->text('declare')->nullable();
            $table->string('HS_code', 100)->nullable();
            $table->string('category', 100)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbproduct');
    }
};
