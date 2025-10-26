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
    // const review = await databases.createDocument(
    //     databaseId,
    //     appwriteConfig.reviewsCollectionId,
    //     ID.unique(),
    //     {
    //         ...reviewData,
    //         isVisible: true,
    //         createdAt: new Date().toISOString(),
    //     }
    // );
    
    // // Update restaurant rating
    // await updateRestaurantRating(reviewData.restaurantId);
    
    // return review as unknown as Review;
    throw new Error('Reviews feature not implemented - reviews collection does not exist');
};

export const getRestaurantReviews = async (restaurantId: string): Promise<Review[]> => {
    // Reviews collection doesn't exist in current database
    // const response = await databases.listDocuments(
    //     databaseId,
    //     appwriteConfig.reviewsCollectionId,
    //     [
    //         Query.equal('restaurantId', restaurantId),
    //         Query.equal('isVisible', true),
    //         Query.orderDesc('$createdAt'),
    //         Query.limit(50)
    //     ]
    // );
    
    // return response.documents as unknown as Review[];
    return []; // Return empty array since reviews collection doesn't exist
};

export const updateRestaurantRating = async (restaurantId: string): Promise<void> => {
    // Reviews collection doesn't exist - skip rating update
    // // Get all reviews for restaurant
    // const reviews = await getRestaurantReviews(restaurantId);
    
    // if (reviews.length === 0) return;
    
    // // Calculate average rating
    // const avgRating = reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviews.length;
    
    // // Update restaurant
    // await databases.updateDocument(
    //     databaseId,
    //     appwriteConfig.restaurantsCollectionId,
    //     restaurantId,
    //     {
    //         rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
    //     }
    // );
};

// ===================== NOTIFICATIONS =====================

export const createNotification = async (notificationData: {
    userId: string;
    type: 'order_update' | 'promotion' | 'system' | 'review_request';
    title: string;
    body: string;
    data?: any;
    channel?: 'push' | 'email' | 'in_app';
}): Promise<Notification> => {
    const notification = await databases.createDocument(
        databaseId,
        appwriteConfig.notificationsCollectionId,
        ID.unique(),
        {
            ...notificationData,
            channel: notificationData.channel || 'push',
            status: 'sent',
            sentAt: new Date().toISOString(),
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

// ===================== DRONES =====================

export const createDrone = async (data: {
    name: string;
    model?: string;
    serialNumber?: string;
}): Promise<Drone> => {
    const droneData = {
        name: data.name,
        model: data.model || 'DJI Phantom 4',
        serialNumber: data.serialNumber || `SN-${Date.now()}`,
        status: 'idle',
        isActive: true,
        batteryLevel: 100,
        currentLatitude: 10.762622, // Default HCM location
        currentLongitude: 106.660172,
        maxSpeed: 40,
        maxPayload: 2000,
        baseLatitude: 10.762622,
        baseLongitude: 106.660172,
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
            Query.equal('status', 'idle'),
            Query.equal('isActive', true),
            Query.greaterThan('batteryLevel', 30),
            Query.limit(1)
        ]
    );
    
    // If no drone available, try to create one automatically
    if (response.documents.length === 0) {
        console.log('⚠️ No drones available. Creating a new drone...');
        try {
            const newDrone = await createDrone({
                name: `Drone-${Date.now()}`,
                model: 'DJI Phantom 4 Pro',
            });
            console.log('✅ Created new drone:', newDrone.$id);
            return newDrone;
        } catch (error) {
            console.error('❌ Failed to create drone:', error);
            return null;
        }
    }
    
    return response.documents[0] as unknown as Drone;
};

export const getDroneById = async (droneId: string): Promise<Drone> => {
    const response = await databases.getDocument(
        databaseId,
        appwriteConfig.dronesCollectionId,
        droneId
    );
    
    return response as unknown as Drone;
};

export const assignDroneToOrder = async (droneId: string, orderId: string): Promise<Drone> => {
    const updated = await databases.updateDocument(
        databaseId,
        appwriteConfig.dronesCollectionId,
        droneId,
        {
            status: 'delivering',
            assignedOrderId: orderId,
            updatedAt: new Date().toISOString(),
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
            timestamp: new Date().toISOString(),
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
            timestamp: new Date().toISOString(),
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
    await databases.updateDocument(
        databaseId,
        appwriteConfig.dronesCollectionId,
        droneId,
        {
            currentLatitude: latitude,
            currentLongitude: longitude,
            batteryLevel: options.batteryLevel ?? undefined,
            updatedAt: new Date().toISOString(),
        }
    );

    await databases.createDocument(
        databaseId,
        appwriteConfig.droneEventsCollectionId,
        ID.unique(),
        {
            droneId,
            orderId: options.orderId,
            eventType: 'position_update',
            latitude,
            longitude,
            altitude: options.altitude,
            speed: options.speed,
            batteryLevel: options.batteryLevel,
            timestamp: new Date().toISOString(),
        }
    );
};

export const completeDroneDelivery = async (droneId: string): Promise<void> => {
    const drone = await databases.getDocument(
        databaseId,
        appwriteConfig.dronesCollectionId,
        droneId
    ) as unknown as Drone;
    
    await databases.updateDocument(
        databaseId,
        appwriteConfig.dronesCollectionId,
        droneId,
        {
            status: 'idle',
            assignedOrderId: null,
            totalFlights: drone.totalFlights + 1,
            updatedAt: new Date().toISOString(),
        }
    );
    
    // Create landing event
    await databases.createDocument(
        databaseId,
        appwriteConfig.droneEventsCollectionId,
        ID.unique(),
        {
            droneId,
            orderId: drone.assignedOrderId,
            eventType: 'landing',
            timestamp: new Date().toISOString(),
        }
    );
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
