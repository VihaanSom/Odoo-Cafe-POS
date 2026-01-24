// Error messages
const MESSAGES = {
    USER_NOT_FOUND: 'User not found',
    INVALID_PASSWORD: 'Invalid password',
    USER_ALREADY_EXISTS: 'User already exists',
    SESSION_NOT_FOUND: 'Session not found',
    SESSION_ALREADY_CLOSED: 'Session is already closed',
    ORDER_NOT_FOUND: 'Order not found',
    PRODUCT_NOT_FOUND: 'Product not found',
    TABLE_NOT_FOUND: 'Table not found',
    INVALID_STATUS_TRANSITION: 'Invalid status transition',
    TABLE_ID_REQUIRED: 'Table ID is required for dine-in orders',
};

// Order status enum (matches Prisma schema)
const ORDER_STATUS = {
    CREATED: 'CREATED',
    IN_PROGRESS: 'IN_PROGRESS',
    READY: 'READY',
    COMPLETED: 'COMPLETED',
};

// Order type enum
const ORDER_TYPE = {
    DINE_IN: 'DINE_IN',
    TAKEAWAY: 'TAKEAWAY',
};

// Table status enum
const TABLE_STATUS = {
    FREE: 'FREE',
    OCCUPIED: 'OCCUPIED',
};

// Payment method enum
const PAYMENT_METHOD = {
    CASH: 'CASH',
    CARD: 'CARD',
    UPI: 'UPI',
};

// Payment status enum
const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
};

module.exports = {
    MESSAGES,
    ORDER_STATUS,
    ORDER_TYPE,
    TABLE_STATUS,
    PAYMENT_METHOD,
    PAYMENT_STATUS,
};
