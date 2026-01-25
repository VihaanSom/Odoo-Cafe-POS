const API_BASE_URL = 'http://localhost:5000/api';

export interface DashboardStats {
    lastClosingDate: string | null;
    todaySales: number;
    activeSessionOpenedAt: string | null;
}

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('pos_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Get dashboard Statistics
 */
export const getDashboardStatsApi = async (): Promise<DashboardStats> => {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error('Failed to fetch dashboard stats');
            return { lastClosingDate: null, todaySales: 0, activeSessionOpenedAt: null };
        }

        return await response.json();
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        return { lastClosingDate: null, todaySales: 0, activeSessionOpenedAt: null };
    }
};
