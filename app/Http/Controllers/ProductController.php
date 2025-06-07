<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVideo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->query('perPage', 25);
        $page = $request->query('page', 1);
        $search = $request->query('search');

        $query = Product::query()->where('status', 1); // Only get products with status = 1

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
            'darkMode' => true, // Adjust based on your dark mode logic
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_code' => [
                'nullable',
                'string',
                'max:100',
                // Ensure product_code is unique for products with status = 1
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
            $filename = $this->generateUniqueFilename($file->getClientOriginalExtension());
            $path = $file->storeAs('uploads/images', $filename, 'public');
            $product->image = 'uploads/images/' . $filename;
        }

        $product->save();

        if ($request->hasFile('thumbnails')) {
            foreach ($request->file('thumbnails') as $thumbnail) {
                $filename = $this->generateUniqueFilename($thumbnail->getClientOriginalExtension());
                $path = $thumbnail->storeAs('uploads/promotions', $filename, 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => 'uploads/promotions/' . $filename,
                ]);
            }
        }

        if ($request->hasFile('videos')) {
            foreach ($request->file('videos') as $video) {
                $filename = $this->generateUniqueFilename($video->getClientOriginalExtension());
                $path = $video->storeAs('uploads/videos', $filename, 'public');
                ProductVideo::create([
                    'product_id' => $product->id,
                    'video' => 'uploads/videos/' . $filename,
                ]);
            }
        }

        return redirect()->route('products.index')->with('success', 'Product created successfully.');
    }

    public function show($id)
    {
        $product = Product::with(['images', 'videos'])->where('status', 1)->findOrFail($id); // Only show if status = 1
        return response()->json($product);
    }

    public function update(Request $request, $id)
    {
        $product = Product::where('status', 1)->findOrFail($id); // Only update if status = 1

        $validated = $request->validate([
            'product_code' => [
                'nullable',
                'string',
                'max:100',
                // Ensure product_code is unique for products with status = 1, excluding current product
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
            'existing_thumbnails.*' => 'nullable|string',
            'existing_videos.*' => 'nullable|string',
        ]);

        // Update product fields
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
            // Delete old image if exists
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $file = $request->file('default_image');
            $filename = $this->generateUniqueFilename($file->getClientOriginalExtension());
            $path = $file->storeAs('uploads/images', $filename, 'public');
            $product->image = 'uploads/images/' . $filename;
            $product->save();
        } elseif ($request->input('existing_default_image')) {
            $product->image = $request->input('existing_default_image');
            $product->save();
        } elseif (!$request->hasFile('default_image') && !$request->input('existing_default_image')) {
            // If no new image and no existing image is provided, remove the default image
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
                $product->image = null;
                $product->save();
            }
        }

        // Handle thumbnails
        $existingThumbnails = $request->input('existing_thumbnails', []);
        // Delete thumbnails not included in existing_thumbnails
        ProductImage::where('product_id', $product->id)
            ->whereNotIn('image', $existingThumbnails)
            ->each(function ($image) {
                Storage::disk('public')->delete($image->image);
                $image->delete();
            });

        if ($request->hasFile('thumbnails')) {
            foreach ($request->file('thumbnails') as $thumbnail) {
                $filename = $this->generateUniqueFilename($thumbnail->getClientOriginalExtension());
                $path = $thumbnail->storeAs('uploads/promotions', $filename, 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image' => 'uploads/promotions/' . $filename,
                ]);
            }
        }

        // Handle videos
        $existingVideos = $request->input('existing_videos', []);
        // Delete videos not included in existing_videos
        ProductVideo::where('product_id', $product->id)
            ->whereNotIn('video', $existingVideos)
            ->each(function ($video) {
                Storage::disk('public')->delete($video->video);
                $video->delete();
            });

        if ($request->hasFile('videos')) {
            foreach ($request->file('videos') as $video) {
                $filename = $this->generateUniqueFilename($video->getClientOriginalExtension());
                $path = $video->storeAs('uploads/videos', $filename, 'public');
                ProductVideo::create([
                    'product_id' => $product->id,
                    'video' => 'uploads/videos/' . $filename,
                ]);
            }
        }

        return redirect()->route('products.index')->with('success', 'Product updated successfully.');
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
        $product = Product::where('status', 1)->findOrFail($id); // Only "delete" if status = 1

        // Update status to 0 instead of deleting
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
}
