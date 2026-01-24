/**
 * Products Management Page
 * CRUD operations for restaurant products
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, X, Package } from 'lucide-react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import ConfirmDialog from '../../components/common/ConfirmDialog';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    cost: number;
    barcode?: string;
    icon: string;
    isActive: boolean;
}

interface Category {
    id: string;
    name: string;
}

// Mock data
const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Starters' },
    { id: 'cat-2', name: 'Main Course' },
    { id: 'cat-3', name: 'Drinks' },
    { id: 'cat-4', name: 'Desserts' },
    { id: 'cat-5', name: 'Sides' },
];

const mockProducts: Product[] = [
    { id: 'prod-1', name: 'Crispy Chicken Wings', category: 'cat-1', price: 249, cost: 120, icon: '🍗', isActive: true },
    { id: 'prod-2', name: 'Garlic Bread', category: 'cat-1', price: 149, cost: 50, icon: '🥖', isActive: true },
    { id: 'prod-3', name: 'Caesar Salad', category: 'cat-1', price: 199, cost: 80, icon: '🥗', isActive: true },
    { id: 'prod-4', name: 'Grilled Salmon', category: 'cat-2', price: 549, cost: 280, icon: '🐟', isActive: true },
    { id: 'prod-5', name: 'Butter Chicken', category: 'cat-2', price: 399, cost: 180, icon: '🍛', isActive: true },
    { id: 'prod-6', name: 'Margherita Pizza', category: 'cat-2', price: 349, cost: 140, icon: '🍕', isActive: true },
    { id: 'prod-7', name: 'Virgin Mojito', category: 'cat-3', price: 149, cost: 40, icon: '🍹', isActive: true },
    { id: 'prod-8', name: 'Cold Coffee', category: 'cat-3', price: 149, cost: 45, icon: '☕', isActive: true },
    { id: 'prod-9', name: 'Chocolate Brownie', category: 'cat-4', price: 179, cost: 70, icon: '🍫', isActive: true },
    { id: 'prod-10', name: 'French Fries', category: 'cat-5', price: 129, cost: 40, icon: '🍟', isActive: true },
];

const Products = () => {
    const [products, setProducts] = useState<Product[]>(mockProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        cost: '',
        barcode: '',
    });

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const getCategoryName = (categoryId: string) => {
        return mockCategories.find(c => c.id === categoryId)?.name || 'Unknown';
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCategoryName(product.category).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleNewClick = () => {
        setEditingProduct(null);
        setFormData({ name: '', category: '', price: '', cost: '', barcode: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price.toString(),
            cost: product.cost.toString(),
            barcode: product.barcode || '',
        });
        setIsModalOpen(true);
    };

    const handleDeleteClick = (productId: string) => {
        setDeleteId(productId);
        setConfirmOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (deleteId) {
            setProducts(products.filter(p => p.id !== deleteId));
            setDeleteId(null);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingProduct) {
            // Update existing
            setProducts(products.map(p =>
                p.id === editingProduct.id
                    ? { ...p, name: formData.name, category: formData.category, price: parseFloat(formData.price), cost: parseFloat(formData.cost), barcode: formData.barcode }
                    : p
            ));
        } else {
            // Create new
            const newProduct: Product = {
                id: `prod-${Date.now()}`,
                name: formData.name,
                category: formData.category,
                price: parseFloat(formData.price),
                cost: parseFloat(formData.cost),
                barcode: formData.barcode,
                icon: '📦',
                isActive: true,
            };
            setProducts([...products, newProduct]);
        }

        setIsModalOpen(false);
    };

    return (
        <AdminPageLayout
            title="Products"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onNewClick={handleNewClick}
            newButtonLabel="New Product"
        >
            <div className="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Cost</th>
                            <th>Status</th>
                            <th style={{ width: '100px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan={7}>
                                    <div className="admin-empty">
                                        <div className="admin-empty__icon"><Package size={48} /></div>
                                        <p className="admin-empty__text">No products found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredProducts.map((product) => (
                                <motion.tr
                                    key={product.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    layout
                                >
                                    <td>
                                        <div className="admin-table__image">{product.icon}</div>
                                    </td>
                                    <td><strong>{product.name}</strong></td>
                                    <td>{getCategoryName(product.category)}</td>
                                    <td>₹{product.price.toFixed(2)}</td>
                                    <td>₹{product.cost.toFixed(2)}</td>
                                    <td>
                                        <span className={`admin-badge ${product.isActive ? 'admin-badge--success' : 'admin-badge--neutral'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="admin-table__actions">
                                            <button
                                                className="admin-table__action-btn"
                                                onClick={() => handleEdit(product)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="admin-table__action-btn admin-table__action-btn--danger"
                                                onClick={() => handleDeleteClick(product.id)}
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

            {/* Product Modal */}
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
                                    {editingProduct ? 'Edit Product' : 'New Product'}
                                </h2>
                                <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="admin-modal__body">
                                    <div className="admin-form__group">
                                        <label className="admin-form__label">Product Name</label>
                                        <input
                                            type="text"
                                            className="admin-form__input"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="admin-form__group">
                                        <label className="admin-form__label">Category</label>
                                        <select
                                            className="admin-form__select"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {mockCategories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="admin-form__row">
                                        <div className="admin-form__group">
                                            <label className="admin-form__label">Price (₹)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="admin-form__input"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="admin-form__group">
                                            <label className="admin-form__label">Cost (₹)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                className="admin-form__input"
                                                value={formData.cost}
                                                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="admin-form__group">
                                        <label className="admin-form__label">Barcode (Optional)</label>
                                        <input
                                            type="text"
                                            className="admin-form__input"
                                            value={formData.barcode}
                                            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
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
                                        {editingProduct ? 'Update' : 'Create'}
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
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />
        </AdminPageLayout>
    );
};

export default Products;
