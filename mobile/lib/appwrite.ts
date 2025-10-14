import Constants from "expo-constants";
import { Platform } from "react-native";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";
import { CreateUserParams, GetMenuParams, SignInParams } from "../type";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  // Use Expo defaults in development if bundle IDs are not set
  iosBundleId: Constants.expoConfig?.ios?.bundleIdentifier || "host.exp.Exponent",
  androidPackage: Constants.expoConfig?.android?.package || "host.exp.exponent",
  databaseId: "68da5e73002cb68e70af",
  bucketId:"68dacda1003d6943981e",
  userCollectionId: "user", 
  categoriesCollectionId: "categories",
  menuCollectionId: "menu",
  customizationsCollectionId: "customizations",
  menuCustomizationsCollectionId: "menu_customizations",
  ordersCollectionId: "orders",
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
    try {
        const newAccount = await account.create(ID.unique(), email, password, name)
        if(!newAccount) throw Error;

        // Đăng nhập sau khi tạo tài khoản thành công
        await signIn({ email, password });

        const avatarUrl = avatars.getInitialsURL(name);

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { email, name, accountId: newAccount.$id, avatar: avatarUrl }
        );
    } catch (e) {
        throw new Error(e as string);
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
