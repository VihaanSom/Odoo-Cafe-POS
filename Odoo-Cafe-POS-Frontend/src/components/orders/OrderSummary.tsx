import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CreditCard, ClipboardList } from 'lucide-react';
import { useOrder } from '../../store/order.store';
import { useSession } from '../../store/session.store';
import {
    createOrderBackendApi,
    sendToKitchenBackendApi,
    getActiveOrderByTableApi,
    type CreateOrderBackendRequest
} from '../../api/orders.api';
import { processPaymentBackendApi, generateReceiptBackendApi, type PaymentMethod } from '../../api/payments.api';
import {
    setCustomerDisplayCart,
    setCustomerDisplayPayment,
    setCustomerDisplayThankYou
} from '../../pages/CustomerDisplay/CustomerDisplay';

interface OrderSummaryProps {
    tableNumber: string;
    tableId: string;
    branchId?: string;
}

const OrderSummary = ({ tableNumber, tableId, branchId = 'default-branch' }: OrderSummaryProps) => {
    const {
        cart,
        orderNumber,
        addToCart,
        removeFromCart,
        cartSubtotal,
        cartTax,
        cartTotal,
        clearCart,
    } = useOrder();

    const { session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(0);
    const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
    const [receiptData, setReceiptData] = useState<any>(null);

    const formatPrice = (price: number | string | undefined | null) => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : Number(price);
        if (isNaN(numPrice)) return '₹0.00';
        return `₹${numPrice.toFixed(2)}`;
    };

    // Sync cart changes to customer display
    useEffect(() => {
        if (!session?.terminal_id) return;

        setCustomerDisplayCart(
            session.terminal_id,
            cart.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            cartSubtotal,
            cartTax,
            cartTotal
        );
    }, [cart, cartSubtotal, cartTax, cartTotal, session?.terminal_id]);

    const initiatePayment = async () => {
        if (!session) {
            setOrderError('No active session.');
            return;
        }

        setOrderError(null);
        setIsLoading(true);
        setReceiptData(null); // Reset receipt

        try {
            // Scene 1: Cart has items -> Create Order then Pay
            if (cart.length > 0) {
                if (!branchId) {
                    setOrderError('Branch info missing. Refresh page.');
                    setIsLoading(false);
                    return;
                }

                // We'll create the order first
                // Note: In a real flow, you might want to confirm before creating
                const orderData: CreateOrderBackendRequest = {
                    branchId: branchId,
                    sessionId: session.id,
                    orderType: 'DINE_IN',
                    tableId: tableId,
                    items: cart.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                };

                const createResult = await createOrderBackendApi(orderData);
                if (!createResult.success || !createResult.order) {
                    setOrderError(createResult.error || 'Failed to create order');
                    setIsLoading(false);
                    return;
                }

                // Send to kitchen too
                await sendToKitchenBackendApi(createResult.order.id);

                setActiveOrderId(createResult.order.id);
                setPaymentAmount(createResult.order.total_amount);
                setShowPayment(true);

                // Update customer display to payment mode
                if (session?.terminal_id) {
                    setCustomerDisplayPayment(session.terminal_id, '', createResult.order.total_amount);
                }

                clearCart(); // Clear cart as order is created
            }
            // Scene 2: Cart empty -> Pay for existing active order
            else {
                const activeOrderResult = await getActiveOrderByTableApi(tableId);

                if (!activeOrderResult.success || !activeOrderResult.order) {
                    setOrderError('No active order to pay for this table.');
                    setIsLoading(false);
                    return;
                }

                if (activeOrderResult.order.status === 'COMPLETED') {
                    setOrderError('This order is already paid.');
                    setIsLoading(false);
                    return;
                }

                setActiveOrderId(activeOrderResult.order.id);
                setPaymentAmount(activeOrderResult.order.total_amount);
                setShowPayment(true);

                // Update customer display to payment mode
                if (session?.terminal_id) {
                    setCustomerDisplayPayment(session.terminal_id, '', activeOrderResult.order.total_amount);
                }
            }
        } catch (error) {
            console.error('Payment initiation error:', error);
            setOrderError('Failed to initiate payment.');
        } finally {
            setIsLoading(false);
        }
    };

    const processPayment = async (method: PaymentMethod) => {
        if (!activeOrderId) return;

        setIsLoading(true);
        try {
            const result = await processPaymentBackendApi({
                orderId: activeOrderId,
                amount: paymentAmount,
                method: method,
                transactionReference: method === 'CASH' ? undefined : `REF-${Date.now()}`
            });

            if (result.success) {
                // Fetch receipt
                const receipt = await generateReceiptBackendApi(activeOrderId);
                if (receipt) {
                    setReceiptData(receipt);

                    // Update customer display to thank you state
                    if (session?.terminal_id) {
                        setCustomerDisplayThankYou(session.terminal_id);
                    }
                } else {
                    alert('Payment successful, but failed to load receipt.');
                    setShowPayment(false);
                    setActiveOrderId(null);
                }
            } else {
                setOrderError(result.error || 'Payment failed');
            }
        } catch (error) {
            setOrderError('Payment processing error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseReceipt = () => {
        setReceiptData(null);
        setShowPayment(false);
        setActiveOrderId(null);
    };

    const handlePlaceOrder = async () => {
        if (!session) {
            setOrderError('No active session. Please start a session first.');
            return;
        }

        if (!branchId) {
            setOrderError('Branch information not loaded. Please refresh the page.');
            return;
        }

        if (cart.length === 0) {
            return;
        }

        setIsLoading(true);
        setOrderError(null);

        try {
            // Create order with items
            const orderData: CreateOrderBackendRequest = {
                branchId: branchId,
                sessionId: session.id,
                orderType: 'DINE_IN',
                tableId: tableId,
                items: cart.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            };

            const createResult = await createOrderBackendApi(orderData);

            if (!createResult.success || !createResult.order) {
                setOrderError(createResult.error || 'Failed to create order');
                setIsLoading(false);
                return;
            }

            // Send to kitchen
            const kitchenResult = await sendToKitchenBackendApi(createResult.order.id);

            if (!kitchenResult.success) {
                setOrderError(kitchenResult.error || 'Failed to send to kitchen');
                setIsLoading(false);
                return;
            }

            // Success - clear cart
            clearCart();
            alert(`Order ${createResult.order.id} sent to kitchen!`);
        } catch (error) {
            console.error('Place order error:', error);
            setOrderError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const MAX_QUANTITY = 99;

    if (showPayment) {
        return (
            <aside className="order-summary">
                <div className="order-summary__header">
                    <h2 style={{ margin: 0 }}>{receiptData ? 'Receipt' : 'Payment'}</h2>
                    <button onClick={() => setShowPayment(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                </div>

                {receiptData ? (
                    <div style={{ padding: '1rem', overflowY: 'auto', maxHeight: '80vh', textAlign: 'left', background: 'white', color: 'black', margin: '1rem', borderRadius: '4px' }}>
                        <div style={{ textAlign: 'center', marginBottom: '1rem', borderBottom: '1px dashed #ccc', paddingBottom: '0.5rem' }}>
                            <h3 style={{ margin: 0 }}>Odoo Cafe</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem' }}>{receiptData.date}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem' }}>Order: {receiptData.receiptNumber}</p>
                            <p style={{ margin: 0, fontSize: '0.8rem' }}>Table: {receiptData.table}</p>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            {receiptData.items.map((item: any, i: number) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                                    <span>{item.qty}x {item.name}</span>
                                    <span>{formatPrice(item.total)}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '1px dashed #ccc', paddingTop: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                <span>Total</span>
                                <span>{formatPrice(receiptData.totalAmount)}</span>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.8rem' }}>Thank you for visiting!</p>
                            <button
                                className="order-summary__pay-btn"
                                onClick={handleCloseReceipt}
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '2rem', marginBottom: '2rem' }}>{formatPrice(paymentAmount)}</h3>
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <button
                                className="order-summary__pay-btn"
                                onClick={() => processPayment('CASH')}
                                disabled={isLoading}
                            >
                                CASH
                            </button>
                            <button
                                className="order-summary__pay-btn"
                                onClick={() => processPayment('UPI')}
                                style={{ background: '#10B981' }}
                                disabled={isLoading}
                            >
                                UPI
                            </button>
                            <button
                                className="order-summary__pay-btn"
                                onClick={() => processPayment('CARD')}
                                style={{ background: '#6366F1' }}
                                disabled={isLoading}
                            >
                                CARD
                            </button>
                        </div>
                        {isLoading && <p>Processing...</p>}
                        {orderError && <p style={{ color: 'red', marginTop: '1rem' }}>{orderError}</p>}
                    </div>
                )}
            </aside>
        );
    }

    return (
        <aside className="order-summary">
            {/* Header */}
            <div className="order-summary__header">
                <div className="order-summary__order-info">
                    <span className="order-summary__order-number">Order {orderNumber}</span>
                    <span className="order-summary__table">{tableNumber}</span>
                </div>
            </div>

            {/* Cart Items */}
            <div className="order-summary__items">
                {cart.length === 0 ? (
                    <div className="order-summary__empty">
                        <ShoppingBag className="order-summary__empty-icon" size={48} />
                        <span>Your cart is empty</span>
                        <span style={{ fontSize: '0.8rem' }}>Add items to get started</span>
                    </div>
                ) : (
                    <AnimatePresence>
                        {cart.map((item) => (
                            <motion.div
                                key={item.productId}
                                className="cart-item"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="cart-item__info">
                                    <div className="cart-item__name">{item.name}</div>
                                    <div className="cart-item__price">{formatPrice(item.price)}</div>
                                </div>

                                <div className="cart-item__controls">
                                    <button
                                        className="cart-item__btn"
                                        onClick={() => removeFromCart(item.productId)}
                                    >
                                        −
                                    </button>
                                    <span className="cart-item__qty">{item.quantity}</span>
                                    <button
                                        className={`cart-item__btn ${item.quantity >= MAX_QUANTITY ? 'cart-item__btn--disabled' : ''}`}
                                        onClick={() => addToCart({
                                            id: item.productId,
                                            name: item.name,
                                            price: item.price
                                        })}
                                        disabled={item.quantity >= MAX_QUANTITY}
                                    >
                                        +
                                    </button>
                                </div>

                                <span className="cart-item__total">
                                    {formatPrice(item.price * item.quantity)}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            {/* Footer - Totals & Pay */}
            <div className="order-summary__footer">
                <div className="order-summary__totals">
                    <div className="order-summary__row">
                        <span className="order-summary__row--label">Subtotal</span>
                        <span className="order-summary__row--value">{formatPrice(cartSubtotal)}</span>
                    </div>
                    <div className="order-summary__row">
                        <span className="order-summary__row--label">Tax (5%)</span>
                        <span className="order-summary__row--value">{formatPrice(cartTax)}</span>
                    </div>
                    <div className="order-summary__row order-summary__row--total">
                        <span>Total</span>
                        <span>{formatPrice(cartTotal)}</span>
                    </div>
                </div>

                {orderError && (
                    <div className="order-summary__error" style={{
                        color: '#DC2626',
                        background: '#FEE2E2',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        marginBottom: '0.5rem',
                        fontSize: '0.85rem'
                    }}>
                        {orderError}
                    </div>
                )}

                <button
                    className="order-summary__place-btn"
                    disabled={cart.length === 0 || isLoading}
                    onClick={handlePlaceOrder}
                >
                    <ClipboardList size={20} />
                    {isLoading ? 'Placing...' : 'Place Order'}
                </button>

                <button
                    className="order-summary__pay-btn"
                    disabled={isLoading}
                    onClick={initiatePayment}
                >
                    <CreditCard size={20} />
                    {cart.length > 0 ? `Pay ${formatPrice(cartTotal)}` : 'Pay Bill'}
                </button>

                {cart.length > 0 && (
                    <button
                        className="order-summary__clear-btn"
                        onClick={clearCart}
                    >
                        Clear Order
                    </button>
                )}
            </div>
        </aside>
    );
};

export default OrderSummary;
