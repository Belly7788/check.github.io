<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 25);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');

        $query = Branch::active()
            ->when($search, function ($query, $search) {
                return $query->where('branch_name_en', 'like', '%' . $search . '%')
                             ->orWhere('branch_name_kh', 'like', '%' . $search . '%');
            })
            ->orderBy('id', 'desc');

        $branches = $query->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('Branch/BranchManager', [
            'branches' => $branches,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'page' => $page,
            ],
            'flash' => $request->session()->get('flash'),
            'darkMode' => true, // Adjust based on your dark mode logic
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_name_en' => 'required|string|max:50|unique:tbbranch,branch_name_en',
            'branch_name_kh' => 'required|string|max:50|unique:tbbranch,branch_name_kh',
            'remark' => 'nullable|string',
        ]);

        Branch::create([
            'branch_name_en' => $validated['branch_name_en'],
            'branch_name_kh' => $validated['branch_name_kh'],
            'remark' => $validated['remark'],
            'status' => 1,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('branch.index')->with('flash', [
            'success' => 'Branch created successfully.',
        ]);
    }

    public function show($id)
    {
        $branch = Branch::active()->findOrFail($id);
        return response()->json($branch);
    }

    public function update(Request $request, $id)
    {
        $branch = Branch::active()->findOrFail($id);

        $validated = $request->validate([
            'branch_name_en' => 'required|string|max:50|unique:tbbranch,branch_name_en,' . $id,
            'branch_name_kh' => 'required|string|max:50|unique:tbbranch,branch_name_kh,' . $id,
            'remark' => 'nullable|string',
        ]);

        $branch->update([
            'branch_name_en' => $validated['branch_name_en'],
            'branch_name_kh' => $validated['branch_name_kh'],
            'remark' => $validated['remark'],
        ]);

        return redirect()->route('branch.index')->with('flash', [
            'success' => 'Branch updated successfully.',
        ]);
    }

    public function destroy($id)
    {
        $branch = Branch::active()->findOrFail($id);
        $branch->update(['status' => 0]);

        return redirect()->route('branch.index')->with('flash', [
            'success' => 'Branch deleted successfully.',
        ]);
    }
}
?>
