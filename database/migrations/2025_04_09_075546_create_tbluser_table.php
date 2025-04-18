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
        Schema::create('tbluser', function (Blueprint $table) {
            $table->id(); // int(11) NOT NULL
            $table->string('username'); // varchar(255) NOT NULL
            $table->text('password'); // text NOT NULL
            $table->text('image'); // text NOT NULL
            $table->integer('role_id'); // int(11) NOT NULL
            $table->integer('status')->default(1); // int(11) NOT NULL DEFAULT 1
            $table->text('desc'); // text NOT NULL
            $table->integer('branch_id')->nullable(); // int(11) DEFAULT NULL
            $table->string('remember_token', 64)->nullable(); // varchar(64) DEFAULT NULL
            $table->dateTime('token_expires_at')->nullable(); // datetime DEFAULT NULL
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tbluser');
    }
};
