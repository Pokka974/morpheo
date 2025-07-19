import { create } from 'zustand';

interface AuthStore {
    mode: 'login' | 'register';
    toggleMode: () => void;
    setMode: (mode: 'login' | 'register') => void;
}

const useAuthStore = create<AuthStore>(set => ({
    mode: 'login', // Default mode
    toggleMode: () => set(state => ({ mode: state.mode === 'login' ? 'register' : 'login' })),
    setMode: mode => set({ mode }),
}));

export default useAuthStore;
