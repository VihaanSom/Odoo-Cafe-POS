import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { OrderProvider, useOrder } from '../../store/order.store';
import ProductCard from '../../components/orders/ProductCard';
import OrderSummary from '../../components/orders/OrderSummary';
import { getProductsBackendApi, type Product } from '../../api/products.api';
import { getCategories, type Category } from '../../api/categories.api';
import { getTableByIdBackendApi } from '../../api/tables.api';
import './OrderView.css';

// Inner component that uses the order context
const OrderViewContent = () => {
    const { tableId } = useParams<{ tableId: string }>();
    const navigate = useNavigate();
    const { addToCart, setTableId } = useOrder();

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<(Product & { icon?: string })[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<string>('');
    const [tableName, setTableName] = useState<string>('');
    const [tableBranchId, setTableBranchId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // Load categories on mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                // Get the first branch (using existing logic or context if available) (Simplified for now, fetching all)
                // Ideally this should come from the table's branch, but for now we fetch generally
                const categoriesData = await getCategories();
                setCategories(categoriesData);
                if (categoriesData.length > 0) {
                    setActiveCategoryId(categoriesData[0].id);
                }
            } catch (error) {
                console.error('Failed to load categories', error);
            }
        };
        loadCategories();
    }, []);

    // Load table info from backend
    useEffect(() => {
        if (tableId) {
            setTableId(tableId);
            const loadTable = async () => {
                const table = await getTableByIdBackendApi(tableId);
                if (table) {
                    setTableName(table.tableNumber);
                    // Store branchId for order creation
                    if (table.branchId) {
                        setTableBranchId(table.branchId);
                    }
                }
            };
            loadTable();
        }
    }, [tableId, setTableId]);

    // Load products from backend and filter by active category
    useEffect(() => {
        const loadProducts = async () => {
            if (!activeCategoryId) return;

            setIsLoading(true);
            try {
                // Fetch all products first (or could optimize to fetch by category key)
                const productsData = await getProductsBackendApi();

                // Filter products that match the active Category ID
                const filteredProducts = productsData.filter(p => p.categoryId === activeCategoryId);

                setProducts(filteredProducts as (Product & { icon?: string })[]);
            } catch (error) {
                console.error("Failed to load products", error);
            }
            setIsLoading(false);
        };
        loadProducts();
    }, [activeCategoryId]);

    const handleProductClick = (product: Product) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
        });
    };

    const handleBack = () => {
        navigate('/pos');
    };

    const activeCategory = categories.find(c => c.id === activeCategoryId);

    return (
        <div className="order-view">
            {/* Left Column - Categories */}
            <nav className="order-categories">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className={`order-categories__item ${activeCategoryId === category.id ? 'order-categories__item--active' : ''}`}
                        onClick={() => setActiveCategoryId(category.id)}
                    >
                        <div className="order-categories__icon">
                            <span style={{ fontSize: '1.25rem' }}>{category.icon}</span>
                        </div>
                        {category.name}
                    </button>
                ))}
            </nav>

            {/* Middle Column - Products */}
            <section className="order-products">
                <header className="order-products__header">
                    <button className="order-back-btn" onClick={handleBack}>
                        <ArrowLeft size={16} />
                        Back to Tables
                    </button>
                    <h1 className="order-products__title">
                        {activeCategory?.name || 'Menu'}
                    </h1>
                    <p className="order-products__subtitle">
                        {tableName ? `Taking order for ${tableName}` : 'Select items to add to order'}
                    </p>
                </header>

                <div className="order-products__grid">
                    {isLoading ? (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                            Loading products...
                        </div>
                    ) : (
                        products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={handleProductClick}
                            />
                        ))
                    )}
                </div>
            </section>

            {/* Right Column - Order Summary */}
            <OrderSummary tableNumber={tableName || 'Table'} tableId={tableId || ''} branchId={tableBranchId} />
        </div>
    );
};

// Wrapper component that provides the OrderContext
const OrderView = () => {
    return (
        <OrderProvider>
            <OrderViewContent />
        </OrderProvider>
    );
};

export default OrderView;
