<?php

namespace App\Http\Controllers;

use App\Models\Role;
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
            ->orderBy('id', 'desc') // Sort by id in descending order
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Role/List_role', [
            'roles' => $roles,
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
            'permissionid' => 'nullable|integer',
        ]);

        Role::create($validated);

        return redirect()->back();
    }

    public function show(Role $role)
    {
        // Return JSON response for AJAX-like requests
        return response()->json($role);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'rolename' => 'required|string|max:100|unique:tbrole,rolename,' . $role->id,
            'desc' => 'nullable|string',
            'permissionid' => 'nullable|integer',
        ]);

        $role->update($validated);

        return redirect()->back();
    }

    public function destroy(Role $role)
    {
        $role->delete();

        return redirect()->back();
    }
}
