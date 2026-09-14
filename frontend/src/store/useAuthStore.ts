import { create } from 'zustand';
import { User, UserRole } from '@/types';
import { authApi } from '@/services/api/auth';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('eduarchive_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  accessToken: localStorage.getItem('eduarchive_access_token'),
  refreshToken: localStorage.getItem('eduarchive_refresh_token'),
  role: (() => {
    try {
      const stored = localStorage.getItem('eduarchive_user');
      return stored ? (JSON.parse(stored).role as UserRole) : null;
    } catch {
      return null;
    }
  })(),
  isAuthenticated: !!localStorage.getItem('eduarchive_access_token'),
  isLoading: false,

  login: (accessToken: string, refreshToken: string, user: User) => {
    localStorage.setItem('eduarchive_access_token', accessToken);
    localStorage.setItem('eduarchive_refresh_token', refreshToken);
    localStorage.setItem('eduarchive_user', JSON.stringify(user));
    set({
      user,
      accessToken,
      refreshToken,
      role: user.role,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore network failure on logout
    } finally {
      localStorage.removeItem('eduarchive_access_token');
      localStorage.removeItem('eduarchive_refresh_token');
      localStorage.removeItem('eduarchive_user');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('eduarchive_access_token');
    if (!token) {
      set({ isAuthenticated: false, user: null, role: null, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const res = await authApi.me();
      if (res.success && res.data) {
        localStorage.setItem('eduarchive_user', JSON.stringify(res.data));
        set({
          user: res.data,
          role: res.data.role,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        throw new Error('Failed to load user profile');
      }
    } catch {
      localStorage.removeItem('eduarchive_access_token');
      localStorage.removeItem('eduarchive_refresh_token');
      localStorage.removeItem('eduarchive_user');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: User) => {
    localStorage.setItem('eduarchive_user', JSON.stringify(user));
    set({ user, role: user.role });
  },
}));
