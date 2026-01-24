/**
 * Branches API - Mock Data
 * Handles branch and terminal management
 * Routes match backend: POST /api/branches, POST /api/terminals
 */

export interface Branch {
    id: string;
    name: string;
    address?: string;
    created_at?: string;
}

export interface Terminal {
    id: string;
    branch_id: string;
    terminal_name: string;
    user_id?: string;
    created_at?: string;
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

// Mock branch data
const mockBranches: Branch[] = [
    {
        id: 'branch-001',
        name: 'Odoo Cafe - Main',
        address: '123 Main Street, City Center',
        created_at: new Date().toISOString(),
    },
];

// Mock terminal data
const mockTerminals: Terminal[] = [
    {
        id: 'terminal-001-main',
        branch_id: 'branch-001',
        terminal_name: 'Counter 1',
        created_at: new Date().toISOString(),
    },
    {
        id: 'terminal-002-main',
        branch_id: 'branch-001',
        terminal_name: 'Counter 2',
        created_at: new Date().toISOString(),
    },
];

/**
 * Get all branches
 * GET /api/branches
 */
export const getBranches = async (): Promise<Branch[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(mockBranches);
        }, 200);
    });
};

/**
 * Create a new branch
 * POST /api/branches
 */
export const createBranch = async (name: string, address?: string): Promise<BranchResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newBranch: Branch = {
                id: `branch-${Date.now()}`,
                name,
                address,
                created_at: new Date().toISOString(),
            };

            mockBranches.push(newBranch);

            resolve({
                success: true,
                branch: newBranch,
            });
        }, 200);
    });
};

/**
 * Get branch by ID
 * GET /api/branches/:id
 */
export const getBranchById = async (branchId: string): Promise<Branch | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const branch = mockBranches.find(b => b.id === branchId);
            resolve(branch || null);
        }, 100);
    });
};

/**
 * Get all terminals (optionally filtered by branch)
 * GET /api/terminals?branch_id=...
 */
export const getTerminals = async (branchId?: string): Promise<Terminal[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (branchId) {
                const branchTerminals = mockTerminals.filter(t => t.branch_id === branchId);
                resolve(branchTerminals);
            } else {
                resolve(mockTerminals);
            }
        }, 200);
    });
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
    return new Promise((resolve) => {
        setTimeout(() => {
            const newTerminal: Terminal = {
                id: `terminal-${Date.now()}`,
                branch_id: branchId,
                terminal_name: terminalName,
                user_id: userId,
                created_at: new Date().toISOString(),
            };

            mockTerminals.push(newTerminal);

            resolve({
                success: true,
                terminal: newTerminal,
            });
        }, 200);
    });
};

/**
 * Get terminal by ID
 * GET /api/terminals/:id
 */
export const getTerminalById = async (terminalId: string): Promise<Terminal | null> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const terminal = mockTerminals.find(t => t.id === terminalId);
            resolve(terminal || null);
        }, 100);
    });
};

// ============================================
// REAL BACKEND API FUNCTIONS
// ============================================

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('pos_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

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
    branch_id: t.branchId || '',
    terminal_name: t.terminalName,
    user_id: t.userId,
    created_at: t.createdAt,
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
            terminal: mapBackendTerminal(data),
        };
    } catch (error) {
        console.error('Create terminal error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.',
        };
    }
};

