import Constants from "expo-constants";
import { Platform } from "react-native";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";
import { CreateUserParams, GetMenuParams, RestaurantFilters, SignInParams } from "../type";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1",
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "",
  // Use Expo defaults in development if bundle IDs are not set
  iosBundleId: process.env.EXPO_PUBLIC_APPWRITE_IOS_BUNDLE_ID || Constants.expoConfig?.ios?.bundleIdentifier || "host.exp.Exponent",
  androidPackage: process.env.EXPO_PUBLIC_APPWRITE_ANDROID_PACKAGE || Constants.expoConfig?.android?.package || "host.exp.exponent",
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "68da5e73002cb68e70af",
  bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID || "68dacda1003d6943981e",
  
  // Existing collections
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID || "user", 
  categoriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID || "categories",
  menuCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID || "menu",
  customizationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID || "customizations",
  menuCustomizationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_CUSTOMIZATIONS_COLLECTION_ID || "menu_customizations",
  ordersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID || "orders",
  
  // New collections (Phase 0 - Database Foundation)
  restaurantsCollectionId: "restaurants",
  orderItemsCollectionId: "order_items",
  paymentsCollectionId: "payments",
  reviewsCollectionId: "reviews",
  notificationsCollectionId: "notifications",
  dronesCollectionId: "drones",
  droneEventsCollectionId: "drone_events",
  promotionsCollectionId: "promotions",
  userVouchersCollectionId: "user_vouchers",
  auditLogsCollectionId: "audit_logs",
};

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(Platform.OS === 'ios' ? appwriteConfig.iosBundleId : appwriteConfig.androidPackage)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    let newAccount: any = null;
    
    try {
        console.log('🔵 [STEP 1/3] Creating account in Auth for:', email);
        
        // Bước 1: Tạo account trong Auth
        newAccount = await account.create(ID.unique(), email, password, name);
        if (!newAccount) throw new Error('Failed to create account');
        
        console.log('✅ [STEP 1/3] Account created successfully. ID:', newAccount.$id);

        // Bước 2: Tạo avatar URL
        const avatarUrl = avatars.getInitials(name);
        console.log('🔵 [STEP 2/3] Creating user document in database...');

        // Bước 3: Tạo document trong user collection
        // Note: Only include attributes that exist in Appwrite user collection
        const userDoc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { 
                email, 
                name, 
                accountId: newAccount.$id, 
                avatar: avatarUrl,
                role: 'customer'
                // phone and address removed - not in Appwrite schema
                // Add them in Appwrite Console if needed: Database → user → Attributes
            }
        );
        
        console.log('✅ [STEP 2/3] User document created successfully. Doc ID:', userDoc.$id);
        console.log('🔵 [STEP 3/3] Logging in user...');

        // Bước 4: Login sau khi tất cả thành công
        await signIn({ email, password });
        
        console.log('✅ [STEP 3/3] User logged in successfully');
        console.log('🎉 Registration completed successfully for:', email);

        return userDoc;
        
    } catch (e: any) {
        console.error('❌ Error in createUser:', e);
        
        // Provide better error message
        let errorMessage = '';
        
        if (e.message?.includes('permission') || e.message?.includes('Unauthorized')) {
            errorMessage = '⚠️ Permission Error: Unable to save user to database.\n\n' +
                '📝 Admin needs to:\n' +
                '1. Open Appwrite Console\n' +
                '2. Go to Database → user collection\n' +
                '3. Settings → Permissions\n' +
                '4. Add "Any" role with Create permission\n\n' +
                '💡 Your account was created but not fully registered.';
        } else if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
            errorMessage = '📧 This email is already registered.\n\nPlease try logging in instead.';
        } else if (e.message?.includes('network') || e.message?.includes('fetch')) {
            errorMessage = '📡 Network error. Please check your internet connection and try again.';
        } else {
            errorMessage = `❌ Registration failed: ${e.message || 'Unknown error'}`;
        }
        
        // Log warning if account was created but document wasn't
        if (newAccount) {
            console.warn('⚠️ IMPORTANT: Account created in Auth but user document creation failed');
            console.warn('⚠️ Account ID:', newAccount.$id);
            console.warn('⚠️ Manual cleanup may be required');
        }
        
        throw new Error(errorMessage);
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        // Kiểm tra và xóa session hiện tại nếu có
        try {
            await account.deleteSession('current');
        } catch (e) {
            // Session không tồn tại hoặc đã hết hạn, bỏ qua lỗi này
            console.log('No active session to delete');
        }
        
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');
        return session;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) throw new Error('No authenticated user found');

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser || currentUser.documents.length === 0) {
            throw new Error('User data not found in database');
        }

        return currentUser.documents[0];
    } catch (e) {
        console.log('getCurrentUser error:', e);
        // Nếu không có session hoặc session hết hạn, trả về null thay vì throw error
        return null;
    }
}

export const getMenu = async ({ category, query }: GetMenuParams) => {
    try {
        const queries: string[] = [];

        if(category) queries.push(Query.equal('categories', category));
        // Use contains instead of search to avoid fulltext index requirement
        // For production, create fulltext index on 'name' attribute and use Query.search()
        if(query) queries.push(Query.contains('name', query));

        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        )

        return menus.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getMenuById = async (menuId: string) => {
    try {
        const menuItem = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            menuId
        );

        return menuItem;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        )

        return categories.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const updateUser = async ({ userId, ...updates }: { userId: string; [key: string]: any }) => {
    try {
        const updatedUser = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId,
            {
                ...updates,
                updatedAt: new Date().toISOString()
            }
        );

        return updatedUser;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const uploadAvatar = async (file: any) => {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.bucketId,
            ID.unique(),
            file
        );

        const fileUrl = storage.getFileView(
            appwriteConfig.bucketId,
            uploadedFile.$id
        );

        return fileUrl;
    } catch (e) {
        throw new Error(e as string);
    }
}

// Orders Functions
export const createOrder = async (orderData: any) => {
    try {
        const order = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            ID.unique(),
            {
                ...orderData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        );

        return order;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getUserOrders = async (userId: string) => {
    try {
        const orders = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [
                Query.equal('user', userId),
                Query.orderDesc('createdAt')
            ]
        );

        return orders.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getOrderById = async (orderId: string) => {
    try {
        const order = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            orderId
        );

        return order;
    } catch (e) {
        throw new Error(e as string);
    }
}

// ===================== ADMIN FUNCTIONS =====================

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (limit: number = 100) => {
    try {
        const orders = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [
                Query.orderDesc('createdAt'),
                Query.limit(limit)
            ]
        );

        return orders.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
    try {
        const updatedOrder = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            orderId,
            {
                status,
                updatedAt: new Date().toISOString()
            }
        );

        return updatedOrder;
    } catch (e) {
        throw new Error(e as string);
    }
}

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (limit: number = 100) => {
    try {
        const users = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.orderDesc('createdAt'),
                Query.limit(limit)
            ]
        );

        return users.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

/**
 * Update menu item (admin only)
 */
export const updateMenuItem = async (
    menuId: string, 
    data: {
        name?: string;
        description?: string;
        price?: number;
        image_url?: string;
        rating?: number;
        calories?: number;
        protein?: number;
    }
) => {
    try {
        const updatedItem = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            menuId,
            {
                ...data,
                updatedAt: new Date().toISOString()
            }
        );

        return updatedItem;
    } catch (e) {
        throw new Error(e as string);
    }
}

/**
 * Delete menu item (admin only)
 */
export const deleteMenuItem = async (menuId: string) => {
    try {
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            menuId
        );

        return { success: true };
    } catch (e) {
        throw new Error(e as string);
    }
}

/**
 * Create menu item (admin only)
 */
export const createMenuItem = async (data: {
    name: string;
    description: string;
    price: number;
    image_url: string;
    rating?: number;
    calories?: number;
    protein?: number;
    categories?: string[];
}) => {
    try {
        const newItem = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            ID.unique(),
            {
                ...data,
                createdAt: new Date().toISOString()
            }
        );

        return newItem;
    } catch (e) {
        throw new Error(e as string);
    }
}

// ===================== RESTAURANT FUNCTIONS =====================

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in kilometers
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Check if restaurant is currently open based on operating hours
 */
export const isRestaurantOpen = (operatingHours?: Record<string, { open: string; close: string }>): boolean => {
    if (!operatingHours) return true; // If no hours specified, assume always open

    const now = new Date();
    const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

    const todayHours = operatingHours[day];
    if (!todayHours) return false;

    const [openHour, openMin] = todayHours.open.split(':').map(Number);
    const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
    const openTime = openHour * 60 + openMin;
    const closeTime = closeHour * 60 + closeMin;

    return currentTime >= openTime && currentTime <= closeTime;
}

/**
 * Get all active restaurants with optional filters
 */
export const getRestaurants = async (filters?: RestaurantFilters, userLat?: number, userLng?: number) => {
    try {
        const queries: string[] = [Query.equal('isActive', true)];

        // Apply filters
        if (filters?.cuisine) {
            queries.push(Query.equal('cuisine', filters.cuisine));
        }

        if (filters?.rating) {
            queries.push(Query.greaterThanEqual('rating', filters.rating));
        }

        if (filters?.search) {
            queries.push(Query.search('name', filters.search));
        }

        // Order by rating by default
        if (!filters?.sortBy || filters.sortBy === 'rating') {
            queries.push(Query.orderDesc('rating'));
        } else if (filters.sortBy === 'name') {
            queries.push(Query.orderAsc('name'));
        }

        const restaurants = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.restaurantsCollectionId,
            queries
        );

        // Enhance restaurants with distance and open status
        const enhancedRestaurants = restaurants.documents.map((restaurant: any) => {
            let distance: number | undefined;
            if (userLat && userLng) {
                distance = calculateDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
            }

            const isOpen = isRestaurantOpen(restaurant.operatingHours);
            const estimatedTime = distance ? Math.ceil(distance * 3 + 20) : 30; // 3 min/km + 20 min prep

            return {
                ...restaurant,
                distance,
                isOpen,
                estimatedTime
            };
        });

        // Filter by distance if specified
        let filteredRestaurants = enhancedRestaurants;
        if (filters?.distance && userLat && userLng) {
            filteredRestaurants = enhancedRestaurants.filter(r => r.distance && r.distance <= filters.distance!);
        }

        // Sort by distance if requested
        if (filters?.sortBy === 'distance' && userLat && userLng) {
            filteredRestaurants.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }

        return filteredRestaurants;
    } catch (e) {
        console.error('Error fetching restaurants:', e);
        throw new Error(e as string);
    }
}

/**
 * Get restaurant by ID
 */
export const getRestaurantById = async (restaurantId: string) => {
    try {
        const restaurant = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.restaurantsCollectionId,
            restaurantId
        );

        return restaurant;
    } catch (e) {
        throw new Error(e as string);
    }
}

/**
 * Get menu items for a specific restaurant
 */
export const getRestaurantMenu = async (restaurantId: string, category?: string, query?: string) => {
    try {
        const queries: string[] = [Query.equal('restaurantId', restaurantId)];

        if (category) queries.push(Query.equal('categories', category));
        if (query) queries.push(Query.contains('name', query));

        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries
        );

        return menus.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

/**
 * Get reviews for a restaurant
 */
export const getRestaurantReviews = async (restaurantId: string, limit: number = 20) => {
    try {
        const reviews = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.reviewsCollectionId,
            [
                Query.equal('restaurantId', restaurantId),
                Query.equal('isVisible', true),
                Query.orderDesc('$createdAt'),
                Query.limit(limit)
            ]
        );

        return reviews.documents;
    } catch (e) {
        console.error('Error fetching reviews:', e);
        return []; // Return empty array if reviews collection doesn't exist yet
    }
}

/**
 * Get available cuisines from all restaurants
 */
export const getAvailableCuisines = async (): Promise<string[]> => {
    try {
        const restaurants = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.restaurantsCollectionId,
            [Query.equal('isActive', true)]
        );

        const cuisines = new Set<string>();
        restaurants.documents.forEach((restaurant: any) => {
            if (restaurant.cuisine) {
                cuisines.add(restaurant.cuisine);
            }
        });

        return Array.from(cuisines).sort();
    } catch (e) {
        console.error('Error fetching cuisines:', e);
        return [];
    }
}
