'use client';

/**
 * Wishlist Context
 * =================
 * 
 * Manages wishlist state globally.
 * Provides functions to add/remove items from wishlist.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, getToken } from './AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface WishlistContextType {
    wishlistIds: number[];  // Array of product IDs in wishlist
    loading: boolean;
    isInWishlist: (productId: number) => boolean;
    addToWishlist: (productId: number) => Promise<void>;
    removeFromWishlist: (productId: number) => Promise<void>;
    toggleWishlist: (productId: number) => Promise<void>;
    refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlistIds, setWishlistIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    // Fetch wishlist product IDs when authenticated
    const refreshWishlist = useCallback(async () => {
        if (!isAuthenticated) {
            setWishlistIds([]);
            return;
        }

        const token = getToken();
        if (!token) return;

        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/api/wishlist/ids`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (res.ok) {
                const data = await res.json();
                setWishlistIds(data.product_ids || []);
            }
        } catch (error) {
            console.error('Failed to fetch wishlist:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    // Fetch wishlist on auth state change
    useEffect(() => {
        refreshWishlist();
    }, [refreshWishlist]);

    // Check if product is in wishlist
    const isInWishlist = useCallback((productId: number) => {
        return wishlistIds.includes(productId);
    }, [wishlistIds]);

    // Add product to wishlist
    const addToWishlist = useCallback(async (productId: number) => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/api/wishlist/add/${productId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (res.ok) {
                setWishlistIds(prev => [...prev, productId]);
            }
        } catch (error) {
            console.error('Failed to add to wishlist:', error);
        }
    }, []);

    // Remove product from wishlist
    const removeFromWishlist = useCallback(async (productId: number) => {
        const token = getToken();
        if (!token) return;

        try {
            const res = await fetch(`${API_URL}/api/wishlist/remove/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });

            if (res.ok) {
                setWishlistIds(prev => prev.filter(id => id !== productId));
            }
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        }
    }, []);

    // Toggle wishlist status
    const toggleWishlist = useCallback(async (productId: number) => {
        if (isInWishlist(productId)) {
            await removeFromWishlist(productId);
        } else {
            await addToWishlist(productId);
        }
    }, [isInWishlist, addToWishlist, removeFromWishlist]);

    return (
        <WishlistContext.Provider value={{
            wishlistIds,
            loading,
            isInWishlist,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            refreshWishlist,
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
