import React, { createContext, useContext, useState, type ReactNode } from 'react';

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email: string;
    totalSales: number;
    createdAt: string;
}

interface CustomerContextType {
    customers: Customer[];
    isLoading: boolean;
    addCustomer: (customer: Omit<Customer, 'id' | 'totalSales' | 'createdAt'>) => void;
    updateCustomer: (id: string, customer: Partial<Customer>) => void;
    deleteCustomer: (id: string) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>([
        {
            id: '1',
            name: 'Walking Customer',
            phone: '0000000000',
            email: 'walking@example.com',
            totalSales: 1250.50,
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            name: 'John Doe',
            phone: '9876543210',
            email: 'john@example.com',
            totalSales: 450.00,
            createdAt: new Date().toISOString()
        }
    ]);

    const addCustomer = (customerData: Omit<Customer, 'id' | 'totalSales' | 'createdAt'>) => {
        const newCustomer: Customer = {
            ...customerData,
            id: Math.random().toString(36).substr(2, 9),
            totalSales: 0,
            createdAt: new Date().toISOString()
        };
        setCustomers(prev => [...prev, newCustomer]);
    };

    const updateCustomer = (id: string, customerData: Partial<Customer>) => {
        setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerData } : c));
    };

    const deleteCustomer = (id: string) => {
        setCustomers(prev => prev.filter(c => c.id !== id));
    };

    return (
        <CustomerContext.Provider value={{ customers, isLoading: false, addCustomer, updateCustomer, deleteCustomer }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomers = () => {
    const context = useContext(CustomerContext);
    if (context === undefined) {
        throw new Error('useCustomers must be used within a CustomerProvider');
    }
    return context;
};
