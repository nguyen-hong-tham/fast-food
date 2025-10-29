/**
 * 🔍 useSearchLocation Hook
 * 
 * Search địa điểm với autocomplete suggestions
 * Sử dụng Google Places API hoặc Mapbox Geocoding
 * 
 * Features:
 * - Debounced search (tránh gọi API liên tục)
 * - Location suggestions real-time
 * - Convert suggestion to coordinates
 * - Cache recent searches
 */

import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { UserLocation } from './useCurrentLocation';

export interface LocationSuggestion {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  type?: string; // restaurant, address, landmark
}

interface SearchState {
  query: string;
  suggestions: LocationSuggestion[];
  loading: boolean;
  selectedLocation: UserLocation | null;
}

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export const useSearchLocation = (userLocation?: UserLocation | null) => {
  const [state, setState] = useState<SearchState>({
    query: '',
    suggestions: [],
    loading: false,
    selectedLocation: null,
  });

  // Debounce query 500ms
  const debouncedQuery = useDebounce(state.query, 500);

  /**
   * Search locations using Expo Location Geocoding
   * (Free alternative to Google Places API)
   */
  const searchLocations = useCallback(async (query: string): Promise<LocationSuggestion[]> => {
    if (!query || query.length < 3) return [];

    try {
      // Geocoding forward: Search by text
      const results = await Location.geocodeAsync(query, {
        // Bias search results towards user's current location
        ...(userLocation && {
          region: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }
        })
      });

      if (!results || results.length === 0) return [];

      // Convert to suggestions format
      const suggestions: LocationSuggestion[] = await Promise.all(
        results.slice(0, 5).map(async (result, index) => {
          // Reverse geocode to get full address
          const addressInfo = await Location.reverseGeocodeAsync({
            latitude: result.latitude,
            longitude: result.longitude,
          });

          const addr = addressInfo[0];
          const street = addr?.street || '';
          const district = addr?.subregion || addr?.district || '';
          const city = addr?.city || addr?.region || 'Ho Chi Minh City';

          const fullAddress = [street, district, city].filter(Boolean).join(', ');
          const name = addr?.name || street || query;

          // Calculate distance from user location
          let distance: number | undefined;
          if (userLocation) {
            const distanceInMeters = getDistance(
              userLocation.latitude,
              userLocation.longitude,
              result.latitude,
              result.longitude
            );
            distance = Math.round(distanceInMeters / 1000 * 10) / 10; // km với 1 chữ số thập phân
          }

          return {
            id: `${result.latitude}-${result.longitude}-${index}`,
            name,
            address: fullAddress,
            latitude: result.latitude,
            longitude: result.longitude,
            distance,
            type: 'address',
          };
        })
      );

      return suggestions;
      
    } catch (error) {
      console.error('Search location error:', error);
      return [];
    }
  }, [userLocation]);

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  /**
   * Auto search when query changes (debounced)
   */
  useEffect(() => {
    if (debouncedQuery.length >= 3) {
      setState(prev => ({ ...prev, loading: true }));
      
      searchLocations(debouncedQuery).then(suggestions => {
        setState(prev => ({
          ...prev,
          suggestions,
          loading: false,
        }));
      });
    } else {
      setState(prev => ({ ...prev, suggestions: [], loading: false }));
    }
  }, [debouncedQuery, searchLocations]);

  /**
   * Update search query
   */
  const setQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, query }));
  }, []);

  /**
   * Select a suggestion and convert to full UserLocation
   */
  const selectSuggestion = useCallback(async (suggestion: LocationSuggestion): Promise<UserLocation | null> => {
    if (!suggestion.latitude || !suggestion.longitude) {
      console.error('Suggestion missing coordinates');
      return null;
    }

    try {
      // Reverse geocode lại để có full address details
      const addressInfo = await Location.reverseGeocodeAsync({
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
      });

      const addr = addressInfo[0];
      
      const location: UserLocation = {
        latitude: suggestion.latitude,
        longitude: suggestion.longitude,
        address: suggestion.address,
        street: addr?.street || '',
        district: addr?.subregion || addr?.district || '',
        city: addr?.city || addr?.region || 'Ho Chi Minh City',
        postalCode: addr?.postalCode || undefined,
        country: addr?.country || 'Vietnam',
      };

      setState(prev => ({
        ...prev,
        selectedLocation: location,
        query: suggestion.name,
        suggestions: [],
      }));

      return location;
      
    } catch (error) {
      console.error('Error selecting suggestion:', error);
      return null;
    }
  }, []);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setState({
      query: '',
      suggestions: [],
      loading: false,
      selectedLocation: null,
    });
  }, []);

  /**
   * Get popular locations (hardcoded cho Vietnam)
   */
  const getPopularLocations = useCallback((): LocationSuggestion[] => {
    return [
      {
        id: 'vinhomes-central-park',
        name: 'Vinhomes Central Park',
        address: 'Vinhomes Central Park, 208 Nguyễn Hữu Cảnh, P.22, Q.Bình Thạnh',
        latitude: 10.7971,
        longitude: 106.7218,
        type: 'landmark',
      },
      {
        id: 'saigon-centre',
        name: 'Saigon Centre',
        address: 'Saigon Centre, 65 Lê Lợi, P.Bến Nghé, Q.1',
        latitude: 10.7757,
        longitude: 106.7004,
        type: 'landmark',
      },
      {
        id: 'nha-tho-duc-ba',
        name: 'Nhà Thờ Đức Bà',
        address: 'Nhà Thờ Đức Bà, Công Xã Paris, P.Bến Nghé, Q.1',
        latitude: 10.7797,
        longitude: 106.6990,
        type: 'landmark',
      },
      {
        id: 'ben-xe-mien-dong',
        name: 'Bến Xe Miền Đông Mới',
        address: 'Bến Xe Miền Đông Mới, Quốc Lộ 1K, P.An Phú, TP.Thủ Đức',
        latitude: 10.8505,
        longitude: 106.8445,
        type: 'landmark',
      },
    ];
  }, []);

  return {
    query: state.query,
    suggestions: state.suggestions,
    loading: state.loading,
    selectedLocation: state.selectedLocation,
    setQuery,
    selectSuggestion,
    clearSearch,
    searchLocations,
    getPopularLocations,
  };
};
