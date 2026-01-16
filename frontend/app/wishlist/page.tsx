'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, getToken } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface WishlistItem {
    id: number;
    product_id: number;
    product: Product;
}

export default function WishlistPage() {
    const router = useRouter();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const { wishlistIds, loading: wishlistLoading } = useWishlist();
    const [fetchedItems, setFetchedItems] = useState<WishlistItem[]>([]);
    const [fetching, setFetching] = useState(true);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/wishlist');
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch full wishlist details
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchWishlistDetails = async () => {
            const token = getToken();
            if (!token) return;

            try {
                const res = await fetch(`${API_URL}/api/wishlist/`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (res.ok) {
                    const data = await res.json();
                    setFetchedItems(data);
                }
            } catch (error) {
                console.error('Failed to fetch wishlist', error);
            } finally {
                setFetching(false);
            }
        };

        fetchWishlistDetails();
    }, [isAuthenticated]);

    // Filter items to show only what's currently in wishlist (handles removal updates)
    // We check if the product ID is in the wishlistIds array from context
    // This allows instant UI updates when removing items via the heart icon
    const displayItems = fetchedItems.filter(item =>
        wishlistIds.includes(item.product.id)
    );

    if (authLoading || (fetching && isAuthenticated) || (wishlistLoading && isAuthenticated)) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#febd69]"></div>
            </div>
        );
    }

    if (displayItems.length === 0) {
        return (
            <div className="max-w-[1200px] mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold mb-6 text-[#0f1111]">Your Wishlist</h1>
                <div className="bg-white p-8 rounded-lg shadow-sm">
                    <p className="text-gray-600 mb-6 text-lg">Your wishlist is currently empty.</p>
                    <Link
                        href="/"
                        className="inline-block bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] px-6 py-2.5 rounded-full font-medium transition-colors"
                    >
                        Explore Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-[#0f1111]">Your Wishlist</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {displayItems.map((item) => (
                    <div key={item.id} className="h-full">
                        <ProductCard product={item.product} />
                    </div>
                ))}
            </div>
        </div>
    );
}
