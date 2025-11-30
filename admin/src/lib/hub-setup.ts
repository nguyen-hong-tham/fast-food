/**
 * Setup Default Drone Hub
 * Run this script once to create the default hub for the system
 */

import { Client, Databases } from 'appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID || '692a847d0025bb4d2bb6');

const databases = new Databases(client);
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || '692a85350000a4fc97b3';

export const DEFAULT_HUB_ID = 'default-hub-001';

export const DEFAULT_HUB = {
  name: 'FoodFast Central Hub',
  address: 'Lê Văn Việt, Tăng Nhơn Phú A, Thủ Đức, Hồ Chí Minh',
  latitude: 10.7587229,
  longitude: 106.682131,
};

export async function setupDefaultHub() {
  try {
    // Try to get existing hub first
    try {
      const existingHub = await databases.getDocument(
        databaseId,
        'drone_hub',
        DEFAULT_HUB_ID
      );
      console.log('✅ Default hub already exists:', existingHub);
      return existingHub;
    } catch (e) {
      // Hub doesn't exist, create it
      console.log('📍 Creating default hub...');
    }

    const hub = await databases.createDocument(
      databaseId,
      'drone_hub',
      DEFAULT_HUB_ID,
      DEFAULT_HUB
    );

    console.log('✅ Default hub created successfully!');
    console.log('Hub ID:', hub.$id);
    console.log('Location:', DEFAULT_HUB.latitude, DEFAULT_HUB.longitude);
    
    return hub;
  } catch (error) {
    console.error('❌ Error setting up default hub:', error);
    throw error;
  }
}

// Export hub info for use in other files
export function getDefaultHubLocation() {
  return {
    latitude: DEFAULT_HUB.latitude,
    longitude: DEFAULT_HUB.longitude,
  };
}

export function getDefaultHubId() {
  return DEFAULT_HUB_ID;
}
