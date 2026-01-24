/**
 * Mock Authentication API
 * Simulates backend authentication with 1 second delay
 */

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface SignupCredentials {
    restaurantName: string;
    fullName: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        email: string;
        fullName: string;
        restaurantName: string;
    };
    error?: string;
}

const API_URL = 'http://localhost:5000/api';

/**
 * Login API call
 * Authenticates user with the backend
 */
export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
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
 * Simulates a signup API call
 * Returns a fake token after 1 second delay
 */
export const signupApi = async (credentials: SignupCredentials): Promise<AuthResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock validation
            if (!credentials.email || !credentials.password || !credentials.fullName || !credentials.restaurantName) {
                resolve({
                    success: false,
                    error: 'All fields are required',
                });
                return;
            }

            if (credentials.password.length < 6) {
                resolve({
                    success: false,
                    error: 'Password must be at least 6 characters',
                });
                return;
            }

            // Simulate successful signup
            resolve({
                success: true,
                token: `mock-jwt-token-${Date.now()}`,
                user: {
                    id: 'usr_' + Math.random().toString(36).substr(2, 9),
                    email: credentials.email,
                    fullName: credentials.fullName,
                    restaurantName: credentials.restaurantName,
                },
            });
        }, 1000);
    });
};

/**
 * Simulates token validation
 */
export const validateTokenApi = async (token: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock validation - any token starting with "mock-jwt-token" is valid
            resolve(token.startsWith('mock-jwt-token'));
        }, 200);
    });
};
