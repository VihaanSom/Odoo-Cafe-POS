/**
 * Orders API - Mock Data
 * Handles order creation, items, and status management
 * Routes match backend: POST /api/orders, POST /api/orders/:id/items, etc.
 */

export type OrderType = 'DINE_IN' | 'TAKEAWAY';
export type OrderStatus = 'CREATED' | 'IN_PROGRESS' | 'READY' | 'COMPLETED';

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price_at_time: number;
    product_name?: string;
}

export interface Order {
    id: string;
    branch_id: string;
    session_id: string;
    table_id?: string | null;
    order_type: OrderType;
    status: OrderStatus;
    total_amount: number;
    customer_name?: string;
    created_by?: string;
    created_at?: string;
    items: OrderItem[];
}

export interface CreateOrderRequest {
    branch_id: string;
    session_id: string;
    order_type: OrderType;
    table_id?: string;
    customer_name?: string;
}

export interface AddItemRequest {
    product_id: string;
    quantity: number;
}

export interface OrderResponse {
    success: boolean;
    order?: Order;
    error?: string;
}

// In-memory mock orders storage
let mockOrders: Order[] = [];
let orderIdCounter = 1000;
let itemIdCounter = 5000;

/**
 * Generate a unique order ID
 */
const generateOrderId = (): string => {
    orderIdCounter += 1;
    return `order-${orderIdCounter}`;
};

/**
 * Generate a unique item ID
 */
const generateItemId = (): string => {
    itemIdCounter += 1;
    return `item-${itemIdCounter}`;
};

/**
 * Create a new order
 * POST /api/orders
 */
export const createOrder = async (data: CreateOrderRequest): Promise<OrderResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newOrder: Order = {
                id: generateOrderId(),
                branch_id: data.branch_id,
                session_id: data.session_id,
                table_id: data.order_type === 'DINE_IN' ? data.table_id : null,
                order_type: data.order_type,
                status: 'CREATED',
                total_amount: 0,
                customer_name: data.customer_name,
                created_at: new Date().toISOString(),
                items: [],
            };

            mockOrders.push(newOrder);

            resolve({
                success: true,
                order: newOrder,
            });
        }, 200);
    });
};

/**
 * Add items to an order
 * POST /api/orders/:id/items
 * Note: In real backend, price is fetched from products table
 */
export const addItemToOrder = async (
    orderId: string,
    item: AddItemRequest,
    productName: string,
    priceAtTime: number
): Promise<OrderResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const order = mockOrders.find(o => o.id === orderId);

            if (!order) {
                resolve({ success: false, error: 'Order not found' });
                return;
            }

            // Check if item already exists
            const existingItem = order.items.find(i => i.product_id === item.product_id);

            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                const newItem: OrderItem = {
                    id: generateItemId(),
                    order_id: orderId,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price_at_time: priceAtTime,
                    product_name: productName,
                };
                order.items.push(newItem);
            }

            // Recalculate total
            order.total_amount = order.items.reduce(
                (sum, i) => sum + (i.price_at_time * i.quantity),
                0
            );

            resolve({ success: true, order });
        }, 150);
    });
};

/**
 * Send order to kitchen
 * PATCH /api/orders/:id/send
 */
export const sendOrderToKitchen = async (orderId: string): Promise<OrderResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const order = mockOrders.find(o => o.id === orderId);

            if (!order) {
                resolve({ success: false, error: 'Order not found' });
                return;
            }

            order.status = 'IN_PROGRESS';
            resolve({ success: true, order });
        }, 200);
    });
};

/**
 * Update order status
 * PATCH /api/orders/:id/status
 */
export const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<OrderResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const order = mockOrders.find(o => o.id === orderId);

            if (!order) {
                resolve({ success: false, error: 'Order not found' });
                return;
            }

            order.status = status;
            resolve({ success: true, order });
        }, 150);
    });
};

/**
 * Get order by ID
 * GET /api/orders/:id
 */
export const getOrderById = async (orderId: string): Promise<OrderResponse> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const order = mockOrders.find(o => o.id === orderId);

            if (!order) {
                resolve({ success: false, error: 'Order not found' });
                return;
            }

            resolve({ success: true, order });
        }, 100);
    });
};

/**
 * Get active orders for kitchen display
 * GET /api/kitchen/orders
 */
export const getKitchenOrders = async (): Promise<Order[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const activeOrders = mockOrders.filter(
                o => o.status === 'CREATED' || o.status === 'IN_PROGRESS'
            );
            resolve(activeOrders);
        }, 200);
    });
};

/**
 * Generate receipt for an order
 * POST /api/orders/:id/receipt
 */
export const generateReceipt = async (orderId: string): Promise<{ success: boolean; receipt?: unknown; error?: string }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const order = mockOrders.find(o => o.id === orderId);

            if (!order) {
                resolve({ success: false, error: 'Order not found' });
                return;
            }

            const receipt = {
                receipt_number: `RCP-${Date.now()}`,
                order_id: orderId,
                items: order.items,
                total_amount: order.total_amount,
                created_at: new Date().toISOString(),
            };

            resolve({ success: true, receipt });
        }, 200);
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
 * Get active order for a table from backend
 * GET /api/orders/table/:tableId/active
 * Critical for "View Bill" functionality
 */
export const getActiveOrderByTableApi = async (tableId: string): Promise<OrderResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/table/${encodeURIComponent(tableId)}/active`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (response.status === 404) {
            // No active order for this table is not an error
            return {
                success: false,
                error: 'No active order for this table',
            };
        }

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Failed to get active order',
            };
        }

        // Map backend response to frontend Order interface
        const backendOrder = data;
        const order: Order = {
            id: backendOrder.id,
            branch_id: backendOrder.branchId,
            session_id: backendOrder.sessionId,
            table_id: backendOrder.tableId,
            order_type: backendOrder.orderType,
            status: backendOrder.status,
            total_amount: Number(backendOrder.totalAmount),
            customer_name: backendOrder.customerName,
            created_by: backendOrder.createdBy,
            created_at: backendOrder.createdAt,
            items: (backendOrder.orderItems || []).map((item: { id: string; orderId: string; productId: string; quantity: number; priceAtTime: string | number; product?: { name: string } }) => ({
                id: item.id,
                order_id: item.orderId,
                product_id: item.productId,
                quantity: item.quantity,
                price_at_time: Number(item.priceAtTime),
                product_name: item.product?.name,
            })),
        };

        return { success: true, order };
    } catch (error) {
        console.error('Get active order by table error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.',
        };
    }
};

/**
 * Backend Order Item interface
 */
interface BackendOrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    priceAtTime: string | number;
    product?: { name: string };
}

/**
 * Backend Order interface
 */
interface BackendOrder {
    id: string;
    branchId: string;
    sessionId: string;
    tableId?: string | null;
    orderType: OrderType;
    status: OrderStatus;
    totalAmount: string | number;
    customerName?: string;
    createdBy?: string;
    createdAt?: string;
    orderItems?: BackendOrderItem[];
}

/**
 * Map backend order to frontend Order interface
 */
const mapBackendOrder = (backendOrder: BackendOrder): Order => ({
    id: backendOrder.id,
    branch_id: backendOrder.branchId,
    session_id: backendOrder.sessionId,
    table_id: backendOrder.tableId,
    order_type: backendOrder.orderType,
    status: backendOrder.status,
    total_amount: Number(backendOrder.totalAmount),
    customer_name: backendOrder.customerName,
    created_by: backendOrder.createdBy,
    created_at: backendOrder.createdAt,
    items: (backendOrder.orderItems || []).map((item) => ({
        id: item.id,
        order_id: item.orderId,
        product_id: item.productId,
        quantity: item.quantity,
        price_at_time: Number(item.priceAtTime),
        product_name: item.product?.name,
    })),
});

/**
 * Create a new order via backend
 * POST /api/orders
 */
export interface CreateOrderBackendRequest {
    branchId: string;
    sessionId: string;
    orderType: OrderType;
    tableId?: string;
    customerName?: string;
    items?: { productId: string; quantity: number }[];
}

export const createOrderBackendApi = async (data: CreateOrderBackendRequest): Promise<OrderResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: responseData.message || 'Failed to create order',
            };
        }

        return {
            success: true,
            order: mapBackendOrder(responseData.order),
        };
    } catch (error) {
        console.error('Create order error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.',
        };
    }
};

/**
 * Add items to an order via backend (batch)
 * POST /api/orders/:id/items
 */
export const addOrderItemsBackendApi = async (
    orderId: string,
    items: { productId: string; quantity: number }[]
): Promise<OrderResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/items`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ items }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Failed to add items',
            };
        }

        return {
            success: true,
            order: mapBackendOrder(data.order),
        };
    } catch (error) {
        console.error('Add order items error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.',
        };
    }
};

/**
 * Send order to kitchen via backend
 * POST /api/orders/:id/send
 */
export const sendToKitchenBackendApi = async (orderId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/send`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Failed to send to kitchen',
            };
        }

        return {
            success: true,
            message: data.message,
        };
    } catch (error) {
        console.error('Send to kitchen error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.',
        };
    }
};

/**
 * Get order by ID from backend
 * GET /api/orders/:id
 */
export const getOrderByIdBackendApi = async (orderId: string): Promise<OrderResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.message || 'Order not found',
            };
        }

        return {
            success: true,
            order: mapBackendOrder(data),
        };
    } catch (error) {
        console.error('Get order by ID error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.',
        };
    }
};

/**
 * Clear all mock orders (for testing)
 */
export const clearMockOrders = (): void => {
    mockOrders = [];
};
