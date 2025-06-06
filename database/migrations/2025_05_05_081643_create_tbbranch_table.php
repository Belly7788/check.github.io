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
        Schema::create('tbbranch', function (Blueprint $table) {
            $table->id();
            $table->string('branch_name_en', 50);
            $table->string('branch_name_kh', 50);
            $table->text('remark')->nullable();
            $table->integer('status')->default(1); // int(11) NOT NULL DEFAULT 1
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbbranch');
    }
};
