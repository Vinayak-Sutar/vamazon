/**
 * Home Page - Product Listing
 * ============================
 * 
 * SERVER COMPONENTS VS CLIENT COMPONENTS:
 * ---------------------------------------
 * This page is a Server Component by default (no 'use client').
 * 
 * Benefits of Server Components:
 * 1. Data fetching happens on the server (faster)
 * 2. No loading spinners needed
 * 3. Better SEO (fully rendered HTML)
 * 4. Smaller JavaScript bundle
 * 
 * We use Server Components for data fetching, and Client Components
 * for interactive parts (like the search, filters).
 */

import { Suspense } from 'react';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Product, Category, ProductListResponse } from '@/types';

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Fetch products from API (server-side)
async function getProducts(searchParams: {
  search?: string;
  category?: string;
  page?: string;
}): Promise<ProductListResponse> {
  const params = new URLSearchParams();
  if (searchParams.search) params.set('search', searchParams.search);
  if (searchParams.category) params.set('category', searchParams.category);
  if (searchParams.page) params.set('page', searchParams.page);
  params.set('per_page', '12');

  const res = await fetch(`${API_URL}/api/products/?${params.toString()}`, {
    cache: 'no-store', // Always fetch fresh data
  });

  if (!res.ok) {
    throw new Error('Failed to fetch products');
  }

  return res.json();
}

// Fetch categories
async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/api/categories/`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

// Props type for Next.js 13+ pages with searchParams
interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // Await searchParams (Next.js 15+ requirement)
  const params = await searchParams;

  // Fetch data on the server
  const [productsData, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  const { products, total, page, per_page } = productsData;
  const totalPages = Math.ceil(total / per_page);

  return (
    <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-2 sm:py-4">
      {/* Hero Banner - Amazon style promo */}
      <div className="relative h-[200px] sm:h-[300px] md:h-[350px] bg-gradient-to-b from-[#e3f4f7] to-[#eaeded] mb-3 sm:mb-4 rounded overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#0f1111] mb-2 sm:mb-4">
              Welcome to Vamazon
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
              Shop electronics, computers, and more at amazing prices
            </p>
            <div className="flex gap-2 sm:gap-4 justify-center flex-wrap">
              <a href="/" className="bg-[#ffd814] hover:bg-[#f7ca00] text-black px-4 sm:px-6 py-2 rounded-full font-medium text-sm sm:text-base">
                Shop Now
              </a>
              <a href="/?category=laptop_computer" className="bg-white hover:bg-gray-100 text-black px-4 sm:px-6 py-2 rounded-full font-medium border border-gray-300 text-sm sm:text-base">
                View Laptops
              </a>
            </div>
          </div>
        </div>
        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-20 bg-gradient-to-t from-[#eaeded] to-transparent"></div>
      </div>

      {/* Filters Row - Amazon style */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {params.search ? (
              <span className="text-sm sm:text-base text-[#0f1111]">
                <span className="font-bold">{total}</span> results for{' '}
                <span className="font-bold text-[#c7511f]">&quot;{params.search}&quot;</span>
              </span>
            ) : params.category ? (
              <span className="text-sm sm:text-base text-[#0f1111]">
                <span className="font-bold">{total}</span> results in{' '}
                <span className="font-bold text-[#c7511f]">{params.category.replace(/_/g, ' ')}</span>
              </span>
            ) : (
              <span className="text-sm sm:text-base text-[#0f1111]">
                Showing <span className="font-bold">{total}</span> products
              </span>
            )}
          </div>

          {/* Category Filter */}
          <Suspense fallback={<div className="text-xs">Loading...</div>}>
            <CategoryFilter
              categories={categories}
              currentCategory={params.category}
            />
          </Suspense>
        </div>
      </div>

      {/* Product Grid - 2 cols on mobile, scales up on larger screens */}
      <div id="products" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* No Products Message */}
      {products.length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-600">No products found</p>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <a
              href={`/?${new URLSearchParams({
                ...params,
                page: String(page - 1),
              }).toString()}`}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Previous
            </a>
          )}

          <span className="px-4 py-2">
            Page {page} of {totalPages}
          </span>

          {page < totalPages && (
            <a
              href={`/?${new URLSearchParams({
                ...params,
                page: String(page + 1),
              }).toString()}`}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
