import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';

const TOKEN_KEY = 'artha_auth_token';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (email: string, pass: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  user: null,
  isLoading: true, // starts loading while checking token
  error: null,

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      if (storedToken) {
        // Verify token with backend
        const res = await api.auth.verifyToken(storedToken) as any;
        if (res.valid) {
          set({ token: storedToken, isAuthenticated: true, user: res.user });
        } else {
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          set({ token: null, isAuthenticated: false, user: null });
        }
      } else {
        set({ isAuthenticated: false });
      }
    } catch (e) {
      console.error('Auth check error:', e);
      set({ isAuthenticated: false, token: null });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, pass) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.auth.login(email, pass) as any;
      await SecureStore.setItemAsync(TOKEN_KEY, res.token);
      set({ token: res.token, isAuthenticated: true, user: res.user, isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Login failed', isLoading: false });
      return false;
    }
  },

  register: async (email, pass, name) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.auth.register(email, pass, name) as any;
      await SecureStore.setItemAsync(TOKEN_KEY, res.token);
      set({ token: res.token, isAuthenticated: true, user: res.user, isLoading: false });
      return true;
    } catch (e: any) {
      set({ error: e.message || 'Registration failed', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ token: null, isAuthenticated: false, user: null, isLoading: false });
    } catch (e) {
      set({ isLoading: false });
    }
  }
}));
