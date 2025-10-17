/**
 * Enhanced Seed Script for FoodFast Database
 * 
 * This script seeds the database with test data including:
 * - Restaurants
 * - Menu items with restaurant associations
 * - Orders with order items and payments
 * - Reviews
 * - Drones
 * 
 * Run: npx ts-node lib/seed-enhanced.ts
 */

import { ID, Query } from 'react-native-appwrite';
import { databases, appwriteConfig } from './appwrite';

const { databaseId } = appwriteConfig;

// Helper to clear a collection
async function clearCollection(collectionId: string): Promise<void> {
    try {
        console.log(`🧹 Clearing ${collectionId}...`);
        const docs = await databases.listDocuments(databaseId, collectionId);
        
        await Promise.all(
            docs.documents.map(doc => 
                databases.deleteDocument(databaseId, collectionId, doc.$id)
            )
        );
        
        console.log(`✅ Cleared ${docs.documents.length} documents from ${collectionId}`);
    } catch (error) {
        console.log(`⚠️  Error clearing ${collectionId}:`, error);
    }
}

// Main seed function
export async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // ============= STEP 1: Create Test Restaurant =============
        console.log('\n📍 STEP 1: Creating test restaurant...');
        
        const restaurant = await databases.createDocument(
            databaseId,
            appwriteConfig.restaurantsCollectionId,
            ID.unique(),
            {
                ownerId: 'test-owner-123', // You'll need a real user ID
                name: 'The Burger House',
                description: 'Best burgers in town with fresh ingredients',
                address: '123 Food Street, District 1, Ho Chi Minh City',
                latitude: 10.7769,
                longitude: 106.7009,
                phone: '+84901234567',
                email: 'contact@burgerhouse.com',
                cuisine: 'Fast Food',
                status: 'active',
                rating: 4.5,
                totalOrders: 0,
                totalRevenue: 0,
                operatingHours: {
                    monday: { open: '08:00', close: '22:00' },
                    tuesday: { open: '08:00', close: '22:00' },
                    wednesday: { open: '08:00', close: '22:00' },
                    thursday: { open: '08:00', close: '22:00' },
                    friday: { open: '08:00', close: '23:00' },
                    saturday: { open: '08:00', close: '23:00' },
                    sunday: { open: '09:00', close: '22:00' },
                },
                isActive: true,
            }
        );
        
        console.log(`✅ Created restaurant: ${restaurant.name} (${restaurant.$id})`);
        const restaurantId = restaurant.$id;

        // ============= STEP 2: Create Categories =============
        console.log('\n📂 STEP 2: Creating categories...');
        
        const categories = [
            { name: 'Burgers', description: 'Delicious burgers with various toppings' },
            { name: 'Sides', description: 'Fries, onion rings, and more' },
            { name: 'Drinks', description: 'Soft drinks, juices, and shakes' },
            { name: 'Desserts', description: 'Sweet treats to end your meal' },
        ];

        const createdCategories = await Promise.all(
            categories.map(cat =>
                databases.createDocument(
                    databaseId,
                    appwriteConfig.categoriesCollectionId,
                    ID.unique(),
                    cat
                )
            )
        );

        console.log(`✅ Created ${createdCategories.length} categories`);

        // ============= STEP 3: Create Menu Items =============
        console.log('\n🍔 STEP 3: Creating menu items...');
        
        const menuItems = [
            {
                name: 'Classic Burger',
                description: 'Beef patty, lettuce, tomato, onion, pickles',
                price: 85000,
                image_url: 'https://cloud.appwrite.io/v1/storage/buckets/68dacda1003d6943981e/files/burger1/view',
                calories: 450,
                protein: 25,
                categories: createdCategories[0].$id,
                restaurantId,
                isAvailable: true,
                stock: 50,
            },
            {
                name: 'Cheese Burger',
                description: 'Classic burger with melted cheddar cheese',
                price: 95000,
                image_url: 'https://cloud.appwrite.io/v1/storage/buckets/68dacda1003d6943981e/files/burger2/view',
                calories: 520,
                protein: 28,
                categories: createdCategories[0].$id,
                restaurantId,
                isAvailable: true,
                stock: 45,
            },
            {
                name: 'Bacon Burger',
                description: 'Burger with crispy bacon strips',
                price: 105000,
                image_url: 'https://cloud.appwrite.io/v1/storage/buckets/68dacda1003d6943981e/files/burger3/view',
                calories: 580,
                protein: 32,
                categories: createdCategories[0].$id,
                restaurantId,
                isAvailable: true,
                stock: 40,
            },
            {
                name: 'French Fries',
                description: 'Crispy golden fries',
                price: 35000,
                image_url: 'https://cloud.appwrite.io/v1/storage/buckets/68dacda1003d6943981e/files/fries/view',
                calories: 312,
                protein: 4,
                categories: createdCategories[1].$id,
                restaurantId,
                isAvailable: true,
                stock: 100,
            },
            {
                name: 'Onion Rings',
                description: 'Crispy fried onion rings',
                price: 40000,
                image_url: 'https://cloud.appwrite.io/v1/storage/buckets/68dacda1003d6943981e/files/onion/view',
                calories: 276,
                protein: 3,
                categories: createdCategories[1].$id,
                restaurantId,
                isAvailable: true,
                stock: 80,
            },
            {
                name: 'Coca Cola',
                description: 'Chilled Coca Cola',
                price: 20000,
                image_url: 'https://cloud.appwrite.io/v1/storage/buckets/68dacda1003d6943981e/files/coke/view',
                calories: 140,
                protein: 0,
                categories: createdCategories[2].$id,
                restaurantId,
                isAvailable: true,
                stock: 200,
            },
            {
                name: 'Chocolate Shake',
                description: 'Rich chocolate milkshake',
                price: 50000,
                image_url: 'https://cloud.appwrite.io/v1/storage/buckets/68dacda1003d6943981e/files/shake/view',
                calories: 420,
                protein: 8,
                categories: createdCategories[2].$id,
                restaurantId,
                isAvailable: true,
                stock: 60,
            },
        ];

        const createdMenuItems = await Promise.all(
            menuItems.map(item =>
                databases.createDocument(
                    databaseId,
                    appwriteConfig.menuCollectionId,
                    ID.unique(),
                    item
                )
            )
        );

        console.log(`✅ Created ${createdMenuItems.length} menu items`);

        // ============= STEP 4: Create Drones =============
        console.log('\n🚁 STEP 4: Creating drones...');
        
        const drones = [
            {
                code: 'DRONE-001',
                name: 'Falcon Alpha',
                model: 'DJI Matrice 300',
                status: 'idle',
                batteryLevel: 95,
                currentLat: 10.7769,
                currentLng: 106.7009,
                maxPayload: 5.5,
                maxRange: 15,
                totalFlights: 0,
                isActive: true,
            },
            {
                code: 'DRONE-002',
                name: 'Eagle Beta',
                model: 'DJI Matrice 300',
                status: 'idle',
                batteryLevel: 88,
                currentLat: 10.7800,
                currentLng: 106.7050,
                maxPayload: 5.5,
                maxRange: 15,
                totalFlights: 0,
                isActive: true,
            },
        ];

        const createdDrones = await Promise.all(
            drones.map(drone =>
                databases.createDocument(
                    databaseId,
                    appwriteConfig.dronesCollectionId,
                    ID.unique(),
                    drone
                )
            )
        );

        console.log(`✅ Created ${createdDrones.length} drones`);

        // ============= STEP 5: Create Test Order =============
        console.log('\n📦 STEP 5: Creating test order...');
        
        const testOrder = await databases.createDocument(
            databaseId,
            appwriteConfig.ordersCollectionId,
            ID.unique(),
            {
                userId: 'test-user-123', // You'll need a real user ID
                restaurantId,
                items: JSON.stringify([
                    {
                        menuItemId: createdMenuItems[0].$id,
                        name: createdMenuItems[0].name,
                        price: createdMenuItems[0].price,
                        quantity: 2,
                        image_url: createdMenuItems[0].image_url,
                    },
                    {
                        menuItemId: createdMenuItems[3].$id,
                        name: createdMenuItems[3].name,
                        price: createdMenuItems[3].price,
                        quantity: 1,
                        image_url: createdMenuItems[3].image_url,
                    }
                ]),
                total: 205000, // 2 x 85000 + 35000
                status: 'pending',
                paymentStatus: 'pending',
                paymentMethod: 'cod',
                deliveryAddress: '456 Customer Street, District 3, Ho Chi Minh City',
                phone: '+84912345678',
                notes: 'Please ring the doorbell',
            }
        );

        console.log(`✅ Created order: ${testOrder.$id}`);

        // ============= STEP 6: Create Order Items =============
        console.log('\n📝 STEP 6: Creating order items...');
        
        const orderItems = [
            {
                orderId: testOrder.$id,
                menuItemId: createdMenuItems[0].$id,
                name: createdMenuItems[0].name,
                price: createdMenuItems[0].price,
                quantity: 2,
                subtotal: 170000,
            },
            {
                orderId: testOrder.$id,
                menuItemId: createdMenuItems[3].$id,
                name: createdMenuItems[3].name,
                price: createdMenuItems[3].price,
                quantity: 1,
                subtotal: 35000,
            },
        ];

        const createdOrderItems = await Promise.all(
            orderItems.map(item =>
                databases.createDocument(
                    databaseId,
                    appwriteConfig.orderItemsCollectionId,
                    ID.unique(),
                    item
                )
            )
        );

        console.log(`✅ Created ${createdOrderItems.length} order items`);

        // ============= STEP 7: Create Payment =============
        console.log('\n💳 STEP 7: Creating payment record...');
        
        const payment = await databases.createDocument(
            databaseId,
            appwriteConfig.paymentsCollectionId,
            ID.unique(),
            {
                orderId: testOrder.$id,
                userId: 'test-user-123',
                provider: 'cod',
                amount: 205000,
                status: 'pending',
            }
        );

        console.log(`✅ Created payment: ${payment.$id}`);

        // ============= Summary =============
        console.log('\n\n✅ ============= SEEDING COMPLETED =============');
        console.log(`\n📊 Summary:`);
        console.log(`   - 1 Restaurant created`);
        console.log(`   - ${createdCategories.length} Categories created`);
        console.log(`   - ${createdMenuItems.length} Menu items created`);
        console.log(`   - ${createdDrones.length} Drones created`);
        console.log(`   - 1 Order created`);
        console.log(`   - ${createdOrderItems.length} Order items created`);
        console.log(`   - 1 Payment created`);
        console.log(`\n🎉 Database is ready for testing!`);
        console.log(`\n📱 You can now use the mobile app to:`);
        console.log(`   - Browse menu items`);
        console.log(`   - View restaurant details`);
        console.log(`   - Place orders`);
        console.log(`   - Track delivery`);

    } catch (error) {
        console.error('\n❌ Error seeding database:', error);
        throw error;
    }
}

// Run if called directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('\n✅ Seed script completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Seed script failed:', error);
            process.exit(1);
        });
}

export default seedDatabase;
