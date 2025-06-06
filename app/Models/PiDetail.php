<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PiDetail extends Model
{
    use HasFactory;

    protected $table = 'tbpidetail';

    protected $fillable = [
        'pi_id',
        'product_id',
        'amount',
        'unit_price',
        'note',
        'ctn',
        'status',
        'shipping',
        'shipping_fee',
        'net_price',
        'ctn_size_w',
        'ctn_size_h',
        'ctn_size_l',
        'amount_ctn_by_product',
        'price_cbm',
        'truck_fee',
        'extra_charge',
        'arrived',
        'delivery',
        'cargo_date',
        'note_receipt',
        'receipt_picture',
        'receipt_product',
    ];

    protected $casts = [
        'cargo_date' => 'date:Y-m-d',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function pi()
    {
        return $this->belongsTo(Pi::class, 'pi_id');
    }
}
