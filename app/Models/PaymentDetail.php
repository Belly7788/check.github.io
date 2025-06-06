<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentDetail extends Model
{
    use HasFactory;

    protected $table = 'tbpayment_details';

    protected $fillable = [
        'checkbox',
        'payment_balance',
        'discount_payment',
        'payment',
        'pi_id',
        'payment_id',
        'status_discount',
    ];

    public function pi()
    {
        return $this->belongsTo(Pi::class, 'pi_id');
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }
}
