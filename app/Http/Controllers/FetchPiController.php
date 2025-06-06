<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Pi;
use Illuminate\Http\Request;

class FetchPiController extends Controller
{
    public function index($companyId)
    {
        // Fetch PIs for the given company_id where status = 1 and openbalance is positive
        $pis = Pi::with(['piDetails', 'company'])
            ->where('company_id', $companyId)
            ->where('status', 1)
            ->where(function ($query) {
                $query->where('openbalance', '>', 0) // Greater than 0
                      ->whereNotNull('openbalance'); // Not null
            })
            ->get()
            ->map(function ($pi) {
                // Calculate grand_total: (sum of amount * unit_price) + extra_charge - discount
                $totalDetails = $pi->piDetails->sum(function ($detail) {
                    return $detail->amount * $detail->unit_price;
                });
                $grandTotal = $totalDetails + ($pi->extra_charge ?? 0) - ($pi->discount ?? 0);

                return [
                    'id' => $pi->id,
                    'date' => $pi->date->toDateString(),
                    'pi_number' => $pi->pi_number,
                    'pi_name' => $pi->pi_name,
                    'pi_name_cn' => $pi->pi_name_cn,
                    'grand_total' => $grandTotal,
                    'open_balance' => $pi->openbalance ?? 0,
                ];
            });

        return response()->json($pis);
    }

    public function checkPaymentNumber($number)
    {
        $exists = Payment::where('payment_number', $number)->exists();
        return response()->json(['exists' => $exists]);
    }
}
