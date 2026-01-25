/**
 * Kitchen Display Page
 * Shows order tickets for kitchen staff to manage
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import './KitchenDisplay.css';

type OrderStatus = 'TO_COOK' | 'PREPARING' | 'COMPLETED';

interface KitchenOrderItem {
    id: string;
    productName: string;
    quantity: number;
    isPrepared: boolean;
    category: string;
}

interface KitchenOrder {
    id: string;
    orderNumber: string;
    customerName: string;
    items: KitchenOrderItem[];
    status: OrderStatus;
    createdAt: string;
}

// Mock kitchen orders
const mockOrders: KitchenOrder[] = [
    {
        id: 'ko-1',
        orderNumber: '#2205',
        customerName: 'Amusing Octopus',
        status: 'TO_COOK',
        createdAt: new Date().toISOString(),
        items: [
            { id: 'i1', productName: 'Burger', quantity: 3, isPrepared: false, category: 'Quick Bites' },
            { id: 'i2', productName: 'Pizza', quantity: 3, isPrepared: false, category: 'Quick Bites' },
            { id: 'i3', productName: 'Coffee', quantity: 3, isPrepared: false, category: 'Drink' },
            { id: 'i4', productName: 'Water', quantity: 3, isPrepared: false, category: 'Drink' },
        ],
    },
    {
        id: 'ko-2',
        orderNumber: '#2206',
        customerName: 'Jett main',
        status: 'TO_COOK',
        createdAt: new Date().toISOString(),
        items: [
            { id: 'i5', productName: 'Burger', quantity: 3, isPrepared: false, category: 'Quick Bites' },
            { id: 'i6', productName: 'Pizza', quantity: 3, isPrepared: true, category: 'Quick Bites' },
            { id: 'i7', productName: 'Water', quantity: 3, isPrepared: true, category: 'Drink' },
        ],
    },
    {
        id: 'ko-3',
        orderNumber: '#2207',
        customerName: 'Swift Eagle',
        status: 'PREPARING',
        createdAt: new Date().toISOString(),
        items: [
            { id: 'i8', productName: 'Burger', quantity: 3, isPrepared: true, category: 'Quick Bites' },
            { id: 'i9', productName: 'Pizza', quantity: 3, isPrepared: false, category: 'Quick Bites' },
            { id: 'i10', productName: 'Coffee', quantity: 3, isPrepared: true, category: 'Drink' },
        ],
    },
    {
        id: 'ko-4',
        orderNumber: '#2208',
        customerName: 'Calm River',
        status: 'PREPARING',
        createdAt: new Date().toISOString(),
        items: [
            { id: 'i11', productName: 'Burger', quantity: 3, isPrepared: false, category: 'Quick Bites' },
            { id: 'i12', productName: 'Coffee', quantity: 3, isPrepared: false, category: 'Drink' },
        ],
    },
    {
        id: 'ko-5',
        orderNumber: '#2209',
        customerName: 'Bright Star',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        items: [
            { id: 'i13', productName: 'Burger', quantity: 3, isPrepared: true, category: 'Quick Bites' },
            { id: 'i14', productName: 'Pizza', quantity: 3, isPrepared: true, category: 'Quick Bites' },
            { id: 'i15', productName: 'Coffee', quantity: 3, isPrepared: true, category: 'Drink' },
        ],
    },
    {
        id: 'ko-6',
        orderNumber: '#2210',
        customerName: 'Happy Dolphin',
        status: 'TO_COOK',
        createdAt: new Date().toISOString(),
        items: [
            { id: 'i16', productName: 'Pizza', quantity: 2, isPrepared: false, category: 'Quick Bites' },
            { id: 'i17', productName: 'Coffee', quantity: 4, isPrepared: false, category: 'Drink' },
        ],
    },
    {
        id: 'ko-7',
        orderNumber: '#2211',
        customerName: 'Quick Fox',
        status: 'TO_COOK',
        createdAt: new Date().toISOString(),
        items: [
            { id: 'i18', productName: 'Burger', quantity: 1, isPrepared: false, category: 'Quick Bites' },
            { id: 'i19', productName: 'Water', quantity: 2, isPrepared: false, category: 'Drink' },
        ],
    },
    {
        id: 'ko-8',
        orderNumber: '#2212',
        customerName: 'Lazy Bear',
        status: 'PREPARING',
        createdAt: new Date().toISOString(),
        items: [
            { id: 'i20', productName: 'Pizza', quantity: 2, isPrepared: true, category: 'Quick Bites' },
            { id: 'i21', productName: 'Coffee', quantity: 1, isPrepared: false, category: 'Drink' },
        ],
    },
    {
        id: 'ko-9',
        orderNumber: '#2213',
        customerName: 'Wise Owl',
        status: 'PREPARING',
        createdAt: new Date().toISOString(),
        items: [
            { id: 'i22', productName: 'Burger', quantity: 2, isPrepared: false, category: 'Quick Bites' },
            { id: 'i23', productName: 'Pizza', quantity: 1, isPrepared: true, category: 'Quick Bites' },
        ],
    },
    {
        id: 'ko-10',
        orderNumber: '#2214',
        customerName: 'Silent Tiger',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        items: [
            { id: 'i24', productName: 'Coffee', quantity: 3, isPrepared: true, category: 'Drink' },
            { id: 'i25', productName: 'Water', quantity: 2, isPrepared: true, category: 'Drink' },
        ],
    },
    {
        id: 'ko-11',
        orderNumber: '#2215',
        customerName: 'Brave Lion',
        status: 'TO_COOK',
        createdAt: new Date().toISOString(),
        items: [
            { id: 'i26', productName: 'Burger', quantity: 4, isPrepared: false, category: 'Quick Bites' },
            { id: 'i27', productName: 'Coffee', quantity: 4, isPrepared: false, category: 'Drink' },
        ],
    },
    {
        id: 'ko-12',
        orderNumber: '#2216',
        customerName: 'Gentle Panda',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        items: [
            { id: 'i28', productName: 'Pizza', quantity: 2, isPrepared: true, category: 'Quick Bites' },
            { id: 'i29', productName: 'Water', quantity: 3, isPrepared: true, category: 'Drink' },
        ],
    },
];

// Get unique products and categories from orders
const getUniqueProducts = (orders: KitchenOrder[]) => {
    const products = new Set<string>();
    orders.forEach(order => order.items.forEach(item => products.add(item.productName)));
    return Array.from(products);
};

const getUniqueCategories = (orders: KitchenOrder[]) => {
    const categories = new Set<string>();
    orders.forEach(order => order.items.forEach(item => categories.add(item.category)));
    return Array.from(categories);
};

const KitchenDisplay = () => {
    const navigate = useNavigate();
    const [orders, setOrders] = useState<KitchenOrder[]>(mockOrders);
    const [activeTab, setActiveTab] = useState<'ALL' | OrderStatus>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // Track window resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate orders per page based on screen size - increased values
    const getOrdersPerPage = () => {
        if (windowWidth >= 1600) return 20;  // Very large desktop
        if (windowWidth >= 1400) return 16;  // Large desktop
        if (windowWidth >= 1200) return 12;  // Desktop
        if (windowWidth >= 1024) return 9;   // Tablet landscape
        if (windowWidth >= 768) return 6;    // Tablet portrait
        if (windowWidth >= 480) return 4;    // Mobile landscape
        return 3;                             // Mobile portrait
    };

    const ordersPerPage = getOrdersPerPage();

    const allProducts = getUniqueProducts(orders);
    const allCategories = getUniqueCategories(orders);

    // Reset to page 1 when filters or screen size changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchQuery, selectedProducts, selectedCategories, ordersPerPage]);

    // Filter orders
    const filteredOrders = orders.filter(order => {
        // Tab filter
        if (activeTab !== 'ALL' && order.status !== activeTab) return false;

        // Search filter
        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase();
            const matchesOrder = order.orderNumber.toLowerCase().includes(searchLower);
            const matchesProduct = order.items.some(item =>
                item.productName.toLowerCase().includes(searchLower)
            );
            if (!matchesOrder && !matchesProduct) return false;
        }

        // Product filter
        if (selectedProducts.length > 0) {
            const hasProduct = order.items.some(item =>
                selectedProducts.includes(item.productName)
            );
            if (!hasProduct) return false;
        }

        // Category filter
        if (selectedCategories.length > 0) {
            const hasCategory = order.items.some(item =>
                selectedCategories.includes(item.category)
            );
            if (!hasCategory) return false;
        }

        return true;
    });

    // Pagination
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ordersPerPage,
        currentPage * ordersPerPage
    );

    // Counts
    const toCookCount = orders.filter(o => o.status === 'TO_COOK').length;
    const preparingCount = orders.filter(o => o.status === 'PREPARING').length;
    const completedCount = orders.filter(o => o.status === 'COMPLETED').length;

    // Toggle item prepared status
    const toggleItemPrepared = (orderId: string, itemId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setOrders(prev => prev.map(order =>
            order.id === orderId
                ? {
                    ...order,
                    items: order.items.map(item =>
                        item.id === itemId ? { ...item, isPrepared: !item.isPrepared } : item
                    ),
                }
                : order
        ));
    };

    // Advance order to next status
    const advanceOrderStatus = (orderId: string) => {
        setOrders(prev => prev.map(order => {
            if (order.id !== orderId) return order;

            let newStatus: OrderStatus = order.status;
            if (order.status === 'TO_COOK') newStatus = 'PREPARING';
            else if (order.status === 'PREPARING') newStatus = 'COMPLETED';

            return { ...order, status: newStatus };
        }));
    };

    // Clear filters
    const clearFilters = () => {
        setSelectedProducts([]);
        setSelectedCategories([]);
    };

    const hasActiveFilters = selectedProducts.length > 0 || selectedCategories.length > 0;

    return (
        <div className="kitchen-display">
            {/* Main Content */}
            <main className="kitchen-display__main">
                {/* Header */}
                <header className="kitchen-display__header">
                    <button
                        className="kitchen-display__back"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <h1 className="kitchen-display__title">Kitchen Display</h1>

                    {/* Status Tabs */}
                    <div className="kitchen-display__tabs">
                        <button
                            className={`kitchen-display__tab ${activeTab === 'ALL' ? 'kitchen-display__tab--active' : ''}`}
                            onClick={() => setActiveTab('ALL')}
                        >
                            All <span className="kitchen-display__tab-count">{orders.length}</span>
                        </button>
                        <button
                            className={`kitchen-display__tab kitchen-display__tab--tocook ${activeTab === 'TO_COOK' ? 'kitchen-display__tab--active' : ''}`}
                            onClick={() => setActiveTab('TO_COOK')}
                        >
                            To Cook <span className="kitchen-display__tab-count">{toCookCount}</span>
                        </button>
                        <button
                            className={`kitchen-display__tab kitchen-display__tab--preparing ${activeTab === 'PREPARING' ? 'kitchen-display__tab--active' : ''}`}
                            onClick={() => setActiveTab('PREPARING')}
                        >
                            Preparing <span className="kitchen-display__tab-count">{preparingCount}</span>
                        </button>
                        <button
                            className={`kitchen-display__tab kitchen-display__tab--completed ${activeTab === 'COMPLETED' ? 'kitchen-display__tab--active' : ''}`}
                            onClick={() => setActiveTab('COMPLETED')}
                        >
                            Completed <span className="kitchen-display__tab-count">{completedCount}</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="kitchen-display__search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Pagination */}
                    <div className="kitchen-display__pagination">
                        <span>{((currentPage - 1) * ordersPerPage) + 1}-{Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage >= totalPages}
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="kitchen-display__content">
                    {/* Filter Panel - Always Visible */}
                    <aside className="kitchen-display__filter-panel">
                        <div className="kitchen-display__filter-header">
                            <h2 className="kitchen-display__filter-title">Filters</h2>
                            <button
                                className="kitchen-display__clear-filter"
                                onClick={clearFilters}
                                disabled={!hasActiveFilters}
                            >
                                Clear All
                            </button>
                        </div>

                        <div className="kitchen-display__filter-section">
                            <h3>Product</h3>
                            <div className="kitchen-display__filter-options">
                                {allProducts.map(product => (
                                    <label key={product} className="kitchen-display__filter-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedProducts([...selectedProducts, product]);
                                                } else {
                                                    setSelectedProducts(selectedProducts.filter(p => p !== product));
                                                }
                                            }}
                                        />
                                        <span>{product}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="kitchen-display__filter-section">
                            <h3>Category</h3>
                            <div className="kitchen-display__filter-options">
                                {allCategories.map(category => (
                                    <label key={category} className="kitchen-display__filter-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategories([...selectedCategories, category]);
                                                } else {
                                                    setSelectedCategories(selectedCategories.filter(c => c !== category));
                                                }
                                            }}
                                        />
                                        <span>{category}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Order Tickets Grid */}
                    <div className="kitchen-display__tickets">
                        {paginatedOrders.length === 0 ? (
                            <div className="kitchen-display__empty">
                                No orders found
                            </div>
                        ) : (
                            paginatedOrders.map(order => (
                                <motion.div
                                    key={order.id}
                                    className={`kitchen-ticket kitchen-ticket--${order.status.toLowerCase().replace('_', '-')}`}
                                    onClick={() => advanceOrderStatus(order.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    layout
                                >
                                    <div className="kitchen-ticket__header">
                                        <span className="kitchen-ticket__number">{order.orderNumber}</span>
                                    </div>
                                    <div className="kitchen-ticket__items">
                                        {order.items.map(item => (
                                            <div
                                                key={item.id}
                                                className={`kitchen-ticket__item ${item.isPrepared ? 'kitchen-ticket__item--prepared' : ''}`}
                                                onClick={(e) => toggleItemPrepared(order.id, item.id, e)}
                                            >
                                                {item.quantity} x {item.productName}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="kitchen-ticket__customer">
                                        {order.customerName}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default KitchenDisplay;
