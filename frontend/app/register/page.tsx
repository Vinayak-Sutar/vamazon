'use client';

/**
 * Register Page
 * ==============
 * 
 * Amazon-style registration form.
 * Creates account and auto-logs in user.
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { register, isAuthenticated, loading, error } = useAuth();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
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
        setFormError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setFormError('Passwords do not match');
            return;
        }

        setIsSubmitting(true);

        const success = await register(email, password, name);

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

                {/* Register Form */}
                <div className="bg-white rounded-lg border border-gray-300 p-6">
                    <h1 className="text-2xl font-normal text-[#0f1111] mb-4">Create account</h1>

                    {(error || formError) && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-700">
                            {formError || error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#0f1111] mb-1">
                                Your name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                minLength={2}
                                placeholder="First and last name"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                            />
                        </div>

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
                                placeholder="At least 6 characters"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Passwords must be at least 6 characters.
                            </p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#0f1111] mb-1">
                                Re-enter password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
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
                            {isSubmitting ? 'Creating account...' : 'Create your Vamazon account'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-600 mt-4">
                        By creating an account, you agree to Vamazon&apos;s{' '}
                        <span className="text-[#0066c0] hover:underline cursor-pointer">
                            Conditions of Use
                        </span>{' '}
                        and{' '}
                        <span className="text-[#0066c0] hover:underline cursor-pointer">
                            Privacy Notice
                        </span>
                        .
                    </p>

                    {/* Login link */}
                    <div className="mt-6 pt-4 border-t border-gray-300">
                        <p className="text-sm text-[#0f1111]">
                            Already have an account?{' '}
                            <Link
                                href={`/login${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
                                className="text-[#0066c0] hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
