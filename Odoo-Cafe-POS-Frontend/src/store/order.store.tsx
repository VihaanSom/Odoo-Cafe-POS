import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

/**
 * Cart Item Interface
 */
export interface CartItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

/**
 * Order Context State
 */
interface OrderState {
    cart: CartItem[];
    tableId: string | null;
    orderNumber: string;
}

/**
 * Order Context Actions
 */
interface OrderActions {
    addToCart: (product: { id: string; name: string; price: number; image?: string }) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    setTableId: (tableId: string) => void;
}

/**
 * Computed Values
 */
interface OrderComputed {
    cartTotal: number;
    cartSubtotal: number;
    cartTax: number;
    cartItemsCount: number;
}

type OrderContextType = OrderState & OrderActions & OrderComputed;

const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Tax rate (5%)
const TAX_RATE = 0.05;

/**
 * Generate a random order number
 */
const generateOrderNumber = (): string => {
    return `#${Math.floor(1000 + Math.random() * 9000)}`;
};

/**
 * Order Provider Component
 */
export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [tableId, setTableId] = useState<string | null>(null);
    const [orderNumber] = useState<string>(generateOrderNumber());

    /**
     * Add item to cart or increment quantity
     */
    const addToCart = useCallback((product: { id: string; name: string; price: number; image?: string }) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);

            if (existingItem) {
                return prevCart.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prevCart, {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image,
            }];
        });
    }, []);

    /**
     * Remove item from cart or decrement quantity
     */
    const removeFromCart = useCallback((productId: string) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === productId);

            if (!existingItem) return prevCart;

            if (existingItem.quantity === 1) {
                return prevCart.filter(item => item.productId !== productId);
            }

            return prevCart.map(item =>
                item.productId === productId
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            );
        });
    }, []);

    /**
     * Update item quantity directly
     */
    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            setCart(prevCart => prevCart.filter(item => item.productId !== productId));
        } else {
            setCart(prevCart =>
                prevCart.map(item =>
                    item.productId === productId
                        ? { ...item, quantity }
                        : item
                )
            );
        }
    }, []);

    /**
     * Clear entire cart
     */
    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    /**
     * Computed: Subtotal (before tax)
     */
    const cartSubtotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [cart]);

    /**
     * Computed: Tax amount
     */
    const cartTax = useMemo(() => {
        return cartSubtotal * TAX_RATE;
    }, [cartSubtotal]);

    /**
     * Computed: Total (including tax)
     */
    const cartTotal = useMemo(() => {
        return cartSubtotal + cartTax;
    }, [cartSubtotal, cartTax]);

    /**
     * Computed: Total items count
     */
    const cartItemsCount = useMemo(() => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    }, [cart]);

    const value: OrderContextType = {
        cart,
        tableId,
        orderNumber,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setTableId,
        cartTotal,
        cartSubtotal,
        cartTax,
        cartItemsCount,
    };

    return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

/**
 * useOrder hook
 */
export const useOrder = (): OrderContextType => {
    const context = useContext(OrderContext);
    if (context === undefined) {
        throw new Error('useOrder must be used within an OrderProvider');
    }
    return context;
};

export default OrderContext;
