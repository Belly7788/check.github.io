<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use App\Models\SubPermission;
use App\Models\CheckPermission;
use App\Models\CompilePermission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 25);
        $search = $request->input('search', '');

        $roles = Role::query()
            ->when($search, fn($query) => $query->where('rolename', 'like', "%{$search}%"))
            ->with('compilePermissions.permission', 'compilePermissions.subPermission', 'compilePermissions.checkPermission')
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        // Fetch all permissions and sub-permissions for the frontend
        $permissions = Permission::with('subPermissions', 'checkPermissions')->get();
        $subPermissions = SubPermission::with('checkPermissions')->get();
        $checkPermissions = CheckPermission::all();

        return Inertia::render('Role/List_role', [
            'roles' => $roles,
            'permissions' => $permissions,
            'subPermissions' => $subPermissions,
            'checkPermissions' => $checkPermissions,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'rolename' => 'required|string|max:100|unique:tbrole,rolename',
            'desc' => 'nullable|string',
            'permission_ids' => 'array|nullable',
            'sub_permission_ids' => 'array|nullable',
            'check_permission_ids' => 'array|nullable',
        ]);

        // Create the role
        $role = Role::create([
            'rolename' => $validated['rolename'],
            'desc' => $validated['desc'],
        ]);

        // Save compile permissions
        $this->saveCompilePermissions($role->id, $validated);

        return redirect()->back()->with('success', 'Role created successfully.');
    }

    public function show(Role $role)
    {
        $role->load('compilePermissions.permission', 'compilePermissions.subPermission', 'compilePermissions.checkPermission');
        return response()->json($role);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'rolename' => 'required|string|max:100|unique:tbrole,rolename,' . $role->id,
            'desc' => 'nullable|string',
            'permission_ids' => 'array|nullable',
            'sub_permission_ids' => 'array|nullable',
            'check_permission_ids' => 'array|nullable',
        ]);

        // Update the role
        $role->update([
            'rolename' => $validated['rolename'],
            'desc' => $validated['desc'],
        ]);

        // Delete existing compile permissions
        CompilePermission::where('role_id', $role->id)->delete();

        // Save new compile permissions
        $this->saveCompilePermissions($role->id, $validated);

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        // Delete associated compile permissions
        CompilePermission::where('role_id', $role->id)->delete();
        $role->delete();

        return redirect()->back()->with('success', 'Role deleted successfully.');
    }

    private function saveCompilePermissions($roleId, $data)
    {
        $permissionIds = $data['permission_ids'] ?? [];
        $subPermissionIds = $data['sub_permission_ids'] ?? [];
        $checkPermissionIds = $data['check_permission_ids'] ?? [];

        // Combine all permissions into compile_permission entries
        foreach ($checkPermissionIds as $checkPermissionId) {
            $checkPermission = CheckPermission::find($checkPermissionId);
            if ($checkPermission) {
                CompilePermission::create([
                    'role_id' => $roleId,
                    'permission_id' => $checkPermission->permission_id,
                    'sub_permission_id' => $checkPermission->sub_permission_id,
                    'check_permission_id' => $checkPermissionId,
                ]);
            }
        }

        // Add permissions without check permissions
        foreach ($permissionIds as $permissionId) {
            if (!CompilePermission::where('role_id', $roleId)->where('permission_id', $permissionId)->exists()) {
                CompilePermission::create([
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                    'sub_permission_id' => null,
                    'check_permission_id' => null,
                ]);
            }
        }

        // Add sub-permissions without check permissions
        foreach ($subPermissionIds as $subPermissionId) {
            $subPermission = SubPermission::find($subPermissionId);
            if ($subPermission && !CompilePermission::where('role_id', $roleId)->where('sub_permission_id', $subPermissionId)->exists()) {
                CompilePermission::create([
                    'role_id' => $roleId,
                    'permission_id' => $subPermission->permission_id,
                    'sub_permission_id' => $subPermissionId,
                    'check_permission_id' => null,
                ]);
            }
        }
    }
}
