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
        Schema::table('tbluser', function (Blueprint $table) {
            $table->string('branch_id_multiple')->nullable(); // int, nullable
            $table->integer('company_id')->nullable(); // int, nullable
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbluser', function (Blueprint $table) {
            $table->dropColumn(['branch_id_multiple', 'company_id']);
        });
    }
};
