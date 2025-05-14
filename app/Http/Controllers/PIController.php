<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Pi;
use App\Models\PiDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Normalizer;
use Illuminate\Support\Facades\Redirect;

class PIController extends Controller
{
    public function create()
    {
        return Inertia::render('PI/Create-PI', [
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

    public function searchCompanies(Request $request)
    {
        $query = $request->input('query', '');

        $companies = Company::where('status', 1)
            ->select('id', 'company_name as name')
            ->get();

        // Optionally filter companies if a query is provided
        if ($query) {
            $companies = $companies->filter(function ($company) use ($query) {
                return stripos($company->name, $query) !== false;
            })->values();
        }

        return response()->json($companies);
    }

    public function validatePiNumber(Request $request)
    {
        $piNumber = $request->input('pi_number');

        $exists = Pi::where('pi_number', $piNumber)->exists();

        return response()->json(['exists' => $exists]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pi_number' => 'required|string|unique:tbpi,pi_number',
            'date' => 'required|date',
            'pi_name' => 'nullable|string',
            'pi_name_cn' => 'nullable|string',
            'company_id' => 'required|exists:company,id',
            'discount' => 'nullable|numeric',
            'extra_charge' => 'nullable|numeric',
            'openbalance' => 'required|numeric',
            'products' => 'required|array',
            'products.*.product_id' => 'required|exists:tbproduct,id',
            'products.*.amount' => 'required|integer|min:1',
            'products.*.unit_price' => 'required|numeric|min:0',
            'products.*.note' => 'nullable|string',
            'products.*.ctn' => 'nullable|integer|min:0',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $pi = Pi::create([
            'pi_number' => $request->pi_number,
            'date' => $request->date,
            'pi_name' => $request->pi_name,
            'pi_name_cn' => $request->pi_name_cn,
            'company_id' => $request->company_id,
            'discount' => $request->discount ?? 0,
            'extra_charge' => $request->extra_charge ?? 0,
            'openbalance' => $request->openbalance,
            'user_id' => Auth::id(),
            'status' => 1,
        ]);

        foreach ($request->products as $product) {
            PiDetail::create([
                'pi_id' => $pi->id,
                'product_id' => $product['product_id'],
                'amount' => $product['amount'],
                'unit_price' => $product['unit_price'],
                'note' => $product['note'],
                'ctn' => $product['ctn'] ?? 0,
                'status' => 1,
            ]);
        }

        return redirect()->back()->with('success', 'PI created successfully');
    }
}
