/**
 * Products API - Mock Data
 * Categories and Products for the POS with Advanced Pricing
 */



export interface PriceRule {
    minQty: number;
    price: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    cost?: number;
    categoryId: string;
    image?: string;
    icon?: string;
    description?: string;
    barcode?: string;
    taxes: string;
    priceRules: PriceRule[];
    status: 'active' | 'archived';
    isActive: boolean;
}

// Tax options
export const TAX_OPTIONS = [
    { value: 'none', label: 'No Tax' },
    { value: 'gst_5', label: 'GST 5%' },
    { value: 'gst_12', label: 'GST 12%' },
    { value: 'gst_18', label: 'GST 18%' },
    { value: 'vat_10', label: 'VAT 10%' },
    { value: 'vat_15', label: 'VAT 15%' },
];



// Mock products with extended fields
const products: Product[] = [
    // Starters
    { id: 'prod-1', name: 'Crispy Chicken Wings', price: 249, cost: 120, categoryId: 'cat-1', icon: '🍗', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 249 }, { minQty: 5, price: 220 }], status: 'active', isActive: true },
    { id: 'prod-2', name: 'Garlic Bread', price: 149, cost: 50, categoryId: 'cat-1', icon: '🥖', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 149 }], status: 'active', isActive: true },
    { id: 'prod-3', name: 'Caesar Salad', price: 199, cost: 80, categoryId: 'cat-1', icon: '🥗', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 199 }], status: 'active', isActive: true },
    { id: 'prod-4', name: 'Soup of the Day', price: 129, cost: 40, categoryId: 'cat-1', icon: '🍲', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 129 }], status: 'active', isActive: true },
    { id: 'prod-5', name: 'Bruschetta', price: 179, cost: 60, categoryId: 'cat-1', icon: '🍞', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 179 }], status: 'active', isActive: true },
    { id: 'prod-6', name: 'Spring Rolls', price: 189, cost: 70, categoryId: 'cat-1', icon: '🥟', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 189 }], status: 'active', isActive: true },

    // Main Course
    { id: 'prod-7', name: 'Grilled Salmon', price: 549, cost: 280, categoryId: 'cat-2', icon: '🐟', taxes: 'gst_12', priceRules: [{ minQty: 1, price: 549 }], status: 'active', isActive: true },
    { id: 'prod-8', name: 'Butter Chicken', price: 399, cost: 180, categoryId: 'cat-2', icon: '🍛', taxes: 'gst_12', priceRules: [{ minQty: 1, price: 399 }], status: 'active', isActive: true },
    { id: 'prod-9', name: 'Margherita Pizza', price: 349, cost: 140, categoryId: 'cat-2', icon: '🍕', taxes: 'gst_12', priceRules: [{ minQty: 1, price: 349 }], status: 'active', isActive: true },
    { id: 'prod-10', name: 'Pasta Carbonara', price: 329, cost: 130, categoryId: 'cat-2', icon: '🍝', taxes: 'gst_12', priceRules: [{ minQty: 1, price: 329 }], status: 'active', isActive: true },
    { id: 'prod-11', name: 'Beef Steak', price: 649, cost: 350, categoryId: 'cat-2', icon: '🥩', taxes: 'gst_12', priceRules: [{ minQty: 1, price: 649 }], status: 'active', isActive: true },
    { id: 'prod-12', name: 'Veggie Burger', price: 279, cost: 100, categoryId: 'cat-2', icon: '🍔', taxes: 'gst_12', priceRules: [{ minQty: 1, price: 279 }], status: 'active', isActive: true },

    // Drinks
    { id: 'prod-13', name: 'Virgin Mojito', price: 149, cost: 40, categoryId: 'cat-3', icon: '🍹', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 149 }], status: 'active', isActive: true },
    { id: 'prod-14', name: 'Fresh Lime Soda', price: 79, cost: 20, categoryId: 'cat-3', icon: '🍋', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 79 }], status: 'active', isActive: true },
    { id: 'prod-15', name: 'Mango Smoothie', price: 129, cost: 35, categoryId: 'cat-3', icon: '🥭', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 129 }], status: 'active', isActive: true },
    { id: 'prod-16', name: 'Cold Coffee', price: 149, cost: 45, categoryId: 'cat-3', icon: '☕', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 149 }], status: 'active', isActive: true },
    { id: 'prod-17', name: 'Fresh Orange Juice', price: 119, cost: 30, categoryId: 'cat-3', icon: '🍊', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 119 }], status: 'active', isActive: true },
    { id: 'prod-18', name: 'Coca Cola', price: 60, cost: 25, categoryId: 'cat-3', icon: '🥤', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 60 }, { minQty: 6, price: 50 }], status: 'active', isActive: true },

    // Desserts
    { id: 'prod-19', name: 'Chocolate Brownie', price: 179, cost: 70, categoryId: 'cat-4', icon: '🍫', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 179 }], status: 'active', isActive: true },
    { id: 'prod-20', name: 'New York Cheesecake', price: 229, cost: 100, categoryId: 'cat-4', icon: '🍰', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 229 }], status: 'active', isActive: true },
    { id: 'prod-21', name: 'Ice Cream Sundae', price: 169, cost: 60, categoryId: 'cat-4', icon: '🍨', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 169 }], status: 'active', isActive: true },
    { id: 'prod-22', name: 'Tiramisu', price: 249, cost: 90, categoryId: 'cat-4', icon: '🧁', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 249 }], status: 'active', isActive: true },
    { id: 'prod-23', name: 'Gulab Jamun', price: 99, cost: 30, categoryId: 'cat-4', icon: '🍩', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 99 }, { minQty: 4, price: 80 }], status: 'active', isActive: true },

    // Sides
    { id: 'prod-24', name: 'French Fries', price: 129, cost: 40, categoryId: 'cat-5', icon: '🍟', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 129 }], status: 'active', isActive: true },
    { id: 'prod-25', name: 'Onion Rings', price: 149, cost: 50, categoryId: 'cat-5', icon: '🧅', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 149 }], status: 'active', isActive: true },
    { id: 'prod-26', name: 'Coleslaw', price: 79, cost: 25, categoryId: 'cat-5', icon: '🥬', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 79 }], status: 'active', isActive: true },
    { id: 'prod-27', name: 'Mashed Potatoes', price: 99, cost: 30, categoryId: 'cat-5', icon: '🥔', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 99 }], status: 'active', isActive: true },
    { id: 'prod-28', name: 'Naan Bread', price: 59, cost: 15, categoryId: 'cat-5', icon: '🫓', taxes: 'gst_5', priceRules: [{ minQty: 1, price: 59 }], status: 'active', isActive: true },
];

// In-memory store for mutations
let productStore = [...products];



/**
 * Get products by category
 */
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const categoryProducts = productStore.filter(p => p.categoryId === categoryId && p.status === 'active');
            resolve(categoryProducts);
        }, 150);
    });
};

/**
 * Get all products
 */
export const getAllProducts = async (): Promise<Product[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...productStore]);
        }, 200);
    });
};

/**
 * Get product by ID
 */
export const getProductById = async (productId: string): Promise<Product | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const product = productStore.find(p => p.id === productId);
            resolve(product);
        }, 100);
    });
};

/**
 * Create a new product
 */
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newProduct: Product = {
                ...product,
                id: `prod-${Date.now()}`,
            };
            productStore.push(newProduct);
            resolve(newProduct);
        }, 200);
    });
};

/**
 * Update a product
 */
export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<Product | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const index = productStore.findIndex(p => p.id === productId);
            if (index !== -1) {
                productStore[index] = { ...productStore[index], ...updates };
                resolve(productStore[index]);
            } else {
                resolve(undefined);
            }
        }, 200);
    });
};

/**
 * Delete a product
 */
export const deleteProduct = async (productId: string): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const index = productStore.findIndex(p => p.id === productId);
            if (index !== -1) {
                productStore.splice(index, 1);
                resolve(true);
            } else {
                resolve(false);
            }
        }, 150);
    });
};

/**
 * Bulk archive products
 */
export const archiveProducts = async (productIds: string[]): Promise<number> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            let count = 0;
            productIds.forEach(id => {
                const index = productStore.findIndex(p => p.id === id);
                if (index !== -1) {
                    productStore[index].status = 'archived';
                    productStore[index].isActive = false;
                    count++;
                }
            });
            resolve(count);
        }, 200);
    });
};

/**
 * Bulk delete products
 */
export const deleteProducts = async (productIds: string[]): Promise<number> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const initialLength = productStore.length;
            productStore = productStore.filter(p => !productIds.includes(p.id));
            resolve(initialLength - productStore.length);
        }, 200);
    });
};

// ============================================
// REAL BACKEND API FUNCTIONS
// ============================================

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('pos_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Backend Product interface
 */
interface BackendProduct {
    id: string;
    name: string;
    price: string | number;
    cost?: string | number;
    categoryId?: string;
    description?: string;
    barcode?: string;
    isActive?: boolean;
    category?: {
        id: string;
        name: string;
    };
}

/**
 * Map backend product to frontend Product interface
 */
const mapBackendProduct = (p: BackendProduct): Product => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    cost: p.cost ? Number(p.cost) : undefined,
    categoryId: p.categoryId || p.category?.id || 'cat-1',
    description: p.description,
    barcode: p.barcode,
    taxes: 'gst_5',
    priceRules: [{ minQty: 1, price: Number(p.price) }],
    status: p.isActive !== false ? 'active' : 'archived',
    isActive: p.isActive !== false,
});

/**
 * Get all products from backend
 * GET /api/products
 */
export const getProductsBackendApi = async (): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error('Failed to fetch products');
            return [];
        }

        const data = await response.json();
        // Backend might return array directly or { products: [] }
        const productsData: BackendProduct[] = Array.isArray(data) ? data : (data.products || []);

        return productsData.map(mapBackendProduct);
    } catch (error) {
        console.error('Get products error:', error);
        return [];
    }
};

/**
 * Get products by category from backend (filter locally)
 * GET /api/products then filter by categoryId
 */
export const getProductsByCategoryBackendApi = async (categoryId: string): Promise<Product[]> => {
    const allProducts = await getProductsBackendApi();
    // If categoryId looks like a mock ID (cat-1, cat-2, etc.), return all products
    if (categoryId.startsWith('cat-')) {
        return allProducts;
    }
    return allProducts.filter(p => p.categoryId === categoryId);
};
