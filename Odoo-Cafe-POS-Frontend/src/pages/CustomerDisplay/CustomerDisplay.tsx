/**
 * Customer Display Page
 * Shows real-time order information to customers on a secondary screen.
 * Each POS terminal has its own customer display.
 */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import './CustomerDisplay.css';

// Display states
type DisplayState = 'NO_SESSION' | 'IDLE' | 'CART' | 'PAYMENT' | 'THANKYOU';

// Cart item interface
interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
}

// Customer display data stored in localStorage
interface CustomerDisplayData {
    state: DisplayState;
    cartItems: CartItem[];
    subtotal: number;
    tax: number;
    total: number;
    upiId?: string;
    sessionActive: boolean;
    storeName: string;
}

// localStorage key prefix
const STORAGE_KEY_PREFIX = 'customer_display_';

const getStorageKey = (terminalId: string) => `${STORAGE_KEY_PREFIX}${terminalId}`;

// Default data
const getDefaultData = (): CustomerDisplayData => ({
    state: 'NO_SESSION',
    cartItems: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    upiId: '',
    sessionActive: false,
    storeName: 'Odoo Cafe',
});

const CustomerDisplay = () => {
    const { terminalId } = useParams<{ terminalId: string }>();
    const [displayData, setDisplayData] = useState<CustomerDisplayData>(getDefaultData());

    // Load initial data and listen for changes
    useEffect(() => {
        if (!terminalId) return;

        const storageKey = getStorageKey(terminalId);

        // Load initial data
        const loadData = () => {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
                try {
                    const data = JSON.parse(stored) as CustomerDisplayData;
                    setDisplayData(data);
                } catch {
                    setDisplayData(getDefaultData());
                }
            } else {
                setDisplayData(getDefaultData());
            }
        };

        loadData();

        // Listen for storage changes (cross-window communication)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === storageKey && e.newValue) {
                try {
                    const data = JSON.parse(e.newValue) as CustomerDisplayData;
                    setDisplayData(data);
                } catch {
                    // Ignore parse errors
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also poll periodically for same-window updates
        const pollInterval = setInterval(loadData, 500);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(pollInterval);
        };
    }, [terminalId]);

    // Handle THANKYOU state timeout (5-10 seconds)
    useEffect(() => {
        if (displayData.state === 'THANKYOU' && terminalId) {
            const timer = setTimeout(() => {
                // Reset to IDLE state after thank you
                const storageKey = getStorageKey(terminalId);
                const newData: CustomerDisplayData = {
                    ...getDefaultData(),
                    state: 'IDLE',
                    sessionActive: true,
                    storeName: displayData.storeName,
                };
                localStorage.setItem(storageKey, JSON.stringify(newData));
                setDisplayData(newData);
            }, 7000); // 7 seconds

            return () => clearTimeout(timer);
        }
    }, [displayData.state, terminalId, displayData.storeName]);

    // Render right panel content based on state
    const renderRightPanel = () => {
        switch (displayData.state) {
            case 'NO_SESSION':
                return (
                    <div className="customer-display__message">
                        <div className="customer-display__message-icon">⏸️</div>
                        <h2>Please Start Session</h2>
                        <p>Waiting for cashier to begin...</p>
                    </div>
                );

            case 'IDLE':
                return (
                    <div className="customer-display__message">
                        <div className="customer-display__message-icon">👋</div>
                        <h2>Ready to Serve</h2>
                        <p>Your order will appear here</p>
                    </div>
                );

            case 'CART':
                return (
                    <div className="customer-display__cart">
                        <div className="customer-display__cart-items">
                            {displayData.cartItems.map((item, index) => (
                                <div key={`${item.productId}-${index}`} className="customer-display__cart-item">
                                    <span className="customer-display__item-qty">{item.quantity} x</span>
                                    <span className="customer-display__item-name">{item.name}</span>
                                    <span className="customer-display__item-price">₹{(item.price * item.quantity).toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="customer-display__cart-summary">
                            <div className="customer-display__summary-row">
                                <span>Sub Total:</span>
                                <span>₹ {displayData.subtotal.toFixed(0)}</span>
                            </div>
                            <div className="customer-display__summary-row">
                                <span>Tax:</span>
                                <span>₹ {displayData.tax.toFixed(0)}</span>
                            </div>
                            <div className="customer-display__summary-row customer-display__summary-row--total">
                                <span>Total:</span>
                                <span>₹{displayData.total.toFixed(0)}</span>
                            </div>
                        </div>
                    </div>
                );

            case 'PAYMENT':
                return (
                    <div className="customer-display__payment">
                        <h2 className="customer-display__payment-title">UPI QR</h2>
                        <div className="customer-display__qr-container">
                            <div className="customer-display__qr-box">
                                <div className="customer-display__qr-label">UPI QR</div>
                                <div className="customer-display__qr-placeholder">
                                    {/* QR Code would go here - for now showing placeholder */}
                                    <div className="customer-display__qr-icon">📱</div>
                                    <span>Scan to Pay</span>
                                </div>
                            </div>
                        </div>
                        <div className="customer-display__payment-amount">
                            Amount: ₹ {displayData.total.toFixed(0)}
                        </div>
                    </div>
                );

            case 'THANKYOU':
                return (
                    <div className="customer-display__thankyou">
                        <h1>Thank you for visiting!</h1>
                        <h2>We hope to see you again soon</h2>
                        <div className="customer-display__thankyou-tag">
                            Adani Cafe POS
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="customer-display">
            {/* Left Panel - Fixed */}
            <div className="customer-display__left">
                <div className="customer-display__logo">
                    <div className="customer-display__logo-icon">
                        <RestaurantIcon sx={{ fontSize: 48 }} />
                    </div>
                    <span>Cafe</span>
                </div>

                <div className="customer-display__welcome">
                    <p>Welcome to</p>
                    <h2>'{displayData.storeName}'</h2>
                </div>

                <div className="customer-display__footer">
                    Powered by <span>Odoo Cafe POS</span>
                </div>
            </div>

            {/* Right Panel - Dynamic */}
            <div className="customer-display__right">
                {renderRightPanel()}
            </div>
        </div>
    );
};

export default CustomerDisplay;

// Helper function to update customer display from other components
export const updateCustomerDisplay = (terminalId: string, data: Partial<CustomerDisplayData>) => {
    const storageKey = getStorageKey(terminalId);
    const currentData = localStorage.getItem(storageKey);
    const parsedData = currentData ? JSON.parse(currentData) : getDefaultData();
    const newData = { ...parsedData, ...data };
    localStorage.setItem(storageKey, JSON.stringify(newData));
};

// Helper to set cart items
export const setCustomerDisplayCart = (
    terminalId: string,
    cartItems: CartItem[],
    subtotal: number,
    tax: number,
    total: number
) => {
    updateCustomerDisplay(terminalId, {
        state: cartItems.length > 0 ? 'CART' : 'IDLE',
        cartItems,
        subtotal,
        tax,
        total,
    });
};

// Helper to set payment mode
export const setCustomerDisplayPayment = (terminalId: string, upiId?: string, total?: number) => {
    updateCustomerDisplay(terminalId, {
        state: 'PAYMENT',
        upiId,
        total: total ?? 0,
    });
};

// Helper to set thank you mode
export const setCustomerDisplayThankYou = (terminalId: string) => {
    updateCustomerDisplay(terminalId, {
        state: 'THANKYOU',
    });
};

// Helper to set session state
export const setCustomerDisplaySession = (terminalId: string, active: boolean, storeName?: string) => {
    updateCustomerDisplay(terminalId, {
        state: active ? 'IDLE' : 'NO_SESSION',
        sessionActive: active,
        storeName: storeName ?? 'Odoo Cafe',
        cartItems: [],
        subtotal: 0,
        tax: 0,
        total: 0,
    });
};
