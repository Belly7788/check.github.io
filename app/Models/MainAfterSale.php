<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MainAfterSale extends Model
{
    protected $table = 'main_after_sale';

    protected $fillable = [
        'case_number',
        'date',
        'total',
        'company_id',
        'broblem_type_id',
        'user_id',
        'status',
        'ishow',
        'video',
        'image',
        'remark',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function broblemType()
    {
        return $this->belongsTo(ProblemAfterSale::class, 'broblem_type_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function afterSales()
    {
        return $this->hasMany(AfterSale::class, 'main_after_sale_id');
    }
}