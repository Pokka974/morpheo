import Constants from 'expo-constants';

const generateDallE = async (dreamDescription: string, dreamId: string, token: string) => {
    const url = `${Constants.expoConfig?.extra?.apiUrl}/dalle`;
    
    try {
        const response = await fetch(url, {
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
        console.error('DALL-E Fetch Error:', error);
        throw error;
    }
};

export default {
    generateDallE,
};
