'use client';

/**
 * Add to Cart Button Component
 * =============================
 * 
 * Amazon-style yellow "Add to Cart" button.
 * Uses CartContext to add items to the cart.
 */

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

interface AddToCartButtonProps {
    productId: number;
    disabled?: boolean;
}

export default function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
    const { addToCart } = useCart();
    const [isAdding, setIsAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const handleAddToCart = async () => {
        if (disabled || isAdding) return;

        setIsAdding(true);

        try {
            await addToCart(productId, 1);
            setAdded(true);
            // Reset after 2 seconds
            setTimeout(() => setAdded(false), 2000);
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={disabled || isAdding}
            className={`w-full py-2 px-4 rounded-full text-sm font-medium transition-colors ${disabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : added
                        ? 'bg-[#067D62] text-white'
                        : 'bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111]'
                }`}
        >
            {isAdding ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                </span>
            ) : added ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Added to Cart
                </span>
            ) : (
                'Add to Cart'
            )}
        </button>
    );
}
