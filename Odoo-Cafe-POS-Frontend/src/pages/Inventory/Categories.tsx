/**
 * Categories Management Page
 * CRUD operations for product categories with icon picker and drag-drop reordering
 */
import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Edit2, Trash2, X, FolderOpen, GripVertical } from 'lucide-react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';

interface Category {
    id: string;
    name: string;
    productCount: number;
    icon: string;
    order: number;
}

// Available icons for category selection
const CATEGORY_ICONS = [
    '🍕', '🍔', '🌮', '🥗', '🍛', '🍜', '🍝', '🍣',
    '🍱', '🥘', '🍲', '🍿', '🧁', '🍰', '🍩', '🍪',
    '🍹', '🍸', '☕', '🧃', '🥤', '🍺', '🍷', '🧋',
    '🍟', '🌭', '🥙', '🥪', '🧆', '🥞', '🧇', '🥓',
    '🍗', '🍖', '🥩', '🍤', '🦐', '🦀', '🐟', '🍳',
    '🥚', '🧀', '🥖', '🥨', '🥐', '🫓', '🥯', '🍞',
];

// Mock data with order
const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Starters', productCount: 6, icon: '🥗', order: 1 },
    { id: 'cat-2', name: 'Main Course', productCount: 6, icon: '🍛', order: 2 },
    { id: 'cat-3', name: 'Drinks', productCount: 6, icon: '🍹', order: 3 },
    { id: 'cat-4', name: 'Desserts', productCount: 5, icon: '🍰', order: 4 },
    { id: 'cat-5', name: 'Sides', productCount: 5, icon: '🍟', order: 5 },
];

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>(mockCategories);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', icon: '📁' });

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

    const handleDelete = (categoryId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this category?')) {
            setCategories(categories.filter(c => c.id !== categoryId));
        }
    };

    const handleReorder = (newOrder: Category[]) => {
        // Update order property based on new position
        const reordered = newOrder.map((cat, index) => ({
            ...cat,
            order: index + 1
        }));
        setCategories(reordered);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCategory) {
            setCategories(categories.map(c =>
                c.id === editingCategory.id
                    ? { ...c, name: formData.name, icon: formData.icon }
                    : c
            ));
        } else {
            const newCategory: Category = {
                id: `cat-${Date.now()}`,
                name: formData.name,
                productCount: 0,
                icon: formData.icon,
                order: categories.length + 1,
            };
            setCategories([...categories, newCategory]);
        }

        setIsModalOpen(false);
    };

    const isSearching = searchQuery.length > 0;

    return (
        <AdminPageLayout
            title="Categories"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onNewClick={handleNewClick}
            newButtonLabel="New Category"
        >
            <div className="categories-page">
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
                                                    onClick={(e) => handleDelete(category.id, e)}
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
                                                onClick={(e) => handleDelete(category.id, e)}
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
        </AdminPageLayout>
    );
};

export default Categories;
