<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $table = 'tbrole';

    protected $fillable = ['rolename', 'desc'];

    // Relationship with compile_permission
    public function compilePermissions()
    {
        return $this->hasMany(CompilePermission::class, 'role_id');
    }

    // Get permission IDs from compile_permission
    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'compile_permission', 'role_id', 'permission_id')
                    ->withPivot('sub_permission_id', 'check_permission_id');
    }
}
