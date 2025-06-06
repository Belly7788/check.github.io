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
        Schema::create('tbpayment', function (Blueprint $table) {
            $table->id();
            $table->string('payment_number',100);
            $table->foreignId('company_id')->nullable()->constrained('company')->onDelete('set null');
            $table->date('date');
            $table->integer('payment_method');
            $table->text('memo')->nullable();
            $table->integer('aprove')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->foreign('created_by')->references('id')->on('tbluser')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbpayment');
    }
};
