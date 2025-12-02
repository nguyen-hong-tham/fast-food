/**
 * API Helper Functions for FoodFast
 * 
 * This file contains helper functions to interact with new collections:
 * - Restaurants
 * - Order Items
 * - Payments
 * - Reviews
 * - Notifications
 * - Drones
 * - Promotions
 */

import { ID, Query } from 'react-native-appwrite';
import { databases, appwriteConfig } from './appwrite';
import type {
    Restaurant,
    OrderItemDocument,
    Payment,
    Review,
    Notification,
    Drone,
    DroneEvent,
    Promotion,
    UserVoucher,
} from '../type';

const { databaseId } = appwriteConfig;

// ===================== RESTAURANTS =====================

export const getRestaurants = async (filters?: {
    status?: string;
    cuisine?: string;
    search?: string;
}): Promise<Restaurant[]> => {
    const queries: string[] = [];
    
    if (filters?.status) {
        queries.push(Query.equal('status', filters.status));
    }
    if (filters?.cuisine) {
        queries.push(Query.equal('cuisine', filters.cuisine));
    }
    if (filters?.search) {
        queries.push(Query.search('name', filters.search));
    }
    
    queries.push(Query.orderDesc('rating'));
    
    const response = await databases.listDocuments(
        databaseId,
        appwriteConfig.restaurantsCollectionId,
        queries
    );
    
    return response.documents as unknown as Restaurant[];
};

export const getRestaurantById = async (restaurantId: string): Promise<Restaurant> => {
    const response = await databases.getDocument(
        databaseId,
        appwriteConfig.restaurantsCollectionId,
        restaurantId
    );
    
    return response as unknown as Restaurant;
};

export const getRestaurantMenuItems = async (restaurantId: string) => {
    const response = await databases.listDocuments(
        databaseId,
        appwriteConfig.menuCollectionId,
        [
            Query.equal('restaurantId', restaurantId),
            Query.equal('isAvailable', true),
            Query.orderDesc('$createdAt')
        ]
    );
    
    return response.documents;
};

// ===================== ORDER ITEMS =====================

export const createOrderItems = async (orderId: string, items: Array<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    customizations?: any;
}>): Promise<OrderItemDocument[]> => {
    const orderItems = await Promise.all(
        items.map(item =>
            databases.createDocument(
                databaseId,
                appwriteConfig.orderItemsCollectionId,
                ID.unique(),
                {
                    orderId,
                    menuItemId: item.menuItemId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    customizations: item.customizations || {},
                    subtotal: item.price * item.quantity,
                }
            )
        )
    );
    
    return orderItems as unknown as OrderItemDocument[];
};

export const getOrderItems = async (orderId: string): Promise<OrderItemDocument[]> => {
    const response = await databases.listDocuments(
        databaseId,
        appwriteConfig.orderItemsCollectionId,
        [Query.equal('orderId', orderId)]
    );
    
    return response.documents as unknown as OrderItemDocument[];
};

// ===================== PAYMENTS =====================

export const createPayment = async (paymentData: {
    orderId: string;
    userId: string;
    provider: 'cod' | 'vnpay';
    amount: number;
}): Promise<Payment> => {
    const payment = await databases.createDocument(
        databaseId,
        appwriteConfig.paymentsCollectionId,
        ID.unique(),
        {
            ...paymentData,
            status: 'pending',
            createdAt: new Date().toISOString(),
        }
    );
    
    return payment as unknown as Payment;
};

export const updatePaymentStatus = async (
    paymentId: string,
    status: 'pending' | 'completed' | 'failed' | 'refunded',
    transactionId?: string
): Promise<Payment> => {
    const updates: any = {
        status,
        updatedAt: new Date().toISOString(),
    };
    
    if (transactionId) {
        updates.transactionId = transactionId;
    }
    
    const payment = await databases.updateDocument(
        databaseId,
        appwriteConfig.paymentsCollectionId,
        paymentId,
        updates
    );
    
    return payment as unknown as Payment;
};

export const getPaymentByOrderId = async (orderId: string): Promise<Payment | null> => {
    const response = await databases.listDocuments(
        databaseId,
        appwriteConfig.paymentsCollectionId,
        [Query.equal('orderId', orderId), Query.limit(1)]
    );
    
    return response.documents.length > 0 ? response.documents[0] as unknown as Payment : null;
};

// ===================== REVIEWS =====================
// Reviews collection doesn't exist in current database - all review functions disabled

export const createReview = async (reviewData: {
    userId: string;
    restaurantId: string;
    orderId: string;
    overallRating: number;
    foodQuality?: number;
    deliverySpeed?: number;
    service?: number;
    comment?: string;
}): Promise<Review> => {
    const review = await databases.createDocument(
        databaseId,
        appwriteConfig.reviewsCollectionId,
        ID.unique(),
        {
            ...reviewData,
            isVisible: true,
            createdAt: new Date().toISOString(),
        }
    );
    
    // Update restaurant rating after creating review
    await updateRestaurantRating(reviewData.restaurantId);
    
    return review as unknown as Review;
};

export const getRestaurantReviews = async (restaurantId: string): Promise<Review[]> => {
    const response = await databases.listDocuments(
        databaseId,
        appwriteConfig.reviewsCollectionId,
        [
            Query.equal('restaurantId', restaurantId),
            Query.equal('isVisible', true),
            Query.orderDesc('$createdAt'),
            Query.limit(50)
        ]
    );
    
    return response.documents as unknown as Review[];
};

export const updateRestaurantRating = async (restaurantId: string): Promise<void> => {
    try {
        // Get all reviews for restaurant
        const reviews = await getRestaurantReviews(restaurantId);
        
        if (reviews.length === 0) return;
        
        // Calculate average rating
        const avgRating = reviews.reduce((sum, review) => sum + (review.overallRating || 0), 0) / reviews.length;
        
        // Update restaurant
        await databases.updateDocument(
            databaseId,
            appwriteConfig.restaurantsCollectionId,
            restaurantId,
            {
                rating: Math.round(avgRating), // Round to integer (1-5)
            }
        );
        
        console.log(`⭐ Updated restaurant ${restaurantId} rating to ${Math.round(avgRating * 10) / 10}`);
    } catch (error) {
        console.error('Error updating restaurant rating:', error);
    }
};

// ===================== NOTIFICATIONS =====================

export const createNotification = async (notificationData: {
    userId: string;
    type: 'order_update' | 'promotion' | 'system' | 'review_request';
    title: string;
    body: string;
    data?: any;
    channel?: 'push' | 'email' | 'in_app';
    imageUrl?: string;
    actionUrl?: string;
}): Promise<Notification> => {
    const notification = await databases.createDocument(
        databaseId,
        appwriteConfig.notificationsCollectionId,
        ID.unique(),
        {
            userId: notificationData.userId,
            type: notificationData.type,
            title: notificationData.title,
            body: notificationData.body,
            data: notificationData.data ? JSON.stringify(notificationData.data) : undefined,
            channel: notificationData.channel || 'push',
            status: 'sent',
            sentAt: new Date().toISOString(),
            imageUrl: notificationData.imageUrl,
            actionUrl: notificationData.actionUrl,
        }
    );
    
    return notification as unknown as Notification;
};

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
    const response = await databases.listDocuments(
        databaseId,
        appwriteConfig.notificationsCollectionId,
        [
            Query.equal('userId', userId),
            Query.orderDesc('sentAt'),
            Query.limit(50)
        ]
    );
    
    return response.documents as unknown as Notification[];
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    await databases.updateDocument(
        databaseId,
        appwriteConfig.notificationsCollectionId,
        notificationId,
        {
            status: 'read',
            readAt: new Date().toISOString(),
        }
    );
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
    const notifications = await getUserNotifications(userId);
    const unreadNotifications = notifications.filter(n => n.status !== 'read');
    
    await Promise.all(
        unreadNotifications.map(n => markNotificationAsRead(n.$id))
    );
};

// Helper: Send notification via Appwrite Function
export const sendPushNotification = async (data: {
    userId: string;
    title: string;
    body: string;
    type?: 'order_update' | 'promotion' | 'system' | 'review_request';
    orderId?: string;
    screen?: string;
}): Promise<boolean> => {
    try {
        // Save to database first
        await createNotification({
            userId: data.userId,
            type: data.type || 'order_update',
            title: data.title,
            body: data.body,
            data: {
                orderId: data.orderId,
                screen: data.screen,
                type: data.type,
            },
            channel: 'push',
        });

        // TODO: Call Appwrite Function to send push notification
        // For now, notifications are stored in DB and app will show them
        // When Appwrite Function is deployed, uncomment below:
        
        /*
        const response = await fetch(`${appwriteConfig.endpoint}/functions/send-notification/executions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Appwrite-Project': appwriteConfig.projectId,
            },
            body: JSON.stringify({
                userId: data.userId,
                title: data.title,
                body: data.body,
                data: {
                    orderId: data.orderId,
                    screen: data.screen,
                    type: data.type,
                },
            }),
        });
        
        return response.ok;
        */
        
        return true;
    } catch (error) {
        console.error('Failed to send push notification:', error);
        return false;
    }
};

// ===================== DRONES =====================

export const createDrone = async (data: {
    name: string;
    model?: string;
}): Promise<Drone> => {
    // Generate unique code for drone
    const droneCode = `DR-${Date.now().toString().slice(-6)}`;
    
    const droneData = {
        code: droneCode, // Required attribute in Appwrite schema
        name: data.name,
        model: data.model || 'DJI Phantom 4',
        status: 'available', // Match enum value in Appwrite (available, busy, maintenance, offline)
        isActive: true,
        batteryLevel: 100,
        currentLatitude: 10.762622, // Default HCM location
        currentLongitude: 106.660172,
        maxSpeed: 50,
        maxPayload: 5,
        currentPayload: 0,
        maxRange: 10,
        totalFlights: 0,
        totalDistance: 0,
    };

    const response = await databases.createDocument(
        databaseId,
        appwriteConfig.dronesCollectionId,
        ID.unique(),
        droneData
    );

    return response as unknown as Drone;
};

export const getAvailableDrone = async (): Promise<Drone | null> => {
    const response = await databases.listDocuments(
        databaseId,
        appwriteConfig.dronesCollectionId,
        [
            Query.equal('status', 'available'), // Match enum in Appwrite
            Query.equal('isActive', true),
            Query.greaterThan('batteryLevel', 30),
            Query.limit(1)
        ]
    );
    
    // ❌ REMOVED: Auto-create drone logic
    // Admin should manually add drones via Admin Panel
    if (response.documents.length === 0) {
        console.log('⚠️ No drones available for delivery');
        return null;
    }
    
    return response.documents[0] as unknown as Drone;
};

export const getDroneById = async (droneId: string): Promise<Drone> => {
    const response = await databases.getDocument(
        databaseId,
        appwriteConfig.dronesCollectionId,
        droneId
    );
    
    const drone = response as unknown as Drone;
    
    // If droneHub is a string (relationship ID), try to fetch the full hub data
    // But don't fail if hub doesn't exist - just use homeLatitude/homeLongitude instead
    if (drone.droneHub && typeof drone.droneHub === 'string') {
        try {
            const hubData = await databases.getDocument(
                databaseId,
                appwriteConfig.droneHubsCollectionId,
                drone.droneHub as string
            );
            drone.droneHub = hubData as any;
            console.log('🏠 Fetched drone hub:', hubData.name, hubData.latitude, hubData.longitude);
        } catch (error) {
            // Hub not found - this is OK, we'll use homeLatitude/homeLongitude
            console.log('ℹ️ Drone hub not found, using home position instead');
            drone.droneHub = undefined; // Clear invalid hub reference
        }
    }
    
    // Log drone info for debugging
    console.log('🚁 Drone info:', {
        id: drone.$id,
        name: drone.name,
        currentLat: drone.currentLatitude,
        currentLng: drone.currentLongitude,
        homeLat: drone.homeLatitude,
        homeLng: drone.homeLongitude,
        droneHub: typeof drone.droneHub === 'object' ? drone.droneHub?.name : drone.droneHub
    });
    
    return drone;
};

export const updateDrone = async (droneId: string, data: Partial<Drone>): Promise<Drone> => {
    const updated = await databases.updateDocument(
        databaseId,
        appwriteConfig.dronesCollectionId,
        droneId,
        data
    );
    return updated as unknown as Drone;
};

export const assignDroneToOrder = async (droneId: string, orderId: string): Promise<Drone> => {
    const updated = await databases.updateDocument(
        databaseId,
        appwriteConfig.dronesCollectionId,
        droneId,
        {
            status: 'busy', // Match enum in Appwrite (available, busy, maintenance, offline)
            assignedOrderId: orderId,
        }
    );
    
    await databases.createDocument(
        databaseId,
        appwriteConfig.droneEventsCollectionId,
        ID.unique(),
        {
            droneId,
            orderId,
            eventType: 'takeoff',
            batteryLevel: updated.batteryLevel,
        }
    );

    return updated as unknown as Drone;
};

export const logDroneEvent = async (event: {
    droneId: string;
    orderId?: string;
    eventType: DroneEvent['eventType'];
    latitude?: number;
    longitude?: number;
    altitude?: number;
    speed?: number;
    batteryLevel?: number;
    description?: string;
    payload?: Record<string, any> | null;
}): Promise<DroneEvent> => {
    const payloadString = event.payload ? JSON.stringify(event.payload) : undefined;

    const response = await databases.createDocument(
        databaseId,
        appwriteConfig.droneEventsCollectionId,
        ID.unique(),
        {
            ...event,
            payload: payloadString,
        }
    );

    return response as unknown as DroneEvent;
};

export const listDroneEvents = async (droneId: string, limit: number = 50): Promise<DroneEvent[]> => {
    const response = await databases.listDocuments(
        databaseId,
        appwriteConfig.droneEventsCollectionId,
        [
            Query.equal('droneId', droneId),
            Query.orderDesc('$createdAt'),
            Query.limit(limit)
        ]
    );

    return response.documents as unknown as DroneEvent[];
};

export const updateDroneLocation = async (
    droneId: string,
    latitude: number,
    longitude: number,
    options: {
        altitude?: number;
        speed?: number;
        batteryLevel?: number;
        orderId?: string;
    } = {}
): Promise<void> => {
    // Update drone position
    await databases.updateDocument(
        databaseId,
        appwriteConfig.dronesCollectionId,
        droneId,
        {
            currentLatitude: latitude,
            currentLongitude: longitude,
            batteryLevel: options.batteryLevel ?? undefined,
        }
    );
    
    // Create position update event for real-time tracking
    if (appwriteConfig.droneEventsCollectionId) {
        try {
            await databases.createDocument(
                databaseId,
                appwriteConfig.droneEventsCollectionId,
                ID.unique(),
                {
                    droneId,
                    orderId: options.orderId || null,
                    eventType: 'position_update',
                    latitude,
                    longitude,
                    altitude: options.altitude || null,
                    speed: options.speed || null,
                    batteryLevel: options.batteryLevel || null,
                }
            );
        } catch (error) {
            // Silently fail if position_update is not in enum
            console.log('Note: position_update event type may not be in schema');
        }
    }
};

export const completeDroneDelivery = async (droneId: string): Promise<void> => {
    try {
        console.log('🎯 Completing drone delivery for drone:', droneId);
        
        const drone = await databases.getDocument(
            databaseId,
            appwriteConfig.dronesCollectionId,
            droneId
        ) as unknown as Drone;
        
        console.log('📦 Current drone status:', drone.status);
        console.log('📦 Total flights before:', drone.totalFlights);
        
        // Update drone status back to available
        await databases.updateDocument(
            databaseId,
            appwriteConfig.dronesCollectionId,
            droneId,
            {
                status: 'available',
                assignedOrderId: null,
                totalFlights: (drone.totalFlights || 0) + 1,
            }
        );
        
        console.log('✅ Drone updated to available, total flights:', (drone.totalFlights || 0) + 1);
        
        // Create landing event if collection exists
        if (appwriteConfig.droneEventsCollectionId) {
            try {
                await databases.createDocument(
                    databaseId,
                    appwriteConfig.droneEventsCollectionId,
                    ID.unique(),
                    {
                        droneId,
                        orderId: drone.assignedOrderId,
                        eventType: 'landing',
                    }
                );
                console.log('📝 Landing event created');
            } catch (eventError) {
                console.warn('⚠️ Failed to create landing event (non-critical):', eventError);
            }
        }
    } catch (error) {
        console.error('❌ Error completing drone delivery:', error);
        throw error;
    }
};

// ===================== PROMOTIONS =====================

export const validatePromoCode = async (
    code: string,
    userId: string,
    orderTotal: number
): Promise<{ valid: boolean; promotion?: Promotion; discount?: number; error?: string }> => {
    try {
        // Get promotion by code
        const response = await databases.listDocuments(
            databaseId,
            appwriteConfig.promotionsCollectionId,
            [
                Query.equal('code', code),
                Query.equal('isActive', true),
                Query.limit(1)
            ]
        );
        
        if (response.documents.length === 0) {
            return { valid: false, error: 'Invalid promo code' };
        }
        
        const promotion = response.documents[0] as unknown as Promotion;
        
        // Check if expired
        if (new Date(promotion.endDate) < new Date()) {
            return { valid: false, error: 'Promo code expired' };
        }
        
        // Check if not started yet
        if (new Date(promotion.startDate) > new Date()) {
            return { valid: false, error: 'Promo code not yet active' };
        }
        
        // Check usage limit
        if (promotion.currentUsage >= promotion.maxUsage) {
            return { valid: false, error: 'Promo code usage limit reached' };
        }
        
        // Check minimum order value
        if (promotion.minOrderValue && orderTotal < promotion.minOrderValue) {
            return { 
                valid: false, 
                error: `Minimum order value is ${promotion.minOrderValue.toLocaleString()} VND` 
            };
        }
        
        // Calculate discount
        let discount = 0;
        if (promotion.type === 'percentage') {
            discount = orderTotal * (promotion.discountValue / 100);
            if (promotion.maxDiscountAmount && discount > promotion.maxDiscountAmount) {
                discount = promotion.maxDiscountAmount;
            }
        } else {
            discount = promotion.discountValue;
        }
        
        return { valid: true, promotion, discount };
        
    } catch (error) {
        console.error('Error validating promo code:', error);
        return { valid: false, error: 'Failed to validate promo code' };
    }
};

export const applyPromoCode = async (
    promotionId: string,
    userId: string,
    orderId: string
): Promise<void> => {
    // Create user voucher
    await databases.createDocument(
        databaseId,
        appwriteConfig.userVouchersCollectionId,
        ID.unique(),
        {
            userId,
            promotionId,
            status: 'used',
            usedAt: new Date().toISOString(),
            orderId,
            createdAt: new Date().toISOString(),
        }
    );
    
    // Increment promotion usage
    const promotion = await databases.getDocument(
        databaseId,
        appwriteConfig.promotionsCollectionId,
        promotionId
    ) as unknown as Promotion;
    
    await databases.updateDocument(
        databaseId,
        appwriteConfig.promotionsCollectionId,
        promotionId,
        {
            currentUsage: promotion.currentUsage + 1,
        }
    );
};

// ===================== ORDERS (Enhanced) =====================

export const createOrderWithDetails = async (orderData: {
    userId: string;
    restaurantId: string;
    items: Array<{
        menuItemId: string;
        name: string;
        price: number;
        quantity: number;
        customizations?: any;
    }>;
    total: number;
    deliveryAddress: string;
    phone: string;
    paymentMethod: 'cod' | 'vnpay';
    promoCode?: string;
}): Promise<{ order: any; payment: Payment; orderItems: OrderItemDocument[] }> => {
    try {
        // 1. Create order
        const order = await databases.createDocument(
            databaseId,
            appwriteConfig.ordersCollectionId,
            ID.unique(),
            {
                userId: orderData.userId,
                restaurantId: orderData.restaurantId,
                items: JSON.stringify(orderData.items), // Legacy format
                total: orderData.total,
                status: 'pending',
                paymentStatus: 'pending',
                paymentMethod: orderData.paymentMethod,
                deliveryAddress: orderData.deliveryAddress,
                phone: orderData.phone,
                createdAt: new Date().toISOString(),
            }
        );
        
        // 2. Create order items
        const orderItems = await createOrderItems(order.$id, orderData.items);
        
        // 3. Create payment
        const payment = await createPayment({
            orderId: order.$id,
            userId: orderData.userId,
            provider: orderData.paymentMethod,
            amount: orderData.total,
        });
        
        // 4. Apply promo code if provided
        if (orderData.promoCode) {
            const validation = await validatePromoCode(
                orderData.promoCode,
                orderData.userId,
                orderData.total
            );
            
            if (validation.valid && validation.promotion) {
                await applyPromoCode(validation.promotion.$id, orderData.userId, order.$id);
            }
        }
        
        // 5. Send notification
        await createNotification({
            userId: orderData.userId,
            type: 'order_update',
            title: 'Order Placed',
            body: `Your order #${order.$id.substring(0, 8)} has been placed successfully!`,
            data: { orderId: order.$id },
        });
        
        return { order, payment, orderItems };
        
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

export default {
    // Restaurants
    getRestaurants,
    getRestaurantById,
    getRestaurantMenuItems,
    
    // Order Items
    createOrderItems,
    getOrderItems,
    
    // Payments
    createPayment,
    updatePaymentStatus,
    getPaymentByOrderId,
    
    // Reviews
    createReview,
    getRestaurantReviews,
    updateRestaurantRating,
    
    // Notifications
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    sendPushNotification,
    
    // Drones
    createDrone,
    getAvailableDrone,
    assignDroneToOrder,
    getDroneById,
    updateDroneLocation,
    completeDroneDelivery,
    logDroneEvent,
    listDroneEvents,
    
    // Promotions
    validatePromoCode,
    applyPromoCode,
    
    // Orders
    createOrderWithDetails,
};
