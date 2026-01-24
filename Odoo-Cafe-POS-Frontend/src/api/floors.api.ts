/**
 * Floors API - Real Backend Integration
 * Connects to backend endpoints for floor management
 */

const API_BASE_URL = 'http://localhost:5000/api';

export interface Table {
    id: string;
    floorId: string;
    tableNumber: number;
    status: 'FREE' | 'OCCUPIED' | 'RESERVED';
}

export interface Floor {
    id: string;
    name: string;
    branchId?: string;
    tables: Table[];
    branch?: {
        id: string;
        name: string;
    };
}

export interface FloorResponse {
    success: boolean;
    floor?: Floor;
    error?: string;
}

/**
 * Get all floors
 * GET /api/floors
 */
export const getFloors = async (branchId?: string): Promise<Floor[]> => {
    try {
        const url = branchId 
            ? `${API_BASE_URL}/floors?branchId=${branchId}`
            : `${API_BASE_URL}/floors`;
            
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch floors');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching floors:', error);
        throw error;
    }
};

/**
 * Get floor by ID
 * GET /api/floors/:id
 */
export const getFloorById = async (floorId: string): Promise<Floor | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/floors/${floorId}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch floor');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching floor:', error);
        throw error;
    }
};

/**
 * Get floor layout for a branch (floors with tables)
 * GET /api/floors/:branchId/layout
 */
export const getFloorLayout = async (branchId: string): Promise<Floor[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/floors/${branchId}/layout`);
        if (!response.ok) {
            throw new Error('Failed to fetch floor layout');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching floor layout:', error);
        throw error;
    }
};

/**
 * Create a new floor
 * POST /api/floors
 */
export const createFloor = async (
    branchId: string,
    name: string
): Promise<FloorResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/floors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ branchId, name }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData.message || 'Failed to create floor' };
        }

        const floor = await response.json();
        return { success: true, floor };
    } catch (error) {
        console.error('Error creating floor:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create floor' };
    }
};

/**
 * Update a floor
 * PUT /api/floors/:id
 */
export const updateFloor = async (
    floorId: string,
    name: string
): Promise<FloorResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/floors/${floorId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData.message || 'Failed to update floor' };
        }

        const floor = await response.json();
        return { success: true, floor };
    } catch (error) {
        console.error('Error updating floor:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update floor' };
    }
};

/**
 * Delete a floor
 * DELETE /api/floors/:id
 */
export const deleteFloor = async (floorId: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/floors/${floorId}`, {
            method: 'DELETE',
        });

        if (!response.ok && response.status !== 204) {
            const errorData = await response.json();
            return { success: false, error: errorData.message || 'Failed to delete floor' };
        }

        return { success: true };
    } catch (error) {
        console.error('Error deleting floor:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete floor' };
    }
};
