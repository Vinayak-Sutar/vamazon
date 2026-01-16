'use client';

/**
 * Shopping Cart Page
 * ===================
 * 
 * Amazon-style cart page with:
 * - Product images and details
 * - Quantity selectors
 * - Remove item buttons
 * - Cart subtotal
 * - Proceed to checkout button
 */

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

// Format price in INR
function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
}

export default function CartPage() {
    const { cart, loading, updateQuantity, removeItem, itemCount, subtotal } = useCart();

    if (loading && !cart) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="h-32 bg-gray-200 rounded mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded mb-4"></div>
                </div>
            </div>
        );
    }

    const items = cart?.items || [];

    return (
        <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-4 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-normal text-[#0f1111] mb-4 sm:mb-6">
                Shopping Cart
            </h1>

            {items.length === 0 ? (
                // Empty Cart
                <div className="bg-white rounded-lg p-6 sm:p-10 text-center">
                    <div className="max-w-md mx-auto">
                        <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h2 className="text-xl font-medium text-[#0f1111] mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
                        <Link
                            href="/"
                            className="inline-block bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] px-6 py-2 rounded-full font-medium"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            ) : (
                // Cart with items
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
                    {/* Cart Items */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-lg p-4 sm:p-6">
                            <div className="border-b pb-2 mb-4 hidden sm:flex justify-between text-sm text-gray-500">
                                <span>Product</span>
                                <span>Price</span>
                            </div>

                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col sm:flex-row gap-4 py-4 border-b last:border-b-0"
                                >
                                    {/* Product Image */}
                                    <Link
                                        href={`/product/${item.product_id}`}
                                        className="w-full sm:w-32 h-32 flex-shrink-0 bg-white rounded overflow-hidden"
                                    >
                                        {item.product?.image_url ? (
                                            <Image
                                                src={item.product.image_url}
                                                alt={item.product.name || 'Product'}
                                                width={128}
                                                height={128}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-400">No image</span>
                                            </div>
                                        )}
                                    </Link>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/product/${item.product_id}`}>
                                            <h3 className="text-base sm:text-lg text-[#007185] hover:text-[#c7511f] hover:underline line-clamp-2">
                                                {item.product?.name || 'Unknown Product'}
                                            </h3>
                                        </Link>

                                        <p className="text-sm text-[#007600] mt-1">In Stock</p>

                                        {/* Quantity and Actions */}
                                        <div className="flex items-center gap-4 mt-3 flex-wrap">
                                            {/* Quantity Selector */}
                                            <div className="flex items-center border rounded">
                                                {item.quantity === 1 ? (
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="px-3 py-1 hover:bg-red-50 text-red-500 hover:text-red-600"
                                                        title="Remove item"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="px-3 py-1 hover:bg-gray-100"
                                                    >
                                                        −
                                                    </button>
                                                )}
                                                <span className="px-3 py-1 border-x min-w-[40px] text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-3 py-1 hover:bg-gray-100"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <span className="text-gray-300">|</span>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-[#007185] hover:text-[#c7511f] hover:underline text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-lg font-medium text-[#0f1111]">
                                            {formatPrice(Number(item.product?.price || 0))}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* Subtotal at bottom of items */}
                            <div className="text-right pt-4">
                                <span className="text-lg">
                                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):{' '}
                                    <span className="font-bold">{formatPrice(subtotal)}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-lg p-4 sm:p-6 sticky top-24">
                            <h2 className="text-lg font-medium text-[#0f1111] mb-4">Order Summary</h2>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Items ({itemCount}):</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span className="text-[#007600]">FREE</span>
                                </div>
                            </div>

                            <div className="border-t mt-4 pt-4">
                                <div className="flex justify-between text-lg font-bold text-[#0f1111]">
                                    <span>Order Total:</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full text-center py-3 px-4 rounded-full bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-medium mt-6"
                            >
                                Proceed to Checkout
                            </Link>

                            <Link
                                href="/"
                                className="block text-center text-[#007185] hover:text-[#c7511f] hover:underline text-sm mt-4"
                            >
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
