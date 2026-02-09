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
    branchId?: string;
    name: string;
    price: number;
    categoryId: string;
    image?: string;
    icon?: string;
    description?: string;
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




// Note: getAllProducts and getProductById are defined below using backend API

// ============================================
// REAL BACKEND API FUNCTIONS
// ============================================

import { API_BASE_URL } from '../config/api.config';

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
    branchId?: string;
    name: string;
    price: string | number;
    categoryId?: string;
    description?: string;
    barcode?: string;
    isActive?: boolean;
    taxRate?: string;
    imageUrl?: string;
    priceRules?: string | PriceRule[]; // JSON string or parsed object
    category?: {
        id: string;
        name: string;
    };
}

/**
 * Map backend product to frontend Product interface
 */
const mapBackendProduct = (p: BackendProduct): Product => {
    let rules: PriceRule[] = [];
    if (typeof p.priceRules === 'string') {
        try {
            rules = JSON.parse(p.priceRules);
        } catch (e) {
            rules = [{ minQty: 1, price: Number(p.price) }];
        }
    } else if (Array.isArray(p.priceRules)) {
        rules = p.priceRules;
    } else {
        rules = [{ minQty: 1, price: Number(p.price) }];
    }

    return {
        id: p.id,
        branchId: p.branchId,
        name: p.name,
        price: Number(p.price),
        categoryId: p.categoryId || p.category?.id || '',
        description: p.description,
        taxes: p.taxRate || 'none',
        priceRules: rules,
        icon: p.imageUrl, // Mapping imageUrl to icon for now
        image: p.imageUrl,
        status: p.isActive !== false ? 'active' : 'archived',
        isActive: p.isActive !== false,
    };
};

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
    return allProducts.filter(p => p.categoryId === categoryId);
};

/**
 * Get products by category
 */
export const getProductsByCategory = getProductsByCategoryBackendApi;


// Aliases for compatibility
export const getAllProducts = getProductsBackendApi;

/**
 * Create a new product
 */
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
        const body = {
            branchId: product.branchId, // Require branchId to be passed
            categoryId: product.categoryId,
            name: product.name,
            price: product.price,
            description: product.description,
            taxRate: product.taxes,
            imageUrl: product.image || product.icon,
            priceRules: product.priceRules
        };

        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to create product');
        }

        const newProduct: BackendProduct = await response.json();
        return mapBackendProduct(newProduct);
    } catch (error) {
        console.error('Create product error:', error);
        throw error;
    }
};

/**
 * Update a product
 */
export const updateProduct = async (productId: string, updates: Partial<Product>): Promise<Product | undefined> => {
    try {
        const body: any = {};
        if (updates.name) body.name = updates.name;
        if (updates.price) body.price = updates.price;
        if (updates.categoryId) body.categoryId = updates.categoryId;
        if (updates.description) body.description = updates.description;
        if (updates.taxes) body.taxRate = updates.taxes;
        if (updates.image || updates.icon) body.imageUrl = updates.image || updates.icon;
        if (updates.priceRules) body.priceRules = updates.priceRules;
        if (updates.isActive !== undefined) body.isActive = updates.isActive;
        if (updates.status === 'archived') body.isActive = false;
        if (updates.status === 'active') body.isActive = true;

        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('Failed to update product');
        }

        const updatedProduct: BackendProduct = await response.json();
        return mapBackendProduct(updatedProduct);
    } catch (error) {
        console.error('Update product error:', error);
        throw error;
    }
};

/**
 * Delete a product
 */
export const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return response.status === 204;
    } catch (error) {
        console.error('Delete product error:', error);
        return false;
    }
};

/**
 * Get product by ID
 */
export const getProductById = async (productId: string): Promise<Product | undefined> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) return undefined;
        const p: BackendProduct = await response.json();
        return mapBackendProduct(p);
    } catch (error) {
        return undefined;
    }
};

// Helper: bulk archive/delete (Not fully backed by API bulk endpoints yet, implementing via loops or single endpoint if available)
// Use Promise.all for simple implementation
export const archiveProducts = async (productIds: string[]): Promise<number> => {
    let count = 0;
    await Promise.all(productIds.map(async (id) => {
        try {
            await updateProduct(id, { status: 'archived' });
            count++;
        } catch (e) { }
    }));
    return count;
};

export const deleteProducts = async (productIds: string[]): Promise<number> => {
    let count = 0;
    await Promise.all(productIds.map(async (id) => {
        try {
            if (await deleteProduct(id)) count++;
        } catch (e) { }
    }));
    return count;
};



// Re-export mock data as empty/fallback if needed? No, removing mock.
