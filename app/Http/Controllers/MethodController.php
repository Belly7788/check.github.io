<?php

namespace App\Http\Controllers;

use App\Models\Method;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MethodController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 25);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');

        $query = Method::active()
            ->when($search, function ($query, $search) {
                return $query->where('name_method', 'like', '%' . $search . '%')
                             ->orWhere('note', 'like', '%' . $search . '%');
            })
            ->orderBy('id', 'desc');

        $methods = $query->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('Method/MethodManager', [
            'methods' => $methods,
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
            'name_method' => 'required|string|max:100|unique:tbmethod,name_method',
            'numberdate' => 'nullable|integer',
            'note' => 'nullable|string',
        ]);

        Method::create([
            'name_method' => $validated['name_method'],
            'numberdate' => $validated['numberdate'],
            'note' => $validated['note'],
            'status' => 1,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('method.index')->with('flash', [
            'success' => 'Method created successfully.',
        ]);
    }

    public function show($id)
    {
        $method = Method::active()->findOrFail($id);
        return response()->json($method);
    }

    public function update(Request $request, $id)
    {
        $method = Method::active()->findOrFail($id);

        $validated = $request->validate([
            'name_method' => 'required|string|max:100|unique:tbmethod,name_method,' . $id,
            'numberdate' => 'nullable|integer',
            'note' => 'nullable|string',
        ]);

        $method->update([
            'name_method' => $validated['name_method'],
            'numberdate' => $validated['numberdate'],
            'note' => $validated['note'],
        ]);

        return redirect()->route('method.index')->with('flash', [
            'success' => 'Method updated successfully.',
        ]);
    }

    public function destroy($id)
    {
        $method = Method::active()->findOrFail($id);
        $method->update(['status' => 0]);

        return redirect()->route('method.index')->with('flash', [
            'success' => 'Method deleted successfully.',
        ]);
    }
}
