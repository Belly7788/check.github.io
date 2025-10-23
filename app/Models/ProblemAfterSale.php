<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProblemAfterSale extends Model
{
    protected $table = 'broblem_after_sale';
    protected $fillable = ['name', 'remark', 'status'];
}