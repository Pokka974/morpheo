import Constants from 'expo-constants';

const postChatGPT = async (prompt: string, token: string) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second timeout

  try {
    const response = await fetch(
      `${Constants.expoConfig?.extra?.apiUrl}/chatgpt`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      }
    );

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
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.error('Request timeout after 60 seconds');
      throw new Error('Request timeout - the server took too long to respond');
    }
    console.error('Fetch Error:', error);
    throw error;
  }
};

const isPromptSafe = async (prompt: string, token: string) => {
  try {
    const response = await fetch(
      `${Constants.expoConfig?.extra?.apiUrl}/chatgpt/isItSafe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      }
    );

    const contentType = response.headers.get('content-type');

    // Always return true if content-type is not JSON (handles 404, 500, etc.)
    if (!contentType || !contentType.includes('application/json')) {
      return true;
    }

    if (!response.ok) {
      // For error status codes, still try to parse as JSON, but fallback to true
      try {
        const data = await response.json();
        return data.isSafe ?? true;
      } catch {
        return true;
      }
    }

    const data = await response.json();
    return data.isSafe ?? true;
  } catch (error) {
    console.error('Error checking prompt safety:', error);
    // If safety check fails for any reason, allow the request to proceed (assume safe)
    return true;
  }
};

const updateDreamImagePath = async (
  dreamId: string,
  imagePath: string,
  token: string
) => {
  try {
    const response = await fetch(
      `${Constants.expoConfig?.extra?.apiUrl}/dreams/${dreamId}/image-path`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dalleImagePath: imagePath,
        }),
      }
    );

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
  const url = `${Constants.expoConfig?.extra?.apiUrl}/dreams/all`;

  try {
    const response = await fetch(url, {
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
  const url = `${Constants.expoConfig?.extra?.apiUrl}/dreams/${dreamId}`;

  try {
    const response = await fetch(url, {
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
    const response = await fetch(
      `${Constants.expoConfig?.extra?.apiUrl}/user/delete-data`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
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
    const response = await fetch(
      `${Constants.expoConfig?.extra?.apiUrl}/user/export-data`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
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
  isPromptSafe,
  updateDreamImagePath,
  getAllDreams,
  getDreamById,
  deleteUserData,
  exportUserData,
};
