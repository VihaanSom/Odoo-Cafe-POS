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

// Mock floor data
const floors: Floor[] = [
    { id: 'floor-1', name: 'Main Dining', tableCount: 8 },
    { id: 'floor-2', name: 'Terrace', tableCount: 6 },
];

// Mock table data
const tables: Table[] = [
    // Main Dining (floor-1)
    { id: 'table-1', tableNumber: 'T-01', seats: 4, status: 'FREE', floorId: 'floor-1' },
    { id: 'table-2', tableNumber: 'T-02', seats: 2, status: 'OCCUPIED', floorId: 'floor-1', occupiedInfo: { duration: '25 mins', orderTotal: '₹450' } },
    { id: 'table-3', tableNumber: 'T-03', seats: 6, status: 'FREE', floorId: 'floor-1' },
    { id: 'table-4', tableNumber: 'T-04', seats: 4, status: 'RESERVED', floorId: 'floor-1' },
    { id: 'table-5', tableNumber: 'T-05', seats: 2, status: 'FREE', floorId: 'floor-1' },
    { id: 'table-6', tableNumber: 'T-06', seats: 8, status: 'OCCUPIED', floorId: 'floor-1', occupiedInfo: { duration: '45 mins', orderTotal: '₹1,250' } },
    { id: 'table-7', tableNumber: 'T-07', seats: 4, status: 'FREE', floorId: 'floor-1' },
    { id: 'table-8', tableNumber: 'T-08', seats: 4, status: 'FREE', floorId: 'floor-1' },

    // Terrace (floor-2)
    { id: 'table-9', tableNumber: 'P-01', seats: 4, status: 'FREE', floorId: 'floor-2' },
    { id: 'table-10', tableNumber: 'P-02', seats: 2, status: 'OCCUPIED', floorId: 'floor-2', occupiedInfo: { duration: '15 mins', orderTotal: '₹280' } },
    { id: 'table-11', tableNumber: 'P-03', seats: 6, status: 'FREE', floorId: 'floor-2' },
    { id: 'table-12', tableNumber: 'P-04', seats: 4, status: 'FREE', floorId: 'floor-2' },
    { id: 'table-13', tableNumber: 'P-05', seats: 2, status: 'RESERVED', floorId: 'floor-2' },
    { id: 'table-14', tableNumber: 'P-06', seats: 4, status: 'FREE', floorId: 'floor-2' },
];

/**
 * Get all floors
 */
export const getFloors = async (): Promise<Floor[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(floors);
        }, 300);
    });
};

/**
 * Get tables by floor ID
 */
export const getTablesByFloor = async (floorId: string): Promise<Table[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const floorTables = tables.filter(table => table.floorId === floorId);
            resolve(floorTables);
        }, 200);
    });
};

/**
 * Get a single table by ID
 */
export const getTableById = async (tableId: string): Promise<Table | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const table = tables.find(t => t.id === tableId);
            resolve(table);
        }, 100);
    });
};

/**
 * Get table statistics for a floor
 */
export const getFloorStats = async (floorId: string): Promise<{ free: number; occupied: number; reserved: number }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const floorTables = tables.filter(table => table.floorId === floorId);
            resolve({
                free: floorTables.filter(t => t.status === 'FREE').length,
                occupied: floorTables.filter(t => t.status === 'OCCUPIED').length,
                reserved: floorTables.filter(t => t.status === 'RESERVED').length,
            });
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
 * Get all tables from backend
 * GET /api/tables
 */
export const getTablesBackendApi = async (): Promise<Table[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/tables`, {
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
