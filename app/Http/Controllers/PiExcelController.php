<?php

namespace App\Http\Controllers;

use App\Models\Pi;
use App\Models\ReferenceImage;
use App\Models\PiDetail;
use App\Models\Company;
use App\Models\Shipment;
use App\Models\Method;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class PiExcelController extends Controller
{
        public function downloadExcel($piId)
    {
        // Clear any existing output buffers to prevent corruption
        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        $pi = Pi::with(['piDetails.product'])
            ->where('id', $piId)
            ->where('status', 1)
            ->firstOrFail();

        $productDetails = PiDetail::where('pi_id', $piId)
            ->with(['product'])
            ->get()
            ->map(function ($detail) {
                return [
                    'photo' => $detail->product->image ?? '',
                    'code' => $detail->product->product_code ?? '',
                    'name_en' => $detail->product->name_en ?? '',
                    'name_kh' => $detail->product->name_kh ?? '',
                    'name_cn' => $detail->product->name_cn ?? '',
                    'qty' => $detail->amount,
                    'price' => $detail->unit_price,
                    'note' => $detail->note,
                ];
            })->toArray();

        // Create a new spreadsheet
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $worksheet = $spreadsheet->getActiveSheet();
        $worksheet->setTitle("PI-{$pi->pi_number}");

        // Define styles
        $headerStyle = [
            'font' => ['bold' => true, 'size' => 10],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER, 'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['argb' => 'F7B500']],
        ];

        $detailStyle = [
            'font' => ['size' => 11],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT, 'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER],
        ];

        $borderStyle = [
            'borders' => [
                'allBorders' => ['borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN, 'color' => ['argb' => '000000']],
            ],
        ];

        // Stage 1: Setup header
        $worksheet->mergeCells('A1:G1');
        $worksheet->setCellValue('A1', 'Proforma Invoice');
        $worksheet->getStyle('A1')->applyFromArray([
            'font' => ['bold' => true, 'size' => 20],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER, 'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['argb' => 'F7B500']],
        ]);
        $worksheet->getRowDimension(1)->setRowHeight(50);

        // Stage 2: Setup PI details
        $details = [
            ['PI Number:', $pi->pi_number, '', '', '', 'Ship By:', $pi->shipment_name ?? ''],
            ['PI Name(CN):', $pi->pi_name_cn ?? '', '', '', '', 'Shipping Method:', $pi->name_method ?? ''],
            ['PI Name(EN):', $pi->pi_name ?? '', '', '', '', 'Receipt Number:', $pi->reciept_number ?? ''],
            ['Date:', $this->formatDate($pi->date), '', '', '', 'Tracking Number:', $pi->tracking_number ?? ''],
            ['Total CTN:', $pi->amout_ctn ?? '', '', '', '', 'Arrival Date at Logistic:', $this->formatDate($pi->arrival_date) ?? ''],
            ['Arrival Date at Logistic:', $this->formatDate($pi->arrival_date) ?? '', '', '', '', '', '', ''],
            ['Status:', $pi->note ?? '', '', '', '', '', '', ''],
        ];

        $rowIndex = 2;
        foreach ($details as $index => $row) {
            $worksheet->fromArray($row, null, "A{$rowIndex}");
            $worksheet->getRowDimension($rowIndex)->setRowHeight(30);
            $worksheet->getStyle("A{$rowIndex}:G{$rowIndex}")->applyFromArray($detailStyle);
            if ($index === 5) {
                $worksheet->mergeCells("B{$rowIndex}:F{$rowIndex}");
            }
            $rowIndex++;
        }

        // Stage 3: Setup product headers
        $headers = ['Code', 'Name', 'Photo', 'Unit Price (USD)', 'QTY (pcs)', 'Total Amount (USD)', 'Package Detail'];
        $worksheet->fromArray($headers, null, 'A' . $rowIndex);
        $worksheet->getRowDimension($rowIndex)->setRowHeight(35);
        $worksheet->getStyle("A{$rowIndex}:G{$rowIndex}")->applyFromArray(array_merge($headerStyle, $borderStyle));
        $rowIndex++;

        // Stage 4: Process products
        $totalQty = 0;
        $totalAmount = 0;

        foreach ($productDetails as $product) {
            $mixname = array_filter([$product['name_en'], $product['name_kh'], $product['name_cn']]);
            $mixname = implode("\n", $mixname);
            $totalAmountProduct = ($product['qty'] * (float)$product['price']);

            $row = [
                $product['code'] ?? '',
                $mixname ?? '',
                '',
                number_format($product['price'] ?? 0, 3) . ' $',
                $product['qty'] ?? 0,
                number_format($totalAmountProduct, 3) . ' $',
                $product['note'] ?? '',
            ];

            $worksheet->fromArray($row, null, "A{$rowIndex}");
            $worksheet->getRowDimension($rowIndex)->setRowHeight(150);
            $worksheet->getStyle("A{$rowIndex}:G{$rowIndex}")->applyFromArray(array_merge([
                'alignment' => ['vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER, 'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER, 'wrapText' => true],
            ], $borderStyle));

            // Embed photo
            if ($product['photo'] && file_exists(public_path('storage/' . $product['photo']))) {
                try {
                    $drawing = new \PhpOffice\PhpSpreadsheet\Worksheet\Drawing();
                    $drawing->setPath(public_path('storage/' . $product['photo']));
                    $drawing->setCoordinates('C' . $rowIndex);
                    $drawing->setWidth(100);
                    $drawing->setHeight(100);
                    $drawing->setOffsetX(25);
                    $drawing->setOffsetY(50);
                    $drawing->setWorksheet($worksheet);
                } catch (\Exception $e) {

                }
            }

            $totalQty += $product['qty'] ?? 0;
            $totalAmount += $totalAmountProduct;
            $rowIndex++;
        }

        // Stage 5: Generate footer
        $discount = (float)($pi->discount ?? 0);
        $extraCharge = (float)($pi->extra_charge ?? 0);
        $netTotal = $totalAmount + $extraCharge - $discount;

        // Discount row
        $worksheet->fromArray(['Discount', '', '', '', '', number_format($discount, 3) . ' $', ''], null, "A{$rowIndex}");
        $worksheet->mergeCells("A{$rowIndex}:D{$rowIndex}");
        $worksheet->getRowDimension($rowIndex)->setRowHeight(30);
        $worksheet->getStyle("A{$rowIndex}:G{$rowIndex}")->applyFromArray(array_merge([
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER, 'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['argb' => 'F7B500']],
        ], $borderStyle));
        $rowIndex++;

        // Extra charge row
        $worksheet->fromArray(['Extra Charge', '', '', '', '', number_format($extraCharge, 3) . ' $', ''], null, "A{$rowIndex}");
        $worksheet->mergeCells("A{$rowIndex}:D{$rowIndex}");
        $worksheet->getRowDimension($rowIndex)->setRowHeight(30);
        $worksheet->getStyle("A{$rowIndex}:G{$rowIndex}")->applyFromArray(array_merge([
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER, 'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['argb' => 'F7B500']],
        ], $borderStyle));
        $rowIndex++;

        // Grand total row
        $worksheet->fromArray(['Grand Total', '', '', '', $totalQty, number_format($netTotal, 3) . ' $', ''], null, "A{$rowIndex}");
        $worksheet->mergeCells("A{$rowIndex}:D{$rowIndex}");
        $worksheet->getRowDimension($rowIndex)->setRowHeight(30);
        $worksheet->getStyle("A{$rowIndex}:G{$rowIndex}")->applyFromArray(array_merge([
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER, 'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER],
            'fill' => ['fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID, 'color' => ['argb' => 'F7B500']],
        ], $borderStyle));

        // Set column widths
        $columnWidths = [20, 20, 20, 20, 20, 20, 30];
        foreach (range('A', 'G') as $index => $column) {
            $worksheet->getColumnDimension($column)->setWidth($columnWidths[$index]);
        }

        // Generate Excel file and return response
        $writer = \PhpOffice\PhpSpreadsheet\IOFactory::createWriter($spreadsheet, 'Xlsx');
        $supplierName = $pi->pi_name ?? $pi->pi_name_cn ?? 'Unknown';
        // Sanitize filename to avoid special characters causing issues
        $filename = "PI_of_" . preg_replace('/[^A-Za-z0-9\-_]/', '_', $supplierName) . "_{$pi->pi_number}.xlsx";

        // Start clean output buffer
        ob_start();
        $writer->save('php://output');
        $content = ob_get_clean();

        // Explicitly exit to prevent additional output
        return response($content, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ]);
    }

    private function formatDate($date)
    {
        if (!$date) return '';
        return \Carbon\Carbon::parse($date)->format('d-M-y');
    }
}
