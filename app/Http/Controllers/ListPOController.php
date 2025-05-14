<?php

namespace App\Http\Controllers;

use App\Models\PoDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ListPOController extends Controller
{
    public function index(Request $request)
    {
        // Retrieve filter inputs with defaults
        $perPage = $request->input('per_page', 25);
        $search = $request->input('search', '');
        $sortField = $request->input('sort_field', 'id');
        $sortDirection = $request->input('sort_direction', 'desc');
        $ratings = $request->input('rating', []);
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');
        $orderStatuses = $request->input('order_status', [1, 0]);

        // Build the query
        $query = PoDetail::query()
            ->select('tbpo_detail.*', 'tbproduct.product_code', 'tbproduct.name_kh', 'tbproduct.name_en', 'tbproduct.name_cn', 'tbproduct.image')
            ->join('tbproduct', 'tbpo_detail.product_id', '=', 'tbproduct.id')
            ->where('tbpo_detail.status', 1);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('tbproduct.product_code', 'like', "%{$search}%")
                  ->orWhere('tbproduct.name_kh', 'like', "%{$search}%")
                  ->orWhere('tbproduct.name_en', 'like', "%{$search}%")
                  ->orWhere('tbproduct.name_cn', 'like', "%{$search}%");
            });
        }

        // Apply rating filter
        if (!empty($ratings)) {
            $query->whereIn('tbpo_detail.rating', array_map('intval', $ratings));
        }

        // Apply date range filter
        if ($startDate) {
            $query->whereDate('tbpo_detail.date', '>=', $startDate);
        }
        if ($endDate) {
            $query->whereDate('tbpo_detail.date', '<=', $endDate);
        }

        // Apply order status filter
        if (!empty($orderStatuses) && count($orderStatuses) < 2) {
            $query->whereIn('tbpo_detail.order', array_map('intval', $orderStatuses));
            $query->whereNotNull('tbpo_detail.order');
        }

        // Apply sorting
        $productColumns = ['product_code', 'name_kh', 'name_en', 'name_cn'];
        if ($sortField === 'name') {
            $query->orderBy('tbproduct.name_kh', $sortDirection)
                  ->orderBy('tbproduct.name_en', $sortDirection)
                  ->orderBy('tbproduct.name_cn', $sortDirection);
        } elseif (in_array($sortField, $productColumns)) {
            $query->orderBy("tbproduct.{$sortField}", $sortDirection);
        } else {
            $query->orderBy("tbpo_detail.{$sortField}", $sortDirection);
        }

        // Paginate results
        $purchaseOrders = $query->paginate($perPage)
            ->withQueryString();

        // Return Inertia response
        return Inertia::render('PO/List-PO', [
            'purchaseOrders' => $purchaseOrders,
            'filters' => [
                'search' => $search,
                'per_page' => $perPage,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
                'rating' => $ratings,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'order_status' => $orderStatuses,
            ],
            'darkMode' => $request->user()->dark_mode ?? false,
        ]);
    }

    public function toggleOrder(Request $request, $id)
    {
        $poDetail = PoDetail::findOrFail($id);
        $order = $request->input('order', false);
        $poDetail->order = $order;
        $poDetail->date_auto_order = $order ? now()->toDateString() : null; // Set date_auto_order if order is true
        $poDetail->save();

        return redirect()->back()->with('success', __('order_updated_successfully'));
    }

    public function update(Request $request, $id)
    {
        $poDetail = PoDetail::findOrFail($id);

        $validated = $request->validate([
            'amount' => 'nullable|numeric',
            'remark' => 'nullable|string',
            'rating' => 'nullable|integer|min:0|max:5',
        ]);

        $poDetail->update(array_filter($validated, fn($value) => !is_null($value)));

        return redirect()->back()->with('success', __('po_updated_successfully'));
    }

    public function destroy($id)
    {
        $poDetail = PoDetail::findOrFail($id);
        $poDetail->delete();

        return redirect()->back()->with('success', __('po_deleted_successfully'));
    }
}
