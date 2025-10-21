import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { account, databases } from '@/lib/appwrite';
import { config } from '@/config';
import { User, Restaurant } from '@/types';
import { Query } from '@/lib/appwrite';

interface AuthState {
  user: User | null;
  restaurant: Restaurant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setRestaurant: (restaurant: Restaurant | null) => void;
  refreshRestaurant: () => Promise<void>;
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
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Always clear state even if API call fails
          set({ user: null, restaurant: null, isAuthenticated: false });
        }
      },

      checkAuth: async () => {
        try {
          set({ isLoading: true });
          const session = await account.get();
          
          // Fetch user details from users collection
          const usersResponse = await databases.listDocuments(
            config.appwrite.databaseId,
            config.appwrite.usersCollectionId,
            [Query.equal('accountId', session.$id)]
          );

          if (usersResponse.documents.length === 0) {
            throw new Error('User document not found');
          }

          const userDoc = usersResponse.documents[0];
          const user: User = {
            $id: userDoc.$id,
            accountId: session.$id, // Store account ID for future use
            email: userDoc.email,
            name: userDoc.name,
            role: userDoc.role,
            $createdAt: userDoc.$createdAt,
            $updatedAt: userDoc.$updatedAt,
          };

          // Fetch restaurant details if user is restaurant owner
          let restaurant: Restaurant | null = null;
          if (userDoc.role === 'restaurant') { // ✅ FIXED: Changed from 'restaurant_owner' to 'restaurant'
            const restaurantsResponse = await databases.listDocuments(
              config.appwrite.databaseId,
              config.appwrite.restaurantsCollectionId,
              [Query.equal('ownerId', session.$id)]
            );

            if (restaurantsResponse.documents.length > 0) {
              const restaurantDoc = restaurantsResponse.documents[0];
              
              // ⚠️ CRITICAL: Explicitly map ONLY the fields we need
              // DO NOT spread restaurantDoc - it may contain relationship expansions
              restaurant = {
                $id: restaurantDoc.$id,
                name: restaurantDoc.name,
                ownerId: restaurantDoc.ownerId,
                description: restaurantDoc.description,
                address: restaurantDoc.address,
                phone: restaurantDoc.phone,
                email: restaurantDoc.email,
                status: restaurantDoc.status,
                latitude: restaurantDoc.latitude,
                longitude: restaurantDoc.longitude,
                deliveryRadius: restaurantDoc.deliveryRadius,
                isActive: restaurantDoc.isActive,
                openingHours: restaurantDoc.openingHours,
                imageUrl: restaurantDoc.imageUrl,
                rating: restaurantDoc.rating,
                totalReviews: restaurantDoc.totalReviews,
                // ✅ Business fields from database
                businessLicense: restaurantDoc.businessLicense,
                taxCode: restaurantDoc.taxCode,
                bankAccount: restaurantDoc.bankAccount,
                bankName: restaurantDoc.bankName,
                $createdAt: restaurantDoc.$createdAt,
                $updatedAt: restaurantDoc.$updatedAt,
              } as Restaurant;
              
              console.log('✅ Restaurant loaded (explicit fields only):', restaurant);
            }
          }

          set({ user, restaurant, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('CheckAuth error:', error);
          set({ user: null, restaurant: null, isAuthenticated: false, isLoading: false });
        }
      },

      setRestaurant: (restaurant: Restaurant | null) => {
        set({ restaurant });
      },

      refreshRestaurant: async () => {
        try {
          const state = get();
          if (!state.restaurant?.$id) {
            console.warn('No restaurant ID to refresh');
            return;
          }

          console.log('🔄 Refreshing restaurant data...');
          
          // Fetch latest restaurant data from database
          const restaurantDoc = await databases.getDocument(
            config.appwrite.databaseId,
            config.appwrite.restaurantsCollectionId,
            state.restaurant.$id
          );

          // Map to Restaurant type (same as checkAuth)
          const restaurant: Restaurant = {
            $id: restaurantDoc.$id,
            name: restaurantDoc.name,
            ownerId: restaurantDoc.ownerId,
            description: restaurantDoc.description,
            address: restaurantDoc.address,
            phone: restaurantDoc.phone,
            email: restaurantDoc.email,
            status: restaurantDoc.status,
            latitude: restaurantDoc.latitude,
            longitude: restaurantDoc.longitude,
            deliveryRadius: restaurantDoc.deliveryRadius,
            isActive: restaurantDoc.isActive,
            openingHours: restaurantDoc.openingHours,
            imageUrl: restaurantDoc.imageUrl,
            rating: restaurantDoc.rating,
            totalReviews: restaurantDoc.totalReviews,
            businessLicense: restaurantDoc.businessLicense,
            taxCode: restaurantDoc.taxCode,
            bankAccount: restaurantDoc.bankAccount,
            bankName: restaurantDoc.bankName,
            $createdAt: restaurantDoc.$createdAt,
            $updatedAt: restaurantDoc.$updatedAt,
          } as Restaurant;

          set({ restaurant });
          console.log('✅ Restaurant data refreshed:', restaurant);
        } catch (error) {
          console.error('❌ Error refreshing restaurant:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist restaurant info, not auth state
        // Auth state should be verified on each app load
        restaurant: state.restaurant,
      }),
    }
  )
);
