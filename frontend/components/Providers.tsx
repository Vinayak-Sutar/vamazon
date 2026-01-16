'use client';

/**
 * Client Providers Wrapper
 * =========================
 * 
 * Wraps the app with client-side providers.
 * This is needed because layout.tsx is a Server Component,
 * but AuthProvider and CartProvider use hooks (client-only).
 */

import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    {children}
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
}

