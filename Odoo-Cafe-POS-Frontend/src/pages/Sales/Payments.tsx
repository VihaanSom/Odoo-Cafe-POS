/**
 * Payments Management Page
 * View all payment transactions
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';

interface Payment {
    id: string;
    orderId: string;
    orderNumber: string;
    method: 'CASH' | 'UPI' | 'CARD';
    amount: number;
    transactionRef?: string;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    createdAt: string;
}

// Mock data
const mockPayments: Payment[] = [
    { id: 'pay-1', orderId: 'order-1001', orderNumber: '#1001', method: 'UPI', amount: 1188.60, transactionRef: 'UPI-78945612', status: 'COMPLETED', createdAt: '2026-01-24T20:32:00' },
    { id: 'pay-2', orderId: 'order-1002', orderNumber: '#1002', method: 'CARD', amount: 785.40, transactionRef: 'TXN-456123789', status: 'COMPLETED', createdAt: '2026-01-24T19:48:00' },
    { id: 'pay-3', orderId: 'order-1003', orderNumber: '#1003', method: 'CASH', amount: 1003.80, status: 'COMPLETED', createdAt: '2026-01-24T18:25:00' },
    { id: 'pay-4', orderId: 'order-1005', orderNumber: '#1005', method: 'UPI', amount: 450.00, transactionRef: 'UPI-11223344', status: 'COMPLETED', createdAt: '2026-01-24T16:10:00' },
    { id: 'pay-5', orderId: 'order-1006', orderNumber: '#1006', method: 'CARD', amount: 875.25, transactionRef: 'TXN-987654321', status: 'COMPLETED', createdAt: '2026-01-24T15:45:00' },
    { id: 'pay-6', orderId: 'order-1007', orderNumber: '#1007', method: 'CASH', amount: 299.00, status: 'COMPLETED', createdAt: '2026-01-24T14:30:00' },
];

const Payments = () => {
    const [payments] = useState<Payment[]>(mockPayments);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPayments = payments.filter(payment =>
        payment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.transactionRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.method.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getMethodBadge = (method: Payment['method']) => {
        switch (method) {
            case 'CASH':
                return 'admin-badge--success';
            case 'UPI':
                return 'admin-badge--info';
            case 'CARD':
                return 'admin-badge--warning';
            default:
                return 'admin-badge--neutral';
        }
    };

    const getStatusBadge = (status: Payment['status']) => {
        switch (status) {
            case 'COMPLETED':
                return 'admin-badge--success';
            case 'PENDING':
                return 'admin-badge--warning';
            case 'FAILED':
                return 'admin-badge--danger';
            default:
                return 'admin-badge--neutral';
        }
    };

    // Calculate totals
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const cashTotal = payments.filter(p => p.method === 'CASH').reduce((sum, p) => sum + p.amount, 0);
    const upiTotal = payments.filter(p => p.method === 'UPI').reduce((sum, p) => sum + p.amount, 0);
    const cardTotal = payments.filter(p => p.method === 'CARD').reduce((sum, p) => sum + p.amount, 0);

    return (
        <AdminPageLayout
            title="Payments"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            showNewButton={false}
        >
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>Total Collections</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0', color: '#111827' }}>₹{totalAmount.toFixed(2)}</p>
                </div>
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>💵 Cash</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0', color: '#16A34A' }}>₹{cashTotal.toFixed(2)}</p>
                </div>
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>📱 UPI</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0', color: '#2563EB' }}>₹{upiTotal.toFixed(2)}</p>
                </div>
                <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>💳 Card</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.25rem 0 0', color: '#CA8A04' }}>₹{cardTotal.toFixed(2)}</p>
                </div>
            </div>

            <div className="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Order Ref</th>
                            <th>Method</th>
                            <th>Transaction ID</th>
                            <th>Amount</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPayments.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="admin-empty">
                                        <div className="admin-empty__icon"><CreditCard size={48} /></div>
                                        <p className="admin-empty__text">No payments found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredPayments.map((payment) => (
                                <motion.tr
                                    key={payment.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    layout
                                >
                                    <td>{formatDate(payment.createdAt)}</td>
                                    <td><strong>{payment.orderNumber}</strong></td>
                                    <td>
                                        <span className={`admin-badge ${getMethodBadge(payment.method)}`}>
                                            {payment.method}
                                        </span>
                                    </td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                        {payment.transactionRef || '-'}
                                    </td>
                                    <td><strong>₹{payment.amount.toFixed(2)}</strong></td>
                                    <td>
                                        <span className={`admin-badge ${getStatusBadge(payment.status)}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminPageLayout>
    );
};

export default Payments;
