'use client';

/**
 * Amazon-style Header Component (Responsive)
 * ===========================================
 * 
 * RESPONSIVE DESIGN WITH TAILWIND:
 * --------------------------------
 * Tailwind uses mobile-first breakpoints:
 * - No prefix: applies to all screens (mobile-first)
 * - sm: 640px and up (large phones)
 * - md: 768px and up (tablets)
 * - lg: 1024px and up (laptops)
 * - xl: 1280px and up (desktops)
 * 
 * Example: "hidden md:flex" = hidden on mobile, flex on tablet+
 */

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Header() {
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const router = useRouter();
    const { itemCount, resetCart } = useCart();
    const { user, isAuthenticated, logout } = useAuth();
    const { refreshWishlist } = useWishlist();

    const handleLogout = () => {
        logout();
        resetCart();
        refreshWishlist();  // This will clear wishlist since user is logged out
        router.push('/');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
            setMobileMenuOpen(false);
        }
    };

    return (
        <header className="sticky top-0 z-50">
            {/* Main Header Bar */}
            <div className="bg-[#131921] text-white">
                <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-2 flex items-center gap-2 sm:gap-4">

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 hover:bg-gray-700 rounded"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-1 p-1 sm:p-2 border border-transparent hover:border-white rounded flex-shrink-0">
                        <span className="text-lg sm:text-2xl font-bold text-white">
                            V<span className="text-[#febd69]">amazon</span>
                        </span>
                    </Link>

                    {/* Deliver to Location - Hidden on mobile/tablet */}
                    <div className="hidden lg:flex items-center gap-1 p-2 border border-transparent hover:border-white rounded cursor-pointer flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="text-xs">
                            <p className="text-gray-300">Deliver to</p>
                            <p className="font-bold">India</p>
                        </div>
                    </div>

                    {/* Search Bar - Amazon style with white background */}
                    <form onSubmit={handleSearch} className="flex-1 flex min-w-0">
                        <div className="flex w-full rounded-lg overflow-hidden bg-white shadow-sm">
                            {/* Category Dropdown - Hidden on small screens */}
                            <select className="hidden md:block bg-[#e6e6e6] text-[#0f1111] text-sm px-3 py-2 border-r border-gray-300 focus:outline-none flex-shrink-0 font-medium">
                                <option value="">All</option>
                                <option value="electronics">Electronics</option>
                                <option value="computers">Computers</option>
                                <option value="office">Office</option>
                                <option value="home">Home</option>
                            </select>

                            {/* Search Input - White background with dark text */}
                            <input
                                type="text"
                                placeholder="Search Vamazon..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 px-3 sm:px-4 py-2.5 bg-white text-[#0f1111] text-sm sm:text-base focus:outline-none min-w-0 placeholder-gray-500"
                            />

                            {/* Search Button - Orange */}
                            <button
                                type="submit"
                                className="bg-[#febd69] hover:bg-[#f3a847] px-3 sm:px-4 py-2 flex-shrink-0 transition-colors"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#0f1111]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </form>

                    {/* Language Selector - Desktop only */}
                    <div className="hidden xl:flex items-center gap-1 p-2 border border-transparent hover:border-white rounded cursor-pointer flex-shrink-0">
                        <span className="text-xl">🇮🇳</span>
                        <span className="text-sm font-bold">EN</span>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>

                    {/* Account & Lists - Hidden on small mobile */}
                    {isAuthenticated ? (
                        <div
                            className="hidden sm:block p-2 border border-transparent hover:border-white rounded cursor-pointer flex-shrink-0 relative"
                            onMouseEnter={() => setShowAccountMenu(true)}
                            onMouseLeave={() => setShowAccountMenu(false)}
                        >
                            <p className="text-xs text-gray-300">Hello, {user?.name?.split(' ')[0]}</p>
                            <p className="text-xs sm:text-sm font-bold flex items-center text-white">
                                Account
                                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </p>

                            {/* Dropdown Menu */}
                            {showAccountMenu && (
                                <div
                                    className="absolute right-0 top-full w-52 z-50 dropdown-menu"
                                    style={{ paddingTop: '4px' }}
                                >
                                    {/* Arrow */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '4px',
                                            right: '20px',
                                            width: 0,
                                            height: 0,
                                            borderLeft: '8px solid transparent',
                                            borderRight: '8px solid transparent',
                                            borderBottom: '8px solid white',
                                        }}
                                    />
                                    {/* Menu */}
                                    <div
                                        className="dropdown-menu"
                                        style={{
                                            backgroundColor: 'white',
                                            borderRadius: '4px',
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                                            border: '1px solid #ddd',
                                            marginTop: '8px',
                                        }}
                                    >
                                        <Link
                                            href="/wishlist"
                                            style={{
                                                display: 'block',
                                                padding: '12px 16px',
                                                color: '#0f1111',
                                                fontSize: '14px',
                                                textDecoration: 'none',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafa'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            Your Wishlist
                                        </Link>
                                        <Link
                                            href="/orders"
                                            style={{
                                                display: 'block',
                                                padding: '12px 16px',
                                                color: '#0f1111',
                                                fontSize: '14px',
                                                textDecoration: 'none',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafa'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            Your Orders
                                        </Link>
                                        <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: 0 }} />
                                        <button
                                            onClick={handleLogout}
                                            style={{
                                                display: 'block',
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '12px 16px',
                                                color: '#0f1111',
                                                fontSize: '14px',
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafa'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="hidden sm:block p-2 border border-transparent hover:border-white rounded flex-shrink-0">
                            <p className="text-xs text-gray-300">Hello, sign in</p>
                            <p className="text-xs sm:text-sm font-bold flex items-center text-white">
                                Account
                                <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </p>
                        </Link>
                    )}

                    {/* Returns & Orders - Tablet and up */}
                    <Link href="/orders" className="hidden md:block p-2 border border-transparent hover:border-white rounded flex-shrink-0">
                        <p className="text-xs text-gray-300">Returns</p>
                        <p className="text-sm font-bold">& Orders</p>
                    </Link>

                    {/* Cart - Always visible */}
                    <Link href="/cart" className="flex items-center p-1 sm:p-2 border border-transparent hover:border-white rounded flex-shrink-0">
                        <div className="relative">
                            <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span className="absolute -top-1 right-0 bg-[#f08804] text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded-full">
                                {itemCount}
                            </span>
                        </div>
                        <span className="hidden sm:block text-sm font-bold ml-1">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Secondary Navigation Bar - Scrollable on mobile */}
            <div className="bg-[#232f3e] text-white text-sm">
                <div className="max-w-[1500px] mx-auto px-2 sm:px-4 py-1 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
                    {/* All Menu */}
                    <Link href="/" className="flex items-center gap-1 px-2 py-1 border border-transparent hover:border-white rounded whitespace-nowrap flex-shrink-0">
                        <span className="font-bold">All</span>
                    </Link>

                    {/* Quick Links */}
                    <Link href="/?category=laptop_computer" className="px-2 py-1 hover:underline whitespace-nowrap flex-shrink-0">Laptops</Link>
                    <Link href="/?category=smart_home_products" className="px-2 py-1 hover:underline whitespace-nowrap flex-shrink-0">Smart Home</Link>
                    <Link href="/?category=office_and_school_supplies" className="px-2 py-1 hover:underline whitespace-nowrap flex-shrink-0">Office</Link>
                    <Link href="/?category=tablets" className="px-2 py-1 hover:underline whitespace-nowrap flex-shrink-0">Tablets</Link>
                    <Link href="/?category=smartwatches" className="hidden sm:inline-block px-2 py-1 hover:underline whitespace-nowrap flex-shrink-0">Smartwatches</Link>
                    <Link href="/?category=computer_accessories" className="hidden sm:inline-block px-2 py-1 hover:underline whitespace-nowrap flex-shrink-0">Accessories</Link>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-[#232f3e] text-white border-t border-gray-700">
                    <div className="px-4 py-3 space-y-3">
                        <Link href="/" className="block py-2 hover:bg-gray-700 rounded px-2" onClick={() => setMobileMenuOpen(false)}>
                            Home
                        </Link>
                        <Link href="/cart" className="block py-2 hover:bg-gray-700 rounded px-2" onClick={() => setMobileMenuOpen(false)}>
                            Cart ({itemCount} items)
                        </Link>
                        <Link href="/orders" className="block py-2 hover:bg-gray-700 rounded px-2" onClick={() => setMobileMenuOpen(false)}>
                            Orders
                        </Link>
                        <div className="border-t border-gray-700 pt-3">
                            <p className="text-gray-400 text-xs mb-2">Categories</p>
                            <Link href="/?category=laptop_computer" className="block py-2 hover:bg-gray-700 rounded px-2" onClick={() => setMobileMenuOpen(false)}>
                                Laptops
                            </Link>
                            <Link href="/?category=tablets" className="block py-2 hover:bg-gray-700 rounded px-2" onClick={() => setMobileMenuOpen(false)}>
                                Tablets
                            </Link>
                            <Link href="/?category=smart_home_products" className="block py-2 hover:bg-gray-700 rounded px-2" onClick={() => setMobileMenuOpen(false)}>
                                Smart Home
                            </Link>
                            <Link href="/?category=smartwatches" className="block py-2 hover:bg-gray-700 rounded px-2" onClick={() => setMobileMenuOpen(false)}>
                                Smartwatches
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
