/**
 * ConfirmDialog Component
 * A styled confirmation modal to replace browser alerts
 */
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, Archive, X } from 'lucide-react';

export type ConfirmType = 'delete' | 'archive' | 'warning';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: ConfirmType;
}

const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    type = 'warning',
}: ConfirmDialogProps) => {

    const getIcon = () => {
        switch (type) {
            case 'delete':
                return <Trash2 size={28} />;
            case 'archive':
                return <Archive size={28} />;
            default:
                return <AlertTriangle size={28} />;
        }
    };

    const getIconColor = () => {
        switch (type) {
            case 'delete':
                return '#DC2626';
            case 'archive':
                return '#F59E0B';
            default:
                return '#F59E0B';
        }
    };

    const getButtonClass = () => {
        switch (type) {
            case 'delete':
                return 'confirm-dialog__btn--danger';
            case 'archive':
                return 'confirm-dialog__btn--warning';
            default:
                return 'confirm-dialog__btn--warning';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="confirm-dialog-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="confirm-dialog"
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="confirm-dialog__close" onClick={onClose}>
                            <X size={18} />
                        </button>

                        <div className="confirm-dialog__icon" style={{ color: getIconColor() }}>
                            {getIcon()}
                        </div>

                        <h3 className="confirm-dialog__title">{title}</h3>
                        <p className="confirm-dialog__message">{message}</p>

                        <div className="confirm-dialog__actions">
                            <button
                                className="confirm-dialog__btn confirm-dialog__btn--secondary"
                                onClick={onClose}
                            >
                                {cancelLabel}
                            </button>
                            <button
                                className={`confirm-dialog__btn ${getButtonClass()}`}
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                            >
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>

                    <style>{`
                        .confirm-dialog-overlay {
                            position: fixed;
                            inset: 0;
                            background: rgba(0, 0, 0, 0.5);
                            backdrop-filter: blur(4px);
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 1000;
                            padding: 1rem;
                        }

                        .confirm-dialog {
                            background: white;
                            border-radius: 16px;
                            padding: 2rem;
                            max-width: 400px;
                            width: 100%;
                            text-align: center;
                            position: relative;
                            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
                        }

                        .confirm-dialog__close {
                            position: absolute;
                            top: 1rem;
                            right: 1rem;
                            width: 32px;
                            height: 32px;
                            border: none;
                            background: #f3f4f6;
                            border-radius: 8px;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: #6b7280;
                            transition: all 0.15s;
                        }

                        .confirm-dialog__close:hover {
                            background: #e5e7eb;
                            color: #374151;
                        }

                        .confirm-dialog__icon {
                            width: 64px;
                            height: 64px;
                            border-radius: 50%;
                            background: #FEF2F2;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 1.25rem;
                        }

                        .confirm-dialog__title {
                            font-size: 1.25rem;
                            font-weight: 600;
                            color: #111827;
                            margin: 0 0 0.5rem;
                        }

                        .confirm-dialog__message {
                            font-size: 0.95rem;
                            color: #6b7280;
                            margin: 0 0 1.5rem;
                            line-height: 1.5;
                        }

                        .confirm-dialog__actions {
                            display: flex;
                            gap: 0.75rem;
                            justify-content: center;
                        }

                        .confirm-dialog__btn {
                            padding: 0.75rem 1.5rem;
                            border-radius: 8px;
                            font-size: 0.95rem;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.15s;
                            min-width: 100px;
                        }

                        .confirm-dialog__btn--secondary {
                            background: #f3f4f6;
                            border: 1px solid #e5e7eb;
                            color: #374151;
                        }

                        .confirm-dialog__btn--secondary:hover {
                            background: #e5e7eb;
                        }

                        .confirm-dialog__btn--danger {
                            background: #DC2626;
                            border: none;
                            color: white;
                        }

                        .confirm-dialog__btn--danger:hover {
                            background: #B91C1C;
                        }

                        .confirm-dialog__btn--warning {
                            background: #F59E0B;
                            border: none;
                            color: white;
                        }

                        .confirm-dialog__btn--warning:hover {
                            background: #D97706;
                        }
                    `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ConfirmDialog;
