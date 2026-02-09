/**
 * Authentication API
 * Connects to the Express backend at /api/auth
 */

import { API_BASE_URL } from '../config/api.config';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    restaurantName?: string;
    fullName: string;
    email: string;
    password: string;
}

export interface User {
    id: string;
    email: string;
    fullName: string;
    restaurantName?: string;
    createdAt?: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
}


/**
 * Login API call
 * Authenticates user with the backend
 */
export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Login failed',
            };
        }

        return {
            success: true,
            token: data.token,
            user: {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.name,
                restaurantName: 'Odoo Cafe', // Placeholder as backend doesn't return this yet
            },
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.',
        };
    }
};

/**
 * Signup API call
 * POST /api/auth/signup
 */
export const signupApi = async (credentials: SignupCredentials): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: credentials.fullName, // Map fullName to name for backend
                email: credentials.email,
                password: credentials.password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Signup failed. Please try again.',
            };
        }

        return {
            success: true,
            token: data.token,
            user: {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.name,
                restaurantName: credentials.restaurantName || 'Odoo Cafe',
            },
        };
    } catch (error) {
        console.error('Signup API error:', error);
        return {
            success: false,
            error: 'Unable to connect to server. Please try again later.',
        };
    }
};

/**
 * Validate token with backend
 * GET /api/auth/me
 */
export const validateTokenApi = async (token: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
};
