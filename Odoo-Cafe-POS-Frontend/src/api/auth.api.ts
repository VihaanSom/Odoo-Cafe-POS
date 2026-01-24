/**
 * Authentication API
 * Connects to the Express backend at /api/auth
 */

const API_BASE_URL = 'http://localhost:5000/api';

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
    name: string;
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
 * POST /api/auth/login
 */
export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Login failed. Please check your credentials.',
            };
        }

        return {
            success: true,
            token: data.token,
            user: data.user,
        };
    } catch (error) {
        console.error('Login API error:', error);
        return {
            success: false,
            error: 'Unable to connect to server. Please try again later.',
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
            user: data.user,
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
