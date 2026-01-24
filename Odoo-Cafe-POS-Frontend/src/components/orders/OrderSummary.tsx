import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, CreditCard, ClipboardList } from 'lucide-react';
import { useOrder } from '../../store/order.store';

interface OrderSummaryProps {
    tableNumber: string;
}

const OrderSummary = ({ tableNumber }: OrderSummaryProps) => {
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

    const formatPrice = (price: number) => {
        return `₹${price.toFixed(2)}`;
    };

    const handlePay = () => {
        alert(`Processing payment of ${formatPrice(cartTotal)} for ${tableNumber}`);
        // In a real app, this would navigate to payment screen
    };

    const handlePlaceOrder = () => {
        alert(`Order placed for ${tableNumber}! You can continue adding items.`);
        // In a real app, this would send order to kitchen
    };

    const MAX_QUANTITY = 99;

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

                <button
                    className="order-summary__place-btn"
                    disabled={cart.length === 0}
                    onClick={handlePlaceOrder}
                >
                    <ClipboardList size={20} />
                    Place Order
                </button>

                <button
                    className="order-summary__pay-btn"
                    disabled={cart.length === 0}
                    onClick={handlePay}
                >
                    <CreditCard size={20} />
                    Pay {formatPrice(cartTotal)}
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
