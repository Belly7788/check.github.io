<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferencePayment extends Model
{
    use HasFactory;

    protected $table = 'tbreference_payment';

    protected $fillable = [
        'payment_id',
        'image',
    ];

    public function payment()
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }
}
