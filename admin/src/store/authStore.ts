import { signIn as apiSignIn, signOut as apiSignOut, getCurrentUser } from '@/lib/api';
import { User } from '@/types';
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  
  signIn: async (email, password) => {
    try {
      set({ isLoading: true });
      await apiSignIn(email, password);
      const user = await getCurrentUser();
      
      if (!user || user.role !== 'admin') {
        await apiSignOut();
        throw new Error('Access denied. Admin privileges required.');
      }
      
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      set({ isLoading: true });
      await apiSignOut();
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },
  
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const user = await getCurrentUser();
      
      if (user && user.role === 'admin') {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
