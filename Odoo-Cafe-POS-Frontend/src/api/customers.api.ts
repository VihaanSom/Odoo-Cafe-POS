/**
 * Customers API
 * Persistent customer records from the backend
 */

import { API_BASE_URL } from '../config/api.config';

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    totalSales: number;
    createdAt: string;
}

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('pos_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Get all customers from backend
 */
export const getCustomersApi = async (): Promise<Customer[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/customers`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error('Failed to fetch customers');
            return [];
        }

        const data = await response.json();
        return data.map((c: any) => ({
            ...c,
            totalSales: Number(c.totalSales || 0),
            createdAt: c.createdAt ? c.createdAt.split('T')[0] : ''
        }));
    } catch (error) {
        console.error('Get customers error:', error);
        return [];
    }
};

/**
 * Create a new customer
 */
export const createCustomerApi = async (customer: Omit<Customer, 'id' | 'totalSales' | 'createdAt'>): Promise<Customer> => {
    try {
        const response = await fetch(`${API_BASE_URL}/customers`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(customer),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to create customer');
        }

        const newCustomer = await response.json();
        return {
            ...newCustomer,
            totalSales: Number(newCustomer.totalSales || 0),
            createdAt: newCustomer.createdAt ? newCustomer.createdAt.split('T')[0] : ''
        };
    } catch (error) {
        console.error('Create customer error:', error);
        throw error;
    }
};

/**
 * Update a customer
 */
export const updateCustomerApi = async (customerId: string, updates: Partial<Customer>): Promise<Customer> => {
    try {
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Failed to update customer');
        }

        const updatedCustomer = await response.json();
        return {
            ...updatedCustomer,
            totalSales: Number(updatedCustomer.totalSales || 0),
            createdAt: updatedCustomer.createdAt ? updatedCustomer.createdAt.split('T')[0] : ''
        };
    } catch (error) {
        console.error('Update customer error:', error);
        throw error;
    }
};

/**
 * Delete a customer
 */
export const deleteCustomerApi = async (customerId: string): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/customers/${customerId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return response.status === 204;
    } catch (error) {
        console.error('Delete customer error:', error);
        return false;
    }
};
