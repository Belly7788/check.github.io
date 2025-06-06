<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompilePermission extends Model
{
    use HasFactory;

    protected $table = 'compile_permission';

    protected $fillable = ['role_id', 'permission_id', 'sub_permission_id', 'check_permission_id'];

    // Relationships
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function permission()
    {
        return $this->belongsTo(Permission::class, 'permission_id');
    }

    public function subPermission()
    {
        return $this->belongsTo(SubPermission::class, 'sub_permission_id');
    }

    public function checkPermission()
    {
        return $this->belongsTo(CheckPermission::class, 'check_permission_id');
    }
}
