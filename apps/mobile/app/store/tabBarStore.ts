// store/tabBarStore.ts
import { create } from 'zustand';

interface TabBarState {
    visible: boolean;
    setVisible: (visible: boolean) => void;
}

const useTabBarStore = create<TabBarState>(set => ({
    visible: true,
    setVisible: visible => set({ visible }),
}));

export default useTabBarStore;
