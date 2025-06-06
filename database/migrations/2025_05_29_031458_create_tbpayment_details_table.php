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
        Schema::create('tbpayment_details', function (Blueprint $table) {
            $table->id();
            $table->integer('checkbox')->nullable();
            $table->double('payment_balance',10,3);
            $table->double('discount_payment',10,3);
            $table->double('payment',10,3);
            $table->foreignId('pi_id')->constrained('tbpi')->onDelete('cascade');
            $table->foreignId('payment_id')->constrained('tbpayment')->onDelete('cascade');
            $table->integer('status_discount');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbpayment_details');
    }
};
