<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CheckPermission extends Model
{
    use HasFactory;

    protected $table = 'check_permission';

    protected $fillable = ['name', 'note', 'permission_id', 'sub_permission_id'];

    // Relationship with permission
    public function permission()
    {
        return $this->belongsTo(Permission::class, 'permission_id');
    }

    // Relationship with sub_permission
    public function subPermission()
    {
        return $this->belongsTo(SubPermission::class, 'sub_permission_id');
    }
}
