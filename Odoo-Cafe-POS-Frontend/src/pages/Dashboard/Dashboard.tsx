import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useAuth } from '../../store/auth.store';
import { useSession } from '../../store/session.store';
import { getTerminalsApi, type Terminal } from '../../api/branches.api';
import StatCard from '../../components/common/StatCard';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { session, isSessionActive, isLoading, error, startSession, endSession, clearError } = useSession();

    // Terminal state
    const [terminals, setTerminals] = useState<Terminal[]>([]);
    const [selectedTerminalId, setSelectedTerminalId] = useState<string>('');
    const [isLoadingTerminals, setIsLoadingTerminals] = useState(true);

    // Load terminals on mount
    useEffect(() => {
        const loadTerminals = async () => {
            setIsLoadingTerminals(true);
            const terminalsData = await getTerminalsApi();
            setTerminals(terminalsData);
            // Auto-select first terminal if available
            if (terminalsData.length > 0 && !selectedTerminalId) {
                setSelectedTerminalId(terminalsData[0].id);
            }
            setIsLoadingTerminals(false);
        };
        loadTerminals();
    }, []);

    const handleStartSession = async () => {
        if (!selectedTerminalId) {
            return;
        }
        clearError();
        const success = await startSession(selectedTerminalId);
        if (success) {
            navigate('/pos/tables');
        }
    };

    const handleStopSession = async () => {
        clearError();
        const success = await endSession(session?.total_sales || 0);
        if (success) {
            // Session closed, stay on dashboard
        }
    };

    const handleLogout = () => {
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

            {/* Terminal Card */}
            <motion.div
                className="terminal-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            >
                {/* Settings Icon - Top Right */}
                <button
                    className="terminal-card__settings-btn"
                    onClick={() => navigate('/dashboard/settings')}
                >
                    <Settings size={18} />
                </button>

                <div className="terminal-card__header">
                    <div className="terminal-card__info">
                        <span className="terminal-card__name">
                            <MonitorSmartphone
                                size={20}
                                style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}
                            />
                            {isLoadingTerminals ? 'Loading terminals...' : (
                                terminals.length > 0 ? (
                                    <select
                                        className="terminal-card__select"
                                        value={selectedTerminalId}
                                        onChange={(e) => setSelectedTerminalId(e.target.value)}
                                        disabled={isSessionActive || isLoading}
                                    >
                                        {terminals.map((terminal) => (
                                            <option key={terminal.id} value={terminal.id}>
                                                {terminal.terminal_name}
                                            </option>
                                        ))}
                                    </select>
                                ) : 'No terminals available'
                            )}
                            <span
                                className={`terminal-card__status-dot ${isSessionActive ? 'terminal-card__status-dot--active' : ''}`}
                                title={isSessionActive ? 'Session Active' : 'No Active Session'}
                                style={{ marginLeft: '0.5rem', display: 'inline-block', verticalAlign: 'middle' }}
                            ></span>
                        </span>
                        <span className="terminal-card__id">ID: {selectedTerminalId || '—'}</span>
                    </div>
                </div>

                <div className="terminal-card__details">
                    <div className="terminal-card__detail">
                        <span className="terminal-card__detail-label">Session ID</span>
                        <span className="terminal-card__detail-value">
                            {session?.id || '—'}
                        </span>
                    </div>
                    <div className="terminal-card__detail">
                        <span className="terminal-card__detail-label">Opened At</span>
                        <span className="terminal-card__detail-value">
                            {session?.opened_at ? formatDate(session.opened_at) : '—'}
                        </span>
                    </div>
                </div>

                <div className="terminal-card__actions">
                    {isSessionActive ? (
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
                            onClick={handleStartSession}
                            disabled={isLoading}
                        >
                            <Play size={20} />
                            {isLoading ? 'Starting...' : 'New Session'}
                        </button>
                    )}
                </div>
            </motion.div>

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
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="quick-action__icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
                        <LogOut size={24} />
                    </div>
                    <div className="quick-action__text">
                        <span className="quick-action__title">Logout</span>
                        <span className="quick-action__subtitle">End your shift</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
