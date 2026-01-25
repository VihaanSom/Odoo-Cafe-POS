/**
 * POS Terminal Settings Page
 * Configure terminals and payment methods
 */
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, X, MoreVertical } from 'lucide-react';
import { getTerminalsApi, createTerminalApi, getBranches, type Terminal } from '../../api/branches.api';
import './TerminalSettings.css';

interface PaymentMethods {
    cash: boolean;
    digital: boolean;
    upi: boolean;
    upiId?: string;
}

interface POSTerminal {
    id: string;
    name: string;
    lastOpen?: string;
    lastSell?: number;
    paymentMethods: PaymentMethods;
}

// LocalStorage key for payment methods
const PAYMENT_METHODS_KEY = 'pos_terminal_payment_methods';

// Default payment methods
const defaultPaymentMethods: PaymentMethods = {
    cash: true,
    digital: true,
    upi: false,
    upiId: '',
};

// Load payment methods from localStorage for a terminal
const loadPaymentMethods = (terminalId: string): PaymentMethods => {
    try {
        const saved = localStorage.getItem(PAYMENT_METHODS_KEY);
        if (saved) {
            const allMethods = JSON.parse(saved);
            return allMethods[terminalId] || { ...defaultPaymentMethods };
        }
    } catch {
        // Ignore parse errors
    }
    return { ...defaultPaymentMethods };
};

// Save payment methods to localStorage for a terminal
const savePaymentMethods = (terminalId: string, methods: PaymentMethods): void => {
    try {
        const saved = localStorage.getItem(PAYMENT_METHODS_KEY);
        const allMethods = saved ? JSON.parse(saved) : {};
        allMethods[terminalId] = methods;
        localStorage.setItem(PAYMENT_METHODS_KEY, JSON.stringify(allMethods));
    } catch {
        console.error('Failed to save payment methods');
    }
};

// Map backend Terminal to POSTerminal for display
const mapTerminalToPOS = (t: Terminal): POSTerminal => ({
    id: t.id,
    name: t.terminalName,
    lastOpen: t.createdAt,
    lastSell: undefined,
    paymentMethods: loadPaymentMethods(t.id),
});

const TerminalSettings = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [terminals, setTerminals] = useState<POSTerminal[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [selectedTerminalId, setSelectedTerminalId] = useState<string>('');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [newTerminalName, setNewTerminalName] = useState('');

    const selectedTerminal = terminals.find(t => t.id === selectedTerminalId) || terminals[0];

    // Fetch terminals from backend on mount
    useEffect(() => {
        const loadTerminals = async () => {
            setIsLoading(true);
            try {
                const backendTerminals = await getTerminalsApi();
                const mappedTerminals = backendTerminals.map(mapTerminalToPOS);
                setTerminals(mappedTerminals);

                // Set selected terminal from URL param or first available
                const urlTerminalId = searchParams.get('terminal');
                if (urlTerminalId && mappedTerminals.find(t => t.id === urlTerminalId)) {
                    setSelectedTerminalId(urlTerminalId);
                } else if (mappedTerminals.length > 0) {
                    setSelectedTerminalId(mappedTerminals[0].id);
                }
            } catch (err) {
                console.error('Failed to load terminals:', err);
                setError('Failed to load terminals');
            }
            setIsLoading(false);
        };
        loadTerminals();
    }, [searchParams]);

    const handlePaymentChange = (field: 'cash' | 'digital' | 'upi', value: boolean) => {
        if (!selectedTerminalId) return;

        setTerminals(prev => prev.map(t => {
            if (t.id === selectedTerminalId) {
                const updatedMethods = { ...t.paymentMethods, [field]: value };
                savePaymentMethods(t.id, updatedMethods);
                return { ...t, paymentMethods: updatedMethods };
            }
            return t;
        }));
    };

    const handleUpiIdChange = (value: string) => {
        if (!selectedTerminalId) return;

        setTerminals(prev => prev.map(t => {
            if (t.id === selectedTerminalId) {
                const updatedMethods = { ...t.paymentMethods, upiId: value };
                savePaymentMethods(t.id, updatedMethods);
                return { ...t, paymentMethods: updatedMethods };
            }
            return t;
        }));
    };

    const handleCreateTerminal = async () => {
        if (!newTerminalName.trim()) return;

        setIsCreating(true);
        setError(null);

        try {
            // Get the first branch to assign to the terminal
            let branchId: string | undefined;
            try {
                const branches = await getBranches();
                if (branches.length > 0) {
                    branchId = branches[0].id;
                }
            } catch {
                // No branches found, will create without branchId
            }

            const response = await createTerminalApi(newTerminalName.trim(), branchId);

            if (response.success && response.terminal) {
                const newPOSTerminal = mapTerminalToPOS(response.terminal);
                setTerminals(prev => [...prev, newPOSTerminal]);
                setSelectedTerminalId(newPOSTerminal.id);
                setNewTerminalName('');
                setIsNewModalOpen(false);
            } else {
                setError(response.error || 'Failed to create terminal');
            }
        } catch (err) {
            console.error('Failed to create terminal:', err);
            setError('Failed to create terminal');
        }

        setIsCreating(false);
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

                {/* Error Message */}
                {error && (
                    <div className="terminal-settings__error">
                        {error}
                        <button onClick={() => setError(null)}>×</button>
                    </div>
                )}

                {/* Content Grid */}
                <div className="terminal-settings__content">
                    {/* Point of Sale Section */}
                    <section className="terminal-settings__section">
                        <div className="terminal-settings__section-header">
                            <h2>Point of Sale</h2>
                        </div>
                        <div className="terminal-settings__terminals">
                            {isLoading ? (
                                <span className="terminal-settings__loading">Loading...</span>
                            ) : terminals.length === 0 ? (
                                <span className="terminal-settings__empty">No terminals yet</span>
                            ) : (
                                terminals.map(terminal => (
                                    <button
                                        key={terminal.id}
                                        className={`terminal-settings__terminal-btn ${selectedTerminalId === terminal.id ? 'terminal-settings__terminal-btn--active' : ''}`}
                                        onClick={() => setSelectedTerminalId(terminal.id)}
                                    >
                                        {terminal.name}
                                    </button>
                                ))
                            )}
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
                    {selectedTerminal && (
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
                    )}
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
                                <p className="terminal-settings__modal-hint">
                                    The terminal will be assigned to the default branch automatically.
                                </p>
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
                                    disabled={!newTerminalName.trim() || isCreating}
                                >
                                    {isCreating ? 'Creating...' : 'Save'}
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
