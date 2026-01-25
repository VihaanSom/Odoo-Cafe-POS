/**
 * Kitchen Display Page
 * Shows order tickets for kitchen staff to manage
 * Real-time updates via Socket.IO
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import {
    getAllKitchenOrders,
    advanceOrderStatus,
    type KitchenOrder,
    type KitchenOrderStatus,
} from '../../api/kitchen.api';
import { getSocket } from '../../utils/socket';
import './KitchenDisplay.css';

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
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSocketConnected, setIsSocketConnected] = useState(false);
    const [activeTab, setActiveTab] = useState<'ALL' | KitchenOrderStatus>('ALL');
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

    // Fetch orders from backend
    const fetchOrders = useCallback(async (showLoadingState = true) => {
        if (showLoadingState) {
            setIsLoading(true);
        } else {
            setIsRefreshing(true);
        }

        try {
            const kitchenOrders = await getAllKitchenOrders();
            setOrders(kitchenOrders);
        } catch (error) {
            console.error('Failed to fetch kitchen orders:', error);
        }

        setIsLoading(false);
        setIsRefreshing(false);
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Socket.IO real-time updates
    useEffect(() => {
        const socket = getSocket();

        const handleConnect = () => {
            console.log('Kitchen socket connected');
            setIsSocketConnected(true);
        };

        const handleDisconnect = () => {
            console.log('Kitchen socket disconnected');
            setIsSocketConnected(false);
        };

        const handleNewOrder = () => {
            console.log('New order received - refreshing kitchen display');
            fetchOrders(false);
        };

        const handleOrderUpdate = () => {
            console.log('Order updated - refreshing kitchen display');
            fetchOrders(false);
        };

        // Set initial connection state
        setIsSocketConnected(socket.connected);

        // Register event listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('kitchen:newOrder', handleNewOrder);
        socket.on('kitchen:orderUpdate', handleOrderUpdate);

        // Cleanup on unmount
        return () => {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('kitchen:newOrder', handleNewOrder);
            socket.off('kitchen:orderUpdate', handleOrderUpdate);
        };
    }, [fetchOrders]);

    // Calculate orders per page based on screen size
    const getOrdersPerPage = () => {
        if (windowWidth >= 1600) return 20;
        if (windowWidth >= 1400) return 16;
        if (windowWidth >= 1200) return 12;
        if (windowWidth >= 1024) return 9;
        if (windowWidth >= 768) return 6;
        if (windowWidth >= 480) return 4;
        return 3;
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

    // Toggle item prepared status (local only - backend doesn't track per-item)
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

    // Advance order to next status via API
    const handleAdvanceOrderStatus = async (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        // Don't advance completed orders
        if (order.status === 'COMPLETED') return;

        const updatedOrder = await advanceOrderStatus(order);
        if (updatedOrder) {
            // Socket will trigger refresh, but update locally for immediate feedback
            setOrders(prev => prev.map(o =>
                o.id === orderId ? updatedOrder : o
            ));
        }
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

                    {/* Connection Status */}
                    <div className={`kitchen-display__connection ${isSocketConnected ? 'kitchen-display__connection--connected' : ''}`}>
                        {isSocketConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
                    </div>

                    {/* Refresh Button */}
                    <button
                        className={`kitchen-display__refresh ${isRefreshing ? 'kitchen-display__refresh--spinning' : ''}`}
                        onClick={() => fetchOrders(false)}
                        disabled={isRefreshing}
                        title="Refresh orders"
                    >
                        <RefreshCw size={18} />
                    </button>

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
                        <span>{filteredOrders.length > 0 ? ((currentPage - 1) * ordersPerPage) + 1 : 0}-{Math.min(currentPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length}</span>
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
                        {isLoading ? (
                            <div className="kitchen-display__loading">
                                <RefreshCw size={32} className="kitchen-display__loading-icon" />
                                <span>Loading orders...</span>
                            </div>
                        ) : paginatedOrders.length === 0 ? (
                            <div className="kitchen-display__empty">
                                {orders.length === 0 ? 'No orders in kitchen' : 'No orders match filters'}
                            </div>
                        ) : (
                            paginatedOrders.map(order => (
                                <motion.div
                                    key={order.id}
                                    className={`kitchen-ticket kitchen-ticket--${order.status.toLowerCase().replace('_', '-')}`}
                                    onClick={() => handleAdvanceOrderStatus(order.id)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    layout
                                >
                                    <div className="kitchen-ticket__header">
                                        <span className="kitchen-ticket__number">{order.orderNumber}</span>
                                        {order.tableName && order.tableName !== 'undefined' && (
                                            <span className="kitchen-ticket__table">{order.tableName}</span>
                                        )}
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
                                    {order.notes && (
                                        <div className="kitchen-ticket__notes">
                                            {order.notes}
                                        </div>
                                    )}
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
