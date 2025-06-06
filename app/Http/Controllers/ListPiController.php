<?php

namespace App\Http\Controllers;

use App\Models\Pi;
use App\Models\ReferenceImage;
use App\Models\PiDetail;
use App\Models\Company;
use App\Models\Shipment;
use App\Models\Method;
use App\Models\PaymentDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class ListPiController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 25);
        $search = $request->input('search', '');
        $searchField = $request->input('search_field', 'Pi_Number');
        $companiesFilter = $request->input('companies', []);
        $methodsFilter = $request->input('methods', []);
        $shipmentsFilter = $request->input('shipments', []);
        $tNumberFilter = $request->input('t_number', '');
        $rNumberFilter = $request->input('r_number', '');
        $startDate = $request->input('start_date', '');
        $endDate = $request->input('end_date', '');
        $startArrivalDate = $request->input('start_arrival_date', '');
        $endArrivalDate = $request->input('end_arrival_date', '');
        $trackingStatuses = $request->input('tracking_statuses', []); // New filter
        $user = $request->user();

        // Check if user is authenticated
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Handle company_id_multiple safely
        $userCompanyIds = [];
        if ($user->company_id_multiple) {
            if (is_string($user->company_id_multiple)) {
                $decoded = json_decode($user->company_id_multiple, true);
                $userCompanyIds = is_array($decoded) ? $decoded : explode(',', $user->company_id_multiple);
            } elseif (is_array($user->company_id_multiple)) {
                $userCompanyIds = $user->company_id_multiple;
            }
        }

        // Map frontend column keys to database fields
        $fieldMap = [
            'invoice_code' => 'pi_number',
            'supplier' => 'pi_name',
            'date' => 'date',
            'amount' => 'amount',
            'ctn' => 'amout_ctn',
            'rating' => 'company_id',
            'method' => 'shipment_id',
            't_number' => 'tracking_number',
            'r_number' => 'reciept_number',
            'arrival_date' => 'arrival_date',
            'id' => 'id',
        ];

        $query = Pi::with(['company', 'piDetails', 'method'])
            ->where('tbpi.status', 1)
            ->leftJoin('tbshipment', 'tbpi.shipment_id', '=', 'tbshipment.id')
            ->leftJoin('tbmethod', 'tbpi.shipping_method', '=', 'tbmethod.id')
            ->select([
                'tbpi.id',
                'pi_number',
                'pi_name',
                'pi_name_cn',
                'tbpi.date',
                'amout_ctn as ctn',
                'company_id',
                'tbpi.shipment_id',
                'tbshipment.shipment_name',
                'tbpi.shipping_method',
                'tbmethod.name_method',
                'tbmethod.numberdate',
                'tracking_number',
                'reciept_number',
                'arrival_date',
                'tbpi.note',
                'extra_charge',
                'discount',
            ]);

        // Add filter to only fetch PIs for user's companies
        if (!empty($userCompanyIds)) {
            $query->whereIn('tbpi.company_id', $userCompanyIds);
        }

        if ($search) {
            if ($searchField === 'Pi_Number') {
                $query->where('pi_number', 'like', "%{$search}%");
            } elseif ($searchField === 'Name') {
                $query->where(function ($q) use ($search) {
                    $q->where('pi_name', 'like', "%{$search}%")
                    ->orWhere('pi_name_cn', 'like', "%{$search}%");
                });
            } elseif ($searchField === 'Product') {
                $query->whereHas('piDetails.product', function ($q) use ($search) {
                    $q->where('product_code', 'like', "%{$search}%")
                    ->orWhere('name_en', 'like', "%{$search}%")
                    ->orWhere('name_kh', 'like', "%{$search}%")
                    ->orWhere('name_cn', 'like', "%{$search}%");
                });
            }
        }

        // Apply company filter
        if (!empty($companiesFilter)) {
            $query->whereHas('company', function ($q) use ($companiesFilter) {
                $q->whereIn('company_name', $companiesFilter);
            });
        }

        // Apply method and shipment filter with AND logic
        if (!empty($methodsFilter) || !empty($shipmentsFilter)) {
            $query->where(function ($q) use ($methodsFilter, $shipmentsFilter) {
                if (!empty($methodsFilter)) {
                    $q->whereIn('tbmethod.name_method', $methodsFilter);
                }
                if (!empty($shipmentsFilter)) {
                    $q->whereIn('tbshipment.shipment_name', $shipmentsFilter);
                }
            });
        }

        // Apply T-number filter
        if (!empty($tNumberFilter)) {
            $query->where('tracking_number', 'like', "%{$tNumberFilter}%");
        }

        // Apply R-number filter
        if (!empty($rNumberFilter)) {
            $query->where('reciept_number', 'like', "%{$rNumberFilter}%");
        }

        // Apply date range filter
        if (!empty($startDate) && !empty($endDate)) {
            $query->whereBetween('date', [$startDate, $endDate]);
        } elseif (!empty($startDate)) {
            $query->where('date', '>=', $startDate);
        } elseif (!empty($endDate)) {
            $query->where('date', '<=', $endDate);
        }

        // Apply arrival date range filter
        if (!empty($startArrivalDate) && !empty($endArrivalDate)) {
            $query->whereBetween('arrival_date', [$startArrivalDate, $endArrivalDate]);
        } elseif (!empty($startArrivalDate)) {
            $query->where('arrival_date', '>=', $startArrivalDate);
        } elseif (!empty($endArrivalDate)) {
            $query->where('arrival_date', '<=', $endArrivalDate);
        }

        // Apply tracking status filter
        if (!empty($trackingStatuses)) {
            $trackingClasses = array_map(function ($status) {
                return [
                    'overdue' => 'red-tracking',
                    'delivered' => 'green-tracking',
                    'onTrack' => 'orange-tracking',
                    'missingInfo' => 'gray-tracking',
                ][$status] ?? null;
            }, $trackingStatuses);

            $trackingClasses = array_filter($trackingClasses); // Remove null values

            if (!empty($trackingClasses)) {
                $query->where(function ($q) use ($trackingClasses) {
                    foreach ($trackingClasses as $class) {
                        if ($class === 'gray-tracking') {
                            $q->orWhere(function ($subQ) {
                                $subQ->whereNull('arrival_date')
                                    ->orWhereNull('shipping_method');
                            });
                        } elseif ($class === 'red-tracking') {
                            $q->orWhere(function ($subQ) {
                                $subQ->whereNotNull('arrival_date')
                                    ->whereNotNull('shipping_method')
                                    ->whereHas('method', function ($methodQ) {
                                        $methodQ->whereNotNull('numberdate');
                                    })
                                    ->whereHas('piDetails', function ($detailQ) {
                                        $detailQ->where('delivery', '!=', 1);
                                    })
                                    ->whereRaw('DATE_ADD(arrival_date, INTERVAL tbmethod.numberdate DAY) <= ?', [Carbon::today()]);
                            });
                        } elseif ($class === 'green-tracking') {
                            $q->orWhere(function ($subQ) {
                                $subQ->whereNotNull('arrival_date')
                                    ->whereNotNull('shipping_method')
                                    ->whereHas('piDetails', function ($detailQ) {
                                        $detailQ->where('delivery', 1);
                                    });
                            });
                        } elseif ($class === 'orange-tracking') {
                            $q->orWhere(function ($subQ) {
                                $subQ->whereNotNull('arrival_date')
                                    ->whereNotNull('shipping_method')
                                    ->whereHas('method', function ($methodQ) {
                                        $methodQ->whereNotNull('numberdate');
                                    })
                                    ->whereHas('piDetails', function ($detailQ) {
                                        $detailQ->where('delivery', '!=', 1);
                                    })
                                    ->whereRaw('DATE_ADD(arrival_date, INTERVAL tbmethod.numberdate DAY) > ?', [Carbon::today()]);
                            });
                        }
                    }
                });
            }
        }

        // Apply sorting by id in descending order
        $query->orderBy('tbpi.id', 'desc');

        // Apply default sorting and tracking class logic
        $today = Carbon::today();
        $purchaseInvoices = $query->paginate($perPage)
            ->withQueryString()
            ->through(function ($pi) use ($today) {
                $total = $pi->piDetails->sum(function ($detail) {
                    return $detail->amount * $detail->unit_price;
                }) + ($pi->extra_charge ?? 0) - ($pi->discount ?? 0);

                // Calculate tracking class
                $trackingClass = '';
                if (!$pi->arrival_date || !$pi->shipping_method) {
                    $trackingClass = 'gray-tracking'; // Set gray-tracking if arrival_date or shipping_method is missing
                } elseif ($pi->arrival_date && $pi->shipping_method) {
                    $trackingClass = 'orange-tracking';
                    $method = Method::find($pi->shipping_method);
                    if ($method && $method->numberdate) {
                        $expectedDeliveryDate = Carbon::parse($pi->arrival_date)->addDays($method->numberdate);
                        $allDelivered = $pi->piDetails->every(function ($detail) {
                            return $detail->delivery == 1;
                        });

                        if ($today->gte($expectedDeliveryDate) && !$allDelivered) {
                            $trackingClass = 'red-tracking';
                        } elseif ($allDelivered) {
                            $trackingClass = 'green-tracking';
                        }
                    }
                }

                return [
                    'id' => $pi->id,
                    'invoice_code' => $pi->pi_number,
                    'supplier' => $pi->pi_name ?? $pi->pi_name_cn ?? '',
                    'pi_name_cn' => $pi->pi_name_cn ?? '',
                    'date' => $pi->date?->format('Y-m-d'),
                    'amount' => $total,
                    'ctn' => $pi->ctn,
                    'rating' => $pi->company ? $pi->company->company_name : ($pi->company_id ?? ''),
                    'company_id' => $pi->company_id ?? '',
                    'shipment_name' => $pi->shipment_name ?? '',
                    'name_method' => $pi->name_method ?? '',
                    'shipment_id' => $pi->shipment_id ?? '',
                    'shipping_method' => $pi->name_method ?? '',
                    't_number' => $pi->tracking_number,
                    'r_number' => $pi->reciept_number,
                    'arrival_date' => $pi->arrival_date?->format('Y-m-d'),
                    'remark' => $pi->note,
                    'extra_charge' => $pi->extra_charge ?? 0,
                    'discount' => $pi->discount ?? 0,
                    'tracking_class' => $trackingClass,
                ];
            });

        // Sort by tracking_class (red-tracking first)
        $purchaseInvoices->getCollection()->sortByDesc(function ($pi) {
            if ($pi['tracking_class'] === 'red-tracking') {
                return 3;
            } elseif ($pi['tracking_class'] === 'green-tracking') {
                return 2;
            } elseif ($pi['tracking_class'] === 'orange-tracking') {
                return 1;
            }
            return 0;
        })->values();

        $companies = Company::active()
            ->when(!empty($userCompanyIds), function ($query) use ($userCompanyIds) {
                return $query->whereIn('id', $userCompanyIds);
            })
            ->select('id', 'company_name')
            ->get()
            ->map(function ($company) {
                return ['id' => $company->id, 'name' => $company->company_name];
            })
            ->toArray();

        $shipments = Shipment::active()->select('id', 'shipment_name')->get()->map(function ($shipment) {
            return ['id' => $shipment->id, 'name' => $shipment->shipment_name];
        })->toArray();

        $methods = Method::active()->select('id', 'name_method')->get()->map(function ($method) {
            return ['id' => $method->id, 'name' => $method->name_method];
        })->toArray();

        return Inertia::render('PI/List-PI', [
            'purchaseInvoices' => $purchaseInvoices,
            'companies' => $companies,
            'shipments' => $shipments,
            'methods' => $methods,
            'filters' => [
                'search' => $search,
                'search_field' => $searchField,
                'per_page' => $perPage,
                'sort_field' => 'id',
                'sort_direction' => 'desc',
                'companies' => $companiesFilter,
                'methods' => $methodsFilter,
                'shipments' => $shipmentsFilter,
                't_number' => $tNumberFilter,
                'r_number' => $rNumberFilter,
                'start_date' => $startDate,
                'end_date' => $endDate,
                'start_arrival_date' => $startArrivalDate,
                'end_arrival_date' => $endArrivalDate,
                'tracking_statuses' => $trackingStatuses, // Pass back to frontend
            ],
            'pagination' => [
                'current_page' => $purchaseInvoices->currentPage(),
                'per_page' => $purchaseInvoices->perPage(),
                'total' => $purchaseInvoices->total(),
            ],
            'darkMode' => $request->user()->dark_mode ?? false,
        ]);
    }

    public function getReferencePhotos($piId)
    {
        $referenceImages = ReferenceImage::where('pi_id', $piId)
            ->get()
            ->pluck('image')
            ->toArray();

        return response()->json([
            'referencePhotos' => $referenceImages
        ]);
    }

    public function getProductDetails($piId)
    {
        $productDetails = PiDetail::where('pi_id', $piId)
            ->with(['product'])
            ->get()
            ->map(function ($detail) {
                return [
                    'id' => $detail->id,
                    'pi_id' => $detail->pi_id,
                    'photo' => $detail->product->image ?? '',
                    'code' => $detail->product->product_code ?? '',
                    'name_en' => $detail->product->name_en ?? '',
                    'name_kh' => $detail->product->name_kh ?? '',
                    'name_cn' => $detail->product->name_cn ?? '',
                    'ctn' => $detail->ctn,
                    'qty' => $detail->amount,
                    'price' => $detail->unit_price,
                    'total' => $detail->amount * $detail->unit_price,
                    'note' => $detail->note,
                    'progress' => $detail->shipping ?? 0,
                    'delivered' => $detail->delivery ? true : false,
                    'cargo_date' => $detail->cargo_date ?? '',
                ];
            })->toArray();

        return response()->json([
            'productDetails' => $productDetails
        ]);
    }

    public function destroy($piId)
    {
        $pi = Pi::findOrFail($piId);

        $pi->update([
            'status' => 0,
            'pi_number' => $pi->pi_number . '(delete)',
        ]);

        return redirect()->back()->with('success', __('pi_deleted_successfully'));
    }

    public function update(Request $request, $piId)
    {
        $validated = $request->validate([
            'pi_number' => 'required|string|max:255',
            'pi_name_en' => 'nullable|string|max:255',
            'pi_name_cn' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'ctn' => 'nullable|numeric',
            'tracking_number' => 'nullable|string|max:255',
            'shipment_id' => 'nullable|exists:tbshipment,id',
            'shipping_method' => 'nullable|exists:tbmethod,id',
            'arrival_date' => 'nullable|date',
            'company_id' => 'nullable|exists:company,id',
            'receipt_number' => 'nullable|string|max:255',
            'total' => 'nullable|numeric',
            'extra_charge' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'remark' => 'nullable|string',
            'products' => 'nullable|array',
            'products.*.id' => 'nullable',
            'products.*.ctn' => 'nullable|numeric',
            'products.*.qty' => 'nullable|numeric',
            'products.*.price' => 'nullable|numeric',
            'products.*.progress' => 'nullable|integer|min:0|max:2',
            'existing_photos' => 'nullable|string',
            'photos_to_delete' => 'nullable|string',
            'new_photos' => 'nullable|array',
            'new_photos.*' => 'nullable|file|mimes:jpeg,png,jpg,webp,gif',
        ]);

        // Decode existing_photos and photos_to_delete
        $existingPhotos = !empty($validated['existing_photos']) ? json_decode($validated['existing_photos'], true) ?? [] : [];
        $photosToDelete = !empty($validated['photos_to_delete']) ? json_decode($validated['photos_to_delete'], true) ?? [] : [];

        $pi = Pi::findOrFail($piId);

        // Check if there is a PaymentDetail with pi_id and checkbox = 1
        $hasCheckboxChecked = PaymentDetail::where('pi_id', $piId)
            ->where('checkbox', 1)
            ->exists();

        // Prepare update data, conditionally include openbalance
        $updateData = [
            'pi_number' => $validated['pi_number'],
            'pi_name' => $validated['pi_name_en'],
            'pi_name_cn' => $validated['pi_name_cn'],
            'date' => $validated['date'],
            'amout_ctn' => $validated['ctn'] ?? 0,
            'tracking_number' => $validated['tracking_number'],
            'reciept_number' => $validated['receipt_number'],
            'shipment_id' => $validated['shipment_id'],
            'shipping_method' => $validated['shipping_method'],
            'arrival_date' => $validated['arrival_date'],
            'company_id' => $validated['company_id'],
            'extra_charge' => $validated['extra_charge'] ?? 0,
            'discount' => $validated['discount'] ?? 0,
            'note' => $validated['remark'],
        ];

        // Only update openbalance if checkbox is not 1
        if (!$hasCheckboxChecked) {
            $updateData['openbalance'] = $validated['total'] ?? 0;
        }

        // Update PI
        $pi->update($updateData);

        // Update product details
        if (!empty($validated['products'])) {
            foreach ($validated['products'] as $product) {
                PiDetail::updateOrCreate(
                    ['id' => $product['id'] ?? null, 'pi_id' => $piId],
                    [
                        'ctn' => $product['ctn'] ?? 0,
                        'amount' => $product['qty'] ?? 0,
                        'unit_price' => $product['price'] ?? 0,
                        'shipping' => $product['progress'] ?? 0,
                    ]
                );
            }
        }

        // Delete images based on IDs in photos_to_delete
        if (!empty($photosToDelete)) {
            ReferenceImage::where('pi_id', $piId)
                ->whereIn('id', $photosToDelete)
                ->delete();
        }

        // Add new images
        if ($request->hasFile('new_photos')) {
            foreach ($request->file('new_photos') as $photo) {
                if ($photo->isValid()) {
                    $filename = Carbon::now()->format('YmdHis') . '_' . Str::random(10) . '.' . $photo->extension();
                    $path = $photo->storeAs('uploads/referen_img', $filename, 'public');
                    ReferenceImage::create([
                        'pi_id' => $piId,
                        'image' => $path,
                    ]);
                }
            }
        }

        return redirect()->back()->with('success', __('pi_edit_successfully'));
    }

    public function getEditData($piId)
    {
        $pi = Pi::with(['company', 'piDetails.product'])
            ->where('id', $piId)
            ->where('status', 1)
            ->firstOrFail();

        // Check if there is a PaymentDetail with pi_id and checkbox = 1
        $hasCheckboxChecked = PaymentDetail::where('pi_id', $piId)
            ->where('checkbox', 1)
            ->exists();

        // Fetch reference photos with IDs
        $referenceImages = ReferenceImage::where('pi_id', $piId)
            ->get()
            ->map(function ($image) {
                return [
                    'id' => $image->id,
                    'image' => $image->image,
                ];
            })
            ->toArray();

        // Fetch product details
        $productDetails = PiDetail::where('pi_id', $piId)
            ->with(['product'])
            ->get()
            ->map(function ($detail) {
                return [
                    'id' => $detail->id,
                    'photo' => $detail->product->image ?? '',
                    'code' => $detail->product->product_code ?? '',
                    'name_en' => $detail->product->name_en ?? '',
                    'name_kh' => $detail->product->name_kh ?? '',
                    'name_cn' => $detail->product->name_cn ?? '',
                    'ctn' => $detail->ctn,
                    'qty' => $detail->amount,
                    'price' => $detail->unit_price,
                    'total' => $detail->amount * $detail->unit_price,
                    'note' => $detail->note,
                    'progress' => $detail->shipping ?? 0,
                    'delivered' => $detail->delivery ? true : false,
                ];
            })->toArray();

        // Calculate total amount
        $total = $pi->piDetails->sum(function ($detail) {
            return $detail->amount * $detail->unit_price;
        }) + ($pi->extra_charge ?? 0) - ($pi->discount ?? 0);

        // Prepare PI details
        $piData = [
            'id' => $pi->id,
            'invoice_code' => $pi->pi_number,
            'supplier' => $pi->pi_name ?? $pi->pi_name_cn ?? '',
            'pi_name_cn' => $pi->pi_name_cn ?? '',
            'date' => $pi->date?->format('Y-m-d'),
            'amount' => $total,
            'ctn' => $pi->amout_ctn,
            'rating' => $pi->company ? $pi->company->company_name : ($pi->company_id ?? ''),
            'company_id' => $pi->company_id ?? '',
            'shipment_name' => $pi->shipment_name ?? '',
            'name_method' => $pi->name_method ?? '',
            'shipment_id' => $pi->shipment_id ?? '',
            'shipping_method' => $pi->shipping_method ?? '',
            't_number' => $pi->tracking_number,
            'r_number' => $pi->reciept_number,
            'arrival_date' => $pi->arrival_date?->format('Y-m-d'),
            'remark' => $pi->note,
            'extra_charge' => $pi->extra_charge ?? 0,
            'discount' => $pi->discount ?? 0,
        ];

        return response()->json([
            'pi' => $piData,
            'referencePhotos' => $referenceImages,
            'productDetails' => $productDetails,
            'hasCheckboxChecked' => $hasCheckboxChecked, // New flag
        ]);
    }


}
