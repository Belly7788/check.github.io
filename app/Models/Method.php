<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Method extends Model
{
    use HasFactory;

    protected $table = 'tbmethod';

    protected $fillable = ['name_method', 'numberdate', 'note', 'status'];

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }
}
