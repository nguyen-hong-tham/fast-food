import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { databases, appwriteConfig } from '@/lib/appwrite';
import { Query } from 'react-native-appwrite';

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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        <Text className="text-2xl font-bold text-center mb-6">Restaurant Debug</Text>
        
        <View className="space-y-3 mb-6">
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
        </View>

        <ScrollView className="bg-white p-4 rounded-lg border border-gray-200 h-96">
          <Text className="font-mono text-sm text-gray-800">
            {debugInfo || 'Click a button above to test database connection'}
          </Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default DebugScreen;