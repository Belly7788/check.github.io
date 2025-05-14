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
