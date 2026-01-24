/**
 * Payments API - Mock Data
 * Handles payment processing
 * Routes match backend: POST /api/payments
 */

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export interface Payment {
    id: string;
    order_id: string;
    method: PaymentMethod;
    amount: number;
    status: PaymentStatus;
    transaction_reference?: string;
    created_at?: string;
}

export interface ProcessPaymentRequest {
    order_id: string;
    method: PaymentMethod;
    amount: number;
    transaction_reference?: string;
}

export interface PaymentResponse {
    success: boolean;
    payment?: Payment;
    error?: string;
}

// In-memory mock payments storage
let mockPayments: Payment[] = [];
let paymentIdCounter = 2000;

/**
 * Generate a unique payment ID
 */
const generatePaymentId = (): string => {
    paymentIdCounter += 1;
    return `payment-${paymentIdCounter}`;
};

/**
 * Process a payment
 * POST /api/payments
 * 
 * This will:
 * 1. Insert payment record with status 'COMPLETED'
 * 2. (In real backend) Update order status to 'COMPLETED'
 * 3. (In real backend) If DINE_IN, set table status to 'FREE'
 */
export const processPayment = async (data: ProcessPaymentRequest): Promise<PaymentResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Validate payment method
            if (!['CASH', 'UPI', 'CARD'].includes(data.method)) {
                resolve({
                    success: false,
                    error: 'Invalid payment method. Must be CASH, UPI, or CARD.',
                });
                return;
            }

            const newPayment: Payment = {
                id: generatePaymentId(),
                order_id: data.order_id,
                method: data.method,
                amount: data.amount,
                status: 'COMPLETED',
                transaction_reference: data.transaction_reference || (data.method === 'CASH' ? undefined : `TXN-${Date.now()}`),
                created_at: new Date().toISOString(),
            };

            mockPayments.push(newPayment);

            resolve({
                success: true,
                payment: newPayment,
            });
        }, 300);
    });
};

/**
 * Get payment by order ID
 * GET /api/payments?order_id=...
 */
export const getPaymentByOrderId = async (orderId: string): Promise<PaymentResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const payment = mockPayments.find(p => p.order_id === orderId);

            if (!payment) {
                resolve({ success: false, error: 'Payment not found' });
                return;
            }

            resolve({ success: true, payment });
        }, 100);
    });
};

/**
 * Get all payments for a session
 * GET /api/payments?session_id=...
 */
export const getPaymentsBySession = async (_sessionId: string): Promise<Payment[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // In real implementation, would filter by session_id via order relationship
            resolve(mockPayments);
        }, 150);
    });
};

/**
 * Clear all mock payments (for testing)
 */
export const clearMockPayments = (): void => {
    mockPayments = [];
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

export interface ProcessPaymentBackendRequest {
    orderId: string;
    amount: number;
    method: PaymentMethod;
    transactionReference?: string;
}

/**
 * Process a payment via backend
 * POST /api/payments
 */
export const processPaymentBackendApi = async (data: ProcessPaymentBackendRequest): Promise<PaymentResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/payments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: responseData.message || 'Failed to process payment',
            };
        }

        const backendPayment = responseData.payment;

        // Map backend payment to frontend interface
        const payment: Payment = {
            id: backendPayment.id,
            order_id: backendPayment.orderId,
            method: backendPayment.method,
            amount: Number(backendPayment.amount),
            status: backendPayment.status,
            transaction_reference: backendPayment.transactionReference,
            created_at: backendPayment.createdAt,
        };

        return {
            success: true,
            payment,
        };
    } catch (error) {
        console.error('Process payment error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.',
        };
    }
};

/**
 * Generate receipt for an order
 * POST /api/payments/orders/:id/receipt
 */
export const generateReceiptBackendApi = async (orderId: string): Promise<any> => {
    try {
        const response = await fetch(`${API_BASE_URL}/payments/orders/${encodeURIComponent(orderId)}/receipt`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to generate receipt');
        }

        return data.receipt;
    } catch (error) {
        console.error('Generate receipt error:', error);
        return null;
    }
};
