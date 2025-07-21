// useStableToken.ts - Stable token management to prevent duplicate API calls
import { useAuth } from '@clerk/clerk-expo';
import { useCallback, useRef } from 'react';

/**
 * Custom hook that provides a stable getToken function
 * This prevents unnecessary re-renders and duplicate API calls
 * caused by getToken being recreated on every render
 */
export const useStableToken = () => {
    const { getToken: authGetToken } = useAuth();
    const tokenCache = useRef<{ token: string | null; timestamp: number }>({ 
        token: null, 
        timestamp: 0 
    });
    
    // Cache tokens for 5 minutes to reduce auth overhead
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    
    const getToken = useCallback(async (): Promise<string | null> => {
        const now = Date.now();
        const cachedToken = tokenCache.current;
        
        // Return cached token if still valid
        if (cachedToken.token && (now - cachedToken.timestamp < CACHE_DURATION)) {
            return cachedToken.token;
        }
        
        try {
            const token = await authGetToken();
            
            // Cache the new token
            tokenCache.current = {
                token,
                timestamp: now
            };
            
            return token;
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }, [authGetToken]);
    
    // Force refresh token (bypass cache)
    const refreshToken = useCallback(async (): Promise<string | null> => {
        try {
            const token = await authGetToken();
            tokenCache.current = {
                token,
                timestamp: Date.now()
            };
            return token;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return null;
        }
    }, [authGetToken]);
    
    return { getToken, refreshToken };
};