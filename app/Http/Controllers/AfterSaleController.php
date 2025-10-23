<?php

namespace App\Http\Controllers;

use App\Models\AfterSale;
use App\Models\Company;
use App\Models\MainAfterSale;
use App\Models\Pi;
use App\Models\PiDetail;
use App\Models\ProblemAfterSale;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Redirect;

class AfterSaleController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('Payment/create-after-sale', [
            'darkMode' => true,
        ]);
    }

    public function searchProductsByPiNumber(Request $request)
    {
        $query = urldecode($request->input('query', ''));

        $pi = Pi::where('pi_number', 'like', "%{$query}%")
            ->with(['piDetails.product'])
            ->first();

        $products = [];

        if ($pi) {
            $products = $pi->piDetails->map(function ($detail) use ($pi) {
                return [
                    'id' => $detail->product_id,
                    'pi_id' => $pi->id,
                    'product_code' => $detail->product ? $detail->product->product_code : null,
                    'name_kh' => $detail->product ? $detail->product->name_kh : null,
                    'name_en' => $detail->product ? $detail->product->name_en : null,
                    'name_cn' => $detail->product ? $detail->product->name_cn : null,
                    'image' => $detail->product && $detail->product->image ? asset('storage/' . $detail->product->image) : null,
                    'unit_price' => $detail->unit_price,
                ];
            })->filter()->values()->toArray();
        }

        return response()->json($products);
    }

    public function getUnitPrice(Request $request)
    {
        $piId = $request->input('pi_id');
        $productId = $request->input('product_id');

        $piDetail = PiDetail::where('pi_id', $piId)
            ->where('product_id', $productId)
            ->first();

        if ($piDetail) {
            return response()->json(['unit_price' => $piDetail->unit_price]);
        }

        return response()->json(['unit_price' => 0], 404);
    }

    public function searchCompanies(Request $request)
    {
        $query = $request->input('query', '');

        $companies = Company::where('status', 1)
            ->select('id', 'company_name as name')
            ->get();

        if ($query) {
            $companies = $companies->filter(function ($company) use ($query) {
                return stripos($company->name, $query) !== false;
            })->values();
        }

        return response()->json($companies);
    }

    public function searchProblems(Request $request)
    {
        $query = $request->input('query', '');

        $problems = ProblemAfterSale::where('status', 1)
            ->select('id', 'name')
            ->get();

        if ($query) {
            $problems = $problems->filter(function ($problem) use ($query) {
                return stripos($problem->name, $query) !== false;
            })->values();
        }

        return response()->json($problems);
    }

    public function validatePiNumber(Request $request)
    {
        $piNumber = $request->input('pi_number');
        $exists = Pi::where('pi_number', $piNumber)->exists();
        return response()->json(['exists' => $exists]);
    }

    public function store(Request $request)
    {
        // Validate the incoming request
        $validator = Validator::make($request->all(), [
            'case_number' => 'required|string|unique:main_after_sale,case_number',
            'date' => 'required|date',
            'company_id' => 'required|exists:company,id',
            'process' => 'required|exists:broblem_after_sale,id',
            'products' => 'required|array',
            'products.*.product_id' => 'required|exists:tbproduct,id',
            'products.*.pi_id' => 'nullable|exists:tbpi,id',
            'products.*.amount' => 'required|integer|min:1',
            'products.*.unit_price' => 'required|numeric|min:0',
            'products.*.note' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Calculate total
        $total = collect($request->products)->sum(function ($product) {
            return $product['amount'] * $product['unit_price'];
        });

        // Create record in main_after_sale table
        $mainAfterSale = MainAfterSale::create([
            'case_number' => $request->case_number,
            'date' => $request->date,
            'total' => $total,
            'company_id' => $request->company_id,
            'broblem_type_id' => $request->process,
            'user_id' => Auth::id(),
            'status' => 1,
            'ishow' => 1,
        ]);

        // Create records in after_sale table
        foreach ($request->products as $product) {
            AfterSale::create([
                'main_after_sale_id' => $mainAfterSale->id,
                'product_id' => $product['product_id'],
                'pi_id' => $product['pi_id'] ?? null,
                'qty' => $product['amount'],
                'unit_price' => $product['unit_price'],
                'remark' => $product['note'] ?? null,
            ]);
        }

        return redirect()->route('payment.create-after-sale')->with('success', 'After-sale created successfully');
    }
}