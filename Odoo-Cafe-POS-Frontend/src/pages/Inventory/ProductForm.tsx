/**
 * Product Form Page
 * Create/Edit product with tabs for General Info and Variants
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Save, Upload } from 'lucide-react';
import {
    type Product,
    type PriceRule,
    getProductById,
    createProduct,
    updateProduct,
    TAX_OPTIONS,
} from '../../api/products.api';
import {
    type Category,
    getCategories,
} from '../../api/categories.api';

type TabType = 'general' | 'variants';

const ProductForm = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const isEditing = productId && productId !== 'new';

    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [categories, setCategories] = useState<Category[]>([]);
    const [branches, setBranches] = useState<any[]>([]); // To get branchId
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        price: '',
        barcode: '',
        taxes: 'gst_5',
        description: '',
        icon: '📦',
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [priceRules, setPriceRules] = useState<PriceRule[]>([
        { minQty: 1, price: 0 }
    ]);

    // Load product data if editing
    useEffect(() => {
        const loadData = async () => {
            const categoriesData = await getCategories();
            setCategories(categoriesData);

            // Fetch branches to get an ID for new products
            try {
                // Assuming getBranches exists in branches.api.ts and is exported
                const { getBranches } = await import('../../api/branches.api');
                const branchesData = await getBranches();
                setBranches(branchesData);
            } catch (e) {
                console.error("Failed to load branches", e);
            }

            if (isEditing && productId) {
                setIsLoading(true);
                const product = await getProductById(productId);
                if (product) {
                    setFormData({
                        name: product.name,
                        categoryId: product.categoryId,
                        price: product.price.toString(),
                        barcode: product.barcode || '',
                        taxes: product.taxes,
                        description: product.description || '',
                        icon: product.icon || '📦',
                    });
                    setPriceRules(product.priceRules.length > 0 ? product.priceRules : [{ minQty: 1, price: product.price }]);
                }
                setIsLoading(false);
            }
        };
        loadData();
    }, [isEditing, productId]);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddPriceRule = () => {
        const lastRule = priceRules[priceRules.length - 1];
        setPriceRules([...priceRules, { minQty: (lastRule?.minQty || 0) + 5, price: 0 }]);
    };

    const handleRemovePriceRule = (index: number) => {
        if (priceRules.length > 1) {
            setPriceRules(priceRules.filter((_, i) => i !== index));
        }
    };

    const handlePriceRuleChange = (index: number, field: 'minQty' | 'price', value: string) => {
        const updated = [...priceRules];
        updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
        setPriceRules(updated);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.categoryId || !formData.price) {
            alert('Please fill in all required fields');
            return;
        }

        setIsSaving(true);

        let branchId = branches.length > 0 ? branches[0].id : undefined;
        // If editing, we might want to keep original branchId, but for now we rely on backend or existing

        const productData: Omit<Product, 'id'> = {
            name: formData.name,
            categoryId: formData.categoryId,
            branchId: branchId,
            price: parseFloat(formData.price),
            barcode: formData.barcode,
            taxes: formData.taxes,
            description: formData.description,
            icon: formData.icon,
            priceRules: priceRules,
            status: 'active',
            isActive: true,
        };

        if (isEditing && productId) {
            await updateProduct(productId, productData);
        } else {
            if (!branchId) {
                alert("No branch found. Cannot create product.");
                setIsSaving(false);
                return;
            }
            await createProduct(productData);
        }

        setIsSaving(false);
        navigate('/dashboard/products');
    };

    const tabs: { key: TabType; label: string }[] = [
        { key: 'general', label: 'General Info' },
        { key: 'variants', label: 'Variants' },
    ];

    if (isLoading) {
        return (
            <div className="product-form">
                <div className="product-form__loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="product-form">
            {/* Header */}
            <header className="product-form__header">
                <div className="product-form__header-left">
                    <button
                        className="product-form__back"
                        onClick={() => navigate('/dashboard/products')}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="product-form__title">
                        {isEditing ? 'Edit Product' : 'New Product'}
                    </h1>
                </div>
                <button
                    className="product-form__save-btn"
                    onClick={handleSubmit}
                    disabled={isSaving}
                >
                    <Save size={18} />
                    {isSaving ? 'Saving...' : 'Save'}
                </button>
            </header>

            {/* Tabs */}
            <div className="product-form__tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`product-form__tab ${activeTab === tab.key ? 'product-form__tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <main className="product-form__content">
                {activeTab === 'general' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="product-form__panel"
                    >
                        <div className="product-form__row">
                            <div className="product-form__group product-form__group--wide">
                                <label className="product-form__label">Product Name *</label>
                                <input
                                    type="text"
                                    className="product-form__input"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="e.g., Margherita Pizza"
                                />
                            </div>
                            <div className="product-form__group">
                                <label className="product-form__label">Product Image</label>
                                <div className="product-form__image-upload">
                                    {imagePreview ? (
                                        <div className="product-form__image-preview">
                                            <img src={imagePreview} alt="Product" />
                                            <button
                                                type="button"
                                                className="product-form__image-remove"
                                                onClick={() => setImagePreview(null)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="product-form__image-dropzone">
                                            <Upload size={24} />
                                            <span>Click to upload</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setImagePreview(reader.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }}
                                                style={{ display: 'none' }}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="product-form__group">
                            <label className="product-form__label">Category *</label>
                            <select
                                className="product-form__select"
                                value={formData.categoryId}
                                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="product-form__row">
                            <div className="product-form__group">
                                <label className="product-form__label">Sale Price (₹) *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="product-form__input"
                                    value={formData.price}
                                    onChange={(e) => handleInputChange('price', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="product-form__row">
                                <div className="product-form__group">
                                    <label className="product-form__label">Sale Price (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="product-form__input"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="product-form__row">
                                <div className="product-form__group">
                                    <label className="product-form__label">Customer Taxes</label>
                                    <select
                                        className="product-form__select"
                                        value={formData.taxes}
                                        onChange={(e) => handleInputChange('taxes', e.target.value)}
                                    >
                                        {TAX_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="product-form__group">
                                    <label className="product-form__label">Barcode</label>
                                    <input
                                        type="text"
                                        className="product-form__input"
                                        value={formData.barcode}
                                        onChange={(e) => handleInputChange('barcode', e.target.value)}
                                        placeholder="Scan or enter barcode"
                                    />
                                </div>
                            </div>

                            <div className="product-form__group">
                                <label className="product-form__label">Description</label>
                                <textarea
                                    className="product-form__textarea"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Optional product description..."
                                    rows={3}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'variants' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="product-form__panel"
                    >
                        <div className="product-form__section-header">
                            <h3>Volume Pricing</h3>
                            <p className="product-form__hint">
                                Set different prices based on quantity (e.g., buy 6 for a discount)
                            </p>
                        </div>

                        <table className="product-form__pricing-table">
                            <thead>
                                <tr>
                                    <th>Min. Quantity</th>
                                    <th>Price (₹)</th>
                                    <th style={{ width: '60px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {priceRules.map((rule, index) => (
                                    <tr key={index}>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                className="product-form__table-input"
                                                value={rule.minQty}
                                                onChange={(e) => handlePriceRuleChange(index, 'minQty', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                className="product-form__table-input"
                                                value={rule.price}
                                                onChange={(e) => handlePriceRuleChange(index, 'price', e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="product-form__remove-btn"
                                                onClick={() => handleRemovePriceRule(index)}
                                                disabled={priceRules.length === 1}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <button
                            className="product-form__add-rule-btn"
                            onClick={handleAddPriceRule}
                        >
                            <Plus size={16} />
                            Add Price Rule
                        </button>
                    </motion.div>
                )}
            </main>

            <style>{`
                .product-form {
                    min-height: 100vh;
                    background: var(--bg-color);
                }

                .product-form__loading {
                    text-align: center;
                    padding: 4rem;
                    color: var(--text-muted);
                }

                .product-form__header {
                    background: var(--card-bg);
                    padding: 1rem 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border-light);
                }

                .product-form__header-left {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .product-form__back {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    border: 1px solid var(--border-light);
                    background: var(--card-bg);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .product-form__back:hover {
                    background: var(--bg-color);
                }

                .product-form__title {
                    font-size: 1.5rem;
                    font-weight: 700;
                }

                .product-form__save-btn {
                    padding: 0.75rem 1.5rem;
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

                .product-form__save-btn:hover:not(:disabled) {
                    background: #00796B;
                }

                .product-form__save-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .product-form__tabs {
                    background: var(--card-bg);
                    padding: 0 2rem;
                    display: flex;
                    justify-content: center;
                    gap: 0;
                    border-bottom: 1px solid var(--border-light);
                }

                .product-form__tab {
                    padding: 1rem 1.5rem;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--text-muted);
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    margin-bottom: -1px;
                    transition: all 0.2s;
                }

                .product-form__tab:hover {
                    color: var(--text-main);
                }

                .product-form__tab--active {
                    color: var(--primary-color);
                    border-bottom-color: var(--primary-color);
                }

                .product-form__content {
                    padding: 2rem;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .product-form__panel {
                    background: var(--card-bg);
                    border-radius: var(--border-radius);
                    box-shadow: var(--shadow-card);
                    padding: 2rem;
                }

                .product-form__row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .product-form__group {
                    margin-bottom: 1.5rem;
                }

                .product-form__group--wide {
                    grid-column: span 1;
                }

                .product-form__label {
                    display: block;
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-main);
                    margin-bottom: 0.5rem;
                }

                .product-form__input,
                .product-form__select,
                .product-form__textarea {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1.5px solid #CBD5E1;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                    background: #FAFBFC;
                }

                .product-form__input:focus,
                .product-form__select:focus,
                .product-form__textarea:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.15);
                    background: white;
                }

                .product-form__textarea {
                    resize: none;
                    overflow: hidden;
                    min-height: 80px;
                    field-sizing: content;
                }

                .product-form__image-upload {
                    width: 100%;
                }

                .product-form__image-dropzone {
                    width: 100%;
                    height: 48px;
                    border: 1.5px dashed #CBD5E1;
                    border-radius: 8px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #FAFBFC;
                }

                .product-form__image-dropzone:hover {
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                    background: rgba(0, 172, 193, 0.05);
                }

                .product-form__image-dropzone span {
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .product-form__image-preview {
                    position: relative;
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1.5px solid #CBD5E1;
                }

                .product-form__image-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .product-form__image-remove {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(0, 0, 0, 0.6);
                    color: white;
                    font-size: 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .product-form__image-remove:hover {
                    background: rgba(220, 38, 38, 0.9);
                }

                .product-form__section-header {
                    margin-bottom: 1.5rem;
                }

                .product-form__section-header h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin: 0 0 0.25rem;
                }

                .product-form__hint {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    margin: 0;
                }

                .product-form__pricing-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 1rem;
                }

                .product-form__pricing-table th {
                    text-align: left;
                    padding: 0.75rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: var(--text-muted);
                    border-bottom: 1px solid var(--border-light);
                }

                .product-form__pricing-table td {
                    padding: 0.5rem;
                    border-bottom: 1px solid var(--border-light);
                }

                .product-form__table-input {
                    width: 100%;
                    padding: 0.6rem 0.85rem;
                    border: 1.5px solid #CBD5E1;
                    border-radius: 6px;
                    font-size: 0.9rem;
                    background: #FAFBFC;
                    transition: all 0.2s;
                }

                .product-form__table-input:focus {
                    outline: none;
                    border-color: var(--primary-color);
                    box-shadow: 0 0 0 3px rgba(0, 172, 193, 0.15);
                    background: white;
                }

                .product-form__remove-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    border: 1px solid var(--border-light);
                    background: var(--card-bg);
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .product-form__remove-btn:hover:not(:disabled) {
                    background: #FEE2E2;
                    color: #DC2626;
                    border-color: #FECACA;
                }

                .product-form__remove-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .product-form__add-rule-btn {
                    padding: 0.6rem 1rem;
                    border-radius: 6px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    border: 1px dashed var(--border-light);
                    background: transparent;
                    color: var(--text-muted);
                }

                .product-form__add-rule-btn:hover {
                    border-color: var(--primary-color);
                    color: var(--primary-color);
                    background: rgba(0, 172, 193, 0.05);
                }

                .product-form__placeholder {
                    text-align: center;
                    padding: 3rem;
                    color: var(--text-muted);
                }

                .product-form__placeholder p {
                    font-size: 1.1rem;
                    margin-bottom: 0.5rem;
                }

                .product-form__placeholder span {
                    font-size: 0.85rem;
                }

                @media (max-width: 768px) {
                    .product-form__row {
                        grid-template-columns: 1fr;
                    }

                    .product-form__tabs {
                        overflow-x: auto;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductForm;
