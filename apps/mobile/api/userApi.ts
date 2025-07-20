import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';

type UserProfile = {
    gender?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
    ageRange?: 'TEEN_13_17' | 'YOUNG_ADULT_18_25' | 'ADULT_26_35' | 'MIDDLE_AGED_36_50' | 'MATURE_51_65' | 'SENIOR_65_PLUS';
    culturalBackground?: string[];
    primaryLanguage?: string;
    location?: string;
    interpretationStyle?: 'SCIENTIFIC' | 'SPIRITUAL' | 'PSYCHOLOGICAL' | 'BALANCED' | 'CULTURAL_FOCUSED';
};

/**
 * Get user profile from the API
 */
export const getUserProfile = async (token: string): Promise<UserProfile | null> => {
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Server returned invalid JSON');
        }

        if (!response.ok) {
            throw new Error(data.error || 'Failed to get user profile');
        }

        return data.data;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
};

/**
 * Create or update user profile
 */
export const upsertUserProfile = async (
    token: string,
    profile: Partial<UserProfile>
): Promise<UserProfile | null> => {
    try {
        const response = await fetch(`${API_URL}/user/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(profile),
        });

        const responseText = await response.text();

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Server returned invalid JSON');
        }

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update user profile');
        }

        return data.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

/**
 * Export user data (GDPR compliance)
 */
export const exportUserData = async (token: string) => {
    try {
        const response = await fetch(`${API_URL}/user/export-data`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to export user data');
        }

        return data.data;
    } catch (error) {
        console.error('Error exporting user data:', error);
        throw error;
    }
};

/**
 * Delete all user data (GDPR compliance)
 */
export const deleteUserData = async (token: string) => {
    try {
        const response = await fetch(`${API_URL}/user/delete-data`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete user data');
        }

        return data;
    } catch (error) {
        console.error('Error deleting user data:', error);
        throw error;
    }
};