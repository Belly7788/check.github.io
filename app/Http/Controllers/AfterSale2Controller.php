<?php

namespace App\Http\Controllers;

use App\Models\MainAfterSale;
use App\Models\AfterSale;
use App\Models\Company;
use App\Models\WhoAffort;
use App\Models\CompensaleMethod;
use App\Models\ProblemAfterSale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AfterSale2Controller extends Controller
{
    public function index(Request $request)
    {
        // Initialize query for MainAfterSale
        $query = MainAfterSale::with([
            'company',
            'broblemType',
            'afterSales.product',
            'afterSales.pi',
            'afterSales.whoAffort',
            'afterSales.compensaleMethod'
        ])->where('ishow', 1);

        // Apply search filter if provided
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $searchField = $request->input('search_field', 'CaseNumber');

            $query->where(function ($q) use ($search, $searchField) {
                if ($searchField === 'CaseNumber') {
                    $q->where('case_number', 'like', "%{$search}%")
                      ->orWhereHas('company', function ($q) use ($search) {
                          $q->where('company_name', 'like', "%{$search}%");
                      });
                } elseif ($searchField === 'Product') {
                    $q->whereHas('afterSales.product', function ($q) use ($search) {
                        $q->where('product_code', 'like', "%{$search}%")
                          ->orWhere('name_kh', 'like', "%{$search}%")
                          ->orWhere('name_en', 'like', "%{$search}%")
                          ->orWhere('name_cn', 'like', "%{$search}%");
                    });
                } elseif ($searchField === 'Pi_number') {
                    $q->whereHas('afterSales.pi', function ($q) use ($search) {
                        $q->where('pi_number', 'like', "%{$search}%");
                    });
                }
            });
        }

        // Apply sorting
        $sortField = $request->input('sort_field', 'id');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginate results
        $perPage = $request->input('per_page', 10);
        $data = $query->paginate($perPage)->withQueryString();

        // Format the data for the frontend
        $formattedData = $data->getCollection()->map(function ($mainAfterSale) {
            $images = $mainAfterSale->image ? array_map(function ($image) {
                return '/storage/uploads/after_sale/image/' . trim($image);
            }, explode(',', $mainAfterSale->image)) : [];

            $videos = $mainAfterSale->video ? array_map(function ($video) {
                return '/storage/uploads/after_sale/video/' . trim($video);
            }, explode(',', $mainAfterSale->video)) : [];

            $afterSaleDetails = $mainAfterSale->afterSales->map(function ($afterSale) {
                $productName = collect([
                    $afterSale->product->name_kh,
                    $afterSale->product->name_en,
                    $afterSale->product->name_cn
                ])->filter()->implode(' / ');

                return [
                    'id' => $afterSale->id,
                    'photo' => $afterSale->product->image ? '/storage/' . $afterSale->product->image : null,
                    'pi_number' => $afterSale->pi->pi_number ?? null,
                    'product_code' => $afterSale->product->product_code ?? null,
                    'name' => $productName ?: null,
                    'qty_broken' => $afterSale->qty,
                    'unit_price' => $afterSale->unit_price,
                    'total' => $afterSale->qty * $afterSale->unit_price,
                    'who_afford' => $afterSale->whoAffort->name ?? null,
                    'who_afford_id' => $afterSale->who_affort_id,
                    'method' => $afterSale->compensaleMethod->name ?? null,
                    'compensale_method_id' => $afterSale->compensale_method_id,
                    'remark' => $afterSale->remark,
                ];
            });

            return [
                'id' => $mainAfterSale->id,
                'caseNumber' => $mainAfterSale->case_number,
                'caseName' => $mainAfterSale->broblemType ? $mainAfterSale->broblemType->name : null,
                'broblem_type_id' => $mainAfterSale->broblem_type_id,
                'company' => $mainAfterSale->company ? $mainAfterSale->company->company_name : null,
                'company_id' => $mainAfterSale->company_id,
                'date' => $mainAfterSale->date->format('Y-m-d'),
                'total' => $mainAfterSale->total,
                'remark' => $mainAfterSale->remark,
                'status' => $mainAfterSale->status,
                'details' => [
                    'photos' => $images,
                    'videos' => $videos,
                    'payments' => $afterSaleDetails,
                ],
            ];
        });

        // Fetch dropdown options
        $companyOptions = Company::active()->get()->map(function ($company) {
            return [
                'id' => $company->id,
                'name' => $company->company_name,
            ];
        });

        $problemTypeOptions = ProblemAfterSale::where('status', 1)->get()->map(function ($problem) {
            return [
                'id' => $problem->id,
                'name' => $problem->name,
            ];
        });

        $whoAffordOptions = WhoAffort::where('status', 1)->get()->map(function ($whoAffort) {
            return [
                'id' => $whoAffort->id,
                'name' => $whoAffort->name,
            ];
        });

        $compensaleMethodOptions = CompensaleMethod::where('status', 1)->get()->map(function ($method) {
            return [
                'id' => $method->id,
                'name' => $method->name,
            ];
        });

        return Inertia::render('Payment/after-sale', [
            'data' => $formattedData,
            'pagination' => [
                'currentPage' => $data->currentPage(),
                'perPage' => $data->perPage(),
                'total' => $data->total(),
            ],
            'dropdownOptions' => [
                'companyOptions' => $companyOptions,
                'problemTypeOptions' => $problemTypeOptions,
                'whoAffordOptions' => $whoAffordOptions,
                'compensaleMethodOptions' => $compensaleMethodOptions,
            ],
            'darkMode' => $request->user()->dark_mode ?? false,
            'filters' => [
                'search' => $request->search,
                'search_field' => $request->input('search_field', 'CaseNumber'),
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
                'per_page' => $perPage,
            ],
        ]);
    }
    
    public function show($id, Request $request)
    {
        // Fetch the MainAfterSale record with related data
        $mainAfterSale = MainAfterSale::with([
            'company',
            'broblemType',
            'afterSales.product',
            'afterSales.pi',
            'afterSales.whoAffort',
            'afterSales.compensaleMethod'
        ])->where('id', $id)->where('ishow', 1)->firstOrFail();

        // Format images
        $images = $mainAfterSale->image ? array_map(function ($image) {
            return '/storage/uploads/after_sale/image/' . trim($image);
        }, explode(',', $mainAfterSale->image)) : [];

        // Format videos
        $videos = $mainAfterSale->video ? array_map(function ($video) {
            return '/storage/uploads/after_sale/video/' . trim($video);
        }, explode(',', $mainAfterSale->video)) : [];

        // Format after sale details
        $afterSaleDetails = $mainAfterSale->afterSales->map(function ($afterSale) {
            $productName = collect([
                $afterSale->product->name_kh,
                $afterSale->product->name_en,
                $afterSale->product->name_cn
            ])->filter()->implode(' / ');

            return [
                'id' => $afterSale->id,
                'photo' => $afterSale->product->image ? '/storage/' . $afterSale->product->image : null,
                'pi_number' => $afterSale->pi->pi_number ?? null,
                'product_code' => $afterSale->product->product_code ?? null,
                'name' => $productName ?: null,
                'qty_broken' => $afterSale->qty,
                'unit_price' => $afterSale->unit_price,
                'total' => $afterSale->qty * $afterSale->unit_price,
                'who_afford' => $afterSale->whoAffort->name ?? null,
                'who_afford_id' => $afterSale->who_affort_id,
                'method' => $afterSale->compensaleMethod->name ?? null,
                'compensale_method_id' => $afterSale->compensale_method_id,
                'remark' => $afterSale->remark,
            ];
        });

        // Format the response data
        $formattedData = [
            'id' => $mainAfterSale->id,
            'caseNumber' => $mainAfterSale->case_number,
            'caseName' => $mainAfterSale->broblemType ? $mainAfterSale->broblemType->name : null,
            'broblem_type_id' => $mainAfterSale->broblem_type_id,
            'company' => $mainAfterSale->company ? $mainAfterSale->company->company_name : null,
            'company_id' => $mainAfterSale->company_id,
            'date' => $mainAfterSale->date->format('Y-m-d'),
            'total' => $mainAfterSale->total,
            'remark' => $mainAfterSale->remark,
            'status' => $mainAfterSale->status,
            'details' => [
                'photos' => $images,
                'videos' => $videos,
                'payments' => $afterSaleDetails,
            ],
        ];

        return response()->json($formattedData);
    }   
}

