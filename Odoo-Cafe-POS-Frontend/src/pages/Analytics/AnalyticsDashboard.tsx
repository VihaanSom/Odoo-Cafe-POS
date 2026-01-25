/**
 * Analytics Dashboard
 * Shows real-time reporting based on selection
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
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

// Augmented data type for chart
interface ChartData extends HourlySalesData {
    label?: string; // For formatted display (e.g., "Mon", "Jan 1")
    fullDate?: string; // For tooltip
}

const AnalyticsDashboard = () => {
    const navigate = useNavigate();
    const [period, setPeriod] = useState<Period>('Today');
    const [isLoading, setIsLoading] = useState(true);

    // Data States
    const [totalSales, setTotalSales] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [avgOrderValue, setAvgOrderValue] = useState(0);
    const [salesData, setSalesData] = useState<ChartData[]>([]);
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
                    // Format hourly data
                    setSalesData(hourly.map(h => ({
                        ...h,
                        label: `${h.hour}:00`,
                        fullDate: `${h.hour}:00 - ${h.hour + 1}:00`
                    })));
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

                    // Process real daily breakdown data
                    const breakdown = range.dailyBreakdown || [];
                    const breakdownMap = new Map(breakdown.map(b => [b.date.split('T')[0], b]));

                    let chartData: ChartData[] = [];

                    if (period === 'Yearly') {
                        // Aggregate by month for Yearly view
                        const months = Array.from({ length: 12 }, (_, i) => {
                            const d = new Date(now.getFullYear(), i, 1);
                            return {
                                hour: i + 1,
                                sales: 0,
                                orders: 0,
                                label: d.toLocaleDateString('en-US', { month: 'short' }),
                                fullDate: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                            };
                        });

                        breakdown.forEach(day => {
                            const date = new Date(day.date);
                            const monthIdx = date.getMonth(); // 0-11
                            months[monthIdx].sales += day.sales;
                            months[monthIdx].orders += day.orders;
                        });
                        chartData = months;
                    } else {
                        // Daily breakdown for Weekly/Monthly
                        const points = period === 'Weekly' ? 7 : 30; // Approx for monthly
                        chartData = Array.from({ length: points }, (_, i) => {
                            const d = new Date(endDate);
                            d.setDate(d.getDate() - (points - 1 - i));
                            const dateStr = d.toISOString().split('T')[0];
                            const data = breakdownMap.get(dateStr);

                            // Format Label based on period
                            let label = '';
                            if (period === 'Weekly') {
                                label = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue
                            } else {
                                label = d.getDate().toString(); // 1, 2, 3
                            }

                            return {
                                hour: d.getDate(), // Show day of month
                                sales: data ? data.sales : 0,
                                orders: data ? data.orders : 0,
                                label: label,
                                fullDate: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
                            };
                        });
                    }

                    setSalesData(chartData);
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

    const handleExportXLS = () => {
        // Create workbook
        const wb = XLSX.utils.book_new();

        // 1. Summary Sheet
        const summaryData = [
            ["Metric", "Value"],
            ["Total Sales", totalSales],
            ["Total Orders", totalOrders],
            ["Avg Order Value", avgOrderValue.toFixed(2)],
            [],
            ["Report Generated", new Date().toLocaleString()],
            ["Period", period]
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        wsSummary['!cols'] = [{ wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

        // 2. Sales Timeline Sheet (New)
        const timelineHeader = period === 'Today' ? ["Hour", "Sales", "Orders"] : ["Date", "Sales", "Orders"];
        const timelineData = [
            timelineHeader,
            ...salesData.map(d => [
                d.fullDate || d.label || d.hour, // Best available label
                d.sales,
                d.orders
            ])
        ];
        const wsTimeline = XLSX.utils.aoa_to_sheet(timelineData);
        wsTimeline['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, wsTimeline, "Sales Timeline");

        // 3. Products Sheet
        const productData = [
            ["Product", "Qty", "Price", "Revenue"],
            ...topProducts.map(p => [
                p.product.name,
                p.totalQuantity,
                p.product.price,
                p.totalQuantity * Number(p.product.price)
            ])
        ];
        const wsProducts = XLSX.utils.aoa_to_sheet(productData);
        wsProducts['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 10 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsProducts, "Top Products");

        // 4. Categories Sheet
        const categoryData = [
            ["Category", "Revenue"],
            ...topCategories.map(c => [c.name, c.value])
        ];
        const wsCategories = XLSX.utils.aoa_to_sheet(categoryData);
        wsCategories['!cols'] = [{ wch: 20 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, wsCategories, "Categories");

        // Save file
        XLSX.writeFile(wb, `analytics_report_${period}_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="analytics-dashboard">
            {/* Print Only Header */}
            <div className="print-header">
                <div className="print-header__brand">
                    <h1>Odoo Cafe POS</h1>
                    <p>Analytics Report</p>
                </div>
                <div className="print-header__info">
                    <p><strong>Period:</strong> {period} ({new Date().toLocaleDateString()})</p>
                    <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
                </div>
            </div>

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
                    <button className="analytics-export-btn" onClick={handlePrint}>
                        <FileText size={18} />
                        PDF
                    </button>
                    <button className="analytics-export-btn" onClick={handleExportXLS}>
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
                                <XAxis
                                    dataKey="label"
                                    tick={{ fontSize: 12 }}
                                    interval={period === 'Monthly' ? 5 : 0}
                                />
                                <YAxis />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const dataItem = payload[0].payload as ChartData;
                                            return (
                                                <div style={{ background: 'white', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                                                    <p style={{ fontWeight: 'bold', margin: '0 0 5px' }}>{dataItem.fullDate || label}</p>
                                                    <p style={{ margin: 0, color: '#007BFF' }}>Sales: ₹{Number(payload[0].value).toLocaleString()}</p>
                                                    <p style={{ margin: 0, fontSize: '0.85em', color: '#666' }}>Orders: {dataItem.orders}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
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
