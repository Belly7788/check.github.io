<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $table = 'tbpayment';

    protected $fillable = [
        'payment_number',
        'company_id',
        'date',
        'payment_method',
        'memo',
        'aprove',
        'created_by',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function paymentDetails()
    {
        return $this->hasMany(PaymentDetail::class, 'payment_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function referencePayments()
    {
        return $this->hasMany(ReferencePayment::class, 'payment_id');
    }
}
