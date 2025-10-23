<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AfterSale extends Model
{
    protected $table = 'after_sale';

    protected $fillable = [
        'main_after_sale_id',
        'product_id',
        'pi_id',
        'qty',
        'unit_price',
        'who_affort_id',
        'compensale_method_id',
        'remark',
    ];

    public function mainAfterSale()
    {
        return $this->belongsTo(MainAfterSale::class, 'main_after_sale_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function pi()
    {
        return $this->belongsTo(Pi::class, 'pi_id');
    }

    public function whoAffort()
    {
        return $this->belongsTo(WhoAffort::class, 'who_affort_id');
    }

    public function compensaleMethod()
    {
        return $this->belongsTo(CompensaleMethod::class, 'compensale_method_id');
    }
}