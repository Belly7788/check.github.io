<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReferenceImage extends Model
{
    use HasFactory;

    protected $table = 'reference_image';

    protected $fillable = [
        'image',
        'pi_id',
    ];

    public function pi()
    {
        return $this->belongsTo(Pi::class, 'pi_id');
    }
}
