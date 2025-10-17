import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { account } from '@/lib/appwrite';
import { User, Restaurant } from '@/types';

interface AuthState {
  user: User | null;
  restaurant: Restaurant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setRestaurant: (restaurant: Restaurant | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      restaurant: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          await account.createEmailSession(email, password);
          await get().checkAuth();
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      logout: async () => {
        try {
          await account.deleteSession('current');
          set({ user: null, restaurant: null, isAuthenticated: false });
        } catch (error) {
          console.error('Logout error:', error);
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const session = await account.get();
          
          // TODO: Fetch user details from users collection
          // For now, just set basic info
          const user: User = {
            $id: session.$id,
            email: session.email,
            name: session.name,
            role: 'restaurant_owner',
            $createdAt: session.$createdAt,
            $updatedAt: session.$updatedAt,
          };

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ user: null, restaurant: null, isAuthenticated: false, isLoading: false });
        }
      },

      setRestaurant: (restaurant: Restaurant | null) => {
        set({ restaurant });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        restaurant: state.restaurant,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
