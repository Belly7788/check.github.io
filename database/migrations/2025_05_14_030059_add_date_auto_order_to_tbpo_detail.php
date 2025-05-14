<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tbpo_detail', function (Blueprint $table) {
            $table->date('date_auto_order')->nullable()->after('order');
        });
    }

    public function down(): void
    {
        Schema::table('tbpo_detail', function (Blueprint $table) {
            $table->dropColumn('date_auto_order');
        });
    }
};
