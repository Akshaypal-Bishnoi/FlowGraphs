import { create } from 'zustand';

// Try to parse the user from localStorage on init
const savedUser = localStorage.getItem('flowgraphs_user');
const savedToken = localStorage.getItem('flowgraphs_token');

export const useAuthStore = create((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,

  setAuth: (user, token) => {
    localStorage.setItem('flowgraphs_user', JSON.stringify(user));
    localStorage.setItem('flowgraphs_token', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('flowgraphs_user');
    localStorage.removeItem('flowgraphs_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
