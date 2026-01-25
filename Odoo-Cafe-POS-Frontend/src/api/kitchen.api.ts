/**
 * Kitchen API - Real Backend Integration
 * Connects to backend endpoints for kitchen display system
 */

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('pos_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Backend order status enum
export type BackendOrderStatus = 'CREATED' | 'IN_PROGRESS' | 'READY' | 'COMPLETED';

// Frontend order status for display
export type KitchenOrderStatus = 'TO_COOK' | 'PREPARING' | 'COMPLETED';

// Map backend status to frontend status
export const mapBackendStatusToFrontend = (status: BackendOrderStatus): KitchenOrderStatus => {
    switch (status) {
        case 'CREATED':
            return 'TO_COOK';
        case 'IN_PROGRESS':
            return 'PREPARING';
        case 'READY':
        case 'COMPLETED':
            return 'COMPLETED';
        default:
            return 'TO_COOK';
    }
};

// Map frontend status to backend status (for transitions)
export const mapFrontendStatusToBackend = (status: KitchenOrderStatus): BackendOrderStatus => {
    switch (status) {
        case 'TO_COOK':
            return 'CREATED';
        case 'PREPARING':
            return 'IN_PROGRESS';
        case 'COMPLETED':
            return 'READY';
        default:
            return 'CREATED';
    }
};

// Backend order item structure
interface BackendOrderItem {
    id: string;
    quantity: number;
    unitPrice: string | number;
    totalPrice: string | number;
    notes?: string;
    product: {
        id: string;
        name: string;
        icon?: string;
        category?: {
            id: string;
            name: string;
        };
    };
}

// Backend order structure
interface BackendOrder {
    id: string;
    orderNumber: number;
    status: BackendOrderStatus;
    orderType: 'DINE_IN' | 'TAKEAWAY';
    totalAmount: string | number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    table?: {
        id: string;
        name: string;
    };
    creator?: {
        id: string;
        name: string;
        email: string;
    };
    orderItems: BackendOrderItem[];
}

// Frontend kitchen order item
export interface KitchenOrderItem {
    id: string;
    productName: string;
    quantity: number;
    isPrepared: boolean;
    category: string;
}

// Frontend kitchen order
export interface KitchenOrder {
    id: string;
    orderNumber: string;
    customerName: string;
    items: KitchenOrderItem[];
    status: KitchenOrderStatus;
    createdAt: string;
    tableName?: string;
    notes?: string;
}

// Map backend order to frontend kitchen order
const mapBackendOrderToKitchen = (order: BackendOrder): KitchenOrder => ({
    id: order.id,
    orderNumber: `#${order.orderNumber}`,
    customerName: order.table?.name || order.creator?.name || 'Walk-in',
    status: mapBackendStatusToFrontend(order.status),
    createdAt: order.createdAt,
    tableName: order.table?.name,
    notes: order.notes,
    items: order.orderItems.map(item => ({
        id: item.id,
        productName: item.product.name,
        quantity: item.quantity,
        isPrepared: false, // Backend doesn't track per-item prep status, managed locally
        category: item.product.category?.name || 'Other',
    })),
});

/**
 * Get all active orders for kitchen display
 * GET /api/kitchen/orders
 */
export const getKitchenOrders = async (): Promise<KitchenOrder[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/kitchen/orders`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error('Failed to fetch kitchen orders');
            return [];
        }

        const data = await response.json();
        const orders: BackendOrder[] = data.orders || data || [];

        return orders.map(mapBackendOrderToKitchen);
    } catch (error) {
        console.error('Get kitchen orders error:', error);
        return [];
    }
};

/**
 * Get ready orders (for serving)
 * GET /api/kitchen/ready
 */
export const getReadyOrders = async (): Promise<KitchenOrder[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/kitchen/ready`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error('Failed to fetch ready orders');
            return [];
        }

        const data = await response.json();
        const orders: BackendOrder[] = data.orders || data || [];

        return orders.map(mapBackendOrderToKitchen);
    } catch (error) {
        console.error('Get ready orders error:', error);
        return [];
    }
};

/**
 * Get all orders for kitchen (combines active + ready)
 */
export const getAllKitchenOrders = async (): Promise<KitchenOrder[]> => {
    try {
        const [activeOrders, readyOrders] = await Promise.all([
            getKitchenOrders(),
            getReadyOrders(),
        ]);

        return [...activeOrders, ...readyOrders];
    } catch (error) {
        console.error('Get all kitchen orders error:', error);
        return [];
    }
};

/**
 * Start cooking an order (CREATED -> IN_PROGRESS)
 * POST /api/kitchen/orders/:id/start
 */
export const startOrder = async (orderId: string): Promise<KitchenOrder | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/kitchen/orders/${encodeURIComponent(orderId)}/start`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to start order:', error.message);
            return null;
        }

        const data = await response.json();
        return mapBackendOrderToKitchen(data.order || data);
    } catch (error) {
        console.error('Start order error:', error);
        return null;
    }
};

/**
 * Mark order as ready (IN_PROGRESS -> READY)
 * POST /api/kitchen/orders/:id/ready
 */
export const markOrderReady = async (orderId: string): Promise<KitchenOrder | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/kitchen/orders/${encodeURIComponent(orderId)}/ready`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to mark order ready:', error.message);
            return null;
        }

        const data = await response.json();
        return mapBackendOrderToKitchen(data.order || data);
    } catch (error) {
        console.error('Mark order ready error:', error);
        return null;
    }
};

/**
 * Update order status
 * PATCH /api/kitchen/orders/:id/status
 */
export const updateOrderStatus = async (orderId: string, newStatus: BackendOrderStatus): Promise<KitchenOrder | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/kitchen/orders/${encodeURIComponent(orderId)}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to update order status:', error.message);
            return null;
        }

        const data = await response.json();
        return mapBackendOrderToKitchen(data.order || data);
    } catch (error) {
        console.error('Update order status error:', error);
        return null;
    }
};

/**
 * Advance order to next status (for one-click workflow)
 * TO_COOK -> PREPARING -> COMPLETED
 */
export const advanceOrderStatus = async (order: KitchenOrder): Promise<KitchenOrder | null> => {
    switch (order.status) {
        case 'TO_COOK':
            return startOrder(order.id);
        case 'PREPARING':
            return markOrderReady(order.id);
        case 'COMPLETED':
            // Already completed, no further action
            return order;
        default:
            return null;
    }
};
