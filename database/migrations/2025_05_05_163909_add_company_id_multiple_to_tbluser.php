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
            $table->dropColumn('company_id');
            $table->string('company_id_multiple')->nullable()->after('branch_id_multiple');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbluser', function (Blueprint $table) {
            $table->dropColumn('company_id_multiple');
            $table->integer('company_id')->nullable()->after('branch_id_multiple');
        });
    }
};
