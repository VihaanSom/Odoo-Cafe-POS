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
