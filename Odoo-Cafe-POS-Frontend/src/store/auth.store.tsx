import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginApi, signupApi, LoginCredentials, SignupCredentials, AuthResponse } from '../api/auth.api';

/**
 * User interface
 */
interface User {
    id: string;
    email: string;
    fullName: string;
    restaurantName: string;
}

/**
 * Auth context state interface
 */
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

/**
 * Auth context actions interface
 */
interface AuthActions {
    login: (credentials: LoginCredentials) => Promise<AuthResponse>;
    signup: (credentials: SignupCredentials) => Promise<AuthResponse>;
    logout: () => void;
}

type AuthContextType = AuthState & AuthActions;

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Storage keys
 */
const TOKEN_KEY = 'pos_auth_token';
const USER_KEY = 'pos_auth_user';

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                // Invalid stored data, clear it
                localStorage.removeItem(TOKEN_KEY);
                localStorage.removeItem(USER_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    /**
     * Login function
     */
    const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await loginApi(credentials);

        if (response.success && response.token && response.user) {
            setToken(response.token);
            setUser(response.user);
            localStorage.setItem(TOKEN_KEY, response.token);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        }

        return response;
    };

    /**
     * Signup function
     */
    const signup = async (credentials: SignupCredentials): Promise<AuthResponse> => {
        const response = await signupApi(credentials);

        if (response.success && response.token && response.user) {
            setToken(response.token);
            setUser(response.user);
            localStorage.setItem(TOKEN_KEY, response.token);
            localStorage.setItem(USER_KEY, JSON.stringify(response.user));
        }

        return response;
    };

    /**
     * Logout function
     */
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        signup,
        logout,
    };

    return <AuthContext.Provider value={ value }> { children } </AuthContext.Provider>;
};

/**
 * useAuth hook
 */
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
