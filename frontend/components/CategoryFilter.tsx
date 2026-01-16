'use client';

/**
 * Category Filter Component
 * ==========================
 * 
 * Dropdown to filter products by category.
 * Uses client-side navigation for instant feedback.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@/types';

interface CategoryFilterProps {
    categories: Category[];
    currentCategory?: string;
}

export default function CategoryFilter({ categories, currentCategory }: CategoryFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const category = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (category) {
            params.set('category', category);
        } else {
            params.delete('category');
        }

        // Reset to page 1 when changing category
        params.delete('page');

        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="category" className="text-sm text-gray-600">
                Category:
            </label>
            <select
                id="category"
                value={currentCategory || ''}
                onChange={handleCategoryChange}
                className="border rounded px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#febd69]"
            >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                        {cat.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
