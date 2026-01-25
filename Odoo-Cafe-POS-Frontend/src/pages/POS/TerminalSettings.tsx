/**
 * POS Terminal Settings Page
 * Configure terminals and payment methods
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, MoreVertical } from 'lucide-react';
import './TerminalSettings.css';

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

// Load from localStorage or use defaults
const loadTerminals = (): POSTerminal[] => {
    const saved = localStorage.getItem('pos_terminals_v1');
    if (saved) {
        try {
            return JSON.parse(saved);
        } catch {
            // Return defaults
        }
    }
    return [
        {
            id: 'terminal-001-main',
            name: 'Main Terminal',
            lastOpen: '2026-01-01',
            lastSell: 5000,
            paymentMethods: {
                cash: true,
                digital: true,
                upi: false,
                upiId: '',
            },
        },
    ];
};

const TerminalSettings = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [terminals, setTerminals] = useState<POSTerminal[]>(loadTerminals);

    // Get terminal ID from URL param, or fall back to first terminal
    const initialTerminalId = searchParams.get('terminal') || loadTerminals()[0]?.id || '';
    const [selectedTerminalId, setSelectedTerminalId] = useState<string>(initialTerminalId);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newTerminalName, setNewTerminalName] = useState('');

    const selectedTerminal = terminals.find(t => t.id === selectedTerminalId) || terminals[0];

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('pos_terminals_v1', JSON.stringify(terminals));
    }, [terminals]);

    const handlePaymentChange = (field: 'cash' | 'digital' | 'upi', value: boolean) => {
        setTerminals(prev => prev.map(t =>
            t.id === selectedTerminalId
                ? { ...t, paymentMethods: { ...t.paymentMethods, [field]: value } }
                : t
        ));
    };

    const handleUpiIdChange = (value: string) => {
        setTerminals(prev => prev.map(t =>
            t.id === selectedTerminalId
                ? { ...t, paymentMethods: { ...t.paymentMethods, upiId: value } }
                : t
        ));
    };

    const handleCreateTerminal = () => {
        if (!newTerminalName.trim()) return;

        const newTerminal: POSTerminal = {
            id: `terminal-${Date.now()}`,
            name: newTerminalName.trim(),
            paymentMethods: {
                cash: true,
                digital: false,
                upi: false,
                upiId: '',
            },
        };

        setTerminals([...terminals, newTerminal]);
        setSelectedTerminalId(newTerminal.id);
        setNewTerminalName('');
        setIsNewModalOpen(false);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <div className="terminal-settings">
            {/* Main Content */}
            <main className="terminal-settings__main">
                {/* Header */}
                <header className="terminal-settings__header">
                    <button
                        className="terminal-settings__back"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="terminal-settings__header-info">
                        <h1 className="terminal-settings__title">{selectedTerminal?.name || 'Terminal Settings'}</h1>
                        <div className="terminal-settings__meta">
                            <span>Last open: {formatDate(selectedTerminal?.lastOpen)}</span>
                            <span>Last Sell: ₹{selectedTerminal?.lastSell?.toLocaleString() || 0}</span>
                        </div>
                    </div>
                    <button className="terminal-settings__menu-btn">
                        <MoreVertical size={20} />
                    </button>
                </header>

                {/* Content Grid */}
                <div className="terminal-settings__content">
                    {/* Point of Sale Section */}
                    <section className="terminal-settings__section">
                        <div className="terminal-settings__section-header">
                            <h2>Point of Sale</h2>
                        </div>
                        <div className="terminal-settings__terminals">
                            {terminals.map(terminal => (
                                <button
                                    key={terminal.id}
                                    className={`terminal-settings__terminal-btn ${selectedTerminalId === terminal.id ? 'terminal-settings__terminal-btn--active' : ''}`}
                                    onClick={() => setSelectedTerminalId(terminal.id)}
                                >
                                    {terminal.name}
                                </button>
                            ))}
                            <button
                                className="terminal-settings__add-btn"
                                onClick={() => setIsNewModalOpen(true)}
                            >
                                <Plus size={16} />
                                New
                            </button>
                        </div>
                    </section>

                    {/* Payment Method Section */}
                    <section className="terminal-settings__section">
                        <div className="terminal-settings__section-header">
                            <h2>Payment Method</h2>
                        </div>
                        <div className="terminal-settings__payments">
                            <div className="terminal-settings__payment-row">
                                <label className="terminal-settings__checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedTerminal?.paymentMethods.cash || false}
                                        onChange={(e) => handlePaymentChange('cash', e.target.checked)}
                                    />
                                    <span className="terminal-settings__checkbox-text">Cash</span>
                                </label>
                                <label className="terminal-settings__checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedTerminal?.paymentMethods.digital || false}
                                        onChange={(e) => handlePaymentChange('digital', e.target.checked)}
                                    />
                                    <span className="terminal-settings__checkbox-text">Digital (Bank, Card)</span>
                                </label>
                            </div>
                            <div className="terminal-settings__payment-row terminal-settings__payment-row--upi">
                                <label className="terminal-settings__checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={selectedTerminal?.paymentMethods.upi || false}
                                        onChange={(e) => handlePaymentChange('upi', e.target.checked)}
                                    />
                                    <span className="terminal-settings__checkbox-text">QR Payment (UPI)</span>
                                </label>
                                {selectedTerminal?.paymentMethods.upi && (
                                    <div className="terminal-settings__upi-input">
                                        <label>UPI ID</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 123@ybl.com"
                                            value={selectedTerminal?.paymentMethods.upiId || ''}
                                            onChange={(e) => handleUpiIdChange(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* New Terminal Modal */}
            <AnimatePresence>
                {isNewModalOpen && (
                    <motion.div
                        className="terminal-settings__modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsNewModalOpen(false)}
                    >
                        <motion.div
                            className="terminal-settings__modal"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="terminal-settings__modal-header">
                                <h3>New POS Terminal</h3>
                                <button onClick={() => setIsNewModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="terminal-settings__modal-body">
                                <label>
                                    Name
                                    <input
                                        type="text"
                                        placeholder="Terminal name"
                                        value={newTerminalName}
                                        onChange={(e) => setNewTerminalName(e.target.value)}
                                        autoFocus
                                    />
                                </label>
                            </div>
                            <div className="terminal-settings__modal-footer">
                                <button
                                    className="terminal-settings__modal-btn terminal-settings__modal-btn--secondary"
                                    onClick={() => setIsNewModalOpen(false)}
                                >
                                    Discard
                                </button>
                                <button
                                    className="terminal-settings__modal-btn terminal-settings__modal-btn--primary"
                                    onClick={handleCreateTerminal}
                                    disabled={!newTerminalName.trim()}
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TerminalSettings;
