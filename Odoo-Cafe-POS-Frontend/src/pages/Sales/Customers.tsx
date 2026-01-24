/**
 * Customers Management Page
 * CRUD operations for customer records
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, X, Users } from 'lucide-react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';

interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    points: number;
    totalOrders: number;
    createdAt: string;
}

// Mock data
const mockCustomers: Customer[] = [
    { id: 'cust-1', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@email.com', points: 250, totalOrders: 12, createdAt: '2026-01-15' },
    { id: 'cust-2', name: 'Priya Patel', phone: '+91 87654 32109', email: 'priya.p@email.com', points: 480, totalOrders: 24, createdAt: '2026-01-10' },
    { id: 'cust-3', name: 'Amit Kumar', phone: '+91 76543 21098', points: 120, totalOrders: 6, createdAt: '2026-01-20' },
    { id: 'cust-4', name: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha.r@email.com', points: 890, totalOrders: 45, createdAt: '2025-12-05' },
    { id: 'cust-5', name: 'Vikram Singh', phone: '+91 54321 09876', points: 50, totalOrders: 2, createdAt: '2026-01-22' },
];

const Customers = () => {
    const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleNewClick = () => {
        setEditingCustomer(null);
        setFormData({ name: '', phone: '', email: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (customer: Customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
        });
        setIsModalOpen(true);
    };

    const handleDelete = (customerId: string) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            setCustomers(customers.filter(c => c.id !== customerId));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCustomer) {
            setCustomers(customers.map(c =>
                c.id === editingCustomer.id
                    ? { ...c, name: formData.name, phone: formData.phone, email: formData.email || undefined }
                    : c
            ));
        } else {
            const newCustomer: Customer = {
                id: `cust-${Date.now()}`,
                name: formData.name,
                phone: formData.phone,
                email: formData.email || undefined,
                points: 0,
                totalOrders: 0,
                createdAt: new Date().toISOString().split('T')[0],
            };
            setCustomers([...customers, newCustomer]);
        }

        setIsModalOpen(false);
    };

    return (
        <AdminPageLayout
            title="Customers"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onNewClick={handleNewClick}
            newButtonLabel="New Customer"
        >
            <div className="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Email</th>
                            <th>Points</th>
                            <th>Orders</th>
                            <th style={{ width: '100px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={6}>
                                    <div className="admin-empty">
                                        <div className="admin-empty__icon"><Users size={48} /></div>
                                        <p className="admin-empty__text">No customers found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredCustomers.map((customer) => (
                                <motion.tr
                                    key={customer.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    layout
                                >
                                    <td><strong>{customer.name}</strong></td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.email || '-'}</td>
                                    <td>
                                        <span className="admin-badge admin-badge--success">
                                            {customer.points} pts
                                        </span>
                                    </td>
                                    <td>{customer.totalOrders}</td>
                                    <td>
                                        <div className="admin-table__actions">
                                            <button
                                                className="admin-table__action-btn"
                                                onClick={() => handleEdit(customer)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="admin-table__action-btn admin-table__action-btn--danger"
                                                onClick={() => handleDelete(customer.id)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Customer Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        className="admin-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            className="admin-modal"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="admin-modal__header">
                                <h2 className="admin-modal__title">
                                    {editingCustomer ? 'Edit Customer' : 'New Customer'}
                                </h2>
                                <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="admin-modal__body">
                                    <div className="admin-form__group">
                                        <label className="admin-form__label">Full Name</label>
                                        <input
                                            type="text"
                                            className="admin-form__input"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., John Doe"
                                            required
                                        />
                                    </div>

                                    <div className="admin-form__group">
                                        <label className="admin-form__label">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="admin-form__input"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="+91 98765 43210"
                                            required
                                        />
                                    </div>

                                    <div className="admin-form__group">
                                        <label className="admin-form__label">Email (Optional)</label>
                                        <input
                                            type="email"
                                            className="admin-form__input"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="admin-modal__footer">
                                    <button
                                        type="button"
                                        className="admin-btn admin-btn--secondary"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="admin-btn admin-btn--primary">
                                        {editingCustomer ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminPageLayout>
    );
};

export default Customers;
