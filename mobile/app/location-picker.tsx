/**
 * 📍 Location Picker Screen
 * 
 * Full screen modal để chọn địa chỉ giao hàng
 * Tương tự screenshot "Nội nhận"
 */

import React, { useCallback } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import LocationPicker from '@/components/common/LocationPicker';
import { UserLocation } from '@/hooks/useCurrentLocation';
import useAuthStore from '@/store/auth.store';
import { databases, appwriteConfig } from '@/lib/appwrite';

const LocationPickerScreen = () => {
  const params = useLocalSearchParams<{ 
    returnScreen?: string;
    saveToProfile?: string;
  }>();
  
  const { user, setUser } = useAuthStore();

  const handleSelectLocation = useCallback(async (location: UserLocation) => {
    console.log('Selected location:', location);

    // Always save to user profile when location is selected
    if (user) {
      try {
        await databases.updateDocument(
          appwriteConfig.databaseId,
          appwriteConfig.userCollectionId,
          user.$id,
          {
            address_home: location.address,
            address_home_label: location.street || location.district || 'Home',
            latitude: location.latitude,
            longitude: location.longitude,
            city: location.city,
            district: location.district,
          }
        );

        // Update local store
        setUser({
          ...user,
          address_home: location.address,
          address_home_label: location.street || location.district || 'Home',
        });

        console.log('Location saved to profile');
      } catch (error) {
        console.error('Failed to save location:', error);
      }
    }
    
    // Don't auto-navigate - let LocationPicker component handle it
  }, [user, setUser]);

  return (
    <LocationPicker
      onSelectLocation={handleSelectLocation}
      showHeader={true}
      showMapButton={true}
    />
  );
};

export default LocationPickerScreen;
