/**
 * Orders Management Page
 * Backend view with bulk selection and action buttons
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, Receipt, Archive, Trash2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';

interface OrderItem {
    name: string;
    quantity: number;
    price: number;
}

interface Order {
    id: string;
    orderNumber: string;
    session: string;
    date: string;
    total: number;
    customer: string;
    status: 'COMPLETED' | 'DRAFT' | 'ARCHIVED';
    table: string;
    orderType: 'DINE_IN' | 'TAKEAWAY';
    items: OrderItem[];
    subtotal: number;
    tax: number;
    paymentMethod: string;
}

// Mock data
const mockOrders: Order[] = [
    {
        id: 'order-1',
        orderNumber: '001',
        session: '01',
        date: '5 Jan 2026',
        total: 350,
        customer: 'Eric',
        status: 'COMPLETED',
        table: 'T-02',
        orderType: 'DINE_IN',
        items: [
            { name: 'Butter Chicken', quantity: 2, price: 150 },
            { name: 'Naan Bread', quantity: 2, price: 25 },
        ],
        subtotal: 350,
        tax: 17.50,
        paymentMethod: 'UPI',
    },
    {
        id: 'order-2',
        orderNumber: '002',
        session: '01',
        date: '5 Jan 2026',
        total: 350,
        customer: 'Smith',
        status: 'DRAFT',
        table: 'T-03',
        orderType: 'DINE_IN',
        items: [
            { name: 'Pizza', quantity: 1, price: 350 },
        ],
        subtotal: 350,
        tax: 17.50,
        paymentMethod: '-',
    },
    {
        id: 'order-3',
        orderNumber: '003',
        session: '01',
        date: '5 Jan 2026',
        total: 350,
        customer: 'Jacob',
        status: 'COMPLETED',
        table: 'P-01',
        orderType: 'DINE_IN',
        items: [
            { name: 'Grilled Salmon', quantity: 1, price: 350 },
        ],
        subtotal: 350,
        tax: 17.50,
        paymentMethod: 'CARD',
    },
    {
        id: 'order-4',
        orderNumber: '004',
        session: '02',
        date: '6 Jan 2026',
        total: 520,
        customer: 'Altruistic Cormorant',
        status: 'ARCHIVED',
        table: '-',
        orderType: 'TAKEAWAY',
        items: [
            { name: 'Combo Meal', quantity: 2, price: 260 },
        ],
        subtotal: 520,
        tax: 26,
        paymentMethod: 'CASH',
    },
];

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>(mockOrders);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmType, setConfirmType] = useState<'delete' | 'archive'>('delete');

    // Filter based on search
    const filteredOrders = orders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Selection handlers
    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === filteredOrders.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredOrders.map(o => o.id));
        }
    };

    // Bulk actions
    const handleArchiveClick = () => {
        if (selectedIds.length === 0) return;
        setConfirmType('archive');
        setConfirmOpen(true);
    };

    const handleDeleteClick = () => {
        if (selectedIds.length === 0) return;
        setConfirmType('delete');
        setConfirmOpen(true);
    };

    const handleConfirm = () => {
        if (confirmType === 'archive') {
            setOrders(prev => prev.map(o =>
                selectedIds.includes(o.id) ? { ...o, status: 'ARCHIVED' as const } : o
            ));
        } else {
            setOrders(prev => prev.filter(o => !selectedIds.includes(o.id)));
        }
        setSelectedIds([]);
    };

    const getStatusBadge = (status: Order['status']) => {
        switch (status) {
            case 'COMPLETED':
                return 'admin-badge--success';
            case 'DRAFT':
                return 'admin-badge--warning';
            case 'ARCHIVED':
                return 'admin-badge--neutral';
            default:
                return 'admin-badge--neutral';
        }
    };

    const hasSelection = selectedIds.length > 0;

    const handleDownloadReceipt = async () => {
        if (!selectedOrder) return;

        try {
            const receiptElement = document.getElementById('receipt-content');
            if (!receiptElement) return;

            const canvas = await html2canvas(receiptElement, {
                scale: 2, // Higher scale for better quality
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdfWidth = 80; // mm (Standard receipt width)
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            const pdf = new jsPDF({
                orientation: pdfHeight > pdfWidth ? 'p' : 'l',
                unit: 'mm',
                format: [pdfWidth, pdfHeight]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Receipt-${selectedOrder.orderNumber}.pdf`);
        } catch (error) {
            console.error('Failed to download receipt:', error);
        }
    };

    return (
        <AdminPageLayout
            title="Orders"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            showNewButton={false}
        >
            <div className="orders-page">
                {/* Selection Actions */}
                {hasSelection && (
                    <motion.div
                        className="orders-actions"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="orders-actions__count">✕ {selectedIds.length} Selected</span>
                        <button className="orders-actions__btn" onClick={handleArchiveClick}>
                            <Archive size={14} />
                            Archived
                        </button>
                        <button className="orders-actions__btn orders-actions__btn--danger" onClick={handleDeleteClick}>
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </motion.div>
                )}

                {/* Orders Table */}
                <div className="admin-table">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={selectAll}
                                    />
                                </th>
                                <th>Order No</th>
                                <th>Session</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th style={{ width: '60px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
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
                                        className={selectedIds.includes(order.id) ? 'row-selected' : ''}
                                    >
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(order.id)}
                                                onChange={() => toggleSelect(order.id)}
                                            />
                                        </td>
                                        <td><strong>{order.orderNumber}</strong></td>
                                        <td>{order.session}</td>
                                        <td>{order.date}</td>
                                        <td><strong>₹{order.total}</strong></td>
                                        <td>{order.customer}</td>
                                        <td>
                                            <span className={`admin-badge ${getStatusBadge(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="admin-table__action-btn"
                                                onClick={() => setSelectedOrder(order)}
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

                            <div className="admin-modal__body" id="receipt-content" style={{ fontFamily: 'monospace', padding: '20px', backgroundColor: 'white' }}>
                                <div style={{ textAlign: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px dashed #ddd' }}>
                                    <h3 style={{ margin: 0 }}>Odoo Cafe</h3>
                                    <p style={{ margin: '0.25rem 0', color: '#666', fontSize: '0.85rem' }}>123 Main St, City</p>
                                    <p style={{ margin: 0, fontSize: '0.85rem' }}>{selectedOrder.date}</p>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <p><strong>Order:</strong> #{selectedOrder.orderNumber}</p>
                                    <p><strong>Session:</strong> {selectedOrder.session}</p>
                                    <p><strong>Customer:</strong> {selectedOrder.customer}</p>
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
                                        <span>₹{selectedOrder.total}</span>
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
                                <button className="admin-btn admin-btn--primary" onClick={handleDownloadReceipt}>
                                    <Download size={16} />
                                    Download PDF
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .orders-page {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .orders-actions {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    background: #1F2937;
                    border-radius: 8px;
                    width: fit-content;
                }

                .orders-actions__count {
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 500;
                    padding-right: 0.75rem;
                    border-right: 1px solid #4B5563;
                }

                .orders-actions__btn {
                    padding: 0.5rem 0.85rem;
                    border-radius: 6px;
                    border: none;
                    background: #374151;
                    color: white;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                }

                .orders-actions__btn:hover {
                    background: #4B5563;
                }

                .orders-actions__btn--danger {
                    background: #DC2626;
                }

                .orders-actions__btn--danger:hover {
                    background: #B91C1C;
                }

                .admin-table input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    cursor: pointer;
                    accent-color: var(--primary-color);
                }

                .admin-table tbody tr.row-selected {
                    background: #E0F2F1 !important;
                }

                .admin-table tbody tr.row-selected:hover {
                    background: #B2DFDB !important;
                }
            `}</style>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirm}
                type={confirmType}
                title={confirmType === 'delete' ? 'Delete Orders' : 'Archive Orders'}
                message={confirmType === 'delete'
                    ? `Are you sure you want to delete ${selectedIds.length} order(s)? This action cannot be undone.`
                    : `Are you sure you want to archive ${selectedIds.length} order(s)?`
                }
                confirmLabel={confirmType === 'delete' ? 'Delete' : 'Archive'}
                cancelLabel="Cancel"
            />
        </AdminPageLayout>
    );
};

export default Orders;
