/**
 * Branches API - Real Backend Integration
 * Connects to backend endpoints for branch and terminal management
 */

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('pos_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export interface Branch {
    id: string;
    name: string;
    address?: string;
    createdAt?: string;
}

export interface Terminal {
    id: string;
    branchId: string;
    terminalName: string;
    userId?: string;
    createdAt?: string;
}

export interface BranchResponse {
    success: boolean;
    branch?: Branch;
    error?: string;
}

export interface TerminalResponse {
    success: boolean;
    terminal?: Terminal;
    error?: string;
}

/**
 * Get all branches
 * GET /api/branches
 */
export const getBranches = async (): Promise<Branch[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/branches`);
        if (!response.ok) {
            throw new Error('Failed to fetch branches');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching branches:', error);
        throw error;
    }
};

/**
 * Create a new branch
 * POST /api/branches
 */
export const createBranch = async (name: string, address?: string): Promise<BranchResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/branches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, address }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                error: errorData.message || 'Failed to create branch',
            };
        }

        const branch = await response.json();
        return {
            success: true,
            branch,
        };
    } catch (error) {
        console.error('Error creating branch:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create branch',
        };
    }
};

/**
 * Get branch by ID
 * GET /api/branches/:id
 */
export const getBranchById = async (branchId: string): Promise<Branch | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/branches/${branchId}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error('Failed to fetch branch');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching branch:', error);
        throw error;
    }
};

/**
 * Get all terminals (optionally filtered by branch)
 * GET /api/terminals?branchId=...
 */
export const getTerminals = async (branchId?: string): Promise<Terminal[]> => {
    try {
        const url = branchId
            ? `${API_BASE_URL}/terminals?branchId=${branchId}`
            : `${API_BASE_URL}/terminals`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch terminals');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching terminals:', error);
        throw error;
    }
};

/**
 * Create a new terminal
 * POST /api/terminals
 */
export const createTerminal = async (
    branchId: string,
    terminalName: string,
    userId?: string
): Promise<TerminalResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/terminals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ branchId, terminalName, userId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                error: errorData.message || 'Failed to create terminal',
            };
        }

        const terminal = await response.json();
        return {
            success: true,
            terminal,
        };
    } catch (error) {
        console.error('Error creating terminal:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create terminal',
        };
    }
};

/**
 * Get terminal by ID
 * GET /api/terminals/:id
 */
export const getTerminalById = async (terminalId: string): Promise<Terminal | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/terminals/${terminalId}`);
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error('Failed to fetch terminal');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching terminal:', error);
        throw error;
    }
};

// ============================================
// REAL BACKEND API FUNCTIONS
// ============================================



/**
 * Backend Terminal interface (camelCase)
 */
interface BackendTerminal {
    id: string;
    terminalName: string;
    branchId?: string;
    userId?: string;
    createdAt?: string;
    branch?: {
        id: string;
        name: string;
    };
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

/**
 * Map backend terminal to frontend Terminal interface
 */
const mapBackendTerminal = (t: BackendTerminal): Terminal => ({
    id: t.id,
    branchId: t.branchId || '',
    terminalName: t.terminalName,
    userId: t.userId,
    createdAt: t.createdAt,
});

/**
 * Get all terminals from backend
 * GET /api/terminals
 */
export const getTerminalsApi = async (): Promise<Terminal[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/terminals`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error('Failed to fetch terminals');
            return [];
        }

        const data = await response.json();
        // Backend returns { terminals: [...] }
        const terminals: BackendTerminal[] = data.terminals || [];

        return terminals.map(mapBackendTerminal);
    } catch (error) {
        console.error('Get terminals error:', error);
        return [];
    }
};

/**
 * Get terminal by ID from backend
 * GET /api/terminals/:id
 */
export const getTerminalByIdApi = async (terminalId: string): Promise<Terminal | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/terminals/${encodeURIComponent(terminalId)}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            return null;
        }

        const data: BackendTerminal = await response.json();
        return mapBackendTerminal(data);
    } catch (error) {
        console.error('Get terminal by ID error:', error);
        return null;
    }
};

/**
 * Create a new terminal via backend
 * POST /api/terminals
 */
export const createTerminalApi = async (
    terminalName: string,
    branchId?: string,
    userId?: string
): Promise<TerminalResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/terminals`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                terminalName,
                branchId,
                userId,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Failed to create terminal',
            };
        }

        return {
            success: true,
            terminal: mapBackendTerminal(data.terminal),
        };
    } catch (error) {
        console.error('Create terminal error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.',
        };
    }
};

