/**
 * Analytics Dashboard
 * Shows real-time reporting based on selection
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Download,
    FileText,
    TrendingUp,
    TrendingDown,
    DollarSign,
    ShoppingBag
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    getDailySales,
    getSalesByRange,
    getTopProducts,
    getHourlySales,
    type TopProduct,
    type HourlySalesData
} from '../../api/reports.api';
import './AnalyticsDashboard.css';

// Chart Colors
const COLORS = ['#007BFF', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

type Period = 'Today' | 'Weekly' | 'Monthly' | 'Yearly';

const AnalyticsDashboard = () => {
    const navigate = useNavigate();
    const [period, setPeriod] = useState<Period>('Today');
    const [isLoading, setIsLoading] = useState(true);

    // Data States
    const [totalSales, setTotalSales] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [avgOrderValue, setAvgOrderValue] = useState(0);
    const [salesData, setSalesData] = useState<HourlySalesData[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

    // Load Data based on period
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Determine date range based on period
                const now = new Date();
                let startDate = new Date();
                let endDate = new Date();

                // For "Today", we fetch daily sales and hourly breakdown
                if (period === 'Today') {
                    const todayStr = now.toISOString().split('T')[0];
                    const [daily, hourly, products] = await Promise.all([
                        getDailySales(undefined, todayStr),
                        getHourlySales(undefined, todayStr),
                        getTopProducts(undefined, 10)
                    ]);

                    setTotalSales(daily.totalSales);
                    setTotalOrders(daily.orderCount);
                    setAvgOrderValue(daily.orderCount > 0 ? daily.totalSales / daily.orderCount : 0);
                    setSalesData(hourly);
                    setTopProducts(products);
                }
                // For other periods, we would fetch range data
                // Note: The backend mock currently only supports daily/range basics.
                // We'll simulate other periods using the range API for totals, 
                // but for charts we might need more data points which the mock doesn't fully provide.
                // For this demo, we'll focus on Today's detail view as primary.
                else {
                    // Fallback to range logic
                    if (period === 'Weekly') startDate.setDate(now.getDate() - 7);
                    if (period === 'Monthly') startDate.setMonth(now.getMonth() - 1);
                    if (period === 'Yearly') startDate.setFullYear(now.getFullYear() - 1);

                    const [range, products] = await Promise.all([
                        getSalesByRange(startDate.toISOString(), endDate.toISOString()),
                        getTopProducts(undefined, 10)
                    ]);

                    setTotalSales(range.totalSales);
                    setTotalOrders(range.orderCount);
                    setAvgOrderValue(range.orderCount > 0 ? range.totalSales / range.orderCount : 0);
                    setTopProducts(products);

                    // Clear chart for non-today periods or mock it
                    setSalesData([]);
                }
            } catch (error) {
                console.error('Failed to load analytics:', error);
            }
            setIsLoading(false);
        };

        loadData();
    }, [period]);

    // Derived: Top Categories
    const topCategories = useMemo(() => {
        const categories = new Map<string, number>();

        // Since we don't have direct category info in TopProduct (it just has name/price/id),
        // we'll mock the mapping for visualization purposes or infer if possible.
        // In a real app, TopProduct should include category name.
        // Let's simulate some mock category distribution based on products for the chart
        topProducts.forEach((p, index) => {
            // Mock category assignment based on index
            const cats = ['Beverages', 'Food', 'Desserts', 'Snacks'];
            const cat = cats[index % cats.length];
            const current = categories.get(cat) || 0;
            categories.set(cat, current + p.totalQuantity * Number(p.product.price));
        });

        return Array.from(categories.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [topProducts]);

    return (
        <div className="analytics-dashboard">
            {/* Header */}
            {/* Header */}
            <header className="analytics-header">
                <div className="analytics-header__left">
                    <button className="analytics-back" onClick={() => navigate('/dashboard/settings')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="analytics-title">
                        <h1>Dashboards</h1>
                        <p>Real time reporting based on selection</p>
                    </div>
                </div>
                {isLoading && <div className="analytics-loading">Loading data...</div>}
            </header>

            {/* Filters */}
            <div className="analytics-filters">
                <div className="analytics-filters__periods">
                    {(['Today', 'Weekly', 'Monthly', 'Yearly'] as Period[]).map((p) => (
                        <button
                            key={p}
                            className={`analytics-period-btn ${period === p ? 'active' : ''}`}
                            onClick={() => setPeriod(p)}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <div className="analytics-filters__actions">
                    <button className="analytics-export-btn">
                        <FileText size={18} />
                        PDF
                    </button>
                    <button className="analytics-export-btn">
                        <Download size={18} />
                        XLS
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="analytics-summary">
                <motion.div
                    className="analytics-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="analytics-card__title">Total Orders</div>
                    <div className="analytics-card__value">{totalOrders}</div>
                    <div className="analytics-card__trend positive">
                        <TrendingUp size={16} /> 10% Since last period
                    </div>
                    <ShoppingBag
                        size={80}
                        style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.05 }}
                    />
                </motion.div>

                <motion.div
                    className="analytics-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="analytics-card__title">Revenue</div>
                    <div className="analytics-card__value">₹{totalSales.toLocaleString()}</div>
                    <div className="analytics-card__trend positive">
                        <TrendingUp size={16} /> 20% Since last period
                    </div>
                    <DollarSign
                        size={80}
                        style={{ position: 'absolute', right: -20, bottom: -20, opacity: 0.05 }}
                    />
                </motion.div>

                <motion.div
                    className="analytics-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="analytics-card__title">Average Order</div>
                    <div className="analytics-card__value">₹{avgOrderValue.toFixed(0)}</div>
                    <div className="analytics-card__trend negative">
                        <TrendingDown size={16} /> 5% Since last period
                    </div>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="analytics-charts">
                <motion.div
                    className="chart-container"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="chart-header">
                        <h3 className="chart-title">Sales Overview</h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#007BFF" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#007BFF" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip formatter={(value) => `₹${value}`} />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#007BFF"
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    className="chart-container"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="chart-header">
                        <h3 className="chart-title">Top Categories</h3>
                    </div>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={topCategories}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {topCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Tables Row */}
            <div className="analytics-tables">
                <div className="table-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Top Products</h3>
                    </div>
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th className="text-right">Qty</th>
                                <th className="text-right">Price</th>
                                <th className="text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map((p, index) => (
                                <tr key={index}>
                                    <td>{p.product.name}</td>
                                    <td className="text-right">{p.totalQuantity}</td>
                                    <td className="text-right">₹{Number(p.product.price).toFixed(0)}</td>
                                    <td className="text-right">
                                        ₹{(p.totalQuantity * Number(p.product.price)).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="table-card">
                    <div className="chart-header">
                        <h3 className="chart-title">Category Performance</h3>
                    </div>
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th className="text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topCategories.map((cat, index) => (
                                <tr key={index}>
                                    <td>{cat.name}</td>
                                    <td className="text-right">₹{cat.value.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
