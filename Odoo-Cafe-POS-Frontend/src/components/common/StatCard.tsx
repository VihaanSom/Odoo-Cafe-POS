import { type ReactNode } from 'react';
import './StatCard.css';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'info';
    subtitle?: string;
}

const StatCard = ({ title, value, icon, variant = 'default', subtitle }: StatCardProps) => {
    return (
        <div className={`stat-card stat-card--${variant}`}>
            {icon && <div className="stat-card__icon">{icon}</div>}
            <div className="stat-card__content">
                <span className="stat-card__title">{title}</span>
                <span className="stat-card__value">{value}</span>
                {subtitle && <span className="stat-card__subtitle">{subtitle}</span>}
            </div>
        </div>
    );
};

export default StatCard;
