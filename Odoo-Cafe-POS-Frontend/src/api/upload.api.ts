/**
 * Upload API
 * Handles image uploads to Azure Blob Storage
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
    return localStorage.getItem('pos_auth_token');
};

/**
 * Upload product image to Azure Blob Storage
 * @param file - The image file to upload
 * @returns Promise<string> - The URL of the uploaded image
 */
export const uploadProductImage = async (file: File): Promise<string> => {
    const token = getAuthToken();

    if (!token) {
        throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            // Note: Don't set Content-Type for FormData, browser will set it with boundary
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(error.message || 'Failed to upload image');
    }

    const data = await response.json();
    return data.imageUrl;
};

/**
 * Delete product image from Azure Blob Storage
 * @param imageUrl - The URL of the image to delete
 * @returns Promise<boolean> - Whether the deletion was successful
 */
export const deleteProductImage = async (imageUrl: string): Promise<boolean> => {
    const token = getAuthToken();

    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl }),
    });

    if (!response.ok) {
        return false;
    }

    const data = await response.json();
    return data.success;
};
