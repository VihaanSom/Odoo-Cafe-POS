/**
 * Payments Management Page
 * View all payment transactions with filter by payment method
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard } from 'lucide-react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import { getPaymentsApi, type PaymentRecord as Payment } from '../../api/payments.api';

type FilterType = 'ALL' | 'CASH' | 'UPI' | 'CARD';

const Payments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');

    useEffect(() => {
        const fetchPayments = async () => {
            setIsLoading(true);
            try {
                const data = await getPaymentsApi();
                setPayments(data);
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPayments();
    }, []);

    // Apply filter and search
    const filteredPayments = payments.filter(payment => {
        // First apply method filter
        if (activeFilter !== 'ALL' && payment.method !== activeFilter) {
            return false;
        }
        // Then apply search
        return (
            payment.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.transactionRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.method.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

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
            {/* Summary Cards - Clickable Filters */}
            <div className="payment-cards">
                <button
                    className={`payment-card ${activeFilter === 'ALL' ? 'payment-card--active' : ''}`}
                    onClick={() => setActiveFilter('ALL')}
                >
                    <p className="payment-card__label">Total Collections</p>
                    <p className="payment-card__amount">₹{totalAmount.toFixed(2)}</p>
                </button>
                <button
                    className={`payment-card ${activeFilter === 'CASH' ? 'payment-card--active' : ''}`}
                    onClick={() => setActiveFilter('CASH')}
                >
                    <p className="payment-card__label">💵 Cash</p>
                    <p className="payment-card__amount payment-card__amount--cash">₹{cashTotal.toFixed(2)}</p>
                </button>
                <button
                    className={`payment-card ${activeFilter === 'UPI' ? 'payment-card--active' : ''}`}
                    onClick={() => setActiveFilter('UPI')}
                >
                    <p className="payment-card__label">📱 UPI</p>
                    <p className="payment-card__amount payment-card__amount--upi">₹{upiTotal.toFixed(2)}</p>
                </button>
                <button
                    className={`payment-card ${activeFilter === 'CARD' ? 'payment-card--active' : ''}`}
                    onClick={() => setActiveFilter('CARD')}
                >
                    <p className="payment-card__label">💳 Card</p>
                    <p className="payment-card__amount payment-card__amount--card">₹{cardTotal.toFixed(2)}</p>
                </button>
            </div>

            {/* Active Filter Indicator */}
            {activeFilter !== 'ALL' && (
                <div className="payment-filter-indicator">
                    Showing: <strong>{activeFilter}</strong> payments
                    <button onClick={() => setActiveFilter('ALL')}>Clear filter</button>
                </div>
            )}

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
                        {isLoading ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="admin-empty">
                                        <p className="admin-empty__text">Loading payments...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredPayments.length === 0 ? (
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

            <style>{`
                .payment-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .payment-card {
                    background: white;
                    padding: 1.25rem;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                }

                .payment-card:hover {
                    border-color: var(--primary-color);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .payment-card--active {
                    border-color: var(--primary-color);
                    background: #E0F2F1;
                }

                .payment-card__label {
                    color: #6B7280;
                    font-size: 0.85rem;
                    margin: 0;
                }

                .payment-card__amount {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0.25rem 0 0;
                    color: #111827;
                }

                .payment-card__amount--cash {
                    color: #16A34A;
                }

                .payment-card__amount--upi {
                    color: #2563EB;
                }

                .payment-card__amount--card {
                    color: #CA8A04;
                }

                .payment-filter-indicator {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.5rem 1rem;
                    background: #E0F2F1;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    font-size: 0.9rem;
                    color: #00695C;
                }

                .payment-filter-indicator button {
                    margin-left: auto;
                    padding: 0.25rem 0.75rem;
                    border-radius: 6px;
                    border: 1px solid #00897B;
                    background: transparent;
                    color: #00897B;
                    font-size: 0.8rem;
                    cursor: pointer;
                }

                .payment-filter-indicator button:hover {
                    background: #00897B;
                    color: white;
                }
            `}</style>
        </AdminPageLayout>
    );
};

export default Payments;
