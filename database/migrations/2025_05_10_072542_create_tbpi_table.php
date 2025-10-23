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
        Schema::create('tbpi', function (Blueprint $table) {
            $table->id();
            $table->text('pi_number')->nullable();
            $table->date('date')->nullable();
            $table->double('discount')->nullable();
            $table->integer('shipment_id')->nullable();
            $table->integer('amout_ctn')->nullable();
            $table->text('reciept_number')->nullable();
            $table->text('tracking_number')->nullable();
            $table->text('note')->nullable();
            $table->double('extra_charge', 10, 3)->nullable();
            $table->date('arrival_date')->nullable();
            $table->integer('shipping_method')->nullable();
            $table->text('pi_name')->nullable();
            $table->foreignId('company_id')->nullable()->constrained('company')->onDelete('set null');
            $table->double('openbalance', 10, 3)->nullable();
            $table->text('pi_name_cn')->nullable();
            $table->foreignId('user_id')->constrained('tbluser')->onDelete('cascade');
            $table->integer('status')->default(1);
            $table->integer('tracking_status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbpi');
    }
};
