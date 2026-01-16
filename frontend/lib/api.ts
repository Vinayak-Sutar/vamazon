/**
 * API Client for FastAPI Backend
 * ================================
 * 
 * This file handles all API calls to our FastAPI backend.
 * 
 * NEXT.JS API CALLS vs REACT:
 * ---------------------------
 * In plain React, you might use axios or fetch in useEffect:
 * 
 *     useEffect(() => {
 *         fetch('/api/products')
 *             .then(res => res.json())
 *             .then(data => setProducts(data));
 *     }, []);
 * 
 * In Next.js, you can:
 * 1. Fetch on the server (Server Components) - faster, no loading states
 * 2. Fetch on the client (Client Components) - for interactivity
 * 
 * We'll use both depending on the use case.
 */

import { Product, ProductListResponse, Category, Cart, Order } from '@/types';

// Backend API URL - will be different in production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// ==================
// Product APIs
// ==================

interface GetProductsParams {
    search?: string;
    category?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    per_page?: number;
}

export async function getProducts(params: GetProductsParams = {}): Promise<ProductListResponse> {
    const searchParams = new URLSearchParams();

    if (params.search) searchParams.set('search', params.search);
    if (params.category) searchParams.set('category', params.category);
    if (params.min_price !== undefined) searchParams.set('min_price', String(params.min_price));
    if (params.max_price !== undefined) searchParams.set('max_price', String(params.max_price));
    if (params.page !== undefined) searchParams.set('page', String(params.page));
    if (params.per_page !== undefined) searchParams.set('per_page', String(params.per_page));

    const query = searchParams.toString();
    const endpoint = `/api/products/${query ? `?${query}` : ''}`;

    return fetchAPI<ProductListResponse>(endpoint);
}

export async function getProduct(productId: number): Promise<Product> {
    return fetchAPI<Product>(`/api/products/${productId}`);
}

export async function getProductByAsin(asin: string): Promise<Product> {
    return fetchAPI<Product>(`/api/products/by-asin/${asin}`);
}

// ==================
// Category APIs
// ==================

export async function getCategories(): Promise<Category[]> {
    return fetchAPI<Category[]>('/api/categories/');
}

export async function getCategory(slug: string): Promise<Category> {
    return fetchAPI<Category>(`/api/categories/${slug}`);
}

// ==================
// Cart APIs (to be implemented in backend)
// ==================

export async function getCart(sessionId: string): Promise<Cart> {
    return fetchAPI<Cart>(`/api/cart/${sessionId}`);
}

export async function addToCart(sessionId: string, productId: number, quantity: number = 1): Promise<Cart> {
    return fetchAPI<Cart>(`/api/cart/${sessionId}/items`, {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, quantity }),
    });
}

export async function updateCartItem(sessionId: string, itemId: number, quantity: number): Promise<Cart> {
    return fetchAPI<Cart>(`/api/cart/${sessionId}/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
    });
}

export async function removeFromCart(sessionId: string, itemId: number): Promise<void> {
    return fetchAPI<void>(`/api/cart/${sessionId}/items/${itemId}`, {
        method: 'DELETE',
    });
}

// ==================
// Order APIs (to be implemented in backend)
// ==================

interface CreateOrderParams {
    session_id: string;
    customer_name: string;
    email?: string;
    phone?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
}

export async function createOrder(params: CreateOrderParams): Promise<Order> {
    return fetchAPI<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(params),
    });
}

export async function getOrder(orderNumber: string): Promise<Order> {
    return fetchAPI<Order>(`/api/orders/${orderNumber}`);
}
