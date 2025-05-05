<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 25);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');

        $query = User::active()
            ->with(['role', 'branch', 'creator'])
            ->when($search, function ($query, $search) {
                return $query->where('username', 'like', '%' . $search . '%');
            })
            ->orderBy('id', 'desc'); // Add this line to sort by id in descending order

        $users = $query->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('User/User_Manager', [
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
            'roles' => Role::all()->map(function ($role) {
                return ['id' => $role->id, 'name' => $role->rolename];
            }),
            'branches' => Branch::active()->get()->map(function ($branch) {
                return ['id' => $branch->id, 'name' => $branch->branch_name_en];
            }),
            'companies' => Company::active()->get()->map(function ($company) {
                return ['id' => $company->id, 'name' => $company->company_name];
            }),
            'search' => $search,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:tbluser,username',
            'password' => 'required|string|min:8|confirmed',
            'role_id' => 'required|exists:tbrole,id',
            'branch_id' => 'nullable|exists:tbbranch,id',
            'branch_id_multiple' => 'nullable|array',
            'branch_id_multiple.*' => 'exists:tbbranch,id',
            'company_id_multiple' => 'nullable|array',
            'company_id_multiple.*' => 'exists:company,id',
            'desc' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id'],
            'branch_id' => $validated['branch_id'],
            'branch_id_multiple' => $validated['branch_id_multiple'],
            'company_id_multiple' => $validated['company_id_multiple'],
            'desc' => $validated['desc'],
            'image' => $validated['image'],
            'status' => 1,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('user.index')->with('success', 'User created successfully.');
    }

    public function show($id)
    {
        $user = User::active()->with(['role', 'branch', 'creator'])->findOrFail($id);
        return response()->json($user);
    }

    public function update(Request $request, $id)
    {
        $user = User::active()->findOrFail($id);

        $validated = $request->validate([
            'username' => 'required|string|max:255|unique:tbluser,username,' . $id,
            'password' => 'nullable|string|min:8|confirmed',
            'role_id' => 'required|exists:tbrole,id',
            'branch_id' => 'nullable|exists:tbbranch,id',
            'branch_id_multiple' => 'nullable|array',
            'branch_id_multiple.*' => 'exists:tbbranch,id',
            'company_id_multiple' => 'nullable|array',
            'company_id_multiple.*' => 'exists:company,id',
            'desc' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        $user->update([
            'username' => $validated['username'],
            'password' => $validated['password'] ? Hash::make($validated['password']) : $user->password,
            'role_id' => $validated['role_id'],
            'branch_id' => $validated['branch_id'],
            'branch_id_multiple' => $validated['branch_id_multiple'],
            'company_id_multiple' => $validated['company_id_multiple'],
            'desc' => $validated['desc'],
            'image' => $validated['image'],
        ]);

        return redirect()->route('user.index')->with('success', 'User updated successfully.');
    }

    public function updateStatus($id)
    {
        $user = User::active()->findOrFail($id);
        $user->update(['status' => 0]);
        return redirect()->route('user.index')->with('success', 'User deleted successfully.');
    }

    public function search(Request $request)
    {
        $search = $request->input('search', '');
        $perPage = $request->input('per_page', 25);
        $page = $request->input('page', 1);

        $query = User::active()
            ->with(['role', 'branch', 'creator'])
            ->when($search, function ($query, $search) {
                return $query->where('username', 'like', '%' . $search . '%');
            });


        $users = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'users' => $users->items(),
            'pagination' => [
                'current_page' => $users->currentPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }
}
