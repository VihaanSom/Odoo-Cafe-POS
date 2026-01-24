/**
 * Branches API - Real Backend Integration
 * Connects to backend endpoints for branch and terminal management
 */

const API_BASE_URL = 'http://localhost:5000/api';

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
