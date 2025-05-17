<?php

namespace App\Http\Controllers;

use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 25);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');

        $query = Company::active()
            ->when($search, function ($query, $search) {
                return $query->where('company_name', 'like', '%' . $search . '%');
            })
            ->orderBy('id', 'desc');

        $companies = $query->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('Company/CompanyManager', [
            'companies' => $companies,
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
            'company_name' => 'required|string|max:100|unique:company,company_name',
            'remark' => 'nullable|string',
        ]);

        Company::create([
            'company_name' => $validated['company_name'],
            'remark' => $validated['remark'],
            'status' => 1,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('company.index')->with('flash', [
            'success' => 'Company created successfully.',
        ]);
    }

    public function show($id)
    {
        $company = Company::active()->findOrFail($id);
        return response()->json($company);
    }

    public function update(Request $request, $id)
    {
        $company = Company::active()->findOrFail($id);

        $validated = $request->validate([
            'company_name' => 'required|string|max:100|unique:company,company_name,' . $id,
            'remark' => 'nullable|string',
        ]);

        $company->update([
            'company_name' => $validated['company_name'],
            'remark' => $validated['remark'],
        ]);

        return redirect()->route('company.index')->with('flash', [
            'success' => 'Company updated successfully.',
        ]);
    }

    public function destroy($id)
    {
        $company = Company::active()->findOrFail($id);
        $company->update(['status' => 0]);

        return redirect()->route('company.index')->with('flash', [
            'success' => 'Company deleted successfully.',
        ]);
    }
}
?>
