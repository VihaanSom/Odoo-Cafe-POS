import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MonitorSmartphone,
    Play,
    Square,
    Calendar,
    DollarSign,
    Clock,
    LogOut,
    LayoutGrid,
    Settings,
    AlertCircle,
    MoreVertical,
    ChefHat,
    Monitor,
} from 'lucide-react';
import { useAuth } from '../../store/auth.store';
import { useSession } from '../../store/session.store';
import { getTerminalsApi, type Terminal } from '../../api/branches.api';
import { setCustomerDisplaySession } from '../CustomerDisplay/CustomerDisplay';
import StatCard from '../../components/common/StatCard';
import './Dashboard.css';

// POSTerminal interface - now uses backend Terminal
interface POSTerminal {
    id: string;
    name: string;
    lastOpen?: string;
    lastSell?: number;
    paymentMethods: {
        cash: boolean;
        digital: boolean;
        upi: boolean;
        upiId?: string;
    };
}

// Map backend Terminal to POSTerminal for display
const mapTerminalToPOS = (t: Terminal): POSTerminal => ({
    id: t.id,
    name: t.terminalName,
    lastOpen: t.createdAt,
    lastSell: undefined,
    paymentMethods: {
        cash: true,
        digital: true,
        upi: false,
        upiId: '',
    },
});

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { session, isSessionActive, isLoading, error, startSession, endSession, clearError } = useSession();

    // Terminals state - now fetched from backend
    const [terminals, setTerminals] = useState<POSTerminal[]>([]);
    const [isLoadingTerminals, setIsLoadingTerminals] = useState(true);

    // Dropdown menu state - stores the terminal ID of the open menu (or null)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // Track which terminal is currently starting a session
    const [startingTerminalId, setStartingTerminalId] = useState<string | null>(null);

    // Fetch terminals from backend on mount
    useEffect(() => {
        const loadTerminals = async () => {
            setIsLoadingTerminals(true);
            try {
                const backendTerminals = await getTerminalsApi();
                if (backendTerminals.length > 0) {
                    setTerminals(backendTerminals.map(mapTerminalToPOS));
                } else {
                    // No terminals found in database
                    setTerminals([]);
                }
            } catch (err) {
                console.error('Failed to load terminals:', err);
                setTerminals([]);
            }
            setIsLoadingTerminals(false);
        };
        loadTerminals();
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };

        if (openMenuId) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openMenuId]);

    const handleStartSession = async (terminalId: string) => {
        clearError();
        setStartingTerminalId(terminalId);
        const success = await startSession(terminalId);
        setStartingTerminalId(null);
        if (success) {
            // Update customer display to IDLE state
            setCustomerDisplaySession(terminalId, true, 'Odoo Cafe');
            navigate('/pos/tables');
        }
    };

    const handleStopSession = async () => {
        clearError();
        const terminalId = session?.terminal_id;
        const success = await endSession(session?.total_sales || 0);
        if (success && terminalId) {
            // Update customer display to NO_SESSION state
            setCustomerDisplaySession(terminalId, false);
        }
    };

    const handleLogout = () => {
        if (isSessionActive) {
            // Can't logout with an active session
            return;
        }
        logout();
        navigate('/login');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard__header">
                <div>
                    <motion.h1
                        className="dashboard__title"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        Welcome to Odoo Cafe
                    </motion.h1>
                    <p className="dashboard__subtitle">Manage your point of sale sessions</p>
                </div>

                <div className="dashboard__user">
                    <div className="dashboard__user-avatar">
                        {user?.fullName ? getInitials(user.fullName) : 'U'}
                    </div>
                    <div className="dashboard__user-info">
                        <span className="dashboard__user-name">{user?.fullName || 'User'}</span>
                        <span className="dashboard__user-role">Staff</span>
                    </div>
                </div>
            </header>

            {/* Error Message */}
            {error && (
                <motion.div
                    className="dashboard__error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <AlertCircle size={20} />
                    {error}
                </motion.div>
            )}

            {/* Stats Grid */}
            <div className="dashboard__grid">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <StatCard
                        title="Last Closing Date"
                        value={session?.closed_at ? formatDate(session.closed_at) : 'No Previous Session'}
                        icon={<Calendar size={24} />}
                        variant="info"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <StatCard
                        title="Today's Sales"
                        value="₹0.00"
                        icon={<DollarSign size={24} />}
                        variant="success"
                        subtitle="Session not started"
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <StatCard
                        title="Session Duration"
                        value={isSessionActive ? 'Active' : '0h 0m'}
                        icon={<Clock size={24} />}
                        variant={isSessionActive ? 'success' : 'default'}
                    />
                </motion.div>
            </div>

            {/* Terminal Cards */}
            <div className="terminal-cards-grid">
                {isLoadingTerminals ? (
                    <div className="dashboard__loading">Loading terminals...</div>
                ) : terminals.length === 0 ? (
                    <div className="dashboard__empty">
                        <AlertCircle size={48} />
                        <h3>No Terminals Found</h3>
                        <p>You need to create a terminal in the database first.</p>
                        <p style={{ fontSize: '0.9rem', color: '#6B7280' }}>
                            Go to Settings → Terminals to create one.
                        </p>
                    </div>
                ) : (
                    terminals.map((terminal, index) => (
                        <motion.div
                            key={terminal.id}
                            className="terminal-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                        >
                            {/* Menu Dropdown - Top Right */}
                            <div className="terminal-card__menu-wrapper" ref={openMenuId === terminal.id ? menuRef : null}>
                                <button
                                    className="terminal-card__settings-btn"
                                    onClick={() => setOpenMenuId(openMenuId === terminal.id ? null : terminal.id)}
                                >
                                    <MoreVertical size={18} />
                                </button>
                                <AnimatePresence>
                                    {openMenuId === terminal.id && (
                                        <motion.div
                                            className="terminal-card__dropdown"
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            <button
                                                className="terminal-card__dropdown-item"
                                                onClick={() => {
                                                    setOpenMenuId(null);
                                                    navigate(`/pos/settings?terminal=${terminal.id}`);
                                                }}
                                            >
                                                <Settings size={16} />
                                                Setting
                                            </button>
                                            <button
                                                className="terminal-card__dropdown-item"
                                                onClick={() => {
                                                    setOpenMenuId(null);
                                                    navigate('/kitchen');
                                                }}
                                            >
                                                <ChefHat size={16} />
                                                Kitchen Display
                                            </button>
                                            <button
                                                className="terminal-card__dropdown-item"
                                                onClick={() => {
                                                    setOpenMenuId(null);
                                                    window.open(`/customer-display/${terminal.id}`, `customer-display-${terminal.id}`, 'width=1024,height=768');
                                                }}
                                            >
                                                <Monitor size={16} />
                                                Customer Display
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="terminal-card__header">
                                <div className="terminal-card__info">
                                    <span className="terminal-card__name">
                                        <MonitorSmartphone
                                            size={20}
                                            style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}
                                        />
                                        {terminal.name}
                                        <span
                                            className={`terminal-card__status-dot ${isSessionActive && session?.terminal_id === terminal.id ? 'terminal-card__status-dot--active' : ''}`}
                                            title={isSessionActive && session?.terminal_id === terminal.id ? 'Session Active' : 'No Active Session'}
                                            style={{ marginLeft: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }}
                                        ></span>
                                    </span>
                                    <span className="terminal-card__id">ID: {terminal.id}</span>
                                </div>
                            </div>

                            <div className="terminal-card__details">
                                <div className="terminal-card__detail">
                                    <span className="terminal-card__detail-label">Last Open</span>
                                    <span className="terminal-card__detail-value">
                                        {terminal.lastOpen ? formatDate(terminal.lastOpen) : '—'}
                                    </span>
                                </div>
                                <div className="terminal-card__detail">
                                    <span className="terminal-card__detail-label">Last Sell</span>
                                    <span className="terminal-card__detail-value">
                                        {terminal.lastSell ? `₹${terminal.lastSell.toLocaleString()}` : '—'}
                                    </span>
                                </div>
                            </div>

                            <div className="terminal-card__actions">
                                {isSessionActive && session?.terminal_id === terminal.id ? (
                                    <button
                                        className="terminal-card__btn terminal-card__btn--danger"
                                        onClick={handleStopSession}
                                        disabled={isLoading}
                                    >
                                        <Square size={18} fill="currentColor" />
                                        {isLoading ? 'Stopping...' : 'Stop Session'}
                                    </button>
                                ) : (
                                    <button
                                        className="terminal-card__btn terminal-card__btn--primary"
                                        onClick={() => handleStartSession(terminal.id)}
                                        disabled={isLoading || isSessionActive || startingTerminalId !== null}
                                    >
                                        <Play size={20} />
                                        {startingTerminalId === terminal.id ? 'Starting...' : 'New Session'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Quick Actions */}
            <h2 className="dashboard__section-title" style={{ marginTop: '2rem' }}>
                Quick Actions
            </h2>
            <div className="quick-actions">
                <motion.div
                    className="quick-action"
                    onClick={() => isSessionActive && navigate('/pos/tables')}
                    style={{ opacity: isSessionActive ? 1 : 0.5, cursor: isSessionActive ? 'pointer' : 'not-allowed' }}
                    whileHover={isSessionActive ? { scale: 1.02 } : {}}
                    whileTap={isSessionActive ? { scale: 0.98 } : {}}
                >
                    <div className="quick-action__icon">
                        <LayoutGrid size={24} />
                    </div>
                    <div className="quick-action__text">
                        <span className="quick-action__title">Open Session</span>
                        <span className="quick-action__subtitle">View table selection</span>
                    </div>
                </motion.div>

                <motion.div
                    className="quick-action"
                    onClick={() => navigate('/dashboard/settings')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="quick-action__icon">
                        <Settings size={24} />
                    </div>
                    <div className="quick-action__text">
                        <span className="quick-action__title">Settings</span>
                        <span className="quick-action__subtitle">Configure Backend</span>
                    </div>
                </motion.div>

                <motion.div
                    className="quick-action"
                    onClick={handleLogout}
                    whileHover={isSessionActive ? {} : { scale: 1.02 }}
                    whileTap={isSessionActive ? {} : { scale: 0.98 }}
                    style={{ opacity: isSessionActive ? 0.5 : 1, cursor: isSessionActive ? 'not-allowed' : 'pointer' }}
                    title={isSessionActive ? 'Stop all sessions before logging out' : ''}
                >
                    <div className="quick-action__icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                        <LogOut size={24} />
                    </div>
                    <div className="quick-action__text">
                        <span className="quick-action__title">Logout</span>
                        {isSessionActive && (
                            <span className="quick-action__subtitle" style={{ color: '#DC2626' }}>Stop session first</span>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
