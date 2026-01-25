import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Clock, CalendarCheck, Home, Settings, ChefHat } from 'lucide-react';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TableCard from '../../components/tables/TableCard';
import { getFloors, getTablesByFloor, getFloorStats, type Floor, type Table } from '../../api/tables.api';
import { useAuth } from '../../store/auth.store';
import { useSession } from '../../store/session.store';
import './POS.css';

const TableView = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { session } = useSession();

    const [floors, setFloors] = useState<Floor[]>([]);
    const [activeFloorId, setActiveFloorId] = useState<string>('');
    const [tables, setTables] = useState<Table[]>([]);
    const [stats, setStats] = useState({ free: 0, occupied: 0, reserved: 0 });
    const [isLoading, setIsLoading] = useState(true);

    // Load floors on mount
    useEffect(() => {
        const loadFloors = async () => {
            const floorsData = await getFloors();
            setFloors(floorsData);
            if (floorsData.length > 0) {
                setActiveFloorId(floorsData[0].id);
            }
        };
        loadFloors();
    }, []);

    // Load tables when floor changes
    useEffect(() => {
        if (!activeFloorId) return;

        const loadTables = async () => {
            setIsLoading(true);
            const [tablesData, statsData] = await Promise.all([
                getTablesByFloor(activeFloorId),
                getFloorStats(activeFloorId),
            ]);
            setTables(tablesData);
            setStats(statsData);
            setIsLoading(false);
        };
        loadTables();
    }, [activeFloorId]);

    const handleTableClick = (table: Table) => {
        navigate(`/pos/order/${table.id}`);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="pos-layout">
            {/* Sidebar */}
            <aside className="pos-sidebar">
                <div className="pos-sidebar__logo">
                    <RestaurantIcon sx={{ fontSize: 24 }} />
                </div>

                <nav className="pos-sidebar__nav">
                    <button className="pos-sidebar__item pos-sidebar__item--active" title="Tables">
                        <LayoutGrid size={22} />
                    </button>
                    <button className="pos-sidebar__item" title="Home" onClick={() => navigate('/dashboard')}>
                        <Home size={22} />
                    </button>
                    <button className="pos-sidebar__item" title="Kitchen Display" onClick={() => navigate('/kitchen')}>
                        <ChefHat size={22} />
                    </button>
                    <button className="pos-sidebar__item" title="Settings" onClick={() => navigate(`/pos/settings${session?.terminal_id ? `?terminal=${session.terminal_id}` : ''}`)}>
                        <Settings size={22} />
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="pos-content">
                {/* Header */}
                <header className="pos-header">
                    <div>
                        <h1 className="pos-header__title">Select a Table</h1>
                        <p className="pos-header__subtitle">Choose a table to start a new order</p>
                    </div>

                    <div className="pos-header__actions">
                        <div className="pos-user">
                            <div className="pos-user__avatar">
                                {user?.fullName ? getInitials(user.fullName) : 'U'}
                            </div>
                            <span className="pos-user__name">{user?.fullName || 'User'}</span>
                        </div>
                    </div>
                </header>

                {/* Stats Bar */}
                <motion.div
                    className="pos-stats"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="pos-stats__item">
                        <div className="pos-stats__icon pos-stats__icon--free">
                            <LayoutGrid size={20} />
                        </div>
                        <div className="pos-stats__text">
                            <span className="pos-stats__count">{stats.free}</span>
                            <span className="pos-stats__label">Available</span>
                        </div>
                    </div>

                    <div className="pos-stats__item">
                        <div className="pos-stats__icon pos-stats__icon--occupied">
                            <Clock size={20} />
                        </div>
                        <div className="pos-stats__text">
                            <span className="pos-stats__count">{stats.occupied}</span>
                            <span className="pos-stats__label">Occupied</span>
                        </div>
                    </div>

                    <div className="pos-stats__item">
                        <div className="pos-stats__icon pos-stats__icon--reserved">
                            <CalendarCheck size={20} />
                        </div>
                        <div className="pos-stats__text">
                            <span className="pos-stats__count">{stats.reserved}</span>
                            <span className="pos-stats__label">Reserved</span>
                        </div>
                    </div>
                </motion.div>

                {/* Floor Tabs */}
                <div className="floor-tabs">
                    {floors.map((floor) => (
                        <button
                            key={floor.id}
                            className={`floor-tabs__item ${activeFloorId === floor.id ? 'floor-tabs__item--active' : ''}`}
                            onClick={() => setActiveFloorId(floor.id)}
                        >
                            {floor.name}
                        </button>
                    ))}
                </div>

                {/* Table Grid */}
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Loading tables...
                    </div>
                ) : (
                    <motion.div
                        className="table-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                    >
                        {tables.map((table, index) => (
                            <motion.div
                                key={table.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <TableCard table={table} onClick={handleTableClick} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default TableView;
