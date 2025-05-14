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
        Schema::create('tbpidetail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('tbproduct')->onDelete('cascade');
            $table->integer('amount')->nullable();
            $table->double('unit_price')->nullable();
            $table->text('note')->nullable();
            $table->integer('shipping')->nullable();
            $table->double('shipping_fee')->nullable();
            $table->double('net_price')->nullable();
            $table->double('ctn_size_w')->nullable();
            $table->double('ctn_size_h')->nullable();
            $table->double('ctn_size_l')->nullable();
            $table->integer('amount_ctn_by_product')->nullable();
            $table->double('price_cbm')->nullable();
            $table->double('truck_fee')->nullable();
            $table->double('extra_charge')->nullable();
            $table->integer('arrived')->nullable();
            $table->foreignId('pi_id')->constrained('tbpi')->onDelete('cascade');
            $table->integer('delivery')->nullable();
            $table->integer('ctn')->nullable();
            $table->date('cargo_date')->nullable();
            $table->integer('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbpidetail');
    }
};
