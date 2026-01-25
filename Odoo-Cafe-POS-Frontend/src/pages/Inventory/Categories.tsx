/**
 * Categories Management Page
 * CRUD operations for product categories with icon picker and drag-drop reordering
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Edit2, Trash2, X, FolderOpen, GripVertical, Loader2 } from 'lucide-react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    updateCategoryOrder,
    type Category,
} from '../../api/categories.api';
import { getBranches } from '../../api/branches.api';

// Available icons for category selection
const CATEGORY_ICONS = [
    '🍕', '🍔', '🌮', '🥗', '🍛', '🍜', '🍝', '🍣',
    '🍱', '🥘', '🍲', '🍿', '🧁', '🍰', '🍩', '🍪',
    '🍹', '🍸', '☕', '🧃', '🥤', '🍺', '🍷', '🧋',
    '🍟', '🌭', '🥙', '🥪', '🧆', '🥞', '🧇', '🥓',
    '🍗', '🍖', '🥩', '🍤', '🦐', '🦀', '🐟', '🍳',
    '🥚', '🧀', '🥖', '🥨', '🥐', '🫓', '🥯', '🍞',
];

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', icon: '📁' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [branchId, setBranchId] = useState<string | null>(null);

    // Load categories on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                // Get the first branch (single branch system)
                const branches = await getBranches();
                if (branches.length > 0) {
                    setBranchId(branches[0].id);
                    const cats = await getCategories(branches[0].id);
                    setCategories(cats);
                } else {
                    // No branches, create one first
                    setError('No branch found. Please create a branch first.');
                }
            } catch (err) {
                setError('Failed to load categories');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, []);

    // Confirm dialog state
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleNewClick = () => {
        setEditingCategory(null);
        setFormData({ name: '', icon: '📁' });
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCategory(category);
        setFormData({ name: category.name, icon: category.icon });
        setIsModalOpen(true);
    };

    const handleDelete = async (categoryId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this category?')) {
            setIsSaving(true);
            const result = await deleteCategory(categoryId);
            if (result.success) {
                setCategories(categories.filter(c => c.id !== categoryId));
            } else {
                alert(result.error || 'Failed to delete category');
            }
            setIsSaving(false);
        }
    };

    const handleReorder = (newOrder: Category[]) => {
        // Update order property based on new position
        const reordered = newOrder.map((cat, index) => ({
            ...cat,
            order: index + 1
        }));
        setCategories(reordered);
        // Save order to localStorage
        updateCategoryOrder(reordered);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!branchId) {
            alert('No branch available');
            return;
        }
        
        setIsSaving(true);

        if (editingCategory) {
            const result = await updateCategory(editingCategory.id, {
                name: formData.name,
                icon: formData.icon,
            });
            if (result.success && result.category) {
                setCategories(categories.map(c =>
                    c.id === editingCategory.id ? result.category! : c
                ));
            } else {
                alert(result.error || 'Failed to update category');
            }
        } else {
            const result = await createCategory(branchId, formData.name, formData.icon);
            if (result.success && result.category) {
                setCategories([...categories, result.category]);
            } else {
                alert(result.error || 'Failed to create category');
            }
        }

        setIsSaving(false);
        setIsModalOpen(false);
    };

    const isSearching = searchQuery.length > 0;

    // Loading state
    if (isLoading) {
        return (
            <AdminPageLayout title="Categories" searchValue="" onSearchChange={() => {}} onNewClick={() => {}} newButtonLabel="New Category">
                <div className="categories-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                    <Loader2 size={32} className="spin-animation" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </AdminPageLayout>
        );
    }

    // Error state
    if (error) {
        return (
            <AdminPageLayout title="Categories" searchValue="" onSearchChange={() => {}} onNewClick={() => {}} newButtonLabel="New Category">
                <div className="categories-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: '#e53e3e' }}>
                    <p>{error}</p>
                </div>
            </AdminPageLayout>
        );
    }

    return (
        <AdminPageLayout
            title="Categories"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onNewClick={handleNewClick}
            newButtonLabel="New Category"
        >
            <div className="categories-page">
                {isSaving && (
                    <div className="saving-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'white' }} />
                    </div>
                )}
                
                {!isSearching && (
                    <div className="categories-hint">
                        <GripVertical size={16} />
                        <span>Drag to reorder categories. This order will be reflected in the POS menu.</span>
                    </div>
                )}

                <div className="admin-table">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '40px' }}></th>
                                <th style={{ width: '60px' }}>Icon</th>
                                <th>Name</th>
                                <th>Products</th>
                                <th style={{ width: '50px' }}>Order</th>
                                <th style={{ width: '100px' }}>Actions</th>
                            </tr>
                        </thead>
                    </table>

                    {filteredCategories.length === 0 ? (
                        <div className="admin-empty">
                            <div className="admin-empty__icon"><FolderOpen size={48} /></div>
                            <p className="admin-empty__text">No categories found</p>
                        </div>
                    ) : isSearching ? (
                        // Non-draggable list when searching
                        <table>
                            <tbody>
                                {filteredCategories.map((category) => (
                                    <tr key={category.id}>
                                        <td style={{ width: '40px' }}>
                                            <div className="drag-handle drag-handle--disabled">
                                                <GripVertical size={18} />
                                            </div>
                                        </td>
                                        <td style={{ width: '60px' }}>
                                            <div className="admin-table__image">{category.icon}</div>
                                        </td>
                                        <td><strong>{category.name}</strong></td>
                                        <td>{category.productCount} products</td>
                                        <td style={{ width: '50px' }}>
                                            <span className="order-badge">{category.order}</span>
                                        </td>
                                        <td style={{ width: '100px' }}>
                                            <div className="admin-table__actions">
                                                <button
                                                    className="admin-table__action-btn"
                                                    onClick={(e) => handleEdit(category, e)}
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="admin-table__action-btn admin-table__action-btn--danger"
                                                    onClick={(e) => handleDeleteClick(category.id, e)}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        // Draggable list
                        <Reorder.Group
                            axis="y"
                            values={categories}
                            onReorder={handleReorder}
                            as="div"
                            className="category-reorder-list"
                        >
                            {categories.map((category) => (
                                <Reorder.Item
                                    key={category.id}
                                    value={category}
                                    as="div"
                                    className="category-row"
                                    whileDrag={{
                                        scale: 1.02,
                                        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                                        background: 'white'
                                    }}
                                >
                                    <div className="category-row__cell category-row__cell--drag">
                                        <div className="drag-handle">
                                            <GripVertical size={18} />
                                        </div>
                                    </div>
                                    <div className="category-row__cell category-row__cell--icon">
                                        <div className="admin-table__image">{category.icon}</div>
                                    </div>
                                    <div className="category-row__cell category-row__cell--name">
                                        <strong>{category.name}</strong>
                                    </div>
                                    <div className="category-row__cell category-row__cell--count">
                                        {category.productCount} products
                                    </div>
                                    <div className="category-row__cell category-row__cell--order">
                                        <span className="order-badge">{category.order}</span>
                                    </div>
                                    <div className="category-row__cell category-row__cell--actions">
                                        <div className="admin-table__actions">
                                            <button
                                                className="admin-table__action-btn"
                                                onClick={(e) => handleEdit(category, e)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="admin-table__action-btn admin-table__action-btn--danger"
                                                onClick={(e) => handleDeleteClick(category.id, e)}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    )}
                </div>
            </div>

            {/* Category Modal */}
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
                                    {editingCategory ? 'Edit Category' : 'New Category'}
                                </h2>
                                <button className="admin-modal__close" onClick={() => setIsModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="admin-modal__body">
                                    <div className="admin-form__group">
                                        <label className="admin-form__label">Category Name</label>
                                        <input
                                            type="text"
                                            className="admin-form__input"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Appetizers"
                                            required
                                        />
                                    </div>

                                    <div className="admin-form__group">
                                        <label className="admin-form__label">Category Icon</label>
                                        <div className="category-icon-picker">
                                            <div className="category-icon-picker__selected">
                                                <span className="category-icon-picker__current">{formData.icon}</span>
                                                <span className="category-icon-picker__label">Selected</span>
                                            </div>
                                            <div className="category-icon-picker__grid">
                                                {CATEGORY_ICONS.map((icon) => (
                                                    <button
                                                        key={icon}
                                                        type="button"
                                                        className={`category-icon-picker__item ${formData.icon === icon ? 'category-icon-picker__item--active' : ''}`}
                                                        onClick={() => setFormData({ ...formData, icon })}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
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
                                        {editingCategory ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .categories-page {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .categories-hint {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    padding: 0.75rem 1rem;
                    background: #E0F7FA;
                    border-radius: 8px;
                    color: #00796B;
                    font-size: 0.85rem;
                }

                .category-reorder-list {
                    display: flex;
                    flex-direction: column;
                }

                .category-row {
                    display: grid;
                    grid-template-columns: 40px 60px 1fr 150px 50px 100px;
                    align-items: center;
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid var(--border-light);
                    background: white;
                    cursor: grab;
                }

                .category-row:active {
                    cursor: grabbing;
                }

                .category-row:hover {
                    background: #f9fafb;
                }

                .category-row__cell {
                    display: flex;
                    align-items: center;
                }

                .category-row__cell--name {
                    flex: 1;
                }

                .category-row__cell--actions {
                    justify-content: flex-end;
                }

                .drag-handle {
                    color: var(--text-muted);
                    cursor: grab;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    transition: all 0.15s;
                }

                .drag-handle:hover {
                    background: var(--bg-color);
                    color: var(--text-main);
                }

                .drag-handle--disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .order-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #E8EAF6;
                    color: #3949AB;
                    font-size: 0.8rem;
                    font-weight: 600;
                }

                .category-icon-picker {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }

                .category-icon-picker__selected {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem 1rem;
                    background: #FAFBFC;
                    border: 1.5px solid #CBD5E1;
                    border-radius: 8px;
                }

                .category-icon-picker__current {
                    font-size: 2rem;
                }

                .category-icon-picker__label {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }

                .category-icon-picker__grid {
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                    gap: 0.5rem;
                    max-height: 180px;
                    overflow-y: auto;
                    padding: 0.75rem;
                    background: #FAFBFC;
                    border: 1.5px solid #CBD5E1;
                    border-radius: 8px;
                }

                .category-icon-picker__item {
                    width: 40px;
                    height: 40px;
                    border: 1.5px solid transparent;
                    border-radius: 8px;
                    background: white;
                    font-size: 1.25rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }

                .category-icon-picker__item:hover {
                    border-color: var(--primary-color);
                    background: #E0F7FA;
                }

                .category-icon-picker__item--active {
                    border-color: var(--primary-color);
                    background: #B2EBF2;
                    box-shadow: 0 0 0 2px rgba(0, 172, 193, 0.2);
                }

                @media (max-width: 768px) {
                    .category-row {
                        grid-template-columns: 30px 50px 1fr auto;
                    }

                    .category-row__cell--count,
                    .category-row__cell--order {
                        display: none;
                    }
                }

                @media (max-width: 500px) {
                    .category-icon-picker__grid {
                        grid-template-columns: repeat(6, 1fr);
                    }
                }
            `}</style>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDeleteConfirm}
                type="delete"
                title="Delete Category"
                message="Are you sure you want to delete this category? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
            />
        </AdminPageLayout>
    );
};

export default Categories;
