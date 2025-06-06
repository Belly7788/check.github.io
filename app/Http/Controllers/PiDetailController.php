<?php

namespace App\Http\Controllers;

use App\Models\PiDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class PiDetailController extends Controller
{
    public function show($id)
    {
        try {
            $piDetail = PiDetail::select([
                'delivery',
                'cargo_date',
                'note_receipt',
                'receipt_picture',
                'receipt_product',
                'pi_id',
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $piDetail
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve PI detail'
            ], 404);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $piDetail = PiDetail::findOrFail($id);

            // Validate request
            $request->validate([
                'delivery' => 'required|string',
                'cargo_date' => 'nullable|date',
                'note_receipt' => 'nullable|string',
                'receipt_pictures.*' => 'nullable|file|image',
                'receipt_products.*' => 'nullable|file|image',
            ]);

            // Handle receipt_pictures
            $receiptPicturesToKeep = $request->input('receipt_pictures_to_keep')
                ? json_decode($request->input('receipt_pictures_to_keep'), true)
                : [];
            $currentPictures = $piDetail->receipt_picture
                ? explode(',', $piDetail->receipt_picture)
                : [];

            // Delete pictures not in receipt_pictures_to_keep
            foreach ($currentPictures as $picture) {
                if (!in_array($picture, $receiptPicturesToKeep)) {
                    $filePath = public_path('storage/uploads/receipt_picture/' . $picture);
                    if (file_exists($filePath)) {
                        unlink($filePath);
                    }
                }
            }

            // Upload new receipt_pictures
            $newPictures = [];
            if ($request->hasFile('receipt_pictures')) {
                foreach ($request->file('receipt_pictures') as $photo) {
                    if ($photo->isValid()) {
                        $filename = Carbon::now()->format('YmdHis') . '_' . Str::random(10) . '.' . $photo->extension();
                        $path = $photo->storeAs('uploads/receipt_picture', $filename, 'public');
                        $newPictures[] = $filename;
                    }
                }
            }

            // Handle receipt_products
            $receiptProductsToKeep = $request->input('receipt_products_to_keep')
                ? json_decode($request->input('receipt_products_to_keep'), true)
                : [];
            $currentProducts = $piDetail->receipt_product
                ? explode(',', $piDetail->receipt_product)
                : [];

            // Delete products not in receipt_products_to_keep
            foreach ($currentProducts as $product) {
                if (!in_array($product, $receiptProductsToKeep)) {
                    $filePath = public_path('storage/uploads/receipt_product/' . $product);
                    if (file_exists($filePath)) {
                        unlink($filePath);
                    }
                }
            }

            // Upload new receipt_products
            $newProducts = [];
            if ($request->hasFile('receipt_products')) {
                foreach ($request->file('receipt_products') as $photo) {
                    if ($photo->isValid()) {
                        $filename = Carbon::now()->format('YmdHis') . '_' . Str::random(10) . '.' . $photo->extension();
                        $path = $photo->storeAs('uploads/receipt_product', $filename, 'public');
                        $newProducts[] = $filename;
                    }
                }
            }

            // Update fields
            $piDetail->delivery = $request->input('delivery');
            $piDetail->cargo_date = $request->input('cargo_date') ?: null;
            $piDetail->note_receipt = $request->input('note_receipt') ?: null;
            $piDetail->receipt_picture = $receiptPicturesToKeep || $newPictures
                ? implode(',', array_merge($receiptPicturesToKeep, $newPictures))
                : null;
            $piDetail->receipt_product = $receiptProductsToKeep || $newProducts
                ? implode(',', array_merge($receiptProductsToKeep, $newProducts))
                : null;

            // Save the updated record
            $piDetail->save();

            return response()->json([
                'success' => true,
                'message' => 'PI detail updated successfully',
                'data' => $piDetail
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update PI detail: ' . $e->getMessage()
            ], 500);
        }
    }
}
