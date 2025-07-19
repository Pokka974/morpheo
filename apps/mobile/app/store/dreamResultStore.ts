import { create } from 'zustand';
import { DreamAPI } from '@morpheo/types';

export type DreamData = DreamAPI;

type DreamState = {
    rawDreamText: string;
    dreamData: DreamData | null;
    isLoading: boolean;
    error: string | null;
    startLoading: (prompt: string) => void;
    setDreamData: (data: DreamData) => void;
    setError: (error: string) => void;
    reset: () => void;
};

const useDreamResultStore = create<DreamState>(set => ({
    rawDreamText: '',
    dreamData: null,
    isLoading: false,
    error: null,

    startLoading: prompt =>
        set({
            rawDreamText: prompt,
            isLoading: true,
            error: null,
        }),

    setDreamData: data =>
        set({
            dreamData: data,
            isLoading: false,
        }),

    setError: error =>
        set({
            error,
            isLoading: false,
        }),

    reset: () =>
        set({
            rawDreamText: '',
            dreamData: null,
            isLoading: false,
            error: null,
        }),
}));

export default useDreamResultStore;
