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
            // Check if role_id column exists before adding it
            if (!Schema::hasColumn('tbluser', 'role_id')) {
                $table->unsignedBigInteger('role_id')->nullable(); // Add role_id column
            }

            // Add foreign key constraint
            $table->foreign('role_id')->references('id')->on('tbrole')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbluser', function (Blueprint $table) {
            // Drop the foreign key and the column
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }
};
