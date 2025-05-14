<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $table = 'tbproduct';

    protected $fillable = [
        'product_code',
        'name_kh',
        'name_en',
        'name_cn',
        'image',
        'declare',
        'HS_code',
        'user_id',
        'status',
    ];

    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id');
    }

    public function videos()
    {
        return $this->hasMany(ProductVideo::class, 'product_id');
    }
}
