<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pi extends Model
{
    use HasFactory;

    protected $table = 'tbpi';

    protected $fillable = [
        'pi_number',
        'pi_name',
        'pi_name_cn',
        'date',
        'discount',
        'shipment_id',
        'amout_ctn',
        'reciept_number',
        'tracking_number',
        'note',
        'extra_charge',
        'arrival_date',
        'shipping_method',
        'company_id',
        'openbalance',
        'user_id',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'arrival_date' => 'date',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function piDetails()
    {
        return $this->hasMany(PiDetail::class, 'pi_id');
    }

    public function referenceImages()
    {
        return $this->hasMany(ReferenceImage::class, 'pi_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Add the method relationship
    public function method()
    {
        return $this->belongsTo(Method::class, 'shipping_method', 'id');
    }
}
