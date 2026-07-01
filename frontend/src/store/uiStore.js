import { create } from 'zustand';

export const useUIStore = create((set) => ({
  theme: 'light',
  sidebarOpen: true,
  executionPanelOpen: false,
  
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  setExecutionPanelOpen: (isOpen) => set({ executionPanelOpen: isOpen }),
}));
