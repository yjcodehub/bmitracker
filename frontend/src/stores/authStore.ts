import { create } from 'zustand';
import { api } from '@/lib/api';
import { User, UserRole } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<UserRole>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  getDashboardPath: () => string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const response = await api.post<{ accessToken: string }>('/auth/login', {
      email,
      password,
    });
    api.setToken(response.data.accessToken);
    await get().fetchUser();
    const role = get().user?.roleId?.slug || 'member';
    set({ isAuthenticated: true });
    return role;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      api.setToken(null);
      set({ user: null, isAuthenticated: false });
    }
  },

  fetchUser: async () => {
    try {
      const token = api.getToken();
      if (!token) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }
      const response = await api.get<User>('/auth/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch {
      api.setToken(null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  getDashboardPath: () => {
    const role = get().user?.roleId?.slug;
    switch (role) {
      case 'owner':
        return '/owner';
      case 'staff':
        return '/staff';
      default:
        return '/member';
    }
  },
}));
