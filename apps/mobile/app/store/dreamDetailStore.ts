import dreamApi from '@/api/dreamApi';
import { DreamData } from './dreamResultStore';
import { create } from 'zustand';

interface DreamDetailStoreState {
    dreamDetail: DreamData | undefined;
    isLoading: boolean;
    error: string | null;
    lastFetchedId: string | null;
    setDreamDetail: (dream: DreamData) => void;
    fetchDreamDetail: (dreamId: string, token: string) => Promise<void>;
}

const useDreamDetailStore = create<DreamDetailStoreState>((set, get) => ({
    dreamDetail: undefined,
    isLoading: false,
    error: null,
    lastFetchedId: null,
    
    setDreamDetail: (dream: DreamData) => set({ dreamDetail: dream }),
    
    fetchDreamDetail: async (dreamId: string, token: string) => {
        const { lastFetchedId, isLoading } = get();
        
        // Prevent duplicate calls for the same dream ID
        if (isLoading || lastFetchedId === dreamId) {
            console.log(`Skipping duplicate fetch for dream ID: ${dreamId}`);
            return;
        }

        set({ isLoading: true, error: null });
        
        try {
            console.log(`API Call: Fetching dream detail for ID: ${dreamId}`);
            const response = await dreamApi.getDreamById(dreamId, token);
            
            set({ 
                dreamDetail: response,
                isLoading: false,
                lastFetchedId: dreamId,
                error: null
            });
        } catch (error) {
            console.error('Error fetching dream detail:', error);
            set({ 
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch dream detail'
            });
        }
    },
}));

export default useDreamDetailStore;
