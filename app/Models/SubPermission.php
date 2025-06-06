<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SubPermission extends Model
{
    use HasFactory;

    protected $table = 'sub_permission';

    protected $fillable = ['name', 'permission_id'];

    // Relationship with permission
    public function permission()
    {
        return $this->belongsTo(Permission::class, 'permission_id');
    }

    // Relationship with check_permissions
    public function checkPermissions()
    {
        return $this->hasMany(CheckPermission::class, 'sub_permission_id');
    }
}
