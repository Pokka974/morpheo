import dreamApi from '@/api/dreamApi';
import { DreamData } from './dreamResultStore';
import { create } from 'zustand';

interface DreamDetailStoreState {
    dreamDetail: DreamData | undefined;
    setDreamDetail: (dream: DreamData) => void;
    fetchDreamDetail: (dreamId: string, token: string) => Promise<void>;
}

const useDreamDetailStore = create<DreamDetailStoreState>(set => ({
    dreamDetail: undefined,
    setDreamDetail: (dream: DreamData) => set({ dreamDetail: dream }),
    fetchDreamDetail: async (dreamId: string, token: string) => {
        try {
            const response = await dreamApi.getDreamById(dreamId, token);
            console.log(response);

            set({ dreamDetail: response });
        } catch (error) {
            console.error('Error fetching dreams:', error);
        }
    },
}));

export default useDreamDetailStore;
