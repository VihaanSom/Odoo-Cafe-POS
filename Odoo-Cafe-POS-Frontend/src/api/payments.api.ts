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
