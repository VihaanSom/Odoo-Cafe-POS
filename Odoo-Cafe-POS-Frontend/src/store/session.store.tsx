import {
    createContext,
    useContext,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { openSessionApi, closeSessionApi, type Session } from '../api/sessions.api';

/**
 * Session Context State
 */
interface SessionState {
    session: Session | null;
    isSessionActive: boolean;
    isLoading: boolean;
    error: string | null;
}

/**
 * Session Context Actions
 */
interface SessionActions {
    startSession: (terminalId: string) => Promise<boolean>;
    endSession: (salesTotal: number) => Promise<boolean>;
    clearError: () => void;
}

type SessionContextType = SessionState & SessionActions;

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'pos_active_session';

/**
 * Session Provider Component
 */
export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load session from localStorage on mount
    useEffect(() => {
        const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
        if (storedSession) {
            try {
                const parsedSession = JSON.parse(storedSession) as Session;
                // Only restore if session is still open
                if (parsedSession.status === 'open') {
                    setSession(parsedSession);
                } else {
                    localStorage.removeItem(SESSION_STORAGE_KEY);
                }
            } catch (e) {
                localStorage.removeItem(SESSION_STORAGE_KEY);
            }
        }
    }, []);

    /**
     * Start a new POS session
     */
    const startSession = useCallback(async (terminalId: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await openSessionApi(terminalId);

            if (response.success && response.session) {
                setSession(response.session);
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(response.session));
                setIsLoading(false);
                return true;
            } else {
                setError(response.error || 'Failed to start session');
                setIsLoading(false);
                return false;
            }
        } catch (err) {
            setError('An unexpected error occurred');
            setIsLoading(false);
            return false;
        }
    }, []);

    /**
     * End the current POS session
     */
    const endSession = useCallback(async (salesTotal: number): Promise<boolean> => {
        if (!session) {
            setError('No active session to close');
            return false;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await closeSessionApi(session.id, salesTotal);

            if (response.success) {
                setSession(null);
                localStorage.removeItem(SESSION_STORAGE_KEY);
                setIsLoading(false);
                return true;
            } else {
                setError(response.error || 'Failed to close session');
                setIsLoading(false);
                return false;
            }
        } catch (err) {
            setError('An unexpected error occurred');
            setIsLoading(false);
            return false;
        }
    }, [session]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value: SessionContextType = {
        session,
        isSessionActive: session !== null && session.status === 'open',
        isLoading,
        error,
        startSession,
        endSession,
        clearError,
    };

    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

/**
 * useSession hook
 */
export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};

export default SessionContext;
