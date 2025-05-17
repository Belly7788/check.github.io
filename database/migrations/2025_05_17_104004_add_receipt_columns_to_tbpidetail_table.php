<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddReceiptColumnsToTbpidetailTable extends Migration
{
    public function up()
    {
        Schema::table('tbpidetail', function (Blueprint $table) {
            $table->text('receipt_picture')->nullable();
            $table->text('receipt_product')->nullable();
            $table->text('note_receipt')->nullable();
        });
    }

    public function down()
    {
        Schema::table('tbpidetail', function (Blueprint $table) {
            $table->dropColumn(['receipt_picture', 'receipt_product', 'note_receipt']);
        });
    }
}
