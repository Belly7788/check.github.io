<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    use HasFactory;

    protected $table = 'tbshipment';

    protected $fillable = ['shipment_name', 'address', 'note', 'status'];

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }
}
?>
