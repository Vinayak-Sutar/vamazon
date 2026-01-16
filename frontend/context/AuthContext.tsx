'use client';

/**
 * Authentication Context
 * ======================
 * 
 * Manages auth state globally across the app:
 * - User info (logged in user)
 * - Token storage (localStorage)
 * - Login/Register/Logout functions
 * 
 * EDUCATIONAL NOTES:
 * -----------------
 * React Context is like a "global state" that any component can access.
 * Instead of passing props through many levels (prop drilling), 
 * components can directly access the auth state.
 * 
 * Flow:
 * 1. User logs in → API returns token + user info
 * 2. Token stored in localStorage (persists across page refreshes)
 * 3. AuthContext provides user info to all components
 * 4. Header shows "Hello, [name]" instead of "Sign in"
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
interface User {
    id: number;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, name: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    error: null,
    login: async () => false,
    register: async () => false,
    logout: () => { },
    isAuthenticated: false,
});

// Custom hook for easy access
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Token storage helpers
function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}

function setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', token);
}

function removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
}

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Check if user is logged in on mount
    const checkAuth = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const userData = await res.json();
                setUser(userData);
            } else {
                // Token invalid or expired
                removeToken();
                setUser(null);
            }
        } catch {
            console.error('Auth check failed');
            removeToken();
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Login function
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.detail || 'Login failed');
                setLoading(false);
                return false;
            }

            // Store token and user
            setToken(data.access_token);
            setUser(data.user);
            setLoading(false);
            return true;
        } catch {
            setError('Network error. Please try again.');
            setLoading(false);
            return false;
        }
    }, []);

    // Register function
    const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.detail || 'Registration failed');
                setLoading(false);
                return false;
            }

            // Store token and user
            setToken(data.access_token);
            setUser(data.user);
            setLoading(false);
            return true;
        } catch {
            setError('Network error. Please try again.');
            setLoading(false);
            return false;
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        removeToken();
        setUser(null);
        setError(null);
    }, []);

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Export token getter for other contexts (like CartContext)
export { getToken };
