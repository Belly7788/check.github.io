<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompensaleMethod extends Model
{
    protected $table = 'compensale_method';

    protected $fillable = ['name', 'remark', 'status'];

    public function afterSales()
    {
        return $this->hasMany(AfterSale::class, 'compensale_method_id');
    }
}