/**
 * Categories Management Page
 * CRUD operations for product categories
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Trash2, X, FolderOpen } from 'lucide-react';
import AdminPageLayout from '../../components/admin/AdminPageLayout';

interface Category {
    id: string;
    name: string;
    productCount: number;
    icon: string;
}

// Mock data
const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Starters', productCount: 6, icon: '🥗' },
    { id: 'cat-2', name: 'Main Course', productCount: 6, icon: '🍛' },
    { id: 'cat-3', name: 'Drinks', productCount: 6, icon: '🍹' },
    { id: 'cat-4', name: 'Desserts', productCount: 5, icon: '🍰' },
    { id: 'cat-5', name: 'Sides', productCount: 5, icon: '🍟' },
];

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>(mockCategories);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '' });

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleNewClick = () => {
        setEditingCategory(null);
        setFormData({ name: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name });
        setIsModalOpen(true);
    };

    const handleDelete = (categoryId: string) => {
        if (confirm('Are you sure you want to delete this category?')) {
            setCategories(categories.filter(c => c.id !== categoryId));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingCategory) {
            setCategories(categories.map(c =>
                c.id === editingCategory.id
                    ? { ...c, name: formData.name }
                    : c
            ));
        } else {
            const newCategory: Category = {
                id: `cat-${Date.now()}`,
                name: formData.name,
                productCount: 0,
                icon: '📁',
            };
            setCategories([...categories, newCategory]);
        }

        setIsModalOpen(false);
    };

    return (
        <AdminPageLayout
            title="Categories"
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onNewClick={handleNewClick}
            newButtonLabel="New Category"
        >
            <div className="admin-table">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '60px' }}>Icon</th>
                            <th>Name</th>
                            <th>Products</th>
                            <th style={{ width: '100px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.length === 0 ? (
                            <tr>
                                <td colSpan={4}>
                                    <div className="admin-empty">
                                        <div className="admin-empty__icon"><FolderOpen size={48} /></div>
                                        <p className="admin-empty__text">No categories found</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredCategories.map((category) => (
                                <motion.tr
                                    key={category.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    layout
                                >
                                    <td>
                                        <div className="admin-table__image">{category.icon}</div>
                                    </td>
                                    <td><strong>{category.name}</strong></td>
                                    <td>{category.productCount} products</td>
                                    <td>
                                        <div className="admin-table__actions">
                                            <button
                                                className="admin-table__action-btn"
                                                onClick={() => handleEdit(category)}
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                className="admin-table__action-btn admin-table__action-btn--danger"
                                                onClick={() => handleDelete(category.id)}
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
                                            onChange={(e) => setFormData({ name: e.target.value })}
                                            placeholder="e.g., Appetizers"
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
                                        {editingCategory ? 'Update' : 'Create'}
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

export default Categories;
