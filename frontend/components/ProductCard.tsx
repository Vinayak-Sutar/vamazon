'use client';

/**
 * Amazon-style Product Card (Responsive)
 * =======================================
 * 
 * Responsive design considerations:
 * - Smaller padding on mobile
 * - Text size adjustments
 * - Flexible image sizing
 */

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface ProductCardProps {
    product: Product;
}

// Helper to format price in INR
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
    const hasHalfStar = rating % 1 >= 0.5;

    return (
        <div className="flex items-center gap-1 flex-wrap">
            <div className="flex">
                {[...Array(5)].map((_, i) => (
                    <svg
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${i < fullStars
                            ? 'text-[#de7921]'
                            : i === fullStars && hasHalfStar
                                ? 'text-[#de7921]'
                                : 'text-gray-300'
                            }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
            <span className="text-xs sm:text-sm text-[#007185] hover:text-[#c7511f] cursor-pointer">
                {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
            </span>
        </div>
    );
}

export default function ProductCard({ product }: ProductCardProps) {
    const price = Number(product.price);
    const mrp = product.mrp ? Number(product.mrp) : Math.round(price * 1.3);
    const discount = Math.round((1 - price / mrp) * 100);
    const rating = Number(product.rating) || 4.0;
    const reviewCount = product.review_count || 0;
    const { addToCart } = useCart();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const router = useRouter();
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const handleWishlistClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await toggleWishlist(product.id);
    };

    const isWishlisted = isInWishlist(product.id);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock === 0) return;

        setAdding(true);
        await addToCart(product.id, 1);
        setAdding(false);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (product.stock === 0) return;

        // Store the buy-now product in localStorage
        const buyNowItem = {
            productId: product.id,
            productName: product.name,
            price: price,
            imageUrl: product.image_url,
            quantity: 1,
        };
        localStorage.setItem('buy_now_item', JSON.stringify(buyNowItem));
        router.push('/checkout?mode=buynow');
    };

    return (
        <div className="bg-white rounded-sm shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col h-full group relative">
            {/* Wishlist Heart Icon */}
            <button
                onClick={handleWishlistClick}
                className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-sm transition-transform hover:scale-110"
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
                <svg
                    className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400'}`}
                    fill={isWishlisted ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            </button>

            {/* Product Image */}
            <Link href={`/product/${product.id}`} className="block p-2 sm:p-4 flex-shrink-0">
                <div className="relative aspect-square w-full overflow-hidden bg-white">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-200"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-gray-400 text-xs sm:text-sm">No Image</span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Product Details */}
            <div className="px-2 sm:px-4 pb-2 sm:pb-4 flex flex-col flex-grow">
                {/* Title */}
                <Link href={`/product/${product.id}`}>
                    <h3 className="text-xs sm:text-sm text-[#0f1111] line-clamp-2 hover:text-[#c7511f] cursor-pointer leading-tight mb-1">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="mb-1">
                    <StarRating rating={rating} count={reviewCount} />
                </div>

                {/* Price */}
                <div className="mt-auto">
                    <div className="flex items-baseline gap-0.5 sm:gap-1 flex-wrap">
                        <span className="text-[10px] sm:text-xs">₹</span>
                        <span className="text-base sm:text-xl font-medium text-[#0f1111]">
                            {price.toLocaleString('en-IN')}
                        </span>
                    </div>

                    {/* MRP and Discount */}
                    <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-sm flex-wrap">
                        <span className="text-gray-500">
                            M.R.P: <span className="line-through">{formatPrice(mrp)}</span>
                        </span>
                        <span className="text-[#cc0c39] font-medium">({discount}% off)</span>
                    </div>
                </div>

                {/* Prime Badge - Hidden on very small screens */}
                <div className="hidden sm:flex items-center gap-1 mt-2 text-xs text-gray-600">
                    <span className="text-[#232f3e] font-bold italic">prime</span>
                    <span className="hidden md:inline">FREE Delivery</span>
                </div>

                {/* Stock Status */}
                {product.stock > 0 ? (
                    <p className="text-xs sm:text-sm text-[#007600] mt-1 sm:mt-2">In stock</p>
                ) : (
                    <p className="text-xs sm:text-sm text-[#cc0c39] mt-1 sm:mt-2">Out of stock</p>
                )}

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || adding}
                    className={`mt-2 w-full py-1.5 px-3 rounded-full text-xs sm:text-sm font-medium transition-colors ${added
                        ? 'bg-green-500 text-white'
                        : product.stock === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111]'
                        }`}
                >
                    {adding ? 'Adding...' : added ? '✓ Added' : 'Add to Cart'}
                </button>

                {/* Buy Now Button */}
                <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className={`mt-1.5 w-full py-1.5 px-3 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                        product.stock === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-[#ffa41c] hover:bg-[#ff9500] text-[#0f1111]'
                    }`}
                >
                    Buy Now
                </button>
            </div>
        </div>
    );
}

