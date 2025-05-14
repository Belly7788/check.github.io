<?php

namespace App\Http\Controllers;

use App\Models\PoDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Normalizer;

class POController extends Controller
{
    public function create()
    {
        return Inertia::render('PO/Create-PO', [
            'darkMode' => true, // Adjust based on your dark mode logic
        ]);
    }

    public function searchProducts(Request $request)
    {
        $query = urldecode($request->input('query', ''));
        $query = Normalizer::normalize($query, Normalizer::FORM_C); // Normalize to composed form

        $products = Product::where('status', 1)
            ->where(function ($q) use ($query) {
                $q->where('product_code', 'like', "%{$query}%")
                    ->orWhere('name_kh', 'like', "%{$query}%")
                    ->orWhere('name_en', 'like', "%{$query}%")
                    ->orWhere('name_cn', 'like', "%{$query}%");
            })
            ->select('id', 'product_code', 'name_kh', 'name_en', 'name_cn', 'image')
            ->get()
            ->map(function ($product) {
                $product->image = $product->image ? asset('storage/' . $product->image) : null;
                return $product;
            });

        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date',
            'products' => 'required|array',
            'products.*.product_id' => 'required|exists:tbproduct,id',
            'products.*.amount' => 'required|integer|min:1',
            'products.*.rating' => 'nullable|integer|min:0|max:5',
            'products.*.remark' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        foreach ($request->products as $product) {
            PoDetail::create([
                'product_id' => $product['product_id'],
                'date' => $request->date,
                'amount' => $product['amount'],
                'rating' => $product['rating'] ?? 0,
                'remark' => $product['remark'],
                'user_id' => Auth::id(),
                'status' => 1,
            ]);
        }

        return redirect()->back()->with('success', 'PO created successfully');
    }
}
