<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $table = 'tbbranch';

    protected $fillable = ['branch_name_en', 'branch_name_kh', 'remark', 'status'];

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }
}
