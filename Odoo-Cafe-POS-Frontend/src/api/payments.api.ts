/**
 * Payments API
 * Transaction records from the backend
 */

export interface PaymentRecord {
    id: string;
    orderId: string;
    orderNumber: string;
    method: 'CASH' | 'UPI' | 'CARD';
    amount: number;
    transactionRef?: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    createdAt: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('pos_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Get all payment records
 */
export const getPaymentsApi = async (filters: { method?: string; orderNumber?: string } = {}): Promise<PaymentRecord[]> => {
    try {
        const params = new URLSearchParams();
        if (filters.method && filters.method !== 'ALL') params.append('method', filters.method);
        if (filters.orderNumber) params.append('orderNumber', filters.orderNumber);

        const response = await fetch(`${API_BASE_URL}/payments?${params.toString()}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error('Failed to fetch payments');
            return [];
        }

        const data = await response.json();
        return data.map((p: any) => ({
            id: p.id,
            orderId: p.orderId,
            orderNumber: p.order?.receipts?.[0]?.receiptNumber || `#${p.orderId.substring(0, 8)}`,
            method: p.method,
            amount: Number(p.amount),
            transactionRef: p.transactionReference,
            status: p.status,
            createdAt: p.createdAt
        }));
    } catch (error) {
        console.error('Get payments error:', error);
        return [];
    }
};

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD';

interface PaymentRequest {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    transactionReference?: string;
}

interface PaymentResponse {
    success: boolean;
    payment?: any;
    error?: string;
}

/**
 * Process payment via backend
 */
export const processPaymentBackendApi = async (data: PaymentRequest): Promise<PaymentResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: result.message || 'Payment failed'
            };
        }

        return {
            success: true,
            payment: result.payment
        };
    } catch (error) {
        console.error('Process payment error:', error);
        return {
            success: false,
            error: 'Network error'
        };
    }
};

/**
 * Generate receipt via backend
 */
export const generateReceiptBackendApi = async (orderId: string): Promise<any | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/payments/orders/${encodeURIComponent(orderId)}/receipt`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error('Failed to generate receipt');
            return null;
        }

        const data = await response.json();
        return data.receipt;
    } catch (error) {
        console.error('Generate receipt error:', error);
        return null;
    }
};
