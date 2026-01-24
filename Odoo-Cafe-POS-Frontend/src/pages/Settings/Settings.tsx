/**
 * Settings Page
 * Navigation hub for all admin/back-office modules
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Package,
    FolderOpen,
    Receipt,
    Users,
    CreditCard,
    LayoutGrid,
    ArrowLeft,
} from 'lucide-react';
import './Settings.css';

interface SettingsLink {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    path: string;
    color: string;
}

const settingsLinks: SettingsLink[] = [
    {
        title: 'Products',
        subtitle: 'Manage menu items',
        icon: <Package size={24} />,
        path: '/dashboard/products',
        color: '#009688',
    },
    {
        title: 'Categories',
        subtitle: 'Organize products',
        icon: <FolderOpen size={24} />,
        path: '/dashboard/categories',
        color: '#6366F1',
    },
    {
        title: 'Floor Plan',
        subtitle: 'Edit table layout',
        icon: <LayoutGrid size={24} />,
        path: '/dashboard/floors',
        color: '#F59E0B',
    },
    {
        title: 'Orders',
        subtitle: 'View order history',
        icon: <Receipt size={24} />,
        path: '/dashboard/orders',
        color: '#10B981',
    },
    {
        title: 'Customers',
        subtitle: 'Manage customers',
        icon: <Users size={24} />,
        path: '/dashboard/customers',
        color: '#EC4899',
    },
    {
        title: 'Payments',
        subtitle: 'Transaction history',
        icon: <CreditCard size={24} />,
        path: '/dashboard/payments',
        color: '#8B5CF6',
    },
];

const Settings = () => {
    const navigate = useNavigate();

    return (
        <div className="settings-page">
            <header className="settings-header">
                <button className="settings-back" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="settings-title">Settings</h1>
                    <p className="settings-subtitle">Configure your POS system</p>
                </div>
            </header>

            <div className="settings-grid">
                {settingsLinks.map((link, index) => (
                    <motion.div
                        key={link.path}
                        className="settings-card"
                        onClick={() => navigate(link.path)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -3 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div
                            className="settings-card__icon"
                            style={{ background: `${link.color}15`, color: link.color }}
                        >
                            {link.icon}
                        </div>
                        <div className="settings-card__text">
                            <h3 className="settings-card__title">{link.title}</h3>
                            <p className="settings-card__subtitle">{link.subtitle}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Settings;
