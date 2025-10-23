<?php

namespace App\Http\Controllers;

use App\Models\Pi;
use App\Models\PiDetail;
use App\Models\PoDetail;
use App\Models\Shipment;
use App\Models\Method;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Intervention\Image\Facades\Image;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('perPage', 25);
        $page = $request->query('page', 1);
        $search = $request->query('search');

        $query = Product::query()->where('status', 1);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('product_code', 'like', "%{$search}%")
                  ->orWhere('name_kh', 'like', "%{$search}%")
                  ->orWhere('name_en', 'like', "%{$search}%")
                  ->orWhere('name_cn', 'like', "%{$search}%")
                  ->orWhere('HS_code', 'like', "%{$search}%");
            });
        }

        $products = $query->with(['images', 'videos'])
                        ->orderBy('id', 'desc')
                        ->paginate($perPage, ['*'], 'page', $page);

        return inertia('Products/ProductList', [
            'products' => $products->items(),
            'pagination' => [
                'total' => $products->total(),
                'perPage' => $products->perPage(),
                'currentPage' => $products->currentPage(),
                'lastPage' => $products->lastPage(),
            ],
            'darkMode' => true,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_code' => [
                'nullable',
                'string',
                'max:100',
                function ($attribute, $value, $fail) {
                    if ($value && Product::where('product_code', $value)->where('status', 1)->exists()) {
                        $fail('The product code has already been taken.');
                    }
                },
            ],
            'name_kh' => 'nullable|string|max:100',
            'name_en' => 'nullable|string|max:100',
            'name_cn' => 'nullable|string|max:100',
            'declare' => 'nullable|string',
            'HS_code' => 'nullable|string|max:100',
            'default_image' => 'nullable|image',
            'thumbnails' => 'nullable|array',
            'thumbnails.*' => 'image',
            'videos' => 'nullable|array',
            'videos.*' => 'mimetypes:video/mp4,video/mpeg,video/quicktime',
        ]);

        $product = new Product();
        $product->product_code = $validated['product_code'];
        $product->name_kh = $validated['name_kh'];
        $product->name_en = $validated['name_en'];
        $product->name_cn = $validated['name_cn'];
        $product->declare = $validated['declare'];
        $product->HS_code = $validated['HS_code'];
        $product->user_id = Auth::id();
        $product->status = 1;

        if ($request->hasFile('default_image')) {
            $file = $request->file('default_image');
            $filename = $this->generateUniqueFilename('webp');
            $path = $this->processImage($file, 'uploads/images', $filename);
            $product->image = 'uploads/images/' . $filename;
        }

        $product->save();

        if ($request->hasFile('thumbnails')) {
            foreach ($request->file('thumbnails') as $thumbnail) {
                $filename = $this->generateUniqueFilename('webp');
                $path = $this->processImage($thumbnail, 'uploads/promotions', $filename);
                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => 'uploads/promotions/' . $filename,
                ]);
            }
        }

        if ($request->hasFile('videos')) {
            foreach ($request->file('videos') as $video) {
                $filename = $this->generateUniqueFilename('mp4'); // Changed to 'mp4'
                $path = $video->storeAs('uploads/videos', $filename, 'public');
                ProductVideo::create([
                    'product_id' => $product->id,
                    'video' => 'uploads/videos/' . $filename,
                ]);
            }
        }

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    public function update(Request $request, $id)
    {
        $product = Product::where('status', 1)->findOrFail($id);

        $validated = $request->validate([
            'product_code' => [
                'nullable',
                'string',
                'max:100',
                function ($attribute, $value, $fail) use ($id) {
                    if ($value && Product::where('product_code', $value)->where('status', 1)->where('id', '!=', $id)->exists()) {
                        $fail('The product code has already been taken.');
                    }
                },
            ],
            'name_kh' => 'nullable|string|max:100',
            'name_en' => 'nullable|string|max:100',
            'name_cn' => 'nullable|string|max:100',
            'declare' => 'nullable|string',
            'HS_code' => 'nullable|string|max:100',
            'default_image' => 'nullable|image',
            'thumbnails.*' => 'nullable|image',
            'videos.*' => 'nullable|mimetypes:video/mp4,video/mpeg,video/quicktime',
            'existing_default_image' => 'nullable|string',
            'existing_thumbnails' => 'nullable|array',
            'existing_thumbnails.*' => 'nullable|string',
            'existing_videos' => 'nullable|array',
            'existing_videos.*' => 'nullable|string',
        ]);

        $product->update([
            'product_code' => $validated['product_code'] ?? $product->product_code,
            'name_kh' => $validated['name_kh'] ?? $product->name_kh,
            'name_en' => $validated['name_en'] ?? $product->name_en,
            'name_cn' => $validated['name_cn'] ?? $product->name_cn,
            'declare' => $validated['declare'] ?? $product->declare,
            'HS_code' => $validated['HS_code'] ?? $product->HS_code,
        ]);

        // Handle default image
        if ($request->hasFile('default_image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $file = $request->file('default_image');
            $filename = $this->generateUniqueFilename('webp');
            $path = $this->processImage($file, 'uploads/images', $filename);
            $product->image = 'uploads/images/' . $filename;
            $product->save();
        } elseif ($request->input('existing_default_image')) {
            $product->image = $request->input('existing_default_image');
            $product->save();
        } elseif (!$request->hasFile('default_image') && !$request->input('existing_default_image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
                $product->image = null;
                $product->save();
            }
        }

        // Handle thumbnails
        $existingThumbnails = $request->input('existing_thumbnails', []);
        ProductImage::where('product_id', $product->id)
            ->whereNotIn('image', $existingThumbnails)
            ->each(function ($image) {
                Storage::disk('public')->delete($image->image);
                $image->delete();
            });

        if ($request->hasFile('thumbnails')) {
            foreach ($request->file('thumbnails') as $thumbnail) {
                $filename = $this->generateUniqueFilename('webp');
                $path = $this->processImage($thumbnail, 'uploads/promotions', $filename);
                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => 'uploads/promotions/' . $filename,
                ]);
            }
        }

        // Handle videos
        $existingVideos = $request->input('existing_videos', []);
        ProductVideo::where('product_id', $product->id)
            ->whereNotIn('video', $existingVideos)
            ->each(function ($video) {
                Storage::disk('public')->delete($video->video);
                $video->delete();
            });

        if ($request->hasFile('videos')) {
            foreach ($request->file('videos') as $video) {
                $filename = $this->generateUniqueFilename('mp4'); // Changed to 'mp4'
                $path = $video->storeAs('uploads/videos', $filename, 'public');
                ProductVideo::create([
                    'product_id' => $product->id,
                    'video' => 'uploads/videos/' . $filename,
                ]);
            }
        }

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
    }

    public function show($id)
    {
        $product = Product::with(['images', 'videos'])->where('status', 1)->findOrFail($id);
        return response()->json($product);
    }

    public function getAllProducts()
    {
        $products = Product::where('status', 1)
            ->orderBy('id', 'desc')
            ->get(['id', 'product_code', 'name_kh', 'name_en', 'name_cn', 'HS_code']);
        return response()->json($products);
    }

    public function destroy($id)
    {
        $product = Product::where('status', 1)->findOrFail($id);
        $product->update(['status' => 0]);
        return redirect()->route('products.index')->with('success', 'Product deleted successfully.');
    }

    public function getImages($productId)
    {
        $images = ProductImage::where('product_id', $productId)->get(['image']);
        return response()->json($images->pluck('image'));
    }

    public function getVideos($productId)
    {
        $videos = ProductVideo::where('product_id', $productId)->get(['video']);
        return response()->json($videos->pluck('video'));
    }

    private function generateUniqueFilename($extension)
    {
        $datetime = Carbon::now()->format('YmdHis');
        $randomString = Str::random(100);
        return "{$datetime}_{$randomString}.{$extension}";
    }

    private function processImage($file, $path, $filename)
    {
        $image = Image::make($file)
            ->orientate()
            ->encode('webp', 75);

        $fullPath = storage_path('app/public/' . $path . '/' . $filename);
        Storage::disk('public')->put($path . '/' . $filename, (string) $image);

        return $path . '/' . $filename;
    }

    public function getProformaInvoices(Request $request, $productId)
    {
        $perPage = $request->query('perPage', 10);
        $page = $request->query('page', 1);

        $proformaInvoices = Pi::where('tbpi.status', 1)
            ->leftJoin('tbpidetail', 'tbpi.id', '=', 'tbpidetail.pi_id')
            ->leftJoin('tbshipment', 'tbpi.shipment_id', '=', 'tbshipment.id')
            ->leftJoin('tbmethod', 'tbpi.shipping_method', '=', 'tbmethod.id')
            ->where('tbpidetail.product_id', $productId)
            ->select(
                'tbpi.pi_number',
                'tbpi.date',
                'tbshipment.shipment_name as ship_by',
                'tbmethod.name_method as method',
                'tbpi.reciept_number as reference_number',
                'tbpi.tracking_number',
                'tbpi.arrival_date',
                'tbpidetail.cargo_date as delivered_date'
            )
            ->orderBy('tbpi.id', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'proforma_invoices' => $proformaInvoices->items(),
            'pagination' => [
                'total' => $proformaInvoices->total(),
                'perPage' => $proformaInvoices->perPage(),
                'currentPage' => $proformaInvoices->currentPage(),
                'lastPage' => $proformaInvoices->lastPage(),
            ],
        ]);
    }

    public function getPurchaseOrders(Request $request, $productId)
    {
        $perPage = $request->query('perPage', 10);
        $page = $request->query('page', 1);

        $purchaseOrders = PoDetail::where('status', 1)
            ->where('product_id', $productId)
            ->select('date', 'amount', 'remark', 'rating', 'order', 'date_auto_order')
            ->orderBy('id', 'desc') // Sort by id in descending order
            ->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'purchase_orders' => $purchaseOrders->items(),
            'pagination' => [
                'total' => $purchaseOrders->total(),
                'perPage' => $purchaseOrders->perPage(),
                'currentPage' => $purchaseOrders->currentPage(),
                'lastPage' => $purchaseOrders->lastPage(),
            ],
        ]);
    }


}
