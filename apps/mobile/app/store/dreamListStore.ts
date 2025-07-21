// store/dreamStore.js
import { create } from 'zustand';
import dreamApi from '@/api/dreamApi';
import { DreamData } from './dreamResultStore';

interface DreamListStoreState {
    dreamList: DreamData[];
    isLoading: boolean;
    isRefreshing: boolean;
    error: string | null;
    lastFetched: number | null;
    cacheExpiry: number; // Cache for 5 minutes
    setDreamList: (dreams: DreamData[]) => void;
    fetchDreams: (token: string, forceRefresh?: boolean) => Promise<void>;
    refreshDreams: (token: string) => Promise<void>;
    addDream: (dream: DreamData) => void;
    clearCache: () => void;
    shouldRefetch: () => boolean;
}

const useDreamListStore = create<DreamListStoreState>((set, get) => ({
    dreamList: [],
    isLoading: false,
    isRefreshing: false,
    error: null,
    lastFetched: null,
    cacheExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds

    setDreamList: (dreams: DreamData[]) => set({ dreamList: dreams }),

    shouldRefetch: () => {
        const { lastFetched, cacheExpiry } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > cacheExpiry;
    },

    fetchDreams: async (token: string, forceRefresh: boolean = false) => {
        const { dreamList, shouldRefetch, isLoading } = get();
        
        // Prevent duplicate calls if already loading
        if (isLoading) {
            console.log('Already fetching dreams, skipping duplicate call');
            return;
        }
        
        // Return cached data if available and not expired, unless force refresh
        if (!forceRefresh && dreamList.length > 0 && !shouldRefetch()) {
            console.log('Using cached dreams');
            return;
        }

        set({ isLoading: true, error: null });
        
        try {
            console.log('API Call: Fetching all dreams from API...');
            const response = await dreamApi.getAllDreams(token);

            set({ 
                dreamList: response,
                isLoading: false,
                lastFetched: Date.now(),
                error: null
            });
        } catch (error) {
            console.error('Error fetching dreams:', error);
            set({ 
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch dreams'
            });
        }
    },

    refreshDreams: async (token: string) => {
        const { isRefreshing } = get();
        
        // Prevent duplicate refresh calls
        if (isRefreshing) {
            console.log('Already refreshing dreams, skipping duplicate call');
            return;
        }
        
        set({ isRefreshing: true, error: null });
        
        try {
            console.log('API Call: Refreshing dreams from API...');
            const response = await dreamApi.getAllDreams(token);

            set({ 
                dreamList: response,
                isRefreshing: false,
                lastFetched: Date.now(),
                error: null
            });
        } catch (error) {
            console.error('Error refreshing dreams:', error);
            set({ 
                isRefreshing: false,
                error: error instanceof Error ? error.message : 'Failed to refresh dreams'
            });
        }
    },

    addDream: (dream: DreamData) =>
        set(state => ({
            dreamList: [dream, ...state.dreamList],
            lastFetched: Date.now(), // Update last fetched to prevent immediate refetch
        })),

    clearCache: () => set({ 
        dreamList: [], 
        lastFetched: null,
        error: null 
    }),
}));

export default useDreamListStore;