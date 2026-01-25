/**
 * Product List Page
 * CRUD operations for restaurant products with bulk actions
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Archive, Trash2, X, Package, ArrowLeft } from 'lucide-react';
import {
    type Product,
    getAllProducts,
    archiveProducts,
    deleteProducts,
} from '../../api/products.api';
import {
    type Category,
    getCategories,
} from '../../api/categories.api';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmType, setConfirmType] = useState<'delete' | 'archive'>('delete');

    // Load products and categories
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                getAllProducts(),
                getCategories(),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            setIsLoading(false);
        };
        loadData();
    }, []);

    const getCategoryName = (categoryId: string) => {
        return categories.find(c => c.id === categoryId)?.name || 'Unknown';
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getCategoryName(product.categoryId).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelect = (productId: string) => {
        setSelectedIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === filteredProducts.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredProducts.map(p => p.id));
        }
    };

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

    const handleConfirm = async () => {
        if (confirmType === 'archive') {
            await archiveProducts(selectedIds);
            setProducts(prev => prev.map(p =>
                selectedIds.includes(p.id) ? { ...p, status: 'archived' as const, isActive: false } : p
            ));
        } else {
            await deleteProducts(selectedIds);
            setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
        }
        setSelectedIds([]);
    };

    const handleNewProduct = () => {
        navigate('/dashboard/products/new');
    };

    const handleEditProduct = (productId: string) => {
        navigate(`/dashboard/products/${productId}`);
    };

    const hasSelection = selectedIds.length > 0;

    return (
        <div className="product-list-page">
            {/* Custom Header with Action Bar */}
            <header className="product-list__header">
                <div className="product-list__header-left">
                    <button
                        className="product-list__back"
                        onClick={() => navigate('/dashboard/settings')}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="product-list__title">Products</h1>
                </div>

                {hasSelection ? (
                    <motion.div
                        className="product-list__action-bar"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="product-list__selected-count">
                            {selectedIds.length} selected
                        </span>
                        <button
                            className="product-list__action-btn product-list__action-btn--archive"
                            onClick={handleArchiveClick}
                        >
                            <Archive size={16} />
                            Archive
                        </button>
                        <button
                            className="product-list__action-btn product-list__action-btn--delete"
                            onClick={handleDeleteClick}
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                        <button
                            className="product-list__action-btn"
                            onClick={() => setSelectedIds([])}
                        >
                            <X size={16} />
                            Clear
                        </button>
                    </motion.div>
                ) : (
                    <div className="product-list__header-actions">
                        <div className="product-list__search">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            className="product-list__new-btn"
                            onClick={handleNewProduct}
                        >
                            <Plus size={18} />
                            New Product
                        </button>
                    </div>
                )}
            </header>

            {/* Products Table */}
            <main className="product-list__content">
                {isLoading ? (
                    <div className="product-list__loading">Loading products...</div>
                ) : (
                    <div className="admin-table">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                                            onChange={selectAll}
                                            className="product-list__checkbox"
                                        />
                                    </th>
                                    <th style={{ width: '60px' }}>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Tax</th>
                                    <th>Status</th>
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
                                            className={selectedIds.includes(product.id) ? 'product-list__row--selected' : ''}
                                            onClick={() => handleEditProduct(product.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(product.id)}
                                                    onChange={() => toggleSelect(product.id)}
                                                    className="product-list__checkbox"
                                                />
                                            </td>
                                            <td>
                                                <div className="admin-table__image">
                                                    {product.icon?.startsWith('http') ? (
                                                        <img src={product.icon} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} />
                                                    ) : (
                                                        product.icon || '📦'
                                                    )}
                                                </div>
                                            </td>
                                            <td><strong>{product.name}</strong></td>
                                            <td>{getCategoryName(product.categoryId)}</td>
                                            <td>₹{product.price.toFixed(2)}</td>
                                            <td>
                                                <span className="admin-badge admin-badge--info">
                                                    {product.taxes.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`admin-badge ${product.status === 'active' ? 'admin-badge--success' : 'admin-badge--neutral'}`}>
                                                    {product.status === 'active' ? 'Active' : 'Archived'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            <style>{`
                .product-list-page {
                    min-height: 100vh;
                    background: var(--bg-color);
                }

                .product-list__header {
                    background: var(--card-bg);
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border-light);
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .product-list__header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .product-list__back {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    border: 1px solid var(--border-light);
                    background: var(--card-bg);
                    font-size: 1.2rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .product-list__back:hover {
                    background: var(--bg-color);
                }

                .product-list__title {
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .product-list__header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .product-list__search input {
                    padding: 0.65rem 1rem;
                    border: 1px solid var(--border-light);
                    border-radius: 8px;
                    width: 280px;
                    font-size: 0.9rem;
                }

                .product-list__search input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                }

                .product-list__new-btn {
                    padding: 0.65rem 1.25rem;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: none;
                    background: #009688;
                    color: white;
                }

                .product-list__new-btn:hover {
                    background: #00796B;
                }

                .product-list__action-bar {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    background: #1F2937;
                    padding: 0.5rem 1rem;
                    border-radius: 10px;
                }

                .product-list__selected-count {
                    color: white;
                    font-size: 0.9rem;
                    font-weight: 600;
                    padding-right: 0.75rem;
                    border-right: 1px solid #4B5563;
                }

                .product-list__action-btn {
                    padding: 0.5rem 0.75rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    border: none;
                    background: #374151;
                    color: white;
                }

                .product-list__action-btn:hover {
                    background: #4B5563;
                }

                .product-list__action-btn--archive {
                    background: #D97706;
                }

                .product-list__action-btn--archive:hover {
                    background: #B45309;
                }

                .product-list__action-btn--delete {
                    background: #DC2626;
                }

                .product-list__action-btn--delete:hover {
                    background: #B91C1C;
                }

                .product-list__content {
                    padding: 2rem;
                }

                .product-list__loading {
                    text-align: center;
                    padding: 4rem;
                    color: var(--text-muted);
                }

                .product-list__checkbox {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: var(--primary-color);
                }

                .product-list__row--selected {
                    background: #E0F2F1 !important;
                }

                .product-list__row--selected:hover {
                    background: #B2DFDB !important;
                }
            `}</style>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirm}
                type={confirmType}
                title={confirmType === 'delete' ? 'Delete Products' : 'Archive Products'}
                message={confirmType === 'delete'
                    ? `Are you sure you want to permanently delete ${selectedIds.length} product(s)? This cannot be undone.`
                    : `Are you sure you want to archive ${selectedIds.length} product(s)?`
                }
                confirmLabel={confirmType === 'delete' ? 'Delete' : 'Archive'}
                cancelLabel="Cancel"
            />
        </div>
    );
};

export default ProductList;
