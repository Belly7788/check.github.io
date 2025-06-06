<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use Notifiable;

    protected $table = 'tbluser';

    protected $fillable = [
        'username',
        'password',
        'image',
        'role_id',
        'status',
        'desc',
        'branch_id',
        'branch_id_multiple',
        'company_id_multiple',
        'created_by',
        'email',
        'cover',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function getAuthPassword()
    {
        return $this->password;
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class, 'branch_id');
    }

    public function company()
    {
        return $this->hasMany(Company::class, 'id', 'company_id_multiple');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 1);
    }

    public function getBranchIdMultipleAttribute($value)
    {
        return $value ? explode(',', $value) : [];
    }

    public function setBranchIdMultipleAttribute($value)
    {
        $this->attributes['branch_id_multiple'] = is_array($value) ? implode(',', $value) : $value;
    }

    public function getCompanyIdMultipleAttribute($value)
    {
        return $value ? explode(',', $value) : [];
    }

    public function setCompanyIdMultipleAttribute($value)
    {
        $this->attributes['company_id_multiple'] = is_array($value) ? implode(',', $value) : $value;
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
