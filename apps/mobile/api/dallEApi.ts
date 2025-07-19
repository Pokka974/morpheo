import Constants from 'expo-constants';

const generateDallE = async (dreamDescription: string, dreamId: string, token: string) => {
    try {
        const response = await fetch(`${Constants.expoConfig?.extra?.apiUrl}/dalle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ dreamDescription, dreamId }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Fetch Error:', error);
        throw error;
    }
};

export default {
    generateDallE,
};
