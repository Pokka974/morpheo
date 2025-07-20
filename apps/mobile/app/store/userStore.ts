// store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

type UserProfile = {
    gender?: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'PREFER_NOT_TO_SAY';
    ageRange?: 'TEEN_13_17' | 'YOUNG_ADULT_18_25' | 'ADULT_26_35' | 'MIDDLE_AGED_36_50' | 'MATURE_51_65' | 'SENIOR_65_PLUS';
    culturalBackground?: string[];
    primaryLanguage?: string;
    location?: string;
    interpretationStyle?: 'SCIENTIFIC' | 'SPIRITUAL' | 'PSYCHOLOGICAL' | 'BALANCED' | 'CULTURAL_FOCUSED';
};

type UserState = {
    clerkUser: any | null;
    profile: UserProfile;
    customUserData: {
        dreamPreferences?: string[];
        notificationSettings?: object;
    };
    setClerkUser: (user: any | null) => void;
    updateProfile: (profile: Partial<UserProfile>) => void;
    updateCustomData: (data: Partial<UserState['customUserData']>) => void;
    clear: () => void;
};

const useUserStore = create<UserState>()(
    persist(
        set => ({
            clerkUser: null,
            profile: {},
            customUserData: {},
            setClerkUser: user => set({ clerkUser: user }),
            updateProfile: profile =>
                set(state => ({
                    profile: { ...state.profile, ...profile },
                })),
            updateCustomData: data =>
                set(state => ({
                    customUserData: { ...state.customUserData, ...data },
                })),
            clear: () => set({ clerkUser: null, profile: {}, customUserData: {} }),
        }),
        {
            name: 'user-store',
            storage: {
                getItem: name => SecureStore.getItemAsync(name).then(v => (v ? JSON.parse(v) : null)),
                setItem: (name, value) => SecureStore.setItemAsync(name, JSON.stringify(value)),
                removeItem: name => SecureStore.deleteItemAsync(name),
            },
        }
    )
);

export default useUserStore;
