/**
 * 📍 LocationPicker Component
 * 
 * UI cho phép user chọn địa chỉ giao hàng
 * Tương tự UI trong screenshot "Nội nhận"
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useCurrentLocation, UserLocation } from '@/hooks/useCurrentLocation';
import { useSearchLocation, LocationSuggestion } from '@/hooks/useSearchLocation';
import { icons } from '@/constants';
import cn from 'clsx';

interface LocationPickerProps {
  onSelectLocation: (location: UserLocation) => void;
  initialLocation?: UserLocation | null;
  showHeader?: boolean;
  showMapButton?: boolean;
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onSelectLocation,
  initialLocation,
  showHeader = true,
  showMapButton = true,
}) => {
  const {
    location: currentLocation,
    loading: locationLoading,
    getCurrentLocation,
  } = useCurrentLocation();

  const {
    query,
    suggestions,
    loading: searchLoading,
    setQuery,
    selectSuggestion,
    clearSearch,
    getPopularLocations,
  } = useSearchLocation(currentLocation);

  const popularLocations = useMemo(() => getPopularLocations(), [getPopularLocations]);

  // Don't auto-select location - let user choose explicitly
  
  const handleSelectSuggestion = useCallback(async (suggestion: LocationSuggestion) => {
    const location = await selectSuggestion(suggestion);
    if (location) {
      onSelectLocation(location);
      
      // Navigate back with coords params
      setTimeout(() => {
        router.back();
        // After going back, the parent screen should read from user profile
        // which was updated in onSelectLocation
      }, 300);
    }
  }, [selectSuggestion, onSelectLocation]);

  const handleUseCurrentLocation = useCallback(async () => {
    const location = await getCurrentLocation();
    if (location) {
      onSelectLocation(location);
      setQuery(location.address);
      
      // Navigate back after location is saved
      setTimeout(() => {
        router.back();
      }, 300);
    }
  }, [getCurrentLocation, onSelectLocation, setQuery]);

  const renderSuggestionItem = useCallback(({ item }: { item: LocationSuggestion }) => (
    <TouchableOpacity
      className="flex-row items-center py-4 px-5 border-b border-gray-100"
      onPress={() => handleSelectSuggestion(item)}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
        <Text className="text-lg">
          {item.type === 'landmark' ? '🏢' : '📍'}
        </Text>
      </View>

      {/* Text */}
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
          {item.address}
        </Text>
        {item.distance !== undefined && (
          <Text className="text-xs text-gray-400 mt-0.5">
            📏 {item.distance} km from you
          </Text>
        )}
      </View>

      {/* Arrow */}
      <Image
        source={icons.arrowRight}
        className="w-5 h-5"
        resizeMode="contain"
        tintColor="#9CA3AF"
      />
    </TouchableOpacity>
  ), [handleSelectSuggestion]);

  const keyExtractor = useCallback((item: LocationSuggestion) => item.id, []);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)' as any);
    }
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      {showHeader && (
        <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={handleBack} className="mr-3">
            <Image
              source={icons.arrowBack}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900 flex-1">
            Location Picker
          </Text>
          {showMapButton && (
            <TouchableOpacity
              onPress={() => {
                // Navigate to location-picker page with map mode
                router.push('/location-picker?mode=map' as any);
              }}
              className="px-3 py-1"
            >
              <Text className="text-sm text-primary font-semibold">
                Choose from map
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Search Bar */}
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
          <Image
            source={icons.search}
            className="w-5 h-5 mr-3"
            resizeMode="contain"
            tintColor="#9CA3AF"
          />
          <TextInput
            className="flex-1 text-base text-gray-900"
            placeholder="Enter location..."
            value={query}
            onChangeText={setQuery}
            placeholderTextColor="#9CA3AF"
            autoFocus
            returnKeyType="search"
          />
          {(query.length > 0 || searchLoading) && (
            <TouchableOpacity onPress={clearSearch} className="ml-2">
              {searchLoading ? (
                <ActivityIndicator size="small" color="#FF6B35" />
              ) : (
                <Text className="text-gray-400 text-lg">✕</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Quick Actions */}
      <View className="flex-row px-4 py-3 bg-white border-b border-gray-100">
        {/* Current Location Button */}
        <TouchableOpacity
          onPress={handleUseCurrentLocation}
          className="flex-row items-center bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mr-2 flex-1"
          activeOpacity={0.7}
        >
          {locationLoading ? (
            <ActivityIndicator size="small" color="#FF6B35" />
          ) : (
            <>
              <Text className="text-xl mr-2">📍</Text>
              <Text className="text-sm font-semibold text-amber-700 flex-1" numberOfLines={1}>
                Use currnent location
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Add Home/Office (Future) */}
        <TouchableOpacity
          className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-2"
          activeOpacity={0.7}
          disabled
        >
          <Text className="text-sm font-semibold text-gray-500">Add home/office</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <FlatList
        data={query.length >= 3 ? suggestions : popularLocations}
        keyExtractor={keyExtractor}
        renderItem={renderSuggestionItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="px-5 py-3 bg-gray-50">
            <Text className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {query.length >= 3 ? 'Kết quả tìm kiếm' : 'Địa điểm được đề xuất'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-4xl mb-3">🔍</Text>
            <Text className="text-base font-semibold text-gray-800 mb-1">
              {query.length >= 3 ? "Can't find results" : 'Enter location to search'}
            </Text>
            <Text className="text-sm text-gray-500 text-center px-8">
              {query.length >= 3 
                ? 'Try searching with different keywords'
                : 'Enter street name, building, or landmark'
              }
            </Text>
          </View>
        }
        contentContainerStyle={
          (query.length >= 3 ? suggestions : popularLocations).length === 0
            ? { flex: 1 }
            : undefined
        }
      />

      {/* Current Selected Location (Bottom) */}
      {currentLocation && (
        <View className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <Text className="text-xs text-gray-500 mb-1">Current Location:</Text>
          <View className="flex-row items-start">
            <Text className="text-sm text-gray-900 flex-1">
              {currentLocation.address}
            </Text>
            <Text className="text-xs text-green-600 ml-2 font-semibold">✓ GPS</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default React.memo(LocationPicker);
