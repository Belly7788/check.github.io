<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $table = 'company';

    protected $fillable = ['company_name', 'remark', 'status'];

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }
}
