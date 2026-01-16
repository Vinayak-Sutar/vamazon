'use client';

/**
 * Orders History Page
 * ====================
 * 
 * Lists orders for the logged-in user.
 * Requires authentication - redirects to login if not logged in.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

// Format date
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

interface Product {
    id: number;
    name: string;
    image_url?: string;
    price: number;
}

interface OrderItem {
    id: number;
    product_id: number;
    quantity: number;
    price_at_purchase: number;
    product?: Product;
}

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    items: OrderItem[];
}

export default function OrdersPage() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/orders');
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch orders when authenticated
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchOrders = async () => {
            const token = getToken();
            if (!token) return;

            try {
                const res = await fetch(`${API_URL}/api/orders/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                } else {
                    setError('Failed to load orders');
                }
            } catch {
                setError('Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated]);

    if (authLoading || loading) {
        return (
            <div className="max-w-[1000px] mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="space-y-4">
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-[1000px] mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1000px] mx-auto px-2 sm:px-4 py-4 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-normal text-[#0f1111] mb-6">
                Your Orders
            </h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h2 className="text-xl font-medium text-[#0f1111] mb-2">No orders yet</h2>
                    <p className="text-gray-600 mb-4">When you place orders, they will appear here.</p>
                    <Link
                        href="/"
                        className="inline-block bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] px-6 py-2 rounded-full font-medium"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white rounded-lg overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-4 sm:px-6 py-3 flex flex-wrap gap-4 sm:gap-8 text-sm border-b">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase">Order Placed</p>
                                    <p className="font-medium text-[#0f1111]">{formatDate(order.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs uppercase">Total</p>
                                    <p className="font-medium text-[#0f1111]">{formatPrice(order.total_amount)}</p>
                                </div>
                                <div className="flex-1 text-right">
                                    <p className="text-gray-500 text-xs uppercase">Order #</p>
                                    <Link
                                        href={`/order/${order.order_number}`}
                                        className="font-medium text-[#007185] hover:text-[#c7511f] hover:underline"
                                    >
                                        {order.order_number}
                                    </Link>
                                </div>
                            </div>

                            {/* Order Content */}
                            <div className="px-4 sm:px-6 py-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${order.status === 'confirmed'
                                            ? 'bg-green-100 text-green-800'
                                            : order.status === 'delivered'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/order/${order.order_number}`}
                                        className="text-sm text-[#007185] hover:text-[#c7511f] hover:underline"
                                    >
                                        View Order Details
                                    </Link>
                                </div>

                                {/* Items preview */}
                                <div className="space-y-3">
                                    {order.items.slice(0, 3).map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            {item.product?.image_url && (
                                                <img
                                                    src={item.product.image_url}
                                                    alt={item.product?.name || 'Product'}
                                                    className="w-12 h-12 object-contain rounded"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-[#0f1111] truncate">
                                                    {item.product?.name || 'Product'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Qty: {item.quantity} × {formatPrice(Number(item.price_at_purchase))}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <p className="text-sm text-gray-500">
                                            + {order.items.length - 3} more item(s)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
