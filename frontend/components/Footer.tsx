'use client';

/**
 * Amazon-style Footer (Responsive)
 * =================================
 */

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="mt-auto">
            {/* Back to Top */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full bg-[#37475a] hover:bg-[#485769] text-white py-3 sm:py-4 text-xs sm:text-sm"
            >
                Back to top
            </button>

            {/* Main Footer Links */}
            <div className="bg-[#232f3e] text-white py-6 sm:py-10">
                <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
                    {/* Column 1 */}
                    <div>
                        <h3 className="font-bold text-sm sm:text-base mb-2 sm:mb-3">Get to Know Us</h3>
                        <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                            <li><Link href="#" className="hover:underline">About Us</Link></li>
                            <li><Link href="#" className="hover:underline">Careers</Link></li>
                            <li className="hidden sm:block"><Link href="#" className="hover:underline">Press Releases</Link></li>
                            <li className="hidden sm:block"><Link href="#" className="hover:underline">Amazon Science</Link></li>
                        </ul>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <h3 className="font-bold text-sm sm:text-base mb-2 sm:mb-3">Connect with Us</h3>
                        <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-300">
                            <li><Link href="#" className="hover:underline">Facebook</Link></li>
                            <li><Link href="#" className="hover:underline">Twitter</Link></li>
                            <li><Link href="#" className="hover:underline">Instagram</Link></li>
                        </ul>
                    </div>

                    {/* Column 3 */}
                    <div className="hidden md:block">
                        <h3 className="font-bold text-sm sm:text-base mb-3">Make Money with Us</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="#" className="hover:underline">Sell on Amazon</Link></li>
                            <li><Link href="#" className="hover:underline">Amazon Global Selling</Link></li>
                            <li><Link href="#" className="hover:underline">Become an Affiliate</Link></li>
                        </ul>
                    </div>

                    {/* Column 4 */}
                    <div className="hidden md:block">
                        <h3 className="font-bold text-sm sm:text-base mb-3">Let Us Help You</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link href="#" className="hover:underline">Your Account</Link></li>
                            <li><Link href="#" className="hover:underline">Returns Centre</Link></li>
                            <li><Link href="#" className="hover:underline">Help</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#131921] text-white py-4 sm:py-6">
                <div className="max-w-[1200px] mx-auto px-4 text-center">
                    <Link href="/" className="inline-block mb-2 sm:mb-4">
                        <span className="text-lg sm:text-xl font-bold">
                            amazon<span className="text-[#febd69]">.clone</span>
                        </span>
                    </Link>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                        © 2024 Vamazon - Scaler SDE Intern Assignment
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                        Demo project. Not affiliated with Amazon.
                    </p>
                </div>
            </div>
        </footer>
    );
}
