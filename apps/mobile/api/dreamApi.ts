import Constants from 'expo-constants';

const postChatGPT = async (prompt: string, token: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 10-second timeout

    try {
        console.log(token);

        const response = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/chatgpt`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ prompt }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            // Check if it's a 429 Too Many Requests error
            if (response.status === 429) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Rate limit exceeded.');
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Request failed');
        }

        const rawResponse = await response.text();
        const data = JSON.parse(rawResponse);

        return await data;
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
    }
};

const updateDreamImagePath = async (dreamId: string, imagePath: string, token: string) => {
    try {
        const response = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/dreams/${dreamId}/image-path`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                dalleImagePath: imagePath,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update image path');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating dream image path:', error);
        throw error;
    }
};

const getAllDreams = async (token: string) => {
    try {
        const response = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/dreams/all`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch dreams');
        }
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching dreams:', error);
        throw error;
    }
};

const getDreamById = async (dreamId: string, token: string) => {
    try {
        const response = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/dreams/${dreamId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch dream');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching dream:', error);
        throw error;
    }
};

const deleteUserData = async (token: string) => {
    try {
        const response = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/user/delete-data`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete user data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error deleting user data:', error);
        throw error;
    }
};

const exportUserData = async (token: string) => {
    try {
        const response = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/user/export-data`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to export user data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error exporting user data:', error);
        throw error;
    }
};

export default {
    postChatGPT,
    updateDreamImagePath,
    getAllDreams,
    getDreamById,
    deleteUserData,
    exportUserData,
};
