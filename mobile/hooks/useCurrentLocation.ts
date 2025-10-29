/**
 * 🌍 useCurrentLocation Hook
 * 
 * Quản lý việc lấy vị trí hiện tại của user và reverse geocoding
 * sang địa chỉ thực tế.
 * 
 * Features:
 * - Auto get current location khi app mở
 * - Convert coordinates to address (reverse geocoding)
 * - Cache location để tránh request liên tục
 * - Handle permissions
 */

import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export interface UserLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  district: string;
  street: string;
  postalCode?: string;
  country: string;
}

interface LocationState {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  hasPermission: boolean;
}

export const useCurrentLocation = () => {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: false,
    error: null,
    hasPermission: false,
  });

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to get accurate delivery address.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        return false;
      }
      
      setState(prev => ({ ...prev, hasPermission: true }));
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }, []);

  /**
   * Reverse geocoding: Convert coordinates to address
   */
  const reverseGeocode = useCallback(async (
    latitude: number, 
    longitude: number
  ): Promise<UserLocation | null> => {
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (result && result.length > 0) {
        const addr = result[0];
        
        // Format địa chỉ tiếng Việt - Chi tiết hơn
        const streetNumber = addr.streetNumber || '';
        const street = addr.street || addr.name || '';
        const district = addr.subregion || addr.district || '';
        const city = addr.city || addr.region || 'Ho Chi Minh City';
        const country = addr.country || 'Vietnam';
        
        // Ghép street với street number
        let fullStreet = '';
        if (streetNumber && street) {
          fullStreet = `${streetNumber} ${street}`;
        } else if (street) {
          fullStreet = street;
        } else if (addr.name) {
          fullStreet = addr.name;
        }
        
        // Tạo full address
        const addressParts = [
          fullStreet,
          district,
          city,
        ].filter(Boolean);
        
        const fullAddress = addressParts.join(', ');
        
        return {
          latitude,
          longitude,
          address: fullAddress,
          street: fullStreet || district, // Fallback to district if no street
          district,
          city,
          postalCode: addr.postalCode || undefined,
          country,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw error;
    }
  }, []);

  /**
   * Get current location with high accuracy
   */
  const getCurrentLocation = useCallback(async (): Promise<UserLocation | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check permission first
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      // Get current position with high accuracy
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const { latitude, longitude } = position.coords;

      // Reverse geocode to get address
      const locationData = await reverseGeocode(latitude, longitude);

      if (locationData) {
        setState({
          location: locationData,
          loading: false,
          error: null,
          hasPermission: true,
        });
        
        console.log('📍 Current location:', locationData);
        return locationData;
      }

      throw new Error('Unable to get address from location');
      
    } catch (error: any) {
      console.error('Get location error:', error);
      
      // Fallback to default HCM location
      const fallbackLocation: UserLocation = {
        latitude: 10.8231,
        longitude: 106.6297,
        address: 'District 7, Ho Chi Minh City',
        street: '',
        district: 'District 7',
        city: 'Ho Chi Minh City',
        country: 'Vietnam',
      };
      
      setState({
        location: fallbackLocation,
        loading: false,
        error: error.message,
        hasPermission: false,
      });
      
      return fallbackLocation;
    }
  }, [requestPermission, reverseGeocode]);

  /**
   * Update location manually (khi user chọn từ search)
   */
  const setLocation = useCallback((location: UserLocation) => {
    setState(prev => ({
      ...prev,
      location,
      error: null,
    }));
  }, []);

  /**
   * Auto get location on mount (nếu đã có permission)
   */
  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        setState(prev => ({ ...prev, hasPermission: true }));
        getCurrentLocation();
      }
    })();
  }, []);

  return {
    location: state.location,
    loading: state.loading,
    error: state.error,
    hasPermission: state.hasPermission,
    getCurrentLocation,
    setLocation,
    requestPermission,
    reverseGeocode,
  };
};
