<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Pi;
use App\Models\PiDetail;
use App\Models\PoDetail;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Normalizer;
use Illuminate\Support\Facades\Redirect;

class PIController extends Controller
{
public function create(Request $request)
    {
        // Extract id_pos from query string
        $idPos = [];
        foreach ($request->query() as $key => $value) {
            if (is_numeric($key)) {
                $idPos[] = $key;
            } elseif ($key === 'id_pos') {
                $idPos[] = $value;
            }
        }
        $idPos = array_filter($idPos); // Remove empty values

        // Fetch pre-selected products from tbpo_detail based on id_pos
        $preSelectedProducts = [];
        if (!empty($idPos)) {
            $poDetails = PoDetail::whereIn('id', $idPos)
                ->with('product')
                ->get();

            // Group by product_id to merge duplicates
            $groupedProducts = $poDetails->groupBy('product.id')->map(function ($group) {
                $product = $group->first()->product;
                $totalAmount = $group->sum('amount');
                $totalCtn = $group->sum('ctn');
                $poDetailIds = $group->pluck('id')->toArray();

                return [
                    'product_id' => $product->id,
                    'code' => $product->product_code,
                    'namekh' => $product->name_kh,
                    'nameen' => $product->name_en,
                    'namecn' => $product->name_cn,
                    'photo' => $product->image ? asset('storage/' . $product->image) : null,
                    'ctn' => $totalCtn,
                    'amount' => $totalAmount,
                    'unit_price' => 0,
                    'subTotal' => 0,
                    'note' => '',
                    'po_detail_ids' => $poDetailIds,
                ];
            })->values()->toArray();

            $preSelectedProducts = $groupedProducts;
        }

        // Fetch PI data if id_pi is provided
        $piData = null;
        $piProducts = [];
        if ($request->query('id_pi')) {
            $pi = Pi::with(['company', 'piDetails.product'])
                ->find($request->query('id_pi'));

            if ($pi) {
                $piData = [
                    'company_id' => $pi->company_id,
                    'company_name' => $pi->company ? $pi->company->company_name : null,
                    'pi_name' => $pi->pi_name,
                    'pi_name_cn' => $pi->pi_name_cn,
                    'discount' => $pi->discount,
                    'extra_charge' => $pi->extra_charge,
                    'openbalance' => $pi->openbalance,
                ];

                $piProducts = $pi->piDetails->map(function ($detail) {
                    return [
                        'product_id' => $detail->product_id,
                        'code' => $detail->product ? $detail->product->product_code : null,
                        'namekh' => $detail->product ? $detail->product->name_kh : null,
                        'nameen' => $detail->product ? $detail->product->name_en : null,
                        'namecn' => $detail->product ? $detail->product->name_cn : null,
                        'photo' => $detail->product && $detail->product->image ? asset('storage/' . $detail->product->image) : null,
                        'ctn' => $detail->ctn,
                        'amount' => $detail->amount,
                        'unit_price' => $detail->unit_price,
                        'subTotal' => $detail->amount * $detail->unit_price,
                        'note' => $detail->note,
                        'po_detail_ids' => [], // You can modify this if po_detail_ids are stored or linked
                    ];
                })->toArray();
            }
        }

        return Inertia::render('PI/Create-PI', [
            'darkMode' => true,
            'preSelectedProducts' => $piData ? $piProducts : $preSelectedProducts,
            'idPos' => $idPos,
            'piData' => $piData, // Pass PI data for editing
        ]);
    }

    public function searchProducts(Request $request)
    {
        $query = urldecode($request->input('query', ''));
        $query = Normalizer::normalize($query, Normalizer::FORM_C);

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
            'products.*.po_detail_ids' => 'nullable|array',
            'products.*.po_detail_ids.*' => 'exists:tbpo_detail,id',
            'id_pos' => 'nullable|array',
            'id_pos.*' => 'exists:tbpo_detail,id',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        // Create PI
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

        // Create PI details and collect po_detail_ids
        $submittedPoDetailIds = [];
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

            // Collect po_detail_ids from submitted products
            if (isset($product['po_detail_ids']) && is_array($product['po_detail_ids'])) {
                $submittedPoDetailIds = array_merge($submittedPoDetailIds, $product['po_detail_ids']);
            }
        }

        // Update tbpo_detail only for po_detail_ids that are still in the submitted products
        if (!empty($submittedPoDetailIds)) {
            PoDetail::whereIn('id', $submittedPoDetailIds)->update([
                'order' => 1,
                'date_auto_order' => now(),
            ]);
        }

        // Redirect to /pi/create without query parameters
        return redirect()->route('pi.create')->with('success', 'PI created successfully');
    }
}
