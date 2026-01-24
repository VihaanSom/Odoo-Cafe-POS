import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import type { Table } from '../../api/tables.api';

interface TableCardProps {
    table: Table;
    onClick: (table: Table) => void;
}

const TableCard = ({ table, onClick }: TableCardProps) => {
    const { tableNumber, seats, status, occupiedInfo } = table;

    const getStatusClass = () => {
        switch (status) {
            case 'FREE':
                return 'table-card--free';
            case 'OCCUPIED':
                return 'table-card--occupied';
            case 'RESERVED':
                return 'table-card--reserved';
            default:
                return '';
        }
    };

    const getStatusBadgeClass = () => {
        switch (status) {
            case 'FREE':
                return 'table-card__status--free';
            case 'OCCUPIED':
                return 'table-card__status--occupied';
            case 'RESERVED':
                return 'table-card__status--reserved';
            default:
                return '';
        }
    };

    const getStatusLabel = () => {
        switch (status) {
            case 'FREE':
                return 'Available';
            case 'OCCUPIED':
                return 'Occupied';
            case 'RESERVED':
                return 'Reserved';
            default:
                return status;
        }
    };

    return (
        <motion.div
            className={`table-card ${getStatusClass()}`}
            onClick={() => onClick(table)}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <span className="table-card__number">{tableNumber}</span>

            <div className="table-card__seats">
                <Users className="table-card__seats-icon" size={16} />
                <span>{seats} seats</span>
            </div>

            <span className={`table-card__status ${getStatusBadgeClass()}`}>
                {getStatusLabel()}
            </span>

            {status === 'OCCUPIED' && occupiedInfo && (
                <span className="table-card__info">
                    ⏱ {occupiedInfo.duration}
                </span>
            )}
        </motion.div>
    );
};

export default TableCard;
