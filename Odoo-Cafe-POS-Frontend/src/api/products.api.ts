/**
 * Products API - Mock Data
 * Categories and Products for the POS
 */

export interface Category {
    id: string;
    name: string;
    icon: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    categoryId: string;
    image?: string;
    description?: string;
}

// Mock categories
const categories: Category[] = [
    { id: 'cat-1', name: 'Starters', icon: '🥗' },
    { id: 'cat-2', name: 'Main Course', icon: '🍛' },
    { id: 'cat-3', name: 'Drinks', icon: '🍹' },
    { id: 'cat-4', name: 'Desserts', icon: '🍰' },
    { id: 'cat-5', name: 'Sides', icon: '🍟' },
];

// Mock products
const products: Product[] = [
    // Starters
    { id: 'prod-1', name: 'Crispy Chicken Wings', price: 249, categoryId: 'cat-1', icon: '🍗' },
    { id: 'prod-2', name: 'Garlic Bread', price: 149, categoryId: 'cat-1', icon: '🥖' },
    { id: 'prod-3', name: 'Caesar Salad', price: 199, categoryId: 'cat-1', icon: '🥗' },
    { id: 'prod-4', name: 'Soup of the Day', price: 129, categoryId: 'cat-1', icon: '🍲' },
    { id: 'prod-5', name: 'Bruschetta', price: 179, categoryId: 'cat-1', icon: '🍞' },
    { id: 'prod-6', name: 'Spring Rolls', price: 189, categoryId: 'cat-1', icon: '🥟' },

    // Main Course
    { id: 'prod-7', name: 'Grilled Salmon', price: 549, categoryId: 'cat-2', icon: '🐟' },
    { id: 'prod-8', name: 'Butter Chicken', price: 399, categoryId: 'cat-2', icon: '🍛' },
    { id: 'prod-9', name: 'Margherita Pizza', price: 349, categoryId: 'cat-2', icon: '🍕' },
    { id: 'prod-10', name: 'Pasta Carbonara', price: 329, categoryId: 'cat-2', icon: '🍝' },
    { id: 'prod-11', name: 'Beef Steak', price: 649, categoryId: 'cat-2', icon: '🥩' },
    { id: 'prod-12', name: 'Veggie Burger', price: 279, categoryId: 'cat-2', icon: '🍔' },

    // Drinks
    { id: 'prod-13', name: 'Virgin Mojito', price: 149, categoryId: 'cat-3', icon: '🍹' },
    { id: 'prod-14', name: 'Fresh Lime Soda', price: 79, categoryId: 'cat-3', icon: '🍋' },
    { id: 'prod-15', name: 'Mango Smoothie', price: 129, categoryId: 'cat-3', icon: '🥭' },
    { id: 'prod-16', name: 'Cold Coffee', price: 149, categoryId: 'cat-3', icon: '☕' },
    { id: 'prod-17', name: 'Fresh Orange Juice', price: 119, categoryId: 'cat-3', icon: '🍊' },
    { id: 'prod-18', name: 'Mineral Water', price: 49, categoryId: 'cat-3', icon: '💧' },

    // Desserts
    { id: 'prod-19', name: 'Chocolate Brownie', price: 179, categoryId: 'cat-4', icon: '🍫' },
    { id: 'prod-20', name: 'New York Cheesecake', price: 229, categoryId: 'cat-4', icon: '🍰' },
    { id: 'prod-21', name: 'Ice Cream Sundae', price: 169, categoryId: 'cat-4', icon: '🍨' },
    { id: 'prod-22', name: 'Tiramisu', price: 249, categoryId: 'cat-4', icon: '🧁' },
    { id: 'prod-23', name: 'Gulab Jamun', price: 99, categoryId: 'cat-4', icon: '🍩' },

    // Sides
    { id: 'prod-24', name: 'French Fries', price: 129, categoryId: 'cat-5', icon: '🍟' },
    { id: 'prod-25', name: 'Onion Rings', price: 149, categoryId: 'cat-5', icon: '🧅' },
    { id: 'prod-26', name: 'Coleslaw', price: 79, categoryId: 'cat-5', icon: '🥬' },
    { id: 'prod-27', name: 'Mashed Potatoes', price: 99, categoryId: 'cat-5', icon: '🥔' },
    { id: 'prod-28', name: 'Naan Bread', price: 59, categoryId: 'cat-5', icon: '🫓' },
];

/**
 * Get all categories
 */
export const getCategories = async (): Promise<Category[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(categories);
        }, 200);
    });
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const categoryProducts = products.filter(p => p.categoryId === categoryId);
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
            resolve(products);
        }, 200);
    });
};

/**
 * Get product by ID
 */
export const getProductById = async (productId: string): Promise<Product | undefined> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const product = products.find(p => p.id === productId);
            resolve(product);
        }, 100);
    });
};
