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
        Schema::create('tbpo_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('tbproduct')->onDelete('cascade');
            $table->date('date')->default(now())->nullable(); // Set default to current date
            $table->integer('amount')->nullable();
            $table->integer('rating')->nullable();
            $table->text('remark')->nullable();
            $table->integer('order')->default(0);
            $table->foreignId('user_id')->constrained('tbluser')->onDelete('cascade');
            $table->integer('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbpo_detail');
    }
};
