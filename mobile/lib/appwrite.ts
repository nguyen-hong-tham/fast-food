import Constants from "expo-constants";
import { Platform } from "react-native";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";
import { CreateUserParams, GetMenuParams, RestaurantFilters, SignInParams, VNPayPaymentRequest, VNPayPaymentResponse, VNPayCallbackParams, PaymentResult, PaymentMethod, Order, DroneEvent, Drone } from "../type";

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
  ordersCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID || "orders",
  
  // New collections (Phase 0 - Database Foundation)
  restaurantsCollectionId: "restaurants",
  orderItemsCollectionId: "order_items",
  paymentsCollectionId: "payments",
  reviewsCollectionId: "reviews", // NEW: Reviews collection
  notificationsCollectionId: "notifications",
  dronesCollectionId: "drones",
  droneHubsCollectionId: "drone_hub", // Drone hubs collection
  droneEventsCollectionId: "drone_events",
  promotionsCollectionId: "promotions",
  userVouchersCollectionId: "user_vouchers",
  auditLogsCollectionId: "audit_logs",
};

export const client = new Client();

// Debug: Log configuration to verify environment variables are loaded
console.log('🔧 Appwrite Config:', {
  endpoint: appwriteConfig.endpoint,
  projectId: appwriteConfig.projectId,
  databaseId: appwriteConfig.databaseId,
  userCollectionId: appwriteConfig.userCollectionId,
  categoriesCollectionId: appwriteConfig.categoriesCollectionId,
});

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(Platform.OS === 'ios' ? appwriteConfig.iosBundleId : appwriteConfig.androidPackage);

// Configure realtime with retry logic for better stability
if (typeof window !== 'undefined') {
  // Add reconnection handler for web/mobile
  const setupRealtimeReconnection = () => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const baseDelay = 1000; // 1 second

    const attemptReconnect = () => {
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('❌ Max reconnection attempts reached. Please refresh the app.');
        return;
      }

      reconnectAttempts++;
      const delay = baseDelay * Math.pow(2, reconnectAttempts - 1); // Exponential backoff
      
      console.log(`🔄 Attempting to reconnect to Appwrite Realtime (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`);
      
      setTimeout(() => {
        // Realtime will auto-reconnect, we just log the attempt
        console.log('✅ Realtime reconnection initiated');
        reconnectAttempts = 0; // Reset on successful connection
      }, delay);
    };

    // Listen for connection errors (this is just for logging, SDK handles reconnection)
    console.log('🔌 Appwrite Realtime configured with auto-reconnection');
  };

  setupRealtimeReconnection();
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    let newAccount: any = null;
    
    try {
        // Bước 1: Tạo account trong Auth
        newAccount = await account.create(ID.unique(), email, password, name);
        if (!newAccount) throw new Error('Failed to create account');

        // Bước 2: Tạo document trong user collection
        // Note: Only include attributes that exist in Appwrite user collection
        // Avatar will be optional - user can update later in profile
        const userDoc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { 
                email, 
                name, 
                accountId: newAccount.$id, 
                role: 'customer'
                // avatar: optional - can be added later via profile update
                // phone and address removed - not in Appwrite schema
                // Add them in Appwrite Console if needed: Database → user → Attributes
            }
        );
        
        // Bước 4: Login sau khi tất cả thành công
        await signIn({ email, password });

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
        // ✅ FIX: Kiểm tra và xóa session cũ TRƯỚC KHI tạo mới
        // Điều này xử lý trường hợp:
        // 1. User browse app (anonymous session)
        // 2. Add to cart → yêu cầu login
        // 3. Login → cần xóa session cũ trước
        try {
            const currentSession = await account.getSession('current');
            if (currentSession) {
                console.log('🔄 Found existing session, deleting before login...');
                await account.deleteSession('current');
                // Delay nhỏ để Appwrite xử lý xong
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        } catch (sessionCheckError: any) {
            // Không có session cũ hoặc session đã expired - OK, tiếp tục
            console.log('ℹ️ No existing session found, proceeding with login');
        }

        // Tạo session mới
        const session = await account.createEmailPasswordSession(email, password);
        console.log('✅ Login successful');
        return session;
        
    } catch (e: any) {
        console.error('❌ Login error:', e);
        
        // Nếu vẫn lỗi về session (edge case)
        if (e.message?.includes('session is active') || e.message?.includes('session is prohibited')) {
            try {
                console.log('🔄 Retrying: Force delete session and login again');
                await account.deleteSession('current').catch(() => {});
                await new Promise(resolve => setTimeout(resolve, 500));
                const session = await account.createEmailPasswordSession(email, password);
                console.log('✅ Login successful after retry');
                return session;
            } catch (retryError: any) {
                console.error('❌ Retry failed:', retryError);
                throw new Error('Login failed: ' + (retryError.message || 'Please try again'));
            }
        }
        
        throw e;
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
        console.log('🔍 Getting current user...');
        console.log('📝 Using userCollectionId:', appwriteConfig.userCollectionId);
        console.log('📝 Using databaseId:', appwriteConfig.databaseId);
        
        const currentAccount = await account.get();
        if(!currentAccount) throw new Error('No authenticated user found');
        
        console.log('👤 Current account ID:', currentAccount.$id);

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if(!currentUser || currentUser.documents.length === 0) {
            throw new Error('User data not found in database');
        }

        console.log('✅ User found:', currentUser.documents[0]);
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
        // Get all categories (could add pagination if needed)
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
            [
                Query.equal('isActive', true),
                Query.orderAsc('displayOrder'),
                Query.orderAsc('name'),
                Query.limit(100)
            ]
        );
        return response.documents;
    } catch (e) {
        console.log('Error fetching categories:', e);
        return [];
    }
}

// Get categories for a specific restaurant
export const getRestaurantCategories = async (restaurantId: string) => {
    try {
        console.log('🔍 Fetching categories with:', {
            databaseId: appwriteConfig.databaseId,
            collectionId: appwriteConfig.categoriesCollectionId,
            restaurantId
        });
        
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
            [
                Query.equal('restaurantId', restaurantId),
                Query.equal('isActive', true),
                Query.orderAsc('displayOrder'),
                Query.orderAsc('name'),
                Query.limit(100)
            ]
        );
        
        console.log('✅ Categories fetched:', response.documents.length);
        return response.documents;
    } catch (e: any) {
        console.log('❌ Error fetching restaurant categories:', e.message);
        console.log('💡 Check if collection ID "categories" exists in Appwrite Database:', appwriteConfig.databaseId);
        return [];
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

export const saveUserPushToken = async (userId: string, pushToken: string) => {
    try {
        await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId,
            {
                fcmToken: pushToken,
                updatedAt: new Date().toISOString()
            }
        );
        console.log('✅ Push token saved successfully');
    } catch (e) {
        console.error('Failed to save push token', e);
        throw e;
    }
};

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
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
            }
        );

        return order;
    } catch (e) {
        throw new Error(e as string);
    }
}

/**
 * Create comprehensive order with items and payment integration
 */
export const createOrderWithPayment = async (orderData: {
    userId: string;
    restaurantId: string;
    items: Array<{
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
        image_url: string;
        notes?: string;
    }>;
    total: number;
    deliveryAddress: string;
    deliveryAddressLabel?: string;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    phone: string;
    notes?: string;
    paymentMethod: 'cod' | 'vnpay';
    status?: string;
}) => {
    try {
        // ✅ Xác định trạng thái ban đầu của đơn hàng
        // Các giá trị hợp lệ: "pending", "confirmed", "preparing", "ready", "delivering", "delivered", "cancelled"
        const initialStatus = orderData.status || "pending";

        // 🧾 Log để kiểm tra giá trị status trước khi gửi
        console.log("🧾 ORDER STATUS:", initialStatus);
        console.log("💳 PAYMENT METHOD:", orderData.paymentMethod);
        console.log("📦 ORDER DATA:", {
            userId: orderData.userId,
            restaurantId: orderData.restaurantId,
            total: orderData.total,
            deliveryAddress: orderData.deliveryAddress,
            phone: orderData.phone
        });

        // ✅ Tạo đơn hàng chính

        // ✅ Tạo items field với dữ liệu tối thiểu (không có image_url, notes để tránh vượt 1000 chars)
        const itemsForOrder = orderData.items.map(item => ({
            id: item.menuItemId,
            name: item.name.substring(0, 40), // Giới hạn tên
            price: item.price,
            qty: item.quantity
        }));

        const orderPayload: any = {
            userId: orderData.userId,
            restaurantId: orderData.restaurantId,
            total: orderData.total,
            deliveryAddress: orderData.deliveryAddress,
            phone: orderData.phone,
            items: JSON.stringify(itemsForOrder), // ✅ Required field với minimal data
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Chỉ thêm các field optional nếu có giá trị
        if (orderData.deliveryAddressLabel) {
            orderPayload.deliveryAddressLabel = orderData.deliveryAddressLabel;
        }
        if (orderData.notes) {
            orderPayload.notes = orderData.notes;
        }
        
        // Add delivery coordinates for drone tracking (if available)
        if (orderData.deliveryLatitude && orderData.deliveryLongitude) {
            orderPayload.deliveryLatitude = orderData.deliveryLatitude;
            orderPayload.deliveryLongitude = orderData.deliveryLongitude;
            console.log('📍 Order delivery coords:', orderData.deliveryLatitude, orderData.deliveryLongitude);
        }
        
        // Thêm các enum fields - đảm bảo giá trị chính xác
        // Validate paymentMethod trước khi gửi
        const validPaymentMethods = ['cod', 'vnpay'];
        const paymentMethod = validPaymentMethods.includes(orderData.paymentMethod) 
            ? orderData.paymentMethod 
            : 'cod'; // fallback to cod
        
        orderPayload.status = initialStatus;
        orderPayload.paymentMethod = paymentMethod;
        orderPayload.paymentStatus = "pending";

        const order = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            ID.unique(),
            orderPayload
        );

        // ✅ Tạo từng dòng order item
        const orderItems = await Promise.all(
            orderData.items.map(async (item) => {
                const subtotal = item.price * item.quantity;

                return await databases.createDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.orderItemsCollectionId,
                    ID.unique(),
                    {
                        orderId: order.$id,
                        menuItemId: item.menuItemId,
                        name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        imageUrl: item.image_url,
                        notes: item.notes, // ✅ Lưu notes
                        subtotal: subtotal,
                        // ✅ Không cần $createdAt, $updatedAt - Appwrite tự động tạo
                    }
                );
            })
        );

        console.log("✅ Order created successfully:", order.$id);

        // ✅ Update restaurant totalOrders count
        try {
            const restaurant = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.restaurantsCollectionId,
                orderData.restaurantId
            );

            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.restaurantsCollectionId,
                orderData.restaurantId,
                {
                    totalOrders: (restaurant.totalOrders || 0) + 1
                }
            );
            console.log("✅ Restaurant totalOrders updated");
        } catch (error) {
            console.error("⚠️ Failed to update restaurant totalOrders:", error);
            // Don't throw error - order is still created successfully
        }

        return { order, orderItems };
    } catch (e: any) {
        console.error("❌ Error creating order:", e.message || e);
        throw new Error(e.message || "Unknown error while creating order");
    }
};


export const getUserOrders = async (userId: string) => {
    try {
        const orders = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [
                Query.equal('userId', userId), // Fixed: 'user' → 'userId'
                Query.orderDesc('createdAt')
            ]
        );

        // Enhance orders with itemCount from orderItems collection
        const enhancedOrders = await Promise.all(
            orders.documents.map(async (order) => {
                try {
                    // Fetch order items count
                    const orderItems = await databases.listDocuments(
                        appwriteConfig.databaseId,
                        appwriteConfig.orderItemsCollectionId,
                        [
                            Query.equal('orderId', order.$id),
                        ]
                    );
                    
                    // Calculate total item count
                    const itemCount = orderItems.documents.reduce((sum, item: any) => {
                        return sum + (item.quantity || 0);
                    }, 0);
                    
                    return {
                        ...order,
                        itemCount,
                    };
                } catch (error) {
                    console.warn('Failed to fetch items for order:', order.$id);
                    // Fallback: try to parse from items field
                    let itemCount = 0;
                    if (order.items) {
                        try {
                            const items = typeof order.items === 'string' 
                                ? JSON.parse(order.items) 
                                : order.items;
                            if (Array.isArray(items)) {
                                itemCount = items.reduce((sum: number, item: any) => sum + (item.quantity || item.qty || 0), 0);
                            }
                        } catch (e) {
                            console.warn('Failed to parse items:', e);
                        }
                    }
                    return {
                        ...order,
                        itemCount,
                    };
                }
            })
        );

        return enhancedOrders;
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

/**
 * Get order items for a specific order
 */
export const getOrderItems = async (orderId: string) => {
    try {
        const orderItems = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.orderItemsCollectionId,
            [
                Query.equal('orderId', orderId),
                Query.orderAsc('$createdAt') // ✅ Appwrite system field
            ]
        );

        console.log('📦 getOrderItems result:', orderItems.documents.length, 'items');
        return orderItems.documents;
    } catch (e) {
        console.error('❌ getOrderItems error:', e);
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
 * Update order status only - handles Appwrite relationship validation issues
 * droneId is a "Many to one" relationship in orders collection
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
    try {
        console.log('📝 Updating order status:', orderId, '→', status);
        
        // Validate status is in allowed enum
        const allowedStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];
        if (!allowedStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}. Must be one of: ${allowedStatuses.join(', ')}`);
        }
        
        // First get the order to check relationship format
        const currentOrder = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            orderId
        );
        
        // Debug: log the droneId structure
        console.log('📋 Order droneId raw:', JSON.stringify(currentOrder.droneId));
        
        // Build update payload
        const updatePayload: Record<string, any> = {
            status: status
        };
        
        // Handle droneId relationship properly
        // If droneId exists, we need to include it in correct format
        if (currentOrder.droneId) {
            let droneIdValue: string | null = null;
            
            if (typeof currentOrder.droneId === 'string') {
                // Already a string ID
                droneIdValue = currentOrder.droneId;
            } else if (typeof currentOrder.droneId === 'object') {
                if (Array.isArray(currentOrder.droneId)) {
                    // It's an array - take first element's $id
                    if (currentOrder.droneId.length > 0) {
                        const first = currentOrder.droneId[0];
                        droneIdValue = typeof first === 'string' ? first : first?.$id;
                    }
                } else if (currentOrder.droneId.$id) {
                    // It's a document object
                    droneIdValue = currentOrder.droneId.$id;
                }
            }
            
            console.log('📋 Extracted droneId:', droneIdValue);
            
            // For "Many to one" relationship, pass the ID directly (not array)
            if (droneIdValue) {
                updatePayload.droneId = droneIdValue;
            }
        }
        
        console.log('📝 Update payload:', JSON.stringify(updatePayload));
        
        const updatedOrder = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            orderId,
            updatePayload
        );

        console.log('✅ Order status updated successfully to:', status);
        return updatedOrder;
    } catch (e: any) {
        console.error('❌ Failed to update order status:', e.message || e);
        throw new Error(e.message || String(e));
    }
}

const parseDroneEventPayload = (payload: any): DroneEvent => {
    let parsedPayload;
    if (typeof payload?.payload === 'string') {
        try {
            parsedPayload = JSON.parse(payload.payload);
        } catch (err) {
            parsedPayload = payload.payload;
        }
    }

    return {
        ...payload,
        payload: parsedPayload,
        timestamp: payload?.timestamp || payload?.$createdAt || new Date().toISOString(),
    } as DroneEvent;
};

export const subscribeToOrder = (orderId: string, callback: (order: Order) => void) => {
    const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.ordersCollectionId}.documents.${orderId}`;

    let unsubscribe: (() => void) | null = null;
    let isSubscribed = false;

    try {
        console.log('🔔 Subscribing to order updates:', orderId);
        unsubscribe = client.subscribe(channel, event => {
            try {
                if (!isSubscribed) {
                    console.log('✅ Order subscription established');
                    isSubscribed = true;
                }
                if (!event?.payload) {
                    console.warn('⚠️ Received empty payload from order subscription');
                    return;
                }
                callback(event.payload as unknown as Order);
            } catch (error) {
                console.error('❌ Error in subscribeToOrder callback:', error);
            }
        });
        
        // Log connection status
        console.log('📡 Order subscription channel active:', channel);
    } catch (error) {
        console.error('❌ Error subscribing to order:', error);
        console.error('Channel attempted:', channel);
        console.error('Error details:', error);
        
        // Return a no-op unsubscribe function to avoid errors
        return () => {
            console.warn('⚠️ No active subscription to unsubscribe from');
        };
    }

    return () => {
        try {
            if (unsubscribe) {
                console.log('🔕 Unsubscribing from order updates');
                isSubscribed = false; // Mark as unsubscribed BEFORE calling unsubscribe
                unsubscribe();
                unsubscribe = null; // Clear reference
            }
        } catch (error) {
            // Suppress INVALID_STATE_ERR when already closed
            if (error instanceof Error && error.message.includes('INVALID_STATE')) {
                console.warn('⚠️ Subscription already closed (expected during cleanup)');
            } else {
                console.error('❌ Error unsubscribing from order:', error);
            }
        }
    };
};

export const subscribeToDroneEvents = (orderId: string, callback: (event: DroneEvent) => void) => {
    const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.droneEventsCollectionId}.documents`;

    let unsubscribe: (() => void) | null = null;
    let isSubscribed = false;

    try {
        console.log('🔔 Subscribing to drone events for order:', orderId);
        unsubscribe = client.subscribe(channel, event => {
            try {
                if (!isSubscribed) {
                    console.log('✅ Drone events subscription established');
                    isSubscribed = true;
                }
                
                const payload = event?.payload as any;
                if (!payload) {
                    console.warn('⚠️ Received empty payload from drone subscription');
                    return;
                }

                if (orderId && payload.orderId !== orderId) {
                    // Silently ignore events for other orders
                    return;
                }

                console.log('🚁 Drone event received:', payload.eventType);
                callback(parseDroneEventPayload(payload));
            } catch (error) {
                console.error('❌ Error in subscribeToDroneEvents callback:', error);
            }
        });
        
        console.log('📡 Drone events subscription channel active:', channel);
    } catch (error) {
        console.error('❌ Error subscribing to drone events:', error);
        console.error('Channel attempted:', channel);
        console.error('Error details:', error);
        
        // Return a no-op unsubscribe function
        return () => {
            console.warn('⚠️ No active drone subscription to unsubscribe from');
        };
    }

    return () => {
        try {
            if (unsubscribe) {
                console.log('🔕 Unsubscribing from drone events');
                isSubscribed = false; // Mark as unsubscribed BEFORE calling unsubscribe
                unsubscribe();
                unsubscribe = null; // Clear reference
            }
        } catch (error) {
            // Suppress INVALID_STATE_ERR when already closed
            if (error instanceof Error && error.message.includes('INVALID_STATE')) {
                console.warn('⚠️ Drone subscription already closed (expected during cleanup)');
            } else {
                console.error('❌ Error unsubscribing from drone events:', error);
            }
        }
    };
};

// Subscribe to drone position updates (realtime)
export const subscribeToDronePosition = (droneId: string, callback: (position: { latitude: number; longitude: number; batteryLevel?: number }) => void) => {
    const channel = `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.dronesCollectionId}.documents.${droneId}`;

    let unsubscribe: (() => void) | null = null;
    let isSubscribed = false;

    try {
        console.log('🔔 Subscribing to drone position for drone:', droneId);
        unsubscribe = client.subscribe(channel, event => {
            try {
                if (!isSubscribed) {
                    console.log('✅ Drone position subscription established');
                    isSubscribed = true;
                }
                
                const payload = event?.payload as any;
                if (!payload) {
                    console.warn('⚠️ Received empty payload from drone position subscription');
                    return;
                }

                // Check if position changed
                if (typeof payload.currentLatitude === 'number' && typeof payload.currentLongitude === 'number') {
                    console.log('📍 Drone position update:', payload.currentLatitude.toFixed(6), payload.currentLongitude.toFixed(6));
                    callback({
                        latitude: payload.currentLatitude,
                        longitude: payload.currentLongitude,
                        batteryLevel: payload.batteryLevel,
                    });
                }
            } catch (error) {
                console.error('❌ Error in subscribeToDronePosition callback:', error);
            }
        });
        
        console.log('📡 Drone position subscription channel active:', channel);
    } catch (error) {
        console.error('❌ Error subscribing to drone position:', error);
        return () => {};
    }

    return () => {
        try {
            if (unsubscribe) {
                console.log('🔕 Unsubscribing from drone position');
                isSubscribed = false;
                unsubscribe();
                unsubscribe = null;
            }
        } catch (error) {
            if (error instanceof Error && error.message.includes('INVALID_STATE')) {
                console.warn('⚠️ Drone position subscription already closed');
            } else {
                console.error('❌ Error unsubscribing from drone position:', error);
            }
        }
    };
};

export const getDroneLocation = async (droneId: string) => {
    try {
        const droneDoc = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.dronesCollectionId,
            droneId
        );

        const drone = droneDoc as unknown as Drone;

        if (typeof drone.currentLatitude === 'number' && typeof drone.currentLongitude === 'number') {
            return {
                latitude: drone.currentLatitude,
                longitude: drone.currentLongitude,
                batteryLevel: drone.batteryLevel,
            };
        }

        const latestEvent = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.droneEventsCollectionId,
            [
                Query.equal('droneId', droneId),
                Query.orderDesc('$createdAt'),
                Query.limit(1)
            ]
        );

        if (latestEvent.documents.length > 0) {
            const event = latestEvent.documents[0];
            return {
                latitude: event.latitude,
                longitude: event.longitude,
                batteryLevel: event.batteryLevel,
            };
        }

        return null;
    } catch (error) {
        console.error('Failed to fetch drone location', error);
        return null;
    }
};

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
        // Start with basic query - only get documents that exist
        const queries: string[] = [];

        // Apply filters only if they exist
        if (filters?.cuisine) {
            queries.push(Query.equal('cuisine', filters.cuisine));
        }

        if (filters?.rating && filters.rating > 0) {
            queries.push(Query.greaterThanEqual('rating', filters.rating));
        }

        if (filters?.search) {
            queries.push(Query.search('name', filters.search));
        }

        // Apply sorting
        if (!filters?.sortBy || filters.sortBy === 'rating') {
            queries.push(Query.orderDesc('rating'));
        } else if (filters.sortBy === 'name') {
            queries.push(Query.orderAsc('name'));
        } else if (filters.sortBy === 'newest') {
            queries.push(Query.orderDesc('$createdAt'));
        }
        // Note: distance sorting is handled after distance calculation

        const restaurants = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.restaurantsCollectionId,
            queries
        );

        // Enhance restaurants with distance and open status
        const enhancedRestaurants = restaurants.documents.map((restaurant: any) => {
            let distance: number | undefined;
            if (userLat && userLng && restaurant.latitude && restaurant.longitude) {
                distance = calculateDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
            } else {
                // Log missing coordinates for debugging
                if (!restaurant.latitude || !restaurant.longitude) {
                    console.warn(`⚠️ Restaurant "${restaurant.name}" missing coordinates`);
                }
            }

            // Default values for missing fields based on actual database structure
            const enhancedRestaurant = {
                ...restaurant,
                distance,
                isOpen: true, // Default to open
                estimatedTime: restaurant.estimatedDeliveryTime || 30,
                status: restaurant.status || 'active', // Default to active if null
                isActive: restaurant.isActive !== false, // Default to true if null
                rating: restaurant.rating || 0, // Use 0 if no rating yet
                totalOrders: restaurant.totalOrders || 0, // ✅ Use real order count from database, 0 if none
                cuisine: restaurant.cuisine || 'Vietnamese', // Default cuisine
                // Add missing fields for better display
                deliveryFee: 0, // Free delivery
                minimumOrder: 50000, // 50k VND minimum
                estimatedDeliveryTime: 30
            };

            return enhancedRestaurant;
        });

        // Filter by distance if specified
        let filteredRestaurants = enhancedRestaurants;
        if (filters?.distance && userLat && userLng) {
            filteredRestaurants = enhancedRestaurants.filter(r => r.distance && r.distance <= filters.distance!);
        }

        // Sort by distance if requested (after distance calculation)
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
            restaurantId,
            [
                Query.select(['*', 'reviews.*', 'reviews.user.*'])
            ]
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
        const queries: string[] = [
            Query.equal('restaurantId', restaurantId),
            Query.equal('isAvailable', true) // Only show available items
        ];

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
 * Get available cuisines from all restaurants
 */
export const getAvailableCuisines = async (): Promise<string[]> => {
    try {
        const restaurants = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.restaurantsCollectionId
        );

        const cuisines = new Set<string>();
        restaurants.documents.forEach((restaurant: any) => {
            if (restaurant.cuisine) {
                cuisines.add(restaurant.cuisine);
            }
        });

        const availableCuisines = Array.from(cuisines).sort();
        
        // Return default cuisines if none found
        return availableCuisines.length > 0 ? availableCuisines : [
            'Vietnamese', 'Korean', 'Japanese', 'Thai', 'Chinese', 'Western', 'Fast Food'
        ];
    } catch (e) {
        console.error('Error fetching cuisines:', e);
        // Return default cuisines on error
        return ['Vietnamese', 'Korean', 'Japanese', 'Thai', 'Chinese', 'Western', 'Fast Food'];
    }
}

// ===================== PAYMENT FUNCTIONS =====================

/**
 * Generate VNPay payment URL (mock implementation)
 * In production, this should call an Appwrite Function or backend service
 */
export const generateVNPayUrl = async (params: VNPayPaymentRequest): Promise<string> => {
    const {
        orderId,
        amount,
        returnUrl = 'foodfast://payment-result',
        ipAddr = '127.0.0.1',
        orderInfo = `Payment for order ${orderId}`
    } = params;

    // VNPay parameters
    const vnpParams = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: 'DEMO', // Replace with actual TMN Code
        vnp_Amount: (amount * 100).toString(), // VNPay expects amount in đồng * 100
        vnp_CurrCode: 'VND',
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: 'other',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
    };

    // Sort parameters
    const sortedParams = Object.keys(vnpParams)
        .sort()
        .map(key => `${key}=${encodeURIComponent(vnpParams[key as keyof typeof vnpParams])}`)
        .join('&');

    // For demo purposes, return a mock URL
    // In production, you would hash this with your secret key and return real VNPay URL
    const baseUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    return `${baseUrl}?${sortedParams}`;
};

/**
 * Create VNPay payment intent
 */
export const createVNPayPayment = async (params: VNPayPaymentRequest & { userId?: string }): Promise<VNPayPaymentResponse> => {
    try {
        // Generate payment URL
        const paymentUrl = await generateVNPayUrl(params);
        
        // Generate unique secret for this payment
        const secret = ID.unique();

        // Create payment document in database
        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.paymentsCollectionId,
            ID.unique(),
            {
                orderId: params.orderId,
                userId: params.userId || 'anonymous', // Required field for database
                secret,
                provider: 'vnpay',
                status: 'pending',
                amount: params.amount,
                currency: 'VND',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );

        return {
            paymentUrl,
            secret
        };
    } catch (e) {
        console.error('Error creating VNPay payment:', e);
        throw new Error(e as string);
    }
};

/**
 * Process VNPay callback and update payment status
 */
export const processVNPayCallback = async (callbackParams: VNPayCallbackParams): Promise<PaymentResult> => {
    try {
        const {
            vnp_ResponseCode,
            vnp_TransactionStatus,
            vnp_TxnRef,
            vnp_Amount,
            vnp_TransactionNo,
            vnp_BankTranNo
        } = callbackParams;

        const orderId = vnp_TxnRef;
        const amount = parseInt(vnp_Amount) / 100; // Convert back from VNPay format
        const success = vnp_ResponseCode === '00' && vnp_TransactionStatus === '00';

        // Update payment status in database
        const payments = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.paymentsCollectionId,
            [Query.equal('secret', orderId)] // Using orderId as secret for simplicity
        );

        if (payments.documents.length > 0) {
            const payment = payments.documents[0];
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.paymentsCollectionId,
                payment.$id,
                {
                    status: success ? 'completed' : 'failed',
                    resultCode: vnp_ResponseCode,
                    transactionRef: vnp_TransactionNo,
                    mvrResponse: JSON.stringify(callbackParams),
                    updatedAt: new Date().toISOString()
                }
            );
        }

        // Update order payment status
        if (success) {
            await updateOrderPaymentStatus(orderId, 'paid');
        }

        return {
            success,
            method: 'vnpay',
            orderId,
            transactionRef: vnp_TransactionNo,
            amount,
            message: success 
                ? 'Payment completed successfully' 
                : `Payment failed: ${getVNPayErrorMessage(vnp_ResponseCode)}`
        };
    } catch (e) {
        console.error('Error processing VNPay callback:', e);
        throw new Error(e as string);
    }
};

/**
 * Update order payment status
 */
export const updateOrderPaymentStatus = async (orderId: string, paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded') => {
    try {
        const orders = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            [Query.equal('$id', orderId)]
        );

        if (orders.documents.length > 0) {
            const order = orders.documents[0];
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.ordersCollectionId,
                order.$id,
                {
                    paymentStatus,
                    updatedAt: new Date().toISOString()
                }
            );
        }
    } catch (e) {
        console.error('Error updating order payment status:', e);
        throw new Error(e as string);
    }
};

/**
 * Create COD payment (cash on delivery)
 */
export const createCODPayment = async (orderId: string, amount: number): Promise<PaymentResult> => {
    try {
        const secret = ID.unique();

        // Create payment document
        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.paymentsCollectionId,
            ID.unique(),
            {
                secret,
                provider: 'cod',
                status: 'pending',
                amount,
                currency: 'VND',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        );

        // Update order with COD payment method
        await updateOrderPaymentStatus(orderId, 'pending');

        return {
            success: true,
            method: 'cod',
            orderId,
            amount,
            message: 'Cash on Delivery order created successfully'
        };
    } catch (e) {
        console.error('Error creating COD payment:', e);
        throw new Error(e as string);
    }
};

/**
 * Get VNPay error message from response code
 */
export const getVNPayErrorMessage = (responseCode: string): string => {
    const errorMessages: Record<string, string> = {
        '01': 'Transaction is pending',
        '02': 'Transaction failed',
        '04': 'Transaction was reversed',
        '05': 'Transaction processing failed',
        '06': 'Transaction was cancelled',
        '07': 'Money was deducted but transaction failed',
        '09': 'Card/Account not registered for internet banking',
        '10': 'Customer authenticated incorrectly more than 3 times',
        '11': 'Payment timed out',
        '12': 'Card/Account locked',
        '13': 'Invalid OTP',
        '24': 'Transaction cancelled',
        '51': 'Insufficient account balance',
        '65': 'Exceeded daily transaction limit',
        '75': 'Payment bank under maintenance',
        '79': 'Incorrect payment password more than allowed times',
        '99': 'Other error'
    };

    return errorMessages[responseCode] || 'Unknown error occurred';
};

/**
 * Get payment methods available
 */
export const getPaymentMethods = (): PaymentMethod[] => {
    return [
        {
            id: 'vnpay',
            name: 'VNPay',
            description: 'Pay with bank card or e-wallet',
            icon: '💳',
            enabled: true
        },
        {
            id: 'cod',
            name: 'Cash on Delivery',
            description: 'Pay when your order arrives',
            icon: '💰',
            enabled: true
        }
    ];
};
