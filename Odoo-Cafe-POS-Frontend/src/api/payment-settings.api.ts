/**
 * Payment Settings API
 * Handles terminal-specific payment method toggles and UPI ID
 */

const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('pos_auth_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export interface PaymentSettings {
    id: string;
    terminalId: string;
    useCash: boolean;
    useDigital: boolean;
    useUpi: boolean;
    upiId: string;
    upiName?: string;
    merchantCode?: string;
    createdAt?: string;
}

/**
 * Get payment settings for a terminal
 */
export const getTerminalPaymentSettingsApi = async (terminalId: string): Promise<PaymentSettings | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/payment-settings/terminal/${terminalId}`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            console.error('Failed to fetch payment settings');
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Get payment settings error:', error);
        return null;
    }
};

/**
 * Update payment settings for a terminal
 */
export const updateTerminalPaymentSettingsApi = async (
    terminalId: string,
    settings: Partial<PaymentSettings>
): Promise<{ success: boolean; settings?: PaymentSettings; error?: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/payment-settings/terminal/${terminalId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(settings),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                success: false,
                error: errorData.message || 'Failed to update payment settings',
            };
        }

        const updatedSettings = await response.json();
        return {
            success: true,
            settings: updatedSettings,
        };
    } catch (error) {
        console.error('Update payment settings error:', error);
        return {
            success: false,
            error: 'Network error. Please try again.',
        };
    }
};
