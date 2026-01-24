/**
 * Categories API - Real Backend Integration
 * Connects to backend for CRUD, uses localStorage for icons and ordering
 */

const API_BASE_URL = 'http://localhost:5000/api';
const CATEGORY_METADATA_KEY = 'pos_category_metadata';

// Backend response type
interface BackendCategory {
    id: string;
    name: string;
    branchId?: string;
    branch?: {
        id: string;
        name: string;
    };
}

// Frontend-enriched type
export interface Category {
    id: string;
    name: string;
    branchId?: string;
    icon: string;
    order: number;
    productCount: number;
}

// Metadata stored in localStorage
interface CategoryMetadata {
    [categoryId: string]: {
        icon: string;
        order: number;
    };
}

// Default icon for new categories
const DEFAULT_ICON = '📁';

/**
 * Get category metadata from localStorage
 */
const getMetadata = (): CategoryMetadata => {
    try {
        const stored = localStorage.getItem(CATEGORY_METADATA_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

/**
 * Save category metadata to localStorage
 */
const saveMetadata = (metadata: CategoryMetadata): void => {
    localStorage.setItem(CATEGORY_METADATA_KEY, JSON.stringify(metadata));
};

/**
 * Get product count per category
 */
const getProductCounts = async (): Promise<Record<string, number>> => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) return {};
        
        const products = await response.json();
        const counts: Record<string, number> = {};
        
        for (const product of products) {
            if (product.categoryId) {
                counts[product.categoryId] = (counts[product.categoryId] || 0) + 1;
            }
        }
        
        return counts;
    } catch {
        return {};
    }
};

/**
 * Enrich backend categories with frontend metadata
 */
const enrichCategories = (
    backendCategories: BackendCategory[],
    metadata: CategoryMetadata,
    productCounts: Record<string, number>
): Category[] => {
    return backendCategories.map((cat, index) => ({
        id: cat.id,
        name: cat.name,
        branchId: cat.branchId,
        icon: metadata[cat.id]?.icon || DEFAULT_ICON,
        order: metadata[cat.id]?.order ?? index + 1,
        productCount: productCounts[cat.id] || 0,
    })).sort((a, b) => a.order - b.order);
};

/**
 * Get all categories
 * GET /api/categories
 */
export const getCategories = async (branchId?: string): Promise<Category[]> => {
    try {
        const url = branchId 
            ? `${API_BASE_URL}/categories?branchId=${branchId}`
            : `${API_BASE_URL}/categories`;
            
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        
        const backendCategories: BackendCategory[] = await response.json();
        const metadata = getMetadata();
        const productCounts = await getProductCounts();
        
        return enrichCategories(backendCategories, metadata, productCounts);
    } catch (error) {
        console.error('Error fetching categories:', error);
        throw error;
    }
};

/**
 * Get category by ID
 * GET /api/categories/:id
 */
export const getCategoryById = async (categoryId: string): Promise<Category | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch category');
        }
        
        const backendCategory: BackendCategory = await response.json();
        const metadata = getMetadata();
        const productCounts = await getProductCounts();
        
        const enriched = enrichCategories([backendCategory], metadata, productCounts);
        return enriched[0] || null;
    } catch (error) {
        console.error('Error fetching category:', error);
        throw error;
    }
};

/**
 * Create a new category
 * POST /api/categories
 */
export const createCategory = async (
    branchId: string,
    name: string,
    icon: string = DEFAULT_ICON
): Promise<{ success: boolean; category?: Category; error?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ branchId, name }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { success: false, error: errorData.message || 'Failed to create category' };
        }

        const backendCategory: BackendCategory = await response.json();
        
        // Save icon metadata
        const metadata = getMetadata();
        const existingOrders = Object.values(metadata).map(m => m.order);
        const maxOrder = existingOrders.length > 0 ? Math.max(...existingOrders) : 0;
        
        metadata[backendCategory.id] = {
            icon,
            order: maxOrder + 1,
        };
        saveMetadata(metadata);

        return {
            success: true,
            category: {
                id: backendCategory.id,
                name: backendCategory.name,
                branchId: backendCategory.branchId,
                icon,
                order: maxOrder + 1,
                productCount: 0,
            },
        };
    } catch (error) {
        console.error('Error creating category:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to create category' };
    }
};

/**
 * Update a category
 * PUT /api/categories/:id
 */
export const updateCategory = async (
    categoryId: string,
    updates: { name?: string; icon?: string }
): Promise<{ success: boolean; category?: Category; error?: string }> => {
    try {
        // Update name on backend if provided
        if (updates.name) {
            const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: updates.name }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                return { success: false, error: errorData.message || 'Failed to update category' };
            }
        }

        // Update icon in localStorage if provided
        if (updates.icon) {
            const metadata = getMetadata();
            metadata[categoryId] = {
                ...metadata[categoryId],
                icon: updates.icon,
            };
            saveMetadata(metadata);
        }

        // Fetch updated category
        const category = await getCategoryById(categoryId);
        return { success: true, category: category || undefined };
    } catch (error) {
        console.error('Error updating category:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to update category' };
    }
};

/**
 * Delete a category
 * DELETE /api/categories/:id
 */
export const deleteCategory = async (categoryId: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
            method: 'DELETE',
        });

        if (!response.ok && response.status !== 204) {
            const errorData = await response.json();
            return { success: false, error: errorData.message || 'Failed to delete category' };
        }

        // Remove from localStorage metadata
        const metadata = getMetadata();
        delete metadata[categoryId];
        saveMetadata(metadata);

        return { success: true };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to delete category' };
    }
};

/**
 * Update category order (localStorage only)
 * Called after drag-and-drop reordering
 */
export const updateCategoryOrder = (categories: Category[]): void => {
    const metadata = getMetadata();
    
    categories.forEach((cat, index) => {
        metadata[cat.id] = {
            icon: metadata[cat.id]?.icon || cat.icon || DEFAULT_ICON,
            order: index + 1,
        };
    });
    
    saveMetadata(metadata);
};

/**
 * Update category icon (localStorage only)
 */
export const updateCategoryIcon = (categoryId: string, icon: string): void => {
    const metadata = getMetadata();
    metadata[categoryId] = {
        ...metadata[categoryId],
        icon,
        order: metadata[categoryId]?.order ?? 1,
    };
    saveMetadata(metadata);
};
