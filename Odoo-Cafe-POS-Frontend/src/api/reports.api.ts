/**
 * Reports API
 * Handles fetching analytical data from the backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('pos_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export interface DailySalesResponse {
    date: string;
    totalSales: number;
    orderCount: number;
}

export interface SalesRangeResponse {
    startDate: string;
    endDate: string;
    totalSales: number;
    orderCount: number;
    dailyBreakdown?: Array<{
        date: string;
        sales: number;
        orders: number;
    }>;
}

export interface TopProduct {
    product: {
        id: string;
        name: string;
        price: string | number;
    };
    totalQuantity: number;
}

export interface OrderStatusCount {
    status: string;
    count: number;
}

export interface HourlySalesData {
    hour: number;
    sales: number;
    orders: number;
}

/**
 * Get daily sales summary
 */
export const getDailySales = async (branchId?: string, date?: string): Promise<DailySalesResponse> => {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    if (date) params.append('date', date);

    const response = await fetch(`${API_BASE_URL}/reports/daily-sales?${params.toString()}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch daily sales');
    return response.json();
};

/**
 * Get sales for a date range
 */
export const getSalesByRange = async (startDate: string, endDate: string, branchId?: string): Promise<SalesRangeResponse> => {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (branchId) params.append('branchId', branchId);

    const response = await fetch(`${API_BASE_URL}/reports/sales-range?${params.toString()}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch sales range');
    return response.json();
};

/**
 * Get top selling products
 */
export const getTopProducts = async (branchId?: string, limit: number = 10): Promise<TopProduct[]> => {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    params.append('limit', limit.toString());

    const response = await fetch(`${API_BASE_URL}/reports/top-products?${params.toString()}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch top products');
    return response.json();
};

/**
 * Get order count by status
 */
export const getOrdersByStatus = async (branchId?: string): Promise<OrderStatusCount[]> => {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);

    const response = await fetch(`${API_BASE_URL}/reports/orders-by-status?${params.toString()}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch orders by status');
    return response.json();
};

/**
 * Get hourly sales breakdown
 */
export const getHourlySales = async (branchId?: string, date?: string): Promise<HourlySalesData[]> => {
    const params = new URLSearchParams();
    if (branchId) params.append('branchId', branchId);
    if (date) params.append('date', date);

    const response = await fetch(`${API_BASE_URL}/reports/hourly-sales?${params.toString()}`, {
        headers: getAuthHeaders(),
    });

    if (!response.ok) throw new Error('Failed to fetch hourly sales');
    return response.json();
};
