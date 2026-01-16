/**
 * Order Confirmation Page
 * ========================
 * 
 * Shows order details after successful checkout.
 * Displays order number, items, shipping address, and total.
 */

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fetch order
async function getOrder(orderNumber: string) {
    try {
        const res = await fetch(`${API_URL}/api/orders/${orderNumber}`, {
            cache: 'no-store',
        });

        if (!res.ok) return null;
        return res.json();
    } catch {
        return null;
    }
}

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
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default async function OrderConfirmationPage({
    params,
}: {
    params: Promise<{ orderNumber: string }>;
}) {
    const { orderNumber } = await params;
    const order = await getOrder(orderNumber);

    if (!order) {
        notFound();
    }

    return (
        <div className="max-w-[900px] mx-auto px-2 sm:px-4 py-6 sm:py-10">
            {/* Success Message */}
            <div className="bg-white rounded-lg p-6 sm:p-8 text-center mb-6">
                <div className="w-16 h-16 mx-auto bg-[#067D62] rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-2xl sm:text-3xl font-medium text-[#0f1111] mb-2">
                    Order Placed Successfully!
                </h1>
                <p className="text-gray-600 mb-4">
                    Thank you for your order. We&apos;ll send you shipping confirmation soon.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 inline-block">
                    <p className="text-sm text-gray-600">Order Number</p>
                    <p className="text-xl font-bold text-[#0f1111]">{order.order_number}</p>
                </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-lg p-6 sm:p-8">
                <h2 className="text-lg font-bold text-[#0f1111] mb-4 pb-2 border-b">
                    Order Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    {/* Shipping Address */}
                    <div>
                        <h3 className="font-medium text-[#0f1111] mb-2">Shipping Address</h3>
                        <div className="text-sm text-gray-600">
                            <p className="font-medium">{order.customer_name}</p>
                            <p>{order.address_line1}</p>
                            {order.address_line2 && <p>{order.address_line2}</p>}
                            <p>{order.city}, {order.state} - {order.pincode}</p>
                            {order.phone && <p className="mt-2">Phone: {order.phone}</p>}
                        </div>
                    </div>

                    {/* Order Info */}
                    <div>
                        <h3 className="font-medium text-[#0f1111] mb-2">Order Information</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p>Order Date: {formatDate(order.created_at)}</p>
                            <p>Status: <span className="text-[#007600] font-medium capitalize">{order.status}</span></p>
                            <p>Payment: Cash on Delivery</p>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <h3 className="font-medium text-[#0f1111] mb-3 pt-4 border-t">Items Ordered</h3>
                <div className="space-y-4">
                    {order.items?.map((item: { id: number; product?: { name: string; image_url?: string }; quantity: number; price_at_purchase: number }) => (
                        <div key={item.id} className="flex gap-4 items-start">
                            {/* Product Image */}
                            <div className="w-16 h-16 flex-shrink-0 bg-white border rounded overflow-hidden">
                                {item.product?.image_url ? (
                                    <Image
                                        src={item.product.image_url}
                                        alt={item.product.name || 'Product'}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <span className="text-gray-400 text-xs">No image</span>
                                    </div>
                                )}
                            </div>
                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-[#0f1111] line-clamp-2">{item.product?.name || 'Unknown Product'}</p>
                                <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                            </div>
                            {/* Price */}
                            <p className="font-medium text-sm">{formatPrice(item.price_at_purchase * item.quantity)}</p>
                        </div>
                    ))}
                </div>

                {/* Total */}
                <div className="border-t mt-4 pt-4">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Order Total:</span>
                        <span className="text-[#c7511f]">{formatPrice(order.total_amount)}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <Link
                    href="/"
                    className="flex-1 text-center py-3 px-6 rounded-full bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-medium"
                >
                    Continue Shopping
                </Link>
                <Link
                    href="/orders"
                    className="flex-1 text-center py-3 px-6 rounded-full border border-gray-300 hover:bg-gray-50 text-[#0f1111] font-medium"
                >
                    View All Orders
                </Link>
            </div>
        </div>
    );
}
