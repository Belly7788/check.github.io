<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        // Recreate who_affort table
        if (Schema::hasTable('who_affort')) {
            Schema::dropIfExists('who_affort');
        }
        
        Schema::create('who_affort', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('name');
            $table->timestamps();
        });

        // Recreate compensale_method table
        if (Schema::hasTable('compensale_method')) {
            Schema::dropIfExists('compensale_method');
        }
        
        Schema::create('compensale_method', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->string('name');
            $table->timestamps();
        });

        // Create after_sale table WITHOUT foreign keys first
        if (Schema::hasTable('after_sale')) {
            Schema::dropIfExists('after_sale');
        }
        
        Schema::create('after_sale', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('tbproduct')->onDelete('cascade');
            $table->foreignId('main_after_sale_id')->constrained('main_after_sale')->onDelete('cascade');
            $table->foreignId('pi_id')->constrained('tbpi')->onDelete('cascade');
            $table->integer('qty')->nullable();
            $table->double('unit_price')->nullable();
            $table->unsignedBigInteger('who_affort_id')->nullable();
            $table->unsignedBigInteger('compensale_method_id')->nullable();
            $table->text('remark')->nullable();
            $table->timestamps();
        });

        // Add foreign keys separately
        Schema::table('after_sale', function (Blueprint $table) {
            $table->foreign('who_affort_id')
                  ->references('id')
                  ->on('who_affort')
                  ->onDelete('set null');
                  
            $table->foreign('compensale_method_id')
                  ->references('id')
                  ->on('compensale_method')
                  ->onDelete('set null');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    public function down(): void
    {
        Schema::dropIfExists('after_sale');
        Schema::dropIfExists('compensale_method');
        Schema::dropIfExists('who_affort');
    }
};