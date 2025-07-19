import { create } from 'zustand';

export type DreamData = {
    id: string;
    advice: string;
    culturalReferences: Record<string, string>;
    'dall-e-prompt': string;
    emotions: string[];
    keywords: string[];
    'midjourney-prompt': string;
    summary: string;
    emoji: string;
    dalleImagePath: string | undefined;
    description: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
};

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
