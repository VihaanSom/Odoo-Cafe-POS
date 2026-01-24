/**
 * Orders Management Page
 * View completed orders with receipt details
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Receipt, Printer } from 'lucide-react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    orderNumber: string;
    table: string;
    orderType: 'DINE_IN' | 'TAKEAWAY';
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
    paymentMethod: string;
    createdAt: string;
    customerName?: string;
}

// Mock data
const mockOrders: Order[] = [
    {
        id: 'order-1001',
        orderNumber: '#1001',
        table: 'T-02',
        orderType: 'DINE_IN',
        items: [
            { name: 'Butter Chicken', quantity: 2, price: 399 },
            { name: 'Naan Bread', quantity: 4, price: 59 },
            { name: 'Cold Coffee', quantity: 2, price: 149 },
        ],
        subtotal: 1132,
        tax: 56.60,
        total: 1188.60,
        status: 'COMPLETED',
        paymentMethod: 'UPI',
        createdAt: '2026-01-24T20:30:00',
    },
    {
        id: 'order-1002',
        orderNumber: '#1002',
        table: 'P-01',
        orderType: 'DINE_IN',
        items: [
            { name: 'Grilled Salmon', quantity: 1, price: 549 },
            { name: 'Caesar Salad', quantity: 1, price: 199 },
        ],
        subtotal: 748,
        tax: 37.40,
        total: 785.40,
        status: 'COMPLETED',
        paymentMethod: 'CARD',
        createdAt: '2026-01-24T19:45:00',
    },
    {
        id: 'order-1003',
        orderNumber: '#1003',
        table: '-',
        orderType: 'TAKEAWAY',
        customerName: 'Rahul',
        items: [
            { name: 'Margherita Pizza', quantity: 2, price: 349 },
            { name: 'French Fries', quantity: 2, price: 129 },
        ],
        subtotal: 956,
        tax: 47.80,
        total: 1003.80,
        status: 'COMPLETED',
        paymentMethod: 'CASH',
        createdAt: '2026-01-24T18:20:00',
    },
    {
        id: 'order-1004',
        orderNumber: '#1004',
        table: 'T-06',
        orderType: 'DINE_IN',
        items: [
            { name: 'Crispy Chicken Wings', quantity: 2, price: 249 },
        ],
        subtotal: 498,
        tax: 24.90,
        total: 522.90,
        status: 'CANCELLED',
        paymentMethod: '-',
        createdAt: '2026-01-24T17:15:00',
    },
];

const Orders = () => {
    const [orders] = useState<Order[]>(mockOrders);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const filteredOrders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.table.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'COMPLETED':
                return 'admin-badge--success';
            case 'CANCELLED':
                return 'admin-badge--danger';
            case 'REFUNDED':
                return 'admin-badge--warning';
            default:
                return 'admin-badge--neutral';
        }
    };

    return (
        <AdminPageLayout
            title="Orders"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            showNewButton={false}
        >
            <div className="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Order #</th>
                            <th>Type</th>
                            <th>Table</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th style={{ width: '80px' }}>View</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={9}>
                                    <div className="admin-empty">
                                        <div className="admin-empty__icon"><Receipt size={48} /></div>
                                        <p className="admin-empty__text">No orders found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredOrders.map((order) => (
                                <motion.tr
                                    key={order.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    layout
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <td><strong>{order.orderNumber}</strong></td>
                                    <td>
                                        <span className={`admin-badge ${order.orderType === 'DINE_IN' ? 'admin-badge--info' : 'admin-badge--neutral'}`}>
                                            {order.orderType === 'DINE_IN' ? 'Dine In' : 'Takeaway'}
                                        </span>
                                    </td>
                                    <td>{order.table}</td>
                                    <td>{order.items.length} items</td>
                                    <td><strong>₹{order.total.toFixed(2)}</strong></td>
                                    <td>{order.paymentMethod}</td>
                                    <td>
                                        <span className={`admin-badge ${getStatusBadge(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>
                                        <button
                                            className="admin-table__action-btn"
                                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                                            title="View Receipt"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Order Receipt Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        className="admin-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            className="admin-modal"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: '400px' }}
                        >
                            <div className="admin-modal__header">
                                <h2 className="admin-modal__title">Order Receipt</h2>
                                <button className="admin-modal__close" onClick={() => setSelectedOrder(null)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="admin-modal__body" style={{ fontFamily: 'monospace' }}>
                                <div style={{ textAlign: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed #ddd' }}>
                                    <h3 style={{ margin: 0 }}>Odoo Cafe</h3>
                                    <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>123 Main St, City</p>
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}>{formatDate(selectedOrder.createdAt)}</p>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <p><strong>Order:</strong> {selectedOrder.orderNumber}</p>
                                    <p><strong>Type:</strong> {selectedOrder.orderType === 'DINE_IN' ? `Dine In - ${selectedOrder.table}` : 'Takeaway'}</p>
                                    {selectedOrder.customerName && <p><strong>Customer:</strong> {selectedOrder.customerName}</p>}
                                </div>

                                <div style={{ borderTop: '1px dashed #ddd', borderBottom: '1px dashed #ddd', padding: '1rem 0', marginBottom: '1rem' }}>
                                    {selectedOrder.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span>Subtotal</span>
                                        <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span>Tax (5%)</span>
                                        <span>₹{selectedOrder.tax.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #ddd' }}>
                                        <span>Total</span>
                                        <span>₹{selectedOrder.total.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#666' }}>
                                        <span>Payment</span>
                                        <span>{selectedOrder.paymentMethod}</span>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#666', fontSize: '0.85rem' }}>
                                    <p style={{ margin: 0 }}>Thank you for dining with us!</p>
                                </div>
                            </div>

                            <div className="admin-modal__footer">
                                <button className="admin-btn admin-btn--secondary" onClick={() => setSelectedOrder(null)}>
                                    Close
                                </button>
                                <button className="admin-btn admin-btn--primary">
                                    <Printer size={16} />
                                    Print
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminPageLayout>
    );
};

export default Orders;
