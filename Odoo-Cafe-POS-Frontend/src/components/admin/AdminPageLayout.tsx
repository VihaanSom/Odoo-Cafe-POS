/**
 * Admin Page Layout
 * Reusable layout for all admin/back-office pages
 */
import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import './AdminPageLayout.css';

interface AdminPageLayoutProps {
    title: string;
    children: ReactNode;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    onNewClick?: () => void;
    newButtonLabel?: string;
    showSearch?: boolean;
    showNewButton?: boolean;
    backPath?: string;
}

const AdminPageLayout = ({
    title,
    children,
    searchValue = '',
    onSearchChange,
    onNewClick,
    newButtonLabel = 'New',
    showSearch = true,
    showNewButton = true,
    backPath = '/dashboard/settings',
}: AdminPageLayoutProps) => {
    const navigate = useNavigate();

    return (
        <div className="admin-layout">
            {/* Header */}
            <header className="admin-header">
                <div className="admin-header__left">
                    <button
                        className="admin-header__back"
                        onClick={() => navigate(backPath)}
                        title="Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <motion.h1
                        className="admin-header__title"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        {title}
                    </motion.h1>
                </div>

                <div className="admin-header__actions">
                    {showSearch && (
                        <div className="admin-search">
                            <Search size={18} className="admin-search__icon" />
                            <input
                                type="text"
                                className="admin-search__input"
                                placeholder="Search..."
                                value={searchValue}
                                onChange={(e) => onSearchChange?.(e.target.value)}
                            />
                        </div>
                    )}

                    {showNewButton && (
                        <button className="admin-btn admin-btn--primary" onClick={onNewClick}>
                            <Plus size={18} />
                            {newButtonLabel}
                        </button>
                    )}
                </div>
            </header>

            {/* Content */}
            <main className="admin-content">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default AdminPageLayout;
