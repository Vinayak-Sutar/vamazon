'use client';

/**
 * Cart Context - Global Cart State Management
 * =============================================
 * 
 * REACT CONTEXT EXPLAINED:
 * ------------------------
 * Context allows sharing state across components without prop drilling.
 * 
 * In Flask/Jinja, you might use session:
 *     session['cart'] = cart_data
 * 
 * In React, we use Context:
 *     const { cart, addToCart } = useCart();
 * 
 * This provides:
 * - Cart state accessible from any component
 * - Functions to modify cart (add, update, remove)
 * - Auto-sync with backend API
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Cart, CartItem, Product } from '@/types';

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Generate or get session ID
function getSessionId(): string {
    if (typeof window === 'undefined') return '';

    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
}

// Cart Context Type
interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    error: string | null;
    addToCart: (productId: number, quantity?: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
    resetCart: () => void;  // Reset cart on logout (clears session)
    itemCount: number;
    subtotal: number;
}

// Create Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider Component
export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch cart from API
    const fetchCart = useCallback(async () => {
        const sessionId = getSessionId();
        if (!sessionId) return;

        try {
            const res = await fetch(`${API_URL}/api/cart/${sessionId}`);
            if (res.ok) {
                const data = await res.json();
                setCart(data);
            }
        } catch (err) {
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load cart on mount
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Add item to cart
    const addToCart = async (productId: number, quantity: number = 1) => {
        const sessionId = getSessionId();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/api/cart/${sessionId}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, quantity }),
            });

            if (!res.ok) throw new Error('Failed to add to cart');

            const data = await res.json();
            setCart(data);
        } catch (err) {
            setError('Failed to add item to cart');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Update item quantity
    const updateQuantity = async (itemId: number, quantity: number) => {
        const sessionId = getSessionId();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/cart/${sessionId}/items/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity }),
            });

            if (!res.ok) throw new Error('Failed to update cart');

            const data = await res.json();
            setCart(data);
        } catch (err) {
            setError('Failed to update cart');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Remove item from cart
    const removeItem = async (itemId: number) => {
        const sessionId = getSessionId();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/cart/${sessionId}/items/${itemId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to remove item');

            const data = await res.json();
            setCart(data);
        } catch (err) {
            setError('Failed to remove item');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Clear entire cart
    const clearCart = async () => {
        const sessionId = getSessionId();
        setLoading(true);

        try {
            await fetch(`${API_URL}/api/cart/${sessionId}`, { method: 'DELETE' });
            setCart(null);
        } catch (err) {
            setError('Failed to clear cart');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Reset cart on logout - clears session ID and cart state
    const resetCart = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('cart_session_id');
        }
        setCart(null);
        setError(null);
    }, []);

    // Calculate totals
    const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const subtotal = cart?.items?.reduce((sum, item) => {
        const price = Number(item.product?.price || 0);
        return sum + (price * item.quantity);
    }, 0) || 0;

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                error,
                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
                refreshCart: fetchCart,
                resetCart,
                itemCount,
                subtotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

// Hook to use cart
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
