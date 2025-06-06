<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Permission extends Model
{
    use HasFactory;

    protected $table = 'tbpermission';

    protected $fillable = ['name', 'note'];

    // Relationship with sub_permissions
    public function subPermissions()
    {
        return $this->hasMany(SubPermission::class, 'permission_id');
    }

    // Relationship with check_permissions
    public function checkPermissions()
    {
        return $this->hasMany(CheckPermission::class, 'permission_id');
    }
}
