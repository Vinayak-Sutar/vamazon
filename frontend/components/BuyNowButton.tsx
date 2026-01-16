'use client';

/**
 * Buy Now Button Component
 * ========================
 * 
 * Handles "Buy Now" flow - direct checkout for single product.
 * Stores product info in localStorage and redirects to checkout.
 */

import { useRouter } from 'next/navigation';

interface BuyNowButtonProps {
    productId: number;
    productName: string;
    price: number;
    imageUrl?: string;
    disabled?: boolean;
}

export default function BuyNowButton({
    productId,
    productName,
    price,
    imageUrl,
    disabled = false
}: BuyNowButtonProps) {
    const router = useRouter();

    const handleBuyNow = () => {
        // Store the buy-now product in localStorage
        const buyNowItem = {
            productId,
            productName,
            price,
            imageUrl,
            quantity: 1,
        };

        localStorage.setItem('buy_now_item', JSON.stringify(buyNowItem));

        // Always redirect to checkout with buynow mode - auth check happens there
        router.push('/checkout?mode=buynow');
    };

    return (
        <button
            onClick={handleBuyNow}
            disabled={disabled}
            className="block w-full text-center py-2 px-4 rounded-full bg-[#ffa41c] hover:bg-[#ff9500] text-sm font-medium text-[#0f1111] disabled:opacity-50 disabled:cursor-not-allowed"
        >
            Buy Now
        </button>
    );
}
