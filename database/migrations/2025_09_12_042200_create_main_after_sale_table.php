<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('main_after_sale', function (Blueprint $table) {
            $table->id();
            $table->string('case_number', 50);
            $table->date('date');
            $table->double('total',10,3);
            
            // Use the same data type as the referenced table
            $table->unsignedBigInteger('broblem_type_id')->nullable();
            
            $table->text('video')->nullable();
            $table->text('image')->nullable();
            $table->text('remark')->nullable();
            
            $table->foreignId('company_id')->nullable()->constrained('company')->onDelete('set null');
            $table->foreignId('user_id')->constrained('tbluser')->onDelete('cascade');
            
            $table->integer('status')->nullable();
            $table->integer('ishow')->default(1);
            $table->timestamps();
            
            // Add foreign key constraint separately
            $table->foreign('broblem_type_id')
                  ->references('id')
                  ->on('broblem_after_sale')
                  ->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('main_after_sale');
    }
};