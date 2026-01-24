/**
 * Sessions API - Mock Data
 * Handles POS session management (open/close sessions)
 * Routes match backend: POST /api/sessions/open, POST /api/sessions/:id/close
 */

export interface Session {
    id: string;
    terminal_id: string;
    opened_at: string;
    closed_at?: string;
    total_sales: number;
    status: 'open' | 'closed';
    user_id?: string;
}

export interface OpenSessionResponse {
    success: boolean;
    session?: Session;
    error?: string;
}

export interface CloseSessionResponse {
    success: boolean;
    session?: Session;
    error?: string;
}

// In-memory mock sessions storage
let mockSessions: Session[] = [];
let sessionIdCounter = 3000;

/**
 * Generate a unique session ID
 */
const generateSessionId = (): string => {
    sessionIdCounter += 1;
    return `session-${sessionIdCounter}`;
};

/**
 * Open a new POS session
 * POST /api/sessions/open
 * Body: { "terminal_id": "..." }
 */
export const openSessionApi = async (terminalId: string): Promise<OpenSessionResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Check if there's already an open session for this terminal
            const existingSession = mockSessions.find(
                s => s.terminal_id === terminalId && s.status === 'open'
            );

            if (existingSession) {
                resolve({
                    success: true,
                    session: existingSession,
                });
                return;
            }

            const newSession: Session = {
                id: generateSessionId(),
                terminal_id: terminalId,
                opened_at: new Date().toISOString(),
                total_sales: 0,
                status: 'open',
            };

            mockSessions.push(newSession);

            resolve({
                success: true,
                session: newSession,
            });
        }, 300);
    });
};

/**
 * Close an existing POS session
 * POST /api/sessions/:id/close
 * Body: { "total_sales": number }
 */
export const closeSessionApi = async (
    sessionId: string,
    totalSales: number
): Promise<CloseSessionResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const session = mockSessions.find(s => s.id === sessionId);

            if (!session) {
                resolve({
                    success: false,
                    error: 'Session not found',
                });
                return;
            }

            if (session.status === 'closed') {
                resolve({
                    success: false,
                    error: 'Session is already closed',
                });
                return;
            }

            // Close the session
            session.closed_at = new Date().toISOString();
            session.total_sales = totalSales;
            session.status = 'closed';

            resolve({
                success: true,
                session,
            });
        }, 300);
    });
};

/**
 * Get current active session for a terminal
 * GET /api/sessions/current?terminal_id=...
 */
export const getCurrentSessionApi = async (terminalId?: string): Promise<OpenSessionResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let activeSession: Session | undefined;

            if (terminalId) {
                activeSession = mockSessions.find(
                    s => s.terminal_id === terminalId && s.status === 'open'
                );
            } else {
                activeSession = mockSessions.find(s => s.status === 'open');
            }

            if (!activeSession) {
                resolve({
                    success: false,
                    error: 'No active session found',
                });
                return;
            }

            resolve({
                success: true,
                session: activeSession,
            });
        }, 200);
    });
};

/**
 * Get session by ID
 * GET /api/sessions/:id
 */
export const getSessionById = async (sessionId: string): Promise<Session | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const session = mockSessions.find(s => s.id === sessionId);
            resolve(session || null);
        }, 100);
    });
};

/**
 * Get all sessions
 * GET /api/sessions
 */
export const getAllSessions = async (): Promise<Session[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockSessions);
        }, 200);
    });
};

/**
 * Clear all mock sessions (for testing)
 */
export const clearMockSessions = (): void => {
    mockSessions = [];
};
