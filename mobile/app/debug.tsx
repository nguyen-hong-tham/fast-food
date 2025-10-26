import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';
import * as Notifications from 'expo-notifications';
import useAuthStore from '@/store/auth.store';

const DebugScreen = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      // Test 1: Get all restaurants without any filters
      const allRestaurants = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.restaurantsCollectionId
      );

      let info = `=== RESTAURANTS DEBUG INFO ===\n\n`;
      info += `Database ID: ${appwriteConfig.databaseId}\n`;
      info += `Collection ID: ${appwriteConfig.restaurantsCollectionId}\n`;
      info += `Total restaurants found: ${allRestaurants.total}\n\n`;

      if (allRestaurants.documents.length > 0) {
        info += `=== RESTAURANT DATA ===\n`;
        allRestaurants.documents.forEach((restaurant: any, index: number) => {
          info += `\n--- Restaurant ${index + 1} ---\n`;
          info += `ID: ${restaurant.$id}\n`;
          info += `Name: ${restaurant.name}\n`;
          info += `Status: ${restaurant.status || 'N/A'}\n`;
          info += `IsActive: ${restaurant.isActive}\n`;
          info += `Cuisine: ${restaurant.cuisine || 'N/A'}\n`;
          info += `Rating: ${restaurant.rating || 'N/A'}\n`;
          info += `Address: ${restaurant.address || 'N/A'}\n`;
          info += `Phone: ${restaurant.phone || 'N/A'}\n`;
          info += `All fields: ${JSON.stringify(restaurant, null, 2)}\n`;
        });
      } else {
        info += `No restaurants found in database.\n`;
        info += `Possible issues:\n`;
        info += `1. Collection name is wrong\n`;
        info += `2. Database ID is wrong\n`;
        info += `3. No data in collection\n`;
      }

      setDebugInfo(info);
    } catch (error) {
      const errorInfo = `=== ERROR ===\n`;
      setDebugInfo(errorInfo + `Error: ${JSON.stringify(error, null, 2)}`);
    }
    setLoading(false);
  };

  const testActiveRestaurants = async () => {
    setLoading(true);
    try {
      // Test with status filter
      const activeRestaurants = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.restaurantsCollectionId,
        [Query.equal('status', 'active')]
      );

      let info = `=== ACTIVE RESTAURANTS TEST ===\n\n`;
      info += `Active restaurants found: ${activeRestaurants.total}\n\n`;

      if (activeRestaurants.documents.length > 0) {
        activeRestaurants.documents.forEach((restaurant: any, index: number) => {
          info += `${index + 1}. ${restaurant.name} - Status: ${restaurant.status}\n`;
        });
      } else {
        info += `No active restaurants found.\n`;
        info += `Try checking if restaurants have status='active'\n`;
      }

      setDebugInfo(info);
    } catch (error) {
      setDebugInfo(`Error with active filter: ${JSON.stringify(error, null, 2)}`);
    }
    setLoading(false);
  };

  const testIsActiveRestaurants = async () => {
    setLoading(true);
    try {
      // Test with isActive filter
      const isActiveRestaurants = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.restaurantsCollectionId,
        [Query.equal('isActive', true)]
      );

      let info = `=== IS_ACTIVE RESTAURANTS TEST ===\n\n`;
      info += `Is Active restaurants found: ${isActiveRestaurants.total}\n\n`;

      if (isActiveRestaurants.documents.length > 0) {
        isActiveRestaurants.documents.forEach((restaurant: any, index: number) => {
          info += `${index + 1}. ${restaurant.name} - IsActive: ${restaurant.isActive}\n`;
        });
      } else {
        info += `No isActive=true restaurants found.\n`;
        info += `Try checking if restaurants have isActive=true\n`;
      }

      setDebugInfo(info);
    } catch (error) {
      setDebugInfo(`Error with isActive filter: ${JSON.stringify(error, null, 2)}`);
    }
    setLoading(false);
  };

  const testLocalNotification = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      
      if (status !== 'granted') {
        setDebugInfo('⚠️ Notification permission not granted. Please enable in settings.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🍔 Order Update Test",
          body: "Your order is being prepared!",
          data: { orderId: '12345', type: 'order_update' },
          sound: true,
        },
        trigger: { seconds: 2 } as any,
      });

      setDebugInfo('✅ Local notification scheduled! It will appear in 2 seconds.\n\nTap the notification to test navigation.');
    } catch (error: any) {
      setDebugInfo(`❌ Error: ${error.message}`);
    }
  };

  const testMultipleNotifications = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      
      if (status !== 'granted') {
        setDebugInfo('⚠️ Notification permission not granted.');
        return;
      }

      // Order Confirmed
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "✅ Order Confirmed",
          body: "Your order has been accepted by the restaurant",
          data: { orderId: '123', type: 'order_confirmed' },
        },
        trigger: { seconds: 2 } as any,
      });

      // Preparing
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "👨‍🍳 Preparing Your Order",
          body: "Your food is being prepared",
          data: { orderId: '123', type: 'order_preparing' },
        },
        trigger: { seconds: 5 } as any,
      });

      // Drone Dispatched
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🚁 Drone On The Way!",
          body: "Your order is on the way. ETA: 10 minutes",
          data: { orderId: '123', type: 'order_delivering' },
        },
        trigger: { seconds: 8 } as any,
      });

      // Delivered
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎉 Order Delivered",
          body: "Your order has been delivered. Enjoy!",
          data: { orderId: '123', type: 'order_delivered' },
        },
        trigger: { seconds: 11 } as any,
      });

      setDebugInfo('✅ Scheduled 4 notifications:\n\n' +
        '1. Order Confirmed (2s)\n' +
        '2. Preparing (5s)\n' +
        '3. Drone Dispatched (8s)\n' +
        '4. Delivered (11s)\n\n' +
        'Tap any notification to test navigation!');
    } catch (error: any) {
      setDebugInfo(`❌ Error: ${error.message}`);
    }
  };

  const checkNotificationStatus = async () => {
    const { user } = useAuthStore.getState();
    const { status } = await Notifications.getPermissionsAsync();
    const token = await Notifications.getExpoPushTokenAsync().catch(() => null);

    let info = '=== NOTIFICATION DEBUG ===\n\n';
    info += `Permission Status: ${status}\n`;
    info += `User Logged In: ${user ? 'Yes' : 'No'}\n`;
    
    if (user) {
      info += `User ID: ${user.$id}\n`;
      const fcmToken = (user as any).fcmToken;
      info += `FCM Token in DB: ${fcmToken ? 'Yes' : 'No'}\n`;
      if (fcmToken) {
        info += `Token: ${fcmToken.substring(0, 30)}...\n`;
      }
    }
    
    info += `\nLocal Token: ${token ? (token as any).data.substring(0, 30) + '...' : 'None'}\n`;
    info += `\n📱 Device: Physical device required for push\n`;

    setDebugInfo(info);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-center mb-6">Debug & Test Tools</Text>
        
        <ScrollView className="space-y-3 mb-6">
          <Text className="text-lg font-semibold mt-2 mb-1">📊 Database Tests</Text>
          
          <TouchableOpacity
            className="bg-blue-500 p-4 rounded-lg"
            onPress={testDatabaseConnection}
            disabled={loading}
          >
            <Text className="text-white text-center font-semibold">
              {loading ? 'Testing...' : 'Test All Restaurants'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-green-500 p-4 rounded-lg"
            onPress={testActiveRestaurants}
            disabled={loading}
          >
            <Text className="text-white text-center font-semibold">
              Test Active Restaurants
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-orange-500 p-4 rounded-lg"
            onPress={testIsActiveRestaurants}
            disabled={loading}
          >
            <Text className="text-white text-center font-semibold">
              Test IsActive Restaurants
            </Text>
          </TouchableOpacity>

          <Text className="text-lg font-semibold mt-4 mb-1">🔔 Notification Tests</Text>

          <TouchableOpacity
            className="bg-purple-500 p-4 rounded-lg"
            onPress={checkNotificationStatus}
          >
            <Text className="text-white text-center font-semibold">
              Check Notification Status
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-pink-500 p-4 rounded-lg"
            onPress={testLocalNotification}
          >
            <Text className="text-white text-center font-semibold">
              Test Single Notification
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-indigo-500 p-4 rounded-lg"
            onPress={testMultipleNotifications}
          >
            <Text className="text-white text-center font-semibold">
              Test Order Flow Notifications
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <ScrollView className="bg-white p-4 rounded-lg border border-gray-200 h-80">
          <Text className="font-mono text-xs text-gray-800">
            {debugInfo || 'Click a button above to test'}
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default DebugScreen;