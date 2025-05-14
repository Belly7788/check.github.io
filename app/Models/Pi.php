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
        'date',
        'pi_name',
        'pi_name_cn',
        'company_id',
        'discount',
        'extra_charge',
        'openbalance',
        'user_id',
        'status',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function details()
    {
        return $this->hasMany(PiDetail::class, 'pi_id');
    }
}
