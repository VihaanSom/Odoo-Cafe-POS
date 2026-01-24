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

/**
 * Simulates a login API call
 * Returns a fake token after 1 second delay
 */
export const loginApi = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock validation - in real app, this would be server-side
            if (!credentials.email || !credentials.password) {
                resolve({
                    success: false,
                    error: 'Email and password are required',
                });
                return;
            }

            // Simulate successful login
            resolve({
                success: true,
                token: `mock-jwt-token-${Date.now()}`,
                user: {
                    id: 'usr_' + Math.random().toString(36).substr(2, 9),
                    email: credentials.email,
                    fullName: 'Restaurant Owner',
                    restaurantName: 'My Restaurant',
                },
            });
        }, 1000);
    });
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
