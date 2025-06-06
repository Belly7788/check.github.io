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
            $table->text('cover')->nullable(); // text, nullable
            $table->string('email')->nullable(); // varchar(255), nullable
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tbluser', function (Blueprint $table) {
            $table->dropColumn('cover');
            $table->dropColumn('email');
        });
    }
};
