'use client';

/**
 * Checkout Page
 * ==============
 * 
 * Amazon-style checkout with:
 * - Order summary on the right
 * - Shipping address form on the left
 * - Place Order button
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth, getToken } from '@/context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Format price
function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(price);
}

// Get session ID
function getSessionId(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('cart_session_id') || '';
}

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { cart, itemCount, subtotal, clearCart } = useCart();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if this is a Buy Now checkout
    const isBuyNow = searchParams.get('mode') === 'buynow';
    const [buyNowItem, setBuyNowItem] = useState<{
        productId: number;
        productName: string;
        price: number;
        imageUrl?: string;
        quantity: number;
    } | null>(null);

    // Load buy-now item from localStorage
    useEffect(() => {
        if (isBuyNow) {
            const stored = localStorage.getItem('buy_now_item');
            if (stored) {
                setBuyNowItem(JSON.parse(stored));
            }
        }
    }, [isBuyNow]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            const redirectUrl = isBuyNow ? '/checkout?mode=buynow' : '/checkout';
            router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
        }
    }, [authLoading, isAuthenticated, router, isBuyNow]);

    // Form state
    const [form, setForm] = useState({
        customer_name: '',
        email: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const token = getToken();
        if (!token) {
            router.push('/login?redirect=/checkout');
            return;
        }

        try {
            // For Buy Now, we need to create order directly with the product
            if (isBuyNow && buyNowItem) {
                const res = await fetch(`${API_URL}/api/orders/buy-now`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        product_id: buyNowItem.productId,
                        quantity: buyNowItem.quantity,
                        ...form,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Failed to place order');
                }

                const order = await res.json();
                localStorage.removeItem('buy_now_item');
                router.push(`/order/${order.order_number}`);
            } else {
                // Regular cart checkout
                const res = await fetch(`${API_URL}/api/orders/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        session_id: getSessionId(),
                        ...form,
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.detail || 'Failed to place order');
                }

                const order = await res.json();
                await clearCart();
                router.push(`/order/${order.order_number}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to place order');
            setLoading(false);
        }
    };

    // Determine what items to show
    const displayItems = isBuyNow && buyNowItem
        ? [{ id: 1, quantity: buyNowItem.quantity, product: { name: buyNowItem.productName, price: buyNowItem.price, image_url: buyNowItem.imageUrl } }]
        : cart?.items || [];

    const displayTotal = isBuyNow && buyNowItem
        ? buyNowItem.price * buyNowItem.quantity
        : subtotal;

    const displayCount = isBuyNow && buyNowItem ? 1 : itemCount;

    if (displayItems.length === 0) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-medium mb-4">Your cart is empty</h1>
                <Link href="/" className="text-[#007185] hover:underline">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-2 sm:px-4 py-4 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-normal text-[#0f1111] mb-6">
                Checkout
            </h1>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Shipping Form */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-lg p-4 sm:p-6">
                            <h2 className="text-lg font-bold text-[#0f1111] mb-4 pb-2 border-b">
                                1. Shipping Address
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Full Name *</label>
                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={form.customer_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#febd69]"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#febd69]"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone *</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#febd69]"
                                        placeholder="+91 9876543210"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Address Line 1 *</label>
                                    <input
                                        type="text"
                                        name="address_line1"
                                        value={form.address_line1}
                                        onChange={handleChange}
                                        required
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#febd69]"
                                        placeholder="House No, Street Name"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Address Line 2</label>
                                    <input
                                        type="text"
                                        name="address_line2"
                                        value={form.address_line2}
                                        onChange={handleChange}
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#febd69]"
                                        placeholder="Landmark, Area"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        required
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#febd69]"
                                        placeholder="Mumbai"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">State *</label>
                                    <select
                                        name="state"
                                        value={form.state}
                                        onChange={handleChange}
                                        required
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#febd69]"
                                    >
                                        <option value="">Select State</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Karnataka">Karnataka</option>
                                        <option value="Tamil Nadu">Tamil Nadu</option>
                                        <option value="Gujarat">Gujarat</option>
                                        <option value="Rajasthan">Rajasthan</option>
                                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                                        <option value="West Bengal">West Bengal</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">PIN Code *</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={form.pincode}
                                        onChange={handleChange}
                                        required
                                        pattern="[0-9]{6}"
                                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#febd69]"
                                        placeholder="400001"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Order Items Review */}
                        <div className="bg-white rounded-lg p-4 sm:p-6">
                            <h2 className="text-lg font-bold text-[#0f1111] mb-4 pb-2 border-b">
                                2. Review Items
                            </h2>

                            <div className="space-y-4">
                                {displayItems.map((item: any) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 flex-shrink-0">
                                            {item.product?.image_url && (
                                                <Image
                                                    src={item.product.image_url}
                                                    alt={item.product.name || ''}
                                                    width={64}
                                                    height={64}
                                                    className="object-contain"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm line-clamp-2">{item.product?.name}</p>
                                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{formatPrice(Number(item.product?.price || 0) * item.quantity)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-white rounded-lg p-4 sm:p-6 sticky top-24">
                            <h2 className="text-lg font-bold text-[#0f1111] mb-4">Order Summary</h2>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Items ({displayCount}):</span>
                                    <span>{formatPrice(displayTotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span className="text-[#007600]">FREE</span>
                                </div>
                            </div>

                            <div className="border-t mt-4 pt-4">
                                <div className="flex justify-between text-lg font-bold text-[#c7511f]">
                                    <span>Order Total:</span>
                                    <span>{formatPrice(displayTotal)}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 rounded-full bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-medium mt-6 disabled:opacity-50"
                            >
                                {loading ? 'Placing Order...' : 'Place Your Order'}
                            </button>

                            <p className="text-xs text-gray-500 mt-4 text-center">
                                By placing your order, you agree to Vamazon&apos;s terms and conditions.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
