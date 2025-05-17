<?php

namespace App\Http\Controllers;

use App\Models\Shipment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ShipmentController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 25);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');

        $query = Shipment::active()
            ->when($search, function ($query, $search) {
                return $query->where('shipment_name', 'like', '%' . $search . '%')
                             ->orWhere('address', 'like', '%' . $search . '%');
            })
            ->orderBy('id', 'desc');

        $shipments = $query->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('Shipment/ShipmentManager', [
            'shipments' => $shipments,
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
            'shipment_name' => 'required|string|max:255|unique:tbshipment,shipment_name',
            'address' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        Shipment::create([
            'shipment_name' => $validated['shipment_name'],
            'address' => $validated['address'],
            'note' => $validated['note'],
            'status' => 1,
            'created_by' => Auth::id(),
        ]);

        return redirect()->route('shipment.index')->with('flash', [
            'success' => 'Shipment created successfully.',
        ]);
    }

    public function show($id)
    {
        $shipment = Shipment::active()->findOrFail($id);
        return response()->json($shipment);
    }

    public function update(Request $request, $id)
    {
        $shipment = Shipment::active()->findOrFail($id);

        $validated = $request->validate([
            'shipment_name' => 'required|string|max:255|unique:tbshipment,shipment_name,' . $id,
            'address' => 'nullable|string',
            'note' => 'nullable|string',
        ]);

        $shipment->update([
            'shipment_name' => $validated['shipment_name'],
            'address' => $validated['address'],
            'note' => $validated['note'],
        ]);

        return redirect()->route('shipment.index')->with('flash', [
            'success' => 'Shipment updated successfully.',
        ]);
    }

    public function destroy($id)
    {
        $shipment = Shipment::active()->findOrFail($id);
        $shipment->update(['status' => 0]);

        return redirect()->route('shipment.index')->with('flash', [
            'success' => 'Shipment deleted successfully.',
        ]);
    }
}
?>
