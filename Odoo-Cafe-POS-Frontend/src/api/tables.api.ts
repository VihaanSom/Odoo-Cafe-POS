/**
 * Tables API - Mock Data
 * Provides floor and table data for the POS
 */

export interface Floor {
    id: string;
    name: string;
    tableCount: number;
}

export interface Table {
    id: string;
    tableNumber: string;
    seats: number;
    status: 'FREE' | 'OCCUPIED' | 'RESERVED';
    floorId: string;
    branchId?: string;
    occupiedInfo?: {
        duration: string;
        orderTotal?: string;
    };
}



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
 * Backend Table interface
 */
interface BackendTable {
    id: string;
    tableNumber: string;
    seats: number;
    status: 'FREE' | 'OCCUPIED' | 'RESERVED';
    floorId?: string;
    branchId?: string;
    floor?: {
        id: string;
        branchId: string;
        name: string;
    };
}

/**
 * Map backend table to frontend Table interface
 */
const mapBackendTable = (t: BackendTable): Table => ({
    id: t.id,
    tableNumber: String(t.tableNumber),
    seats: t.seats,
    status: t.status,
    floorId: t.floorId || t.floor?.id || 'floor-1',
    branchId: t.floor?.branchId || t.branchId,
});

/**
 * Get all tables from backend (optionally filtered by floor)
 * GET /api/tables?floorId=...
 */
export const getTablesBackendApi = async (floorId?: string): Promise<Table[]> => {
    try {
        const url = floorId
            ? `${API_BASE_URL}/tables?floorId=${encodeURIComponent(floorId)}`
            : `${API_BASE_URL}/tables`;

        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error('Failed to fetch tables');
            return [];
        }

        const data = await response.json();
        // Backend returns array directly or { tables: [] }
        const tablesData: BackendTable[] = Array.isArray(data) ? data : (data.tables || []);

        return tablesData.map(mapBackendTable);
    } catch (error) {
        console.error('Get tables error:', error);
        return [];
    }
};

/**
 * Get table by ID from backend
 * GET /api/tables/:id
 */
export const getTableByIdBackendApi = async (tableId: string): Promise<Table | undefined> => {
    try {
        const response = await fetch(`${API_BASE_URL}/tables/${encodeURIComponent(tableId)}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            return undefined;
        }

        const data: BackendTable = await response.json();
        return mapBackendTable(data);
    } catch (error) {
        console.error('Get table by ID error:', error);
        return undefined;
    }
};

/**
 * Get floors from backend (filtered by branch)
 * GET /api/floors?branchId=...
 */
export const getFloorsBackendApi = async (branchId: string): Promise<Floor[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/floors?branchId=${encodeURIComponent(branchId)}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error('Failed to fetch floors');
            return [];
        }

        const data = await response.json();
        // Backend returns array of floors
        // Map backend floor to frontend Floor interface
        // Note: Backend might not return tableCount, so we might need to handle that if used

        // Use Type Assertion if needed or define BackendFloor interface
        return (Array.isArray(data) ? data : []).map((f: any) => ({
            id: f.id,
            name: f.name,
            tableCount: 0 // Backend currently doesn't send count, defaulting to 0
        }));
    } catch (error) {
        console.error('Get floors error:', error);
        return [];
    }
};

// ============================================
// LEGACY COMPATIBILITY ALIASES
// ============================================

/**
 * Get all floors (Legacy alias)
 */
export const getFloors = async (): Promise<Floor[]> => {
    const sessionStr = localStorage.getItem('pos_active_session');
    if (sessionStr) {
        try {
            const session = JSON.parse(sessionStr);
            if (session.branch_id) {
                return getFloorsBackendApi(session.branch_id);
            }
        } catch (e) { }
    }
    return [];
};

/**
 * Get tables by floor ID (Legacy alias)
 */
export const getTablesByFloor = getTablesBackendApi;

/**
 * Get a single table by ID (Legacy alias)
 */
export const getTableById = getTableByIdBackendApi;

/**
 * Get table statistics for a floor
 */
export const getFloorStats = async (floorId: string): Promise<{ free: number; occupied: number; reserved: number }> => {
    const tables = await getTablesBackendApi(floorId);
    return {
        free: tables.filter(t => t.status === 'FREE').length,
        occupied: tables.filter(t => t.status === 'OCCUPIED').length,
        reserved: tables.filter(t => t.status === 'RESERVED').length,
    };
};
