// store/dreamStore.js
import { create } from 'zustand';
import dreamApi from '@/api/dreamApi';
import { DreamData } from './dreamResultStore';

interface DreamListStoreState {
    dreamList: DreamData[];
    setDreamList: (dreams: DreamData[]) => void;
    fetchDreams: (token: string) => Promise<void>;
    addDream: (dream: DreamData) => void;
}

const useDreamListStore = create<DreamListStoreState>(set => ({
    dreamList: [],
    setDreamList: (dreams: DreamData[]) => set({ dreamList: dreams }),
    fetchDreams: async token => {
        try {
            const response = await dreamApi.getAllDreams(token);

            set({ dreamList: response });
        } catch (error) {
            console.error('Error fetching dreams:', error);
        }
    },
    addDream: (dream: DreamData) =>
        set(state => ({
            dreamList: [dream, ...state.dreamList],
        })),
}));

export default useDreamListStore;
