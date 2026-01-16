'use client';

/**
 * Login Page
 * ===========
 * 
 * Amazon-style login form with email and password.
 * Redirects to previous page or home after successful login.
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated, loading, error } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get redirect URL from query params
    const redirect = searchParams.get('redirect') || '/';

    // If already logged in, redirect
    useEffect(() => {
        if (isAuthenticated && !loading) {
            router.push(redirect);
        }
    }, [isAuthenticated, loading, router, redirect]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const success = await login(email, password);

        if (success) {
            router.push(redirect);
        } else {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#febd69]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-[350px]">
                {/* Logo */}
                <div className="text-center mb-6">
                    <Link href="/" className="text-3xl font-bold text-[#0f1111]">
                        V<span className="text-[#febd69]">amazon</span>
                    </Link>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-lg border border-gray-300 p-6">
                    <h1 className="text-2xl font-normal text-[#0f1111] mb-4">Sign in</h1>

                    {/* Test Account Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-700">
                        <p className="font-medium mb-1">Test Account:</p>
                        <p>Email: <span className="font-mono">test@a.com</span></p>
                        <p>Password: <span className="font-mono">123456</span></p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#0f1111] mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#0f1111] mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2 px-4 bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] font-medium rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] disabled:opacity-50"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-600 mt-4">
                        By continuing, you agree to Vamazon&apos;s{' '}
                        <span className="text-[#0066c0] hover:underline cursor-pointer">
                            Conditions of Use
                        </span>{' '}
                        and{' '}
                        <span className="text-[#0066c0] hover:underline cursor-pointer">
                            Privacy Notice
                        </span>
                        .
                    </p>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="bg-[#eaeded] px-2 text-gray-500">New to Vamazon?</span>
                    </div>
                </div>

                {/* Register Link */}
                <Link
                    href={`/register${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                    className="block w-full py-2 px-4 bg-white border border-gray-300 text-[#0f1111] font-medium rounded text-center hover:bg-gray-50"
                >
                    Create your Vamazon account
                </Link>
            </div>
        </div>
    );
}
