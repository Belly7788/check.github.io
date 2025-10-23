<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhoAffort extends Model
{
    protected $table = 'who_affort';

    protected $fillable = ['name', 'remark', 'status'];

    public function afterSales()
    {
        return $this->hasMany(AfterSale::class, 'who_affort_id');
    }
}