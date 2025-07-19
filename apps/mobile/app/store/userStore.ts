// store/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

type UserState = {
    clerkUser: any | null;
    customUserData: {
        dreamPreferences?: string[];
        notificationSettings?: object;
    };
    setClerkUser: (user: any | null) => void;
    updateCustomData: (data: Partial<UserState['customUserData']>) => void;
    clear: () => void;
};

const useUserStore = create<UserState>()(
    persist(
        set => ({
            clerkUser: null,
            customUserData: {},
            setClerkUser: user => set({ clerkUser: user }),
            updateCustomData: data =>
                set(state => ({
                    customUserData: { ...state.customUserData, ...data },
                })),
            clear: () => set({ clerkUser: null, customUserData: {} }),
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
