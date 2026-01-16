/**
 * Product Detail Page
 * ====================
 * 
 * DYNAMIC ROUTES IN NEXT.JS:
 * --------------------------
 * In React Router, you'd write:
 *     <Route path="/product/:id" element={<ProductDetail />} />
 *     // Access via useParams()
 * 
 * In Next.js App Router:
 *     Create folder: app/product/[id]/page.tsx
 *     The [id] folder name creates a dynamic segment
 *     Access via params prop
 * 
 * This page fetches product data server-side for SEO.
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImageGallery from '@/components/ImageGallery';
import AddToCartButton from '@/components/AddToCartButton';
import BuyNowButton from '@/components/BuyNowButton';
import { Product } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fetch single product
async function getProduct(id: string): Promise<Product | null> {
    try {
        const res = await fetch(`${API_URL}/api/products/${id}`, {
            cache: 'no-store',
        });

        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return { title: 'Product Not Found' };
    }

    return {
        title: product.name,
        description: product.description?.slice(0, 160) || 'Shop this product on Vamazon',
    };
}

// Helper functions
function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
}

// Star Rating Component
function StarRating({ rating, count }: { rating: number; count: number }) {
    const fullStars = Math.floor(rating);

    return (
        <div className="flex items-center gap-2">
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`w-5 h-5 ${i < fullStars ? 'text-[#de7921]' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            <span className="text-sm text-[#007185] hover:text-[#c7511f] cursor-pointer">
                {rating} ({count.toLocaleString()} ratings)
            </span>
        </div>
    );
}

export default async function ProductDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const price = Number(product.price);
    const mrp = product.mrp ? Number(product.mrp) : Math.round(price * 1.3);
    const discount = Math.round((1 - price / mrp) * 100);
    const rating = Number(product.rating) || 4.0;
    const reviewCount = product.review_count || 0;

    // Get images - combine main image_url with additional images from images array
    const allImages: string[] = [];
    
    // Add main image first if exists
    if (product.image_url) {
        allImages.push(product.image_url);
    }
    
    // Add additional images from images relationship (avoiding duplicates)
    if (product.images && product.images.length > 0) {
        product.images.forEach(img => {
            if (img.image_url && !allImages.includes(img.image_url)) {
                allImages.push(img.image_url);
            }
        });
    }

    return (
        <div className="bg-white min-h-screen">
            <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-4">
            {/* Breadcrumb */}
            <nav className="text-xs sm:text-sm text-gray-600 mb-4">
                <Link href="/" className="hover:text-[#c7511f] hover:underline">
                    Home
                </Link>
                <span className="mx-2">›</span>
                {product.category && (
                    <>
                        <Link
                            href={`/?category=${product.category.slug}`}
                            className="hover:text-[#c7511f] hover:underline"
                        >
                            {product.category.name}
                        </Link>
                        <span className="mx-2">›</span>
                    </>
                )}
                <span className="text-gray-400 truncate">{product.name.slice(0, 50)}...</span>
            </nav>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
                {/* Left Column - Images */}
                <div className="lg:col-span-5">
                    <ImageGallery images={allImages} productName={product.name} />
                </div>

                {/* Middle Column - Product Info */}
                <div className="lg:col-span-4">
                    {/* Title */}
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-medium text-[#0f1111] mb-2">
                        {product.name}
                    </h1>

                    {/* Rating */}
                    <div className="mb-3">
                        <StarRating rating={rating} count={reviewCount} />
                    </div>

                    {/* Price Section */}
                    <div className="border-b border-gray-200 pb-4 mb-4">
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-[#cc0c39] text-sm">-{discount}%</span>
                            <span className="text-2xl sm:text-3xl font-medium">
                                {formatPrice(price)}
                            </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                            M.R.P.: <span className="line-through">{formatPrice(mrp)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                    </div>

                    {/* Features/About */}
                    {product.features && (
                        <div className="mb-4">
                            <h2 className="font-bold text-base mb-2">About this item</h2>
                            <div className="text-sm text-gray-700 whitespace-pre-line">
                                {product.features}
                            </div>
                        </div>
                    )}

                    {/* Specifications */}
                    {product.specifications && (
                        <div className="mb-4">
                            <h2 className="font-bold text-base mb-2">Technical Details</h2>
                            <div className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">
                                {product.specifications}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Buy Box */}
                <div className="lg:col-span-3">
                    <div className="border border-gray-300 rounded-lg p-4 sticky top-24">
                        {/* Price */}
                        <div className="text-2xl font-medium mb-2">
                            {formatPrice(price)}
                        </div>

                        {/* Delivery Info */}
                        <div className="text-sm mb-3">
                            <span className="text-[#007600]">FREE delivery</span>
                            <span className="font-bold ml-1">Tomorrow</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Or fastest delivery <span className="font-bold">Today</span>
                        </p>

                        {/* Stock Status */}
                        {product.stock > 0 ? (
                            <p className="text-lg text-[#007600] mb-4">In Stock</p>
                        ) : (
                            <p className="text-lg text-[#cc0c39] mb-4">Out of Stock</p>
                        )}

                        {/* Quantity Selector */}
                        <div className="mb-4">
                            <label className="text-sm">Qty:</label>
                            <select className="ml-2 border rounded px-2 py-1 text-sm">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>

                        {/* Add to Cart Button */}
                        <AddToCartButton productId={product.id} disabled={product.stock === 0} />

                        {/* Buy Now Button */}
                        <div className="mt-2">
                            <BuyNowButton
                                productId={product.id}
                                productName={product.name}
                                price={price}
                                imageUrl={product.image_url || undefined}
                                disabled={product.stock === 0}
                            />
                        </div>

                        {/* Secure Transaction */}
                        <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span>Secure transaction</span>
                        </div>

                        {/* Seller Info */}
                        <div className="mt-4 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Sold by</span>
                                <span className="text-[#007185]">Vamazon Store</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}
