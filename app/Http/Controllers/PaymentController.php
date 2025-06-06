<?php

namespace App\Http\Controllers;

use App\Models\Pi;
use App\Models\Payment;
use App\Models\Company;
use App\Models\PaymentDetail;
use App\Models\ReferencePayment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        // Get filter parameters
        $searchQuery = $request->input('search', '');
        $searchField = $request->input('searchField', 'Code_Payment');
        $perPage = $request->input('perPage', 25);
        $currentPage = $request->input('page', 1);
        $startDate = $request->input('startDate');
        $endDate = $request->input('endDate');
        $tranType = $request->input('tranType');
        $status = $request->input('status');
        $companyIds = $request->input('companyIds');
        $openBalanceFilter = $request->input('openBalanceFilter'); // New filter parameter

        // Initialize queries
        $piQuery = Pi::where('status', 1)->with('piDetails', 'company');
        $paymentQuery = Payment::with('paymentDetails', 'company');

        // Apply date filters
        if ($startDate) {
            $piQuery->whereDate('date', '>=', $startDate);
            $paymentQuery->whereDate('date', '>=', $startDate);
        }
        if ($endDate) {
            $piQuery->whereDate('date', '<=', $endDate);
            $paymentQuery->whereDate('date', '<=', $endDate);
        }

        // Apply tran_type filter
        if ($tranType) {
            if ($tranType === '1') {
                $paymentQuery->whereRaw('1 = 0'); // Exclude payments
            } elseif ($tranType === '2') {
                $piQuery->whereRaw('1 = 0'); // Exclude PIs
            }
        }

        // Apply status filter
        if ($status) {
            $statusArray = explode(',', $status);
            if (in_array('null', $statusArray)) {
                // Handle Pending case: include both 0 and null
                $paymentQuery->where(function ($query) {
                    $query->where('aprove', 0)
                          ->orWhereNull('aprove');
                });
            } else {
                $paymentQuery->whereIn('aprove', $statusArray);
            }
        } else {
            // No status filter, include all possible values
            $paymentQuery->where(function ($query) {
                $query->whereIn('aprove', ['0', '1'])
                      ->orWhereNull('aprove');
            });
        }

        // Apply company filter
        if ($companyIds) {
            $companyIdArray = explode(',', $companyIds);
            $piQuery->whereIn('company_id', $companyIdArray);
            $paymentQuery->whereIn('company_id', $companyIdArray);
        }

        // Apply openbalance filter for PI records
        if ($openBalanceFilter) {
            if ($openBalanceFilter === 'open') {
                // Open: openbalance not equal to 0 or null
                $piQuery->where(function ($query) {
                    $query->where('openbalance', '!=', 0)
                          ->whereNotNull('openbalance');
                });
            } elseif ($openBalanceFilter === 'close') {
                // Close: openbalance equal to 0 or null
                $piQuery->where(function ($query) {
                    $query->where('openbalance', 0)
                          ->orWhereNull('openbalance');
                });
            }
        }

        // Apply search filters
        if ($searchQuery) {
            if ($searchField === 'Code_Payment') {
                $paymentQuery->where('payment_number', 'like', '%' . $searchQuery . '%');
                $piQuery->whereRaw('1 = 0'); // Exclude PI records
            } elseif ($searchField === 'PI_Number') {
                $piQuery->where('pi_number', 'like', '%' . $searchQuery . '%');
                $paymentQuery->whereRaw('1 = 0'); // Exclude Payment records
            } elseif ($searchField === 'PI_Name') {
                $piQuery->where(function ($query) use ($searchQuery) {
                    $query->where('pi_name', 'like', '%' . $searchQuery . '%')
                          ->orWhere('pi_name_cn', 'like', '%' . $searchQuery . '%');
                });
                $paymentQuery->whereRaw('1 = 0'); // Exclude Payment records
            }
        }

        // Fetch tbpi data
        $piData = $piQuery->get()->map(function ($pi) {
            $totalAmount = $pi->piDetails->sum(function ($detail) {
                return ($detail->amount * $detail->unit_price);
            }) + ($pi->extra_charge ?? 0) - ($pi->discount ?? 0);

            return [
                'id' => $pi->id,
                'tran_type' => '1',
                'tran_date' => $pi->date->format('Y-m-d'),
                'number' => $pi->pi_number,
                'name' => $pi->pi_name . ($pi->pi_name_cn ? ' / ' . $pi->pi_name_cn : ''),
                'amount' => $totalAmount,
                'open_balance' => $pi->openbalance ?? 0,
                'memo' => $pi->note,
                'status' => '',
                'action' => '',
                'company_id' => $pi->company_id,
                'company_name' => $pi->company ? $pi->company->company_name : '',
            ];
        });

        // Fetch tbpayment data
        $paymentData = $paymentQuery->get()->map(function ($payment) {
            $totalAmount = $payment->paymentDetails->sum(function ($detail) {
                if ($detail->status_discount == 1) {
                    return $detail->payment - ($detail->discount_payment ?? 0);
                } elseif ($detail->status_discount == 2) {
                    return ($detail->payment_balance * ($detail->discount_payment ?? 0) / 100) - $detail->payment;
                }
                return 0;
            });

            return [
                'id' => $payment->id,
                'tran_type' => '2',
                'tran_date' => $payment->date->format('Y-m-d'),
                'number' => $payment->payment_number,
                'name' => '',
                'amount' => $totalAmount,
                'open_balance' => 0,
                'memo' => $payment->memo,
                'aprove' => $payment->aprove, // Send raw aprove value
                'action' => '',
                'company_id' => $payment->company_id,
                'company_name' => $payment->company ? $payment->company->company_name : '',
            ];
        });

        // Combine and sort data
        $combinedData = $piData->concat($paymentData)
            ->sortByDesc('tran_date')
            ->values()
            ->all();

        // Apply pagination
        $total = count($combinedData);
        $paginatedData = array_slice($combinedData, ($currentPage - 1) * $perPage, $perPage);

        // Fetch companies with status = 1
        $companies = Company::where('status', 1)->get(['id', 'company_name'])->toArray();

        // Fetch pie chart and line chart data
        $pieChartData = Pi::where('status', 1)
            ->with('company')
            ->get()
            ->groupBy('company_id')
            ->map(function ($group, $companyId) {
                $company = $group->first()->company;
                return [
                    'value' => $group->sum('openbalance'),
                    'name' => $company ? $company->company_name : 'Unknown (ID: ' . $companyId . ')',
                    'company_id' => $companyId,
                ];
            })
            ->values()
            ->all();

        $lineChartData = Payment::with('paymentDetails', 'company')
            ->get()
            ->groupBy('company_id')
            ->map(function ($group, $companyId) {
                $company = $group->first()->company;
                $companyName = $company ? $company->company_name : 'Unknown (ID: ' . $companyId . ')';
                $yearlyData = $group->groupBy(function ($payment) {
                    return $payment->date->format('Y');
                })->map(function ($payments) {
                    return $payments->sum(function ($payment) {
                        return $payment->paymentDetails->sum(function ($detail) {
                            if ($detail->status_discount == 1) {
                                return $detail->payment - ($detail->discount_payment ?? 0);
                            } elseif ($detail->status_discount == 2) {
                                return ($detail->payment_balance * ($detail->discount_payment ?? 0) / 100) - $detail->payment;
                            }
                            return 0;
                        });
                    });
                });

                return [
                    'company_name' => $companyName,
                    'data' => $yearlyData->toArray(),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('Payment/Payment-Manage', [
            'darkMode' => $request->user()->dark_mode ?? false,
            'payments' => $paginatedData,
            'pagination' => [
                'currentPage' => (int) $currentPage,
                'perPage' => (int) $perPage,
                'total' => $total,
            ],
            'pieChartData' => $pieChartData,
            'lineChartData' => $lineChartData,
            'companies' => $companies,
        ]);
    }

    public function store(Request $request)
    {
        // Validate required fields
        $validated = $request->validate([
            'date' => 'required|date',
            'company_id' => 'required|exists:company,id',
            'payment_method' => 'required|in:1,2', // 1 = Bank, 2 = Cash
            'payment_number' => 'required|string|unique:tbpayment,payment_number',
            'memo' => 'nullable|string',
            'reference_payments.*' => 'nullable|image', // Validate images
            'payment_details' => 'required|array|min:1', // Ensure at least one detail
            'payment_details.*.pi_id' => 'required|exists:tbpi,id',
            'payment_details.*.checkbox' => 'nullable|in:1', // Checkbox can be null or 1
            'payment_details.*.payment_balance' => 'required|numeric|min:0',
            'payment_details.*.discount_payment' => 'nullable|numeric|min:0',
            'payment_details.*.status_discount' => 'nullable|in:$,%',
            'payment_details.*.payment' => 'nullable|numeric|min:0',
        ]);

        // Check if company_id and payment_method are provided
        if (!$validated['company_id'] || !$validated['payment_method']) {
            return redirect()->back()->withErrors([
                'error' => 'Company and payment method are required.',
            ]);
        }

        // Create Payment record
        $payment = Payment::create([
            'date' => $validated['date'],
            'company_id' => $validated['company_id'],
            'payment_method' => $validated['payment_method'],
            'payment_number' => $validated['payment_number'],
            'memo' => $validated['memo'],
            'created_by' => Auth::id(),
        ]);

        // Handle Reference Payment Images
        if ($request->hasFile('reference_payments')) {
            foreach ($request->file('reference_payments') as $index => $image) {
                // Generate datetime prefix
                $datetime = now()->format('Ymd_His');
                // Generate random 50-character alphanumeric string
                $randomString = \Illuminate\Support\Str::random(50);
                // Get file extension
                $extension = $image->getClientOriginalExtension();
                // Create filename with datetime and random string
                $filename = "payment_{$payment->id}_{$datetime}_{$randomString}.{$extension}";
                // Store the image in public/storage/uploads/payment/
                $path = $image->storeAs('uploads/payment', $filename, 'public');
                // Save only the filename to tbreference_payment table
                ReferencePayment::create([
                    'payment_id' => $payment->id,
                    'image' => $filename,
                ]);
            }
        }

        // Create Payment Details for all payment_details
        foreach ($validated['payment_details'] as $detail) {
            $paymentDetailData = [
                'pi_id' => $detail['pi_id'],
                'payment_balance' => $detail['payment_balance'],
                'payment_id' => $payment->id,
                'checkbox' => $detail['checkbox'] === '1' ? 1 : null,
                'discount_payment' => $detail['checkbox'] === '1' ? ($detail['discount_payment'] ?? 0) : 0,
                'status_discount' => $detail['checkbox'] === '1' ? ($detail['status_discount'] === '$' ? 1 : ($detail['status_discount'] === '%' ? 2 : 0)) : 0,
                'payment' => $detail['checkbox'] === '1' ? ($detail['payment'] ?? 0) : 0,
            ];

            PaymentDetail::create($paymentDetailData);
        }

        return redirect()->back()->with('success', 'Payment created successfully.');
    }

    public function fetchPayment($id)
    {
        $payment = Payment::with(['company', 'paymentDetails.pi', 'referencePayments'])
            ->findOrFail($id);

        $paymentDetails = $payment->paymentDetails->map(function ($detail) {
            return [
                'pi_id' => $detail->pi_id,
                'checkbox' => $detail->checkbox,
                'payment_balance' => $detail->payment_balance,
                'discount_payment' => $detail->discount_payment,
                'status_discount' => $detail->status_discount == 1 ? '$' : ($detail->status_discount == 2 ? '%' : null),
                'payment' => $detail->payment,
                // Include PI-related data
                'pi_number' => $detail->pi ? $detail->pi->pi_number : '',
                'pi_name' => $detail->pi ? $detail->pi->pi_name : '',
                'pi_name_cn' => $detail->pi ? $detail->pi->pi_name_cn : '',
                'date' => $detail->pi ? $detail->pi->date->toDateString() : '',
                'grand_total' => $detail->pi ? (
                    $detail->pi->piDetails->sum(function ($piDetail) {
                        return $piDetail->amount * $piDetail->unit_price;
                    }) + ($detail->pi->extra_charge ?? 0) - ($detail->pi->discount ?? 0)
                ) : 0,
                'open_balance' => $detail->pi ? ($detail->pi->openbalance ?? 0) : 0,
            ];
        });

        return response()->json([
            'id' => $payment->id,
            'date' => $payment->date->format('Y-m-d'),
            'company_id' => $payment->company_id,
            'payment_method' => $payment->payment_method,
            'payment_number' => $payment->payment_number,
            'memo' => $payment->memo,
            'aprove' => $payment->aprove,
            'payment_details' => $paymentDetails,
            'reference_payments' => $payment->referencePayments->map(function ($ref) {
                return [
                    'id' => $ref->id,
                    'image' => $ref->image,
                ];
            }),
        ]);
    }

    public function update(Request $request, $id)
    {
        // Validate required fields
        $validated = $request->validate([
            'date' => 'required|date',
            'company_id' => 'required|exists:company,id',
            'payment_method' => 'required|in:1,2', // 1 = Bank, 2 = Cash
            'payment_number' => 'required|string|unique:tbpayment,payment_number,' . $id,
            'memo' => 'nullable|string',
            'status' => 'required|in:0,1',
            'reference_payments.*' => 'nullable|image',
            'payment_details' => 'required|array|min:1',
            'payment_details.*.pi_id' => 'required|exists:tbpi,id',
            'payment_details.*.checkbox' => 'nullable|in:1',
            'payment_details.*.payment_balance' => 'required|numeric|min:0',
            'payment_details.*.discount_payment' => 'nullable|numeric|min:0',
            'payment_details.*.status_discount' => 'nullable|in:$,%',
            'payment_details.*.payment' => 'nullable|numeric|min:0',
            'deleted_images' => 'nullable|string', // For deleted reference payment images
        ]);

        // Find the payment
        $payment = Payment::findOrFail($id);

        // Update payment record
        $payment->update([
            'date' => $validated['date'],
            'company_id' => $validated['company_id'],
            'payment_method' => $validated['payment_method'],
            'payment_number' => $validated['payment_number'],
            'memo' => $validated['memo'],
            'updated_by' => Auth::id(),
        ]);

        // Handle deleted reference payment images
        if ($request->has('deleted_images')) {
            $deletedImages = json_decode($request->input('deleted_images'), true);
            if (!empty($deletedImages)) {
                foreach ($deletedImages as $imageId) {
                    $referencePayment = ReferencePayment::find($imageId);
                    if ($referencePayment) {
                        // Delete the image file from storage
                        Storage::disk('public')->delete('uploads/payment/' . $referencePayment->image);
                        // Delete the reference payment record
                        $referencePayment->delete();
                    }
                }
            }
        }

        // Handle new reference payment images
        if ($request->hasFile('reference_payments')) {
            foreach ($request->file('reference_payments') as $index => $image) {
                $datetime = now()->format('Ymd_His');
                $randomString = \Illuminate\Support\Str::random(50);
                $extension = $image->getClientOriginalExtension();
                $filename = "payment_{$payment->id}_{$datetime}_{$randomString}.{$extension}";
                $path = $image->storeAs('uploads/payment', $filename, 'public');
                ReferencePayment::create([
                    'payment_id' => $payment->id,
                    'image' => $filename,
                ]);
            }
        }

        // Delete existing payment details
        PaymentDetail::where('payment_id', $payment->id)->delete();

        // Create new payment details
        foreach ($validated['payment_details'] as $detail) {
            $paymentDetailData = [
                'pi_id' => $detail['pi_id'],
                'payment_balance' => $detail['payment_balance'],
                'payment_id' => $payment->id,
                'checkbox' => $detail['checkbox'] === '1' ? 1 : null,
                'discount_payment' => $detail['checkbox'] === '1' ? ($detail['discount_payment'] ?? 0) : 0,
                'status_discount' => $detail['checkbox'] === '1' ? ($detail['status_discount'] === '$' ? 1 : ($detail['status_discount'] === '%' ? 2 : 0)) : 0,
                'payment' => $detail['checkbox'] === '1' ? ($detail['payment'] ?? 0) : 0,
            ];

            PaymentDetail::create($paymentDetailData);
        }

        return redirect()->back()->with('success', 'Payment updated successfully.');
    }

    public function approve(Request $request, $id)
    {
        try {
            // Find the payment
            $payment = Payment::with('paymentDetails.pi')->findOrFail($id);

            // Check if payment is already approved
            if ($payment->aprove == 1) {
                return redirect()->back()->withErrors([
                    'error' => 'Payment is already approved.',
                ]);
            }

            // Update aprove status to 1
            $payment->update([
                'aprove' => 1,
                'updated_by' => Auth::id(),
            ]);

            // Process payment details with checkbox = 1
            $paymentDetails = $payment->paymentDetails->where('checkbox', 1);

            foreach ($paymentDetails as $detail) {
                $pi = $detail->pi;
                if (!$pi) {
                    continue; // Skip if PI not found
                }

                // Calculate amount_to_be_paid based on status_discount
                $amountToBePaid = 0;
                if ($detail->status_discount == 1) { // $
                    $amountToBePaid = ($detail->discount_payment ?? 0) + ($detail->payment ?? 0);
                } elseif ($detail->status_discount == 2) { // %
                    $amountToBePaid = (($detail->payment_balance * ($detail->discount_payment ?? 0)) / 100) + ($detail->payment ?? 0);
                }

                // Update openbalance in tbpi
                $currentOpenBalance = $pi->openbalance ?? 0;
                $newOpenBalance = $currentOpenBalance - $amountToBePaid;

                // Ensure openbalance doesn't go negative
                if ($newOpenBalance < 0) {
                    $newOpenBalance = 0;
                }

                $pi->update([
                    'openbalance' => $newOpenBalance,
                ]);
            }

            return redirect()->back()->with('success', 'Payment approved successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'An error occurred while approving the payment.',
            ]);
        }
    }

    public function destroy($id)
    {
        try {
            // Find the payment
            $payment = Payment::with('paymentDetails.pi')->findOrFail($id);

            // If payment is approved (aprove = 1), update openbalance in tbpi
            if ($payment->aprove == 1) {
                $paymentDetails = $payment->paymentDetails->where('checkbox', 1);

                foreach ($paymentDetails as $detail) {
                    $pi = $detail->pi;
                    if (!$pi) {
                        continue; // Skip if PI not found
                    }

                    // Calculate amount_to_be_restored based on status_discount
                    $amountToBeRestored = 0;
                    if ($detail->status_discount == 1) { // $
                        $amountToBeRestored = ($detail->discount_payment ?? 0) + ($detail->payment ?? 0);
                    } elseif ($detail->status_discount == 2) { // %
                        $amountToBeRestored = (($detail->payment_balance * ($detail->discount_payment ?? 0)) / 100) + ($detail->payment ?? 0);
                    }

                    // Update openbalance in tbpi
                    $currentOpenBalance = $pi->openbalance ?? 0;
                    $newOpenBalance = $currentOpenBalance + $amountToBeRestored;

                    $pi->update([
                        'openbalance' => $newOpenBalance,
                    ]);
                }
            }

            // Delete reference payment images from storage
            $referencePayments = ReferencePayment::where('payment_id', $payment->id)->get();
            foreach ($referencePayments as $referencePayment) {
                // Delete the image file from storage
                Storage::disk('public')->delete('uploads/payment/' . $referencePayment->image);
                // Delete the reference payment record
                $referencePayment->delete();
            }

            // Delete payment details
            PaymentDetail::where('payment_id', $payment->id)->delete();

            // Delete the payment record
            $payment->delete();

            return redirect()->back()->with('success', 'Payment deleted successfully.');

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'error' => 'An error occurred while deleting the payment.',
            ]);
        }
    }
}
