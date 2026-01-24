/**
 * Customers Management Page
 * CRUD operations for customer records
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, X, Users } from 'lucide-react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';

interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    totalSales: number;
    createdAt: string;
}

// Mock data
const mockCustomers: Customer[] = [
    { id: 'cust-1', name: 'Rahul Sharma', phone: '+91 98765 43210', email: 'rahul@email.com', totalSales: 4520, createdAt: '2026-01-15' },
    { id: 'cust-2', name: 'Priya Patel', phone: '+91 87654 32109', email: 'priya.p@email.com', totalSales: 8960, createdAt: '2026-01-10' },
    { id: 'cust-3', name: 'Amit Kumar', phone: '+91 76543 21098', email: 'amit.k@email.com', totalSales: 1250, createdAt: '2026-01-20' },
    { id: 'cust-4', name: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha.r@email.com', totalSales: 15800, createdAt: '2025-12-05' },
    { id: 'cust-5', name: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram.s@email.com', totalSales: 350, createdAt: '2026-01-22' },
];

const Customers = () => {
    const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

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

    const handleDeleteClick = (customerId: string) => {
        setDeleteId(customerId);
        setConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (deleteId) {
            setCustomers(customers.filter(c => c.id !== deleteId));
            setDeleteId(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCustomer) {
            setCustomers(customers.map(c =>
                c.id === editingCustomer.id
                    ? { ...c, name: formData.name, phone: formData.phone, email: formData.email }
                    : c
            ));
        } else {
            const newCustomer: Customer = {
                id: `cust-${Date.now()}`,
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                totalSales: 0,
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
                            <th>Total Sales</th>
                            <th style={{ width: '100px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length === 0 ? (
                            <tr>
                                <td colSpan={5}>
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
                                    <td>{customer.email}</td>
                                    <td><strong>₹{customer.totalSales.toLocaleString()}</strong></td>
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
                                                onClick={() => handleDeleteClick(customer.id)}
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
                                        <label className="admin-form__label">Email</label>
                                        <input
                                            type="email"
                                            className="admin-form__input"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="email@example.com"
                                            required
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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
                type="delete"
                title="Delete Customer"
                message="Are you sure you want to delete this customer? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />
        </AdminPageLayout>
    );
};

export default Customers;
