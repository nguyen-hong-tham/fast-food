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
          await account.createEmailPasswordSession(email, password);
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
          
          // ✅ CRITICAL: Only allow restaurant role to access this portal
          if (userDoc.role !== 'restaurant') {
            console.error('❌ Access denied: User is not a restaurant owner');
            await account.deleteSession('current');
            throw new Error('Access denied. This portal is only for restaurant owners.');
          }
          
          const user: User = {
            $id: userDoc.$id,
            accountId: session.$id,
            email: userDoc.email,
            name: userDoc.name,
            role: userDoc.role,
            $createdAt: userDoc.$createdAt,
            $updatedAt: userDoc.$updatedAt,
          };

          // Fetch restaurant details if user is restaurant owner
          let restaurant: Restaurant | null = null;
          if (userDoc.role === 'restaurant') {
            console.log('🔍 Looking for restaurant');
            console.log('📝 Session ID (accountId):', session.$id);
            console.log('📝 User Document ID:', userDoc.$id);
            
            try {
              // If ownerId is relationship, query by user document ID
              // If ownerId is string, query by accountId
              const restaurantsResponse = await databases.listDocuments(
                config.appwrite.databaseId,
                config.appwrite.restaurantsCollectionId,
                [Query.equal('ownerId', userDoc.$id)] // Use user document ID for relationship
              );

              console.log('📊 Found restaurants (query):', restaurantsResponse.documents.length);

              if (restaurantsResponse.documents.length > 0) {
                const restaurantDoc = restaurantsResponse.documents[0];
                restaurant = mapRestaurantDocument(restaurantDoc);
              }
            } catch (queryError: any) {
              console.warn('⚠️ Query by ownerId failed, trying to fetch all:', queryError.message);
              
              // If query fails (relationship issue), fetch all and filter client-side
              try {
                const allRestaurants = await databases.listDocuments(
                  config.appwrite.databaseId,
                  config.appwrite.restaurantsCollectionId,
                  [Query.limit(100)]
                );

                console.log('📊 Total restaurants:', allRestaurants.documents.length);

                // Filter by ownerId (handle both string and relationship object)
                const restaurantDoc = allRestaurants.documents.find((doc: any) => {
                  const docOwnerId = typeof doc.ownerId === 'object' 
                    ? doc.ownerId.$id || doc.ownerId 
                    : doc.ownerId;
                  console.log('🔍 Comparing ownerId:', docOwnerId);
                  console.log('🔍 With user doc ID:', userDoc.$id);
                  console.log('🔍 With session ID:', session.$id);
                  // Try matching with both user document ID and session ID
                  return docOwnerId === userDoc.$id || docOwnerId === session.$id;
                });

                if (restaurantDoc) {
                  console.log('✅ Found restaurant by filtering:', restaurantDoc.$id);
                  restaurant = mapRestaurantDocument(restaurantDoc);
                } else {
                  console.log('❌ No restaurant found for this user');
                }
              } catch (fetchError) {
                console.error('❌ Error fetching all restaurants:', fetchError);
              }
            }

            if (restaurant) {
              console.log('✅ Restaurant loaded:', restaurant.name);
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
          
          const restaurantDoc = await databases.getDocument(
            config.appwrite.databaseId,
            config.appwrite.restaurantsCollectionId,
            state.restaurant.$id
          );

          const restaurant = mapRestaurantDocument(restaurantDoc);
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
        user: state.user,
        restaurant: state.restaurant,
      }),
    }
  )
);

// Helper function to map restaurant document
function mapRestaurantDocument(restaurantDoc: any): Restaurant {
  return {
    $id: restaurantDoc.$id,
    name: restaurantDoc.name,
    ownerId: typeof restaurantDoc.ownerId === 'object' 
      ? restaurantDoc.ownerId.$id || restaurantDoc.ownerId 
      : restaurantDoc.ownerId,
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
    logo: restaurantDoc.logo,
    coverImage: restaurantDoc.coverImage,
    rating: restaurantDoc.rating,
    totalReviews: restaurantDoc.totalReviews,
    businessLicense: restaurantDoc.businessLicense,
    taxCode: restaurantDoc.taxCode,
    bankAccount: restaurantDoc.bankAccount,
    bankName: restaurantDoc.bankName,
    $createdAt: restaurantDoc.$createdAt,
    $updatedAt: restaurantDoc.$updatedAt,
  } as Restaurant;
}
