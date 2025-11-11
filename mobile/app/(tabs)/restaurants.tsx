import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl, Platform, TextInput, Image } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Location from 'expo-location';
import { getRestaurants } from '@/lib/appwrite';
import { RestaurantWithDistance, RestaurantFilters } from '@/type';
import RestaurantCard from '@/components/restaurant/RestaurantCard';
import WebContainer from '@/components/common/WebContainer';
import { RestaurantListSkeleton } from '@/components/common/LoadingSkeleton';
import cn from 'clsx';
import { icons } from '@/constants';
import { useResponsive } from '@/lib/responsive';

const RestaurantsScreen = () => {
  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { isDesktop } = useResponsive();
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'name' | 'newest'>('rating');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'active'>('all');

  // Get user location (mock for Ho Chi Minh City)
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        // Request permission and get location
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          // Fallback to Ho Chi Minh City
          setUserLocation({ latitude: 10.8231, longitude: 106.6297 });
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
        // Fallback to Ho Chi Minh City if error
        setUserLocation({ latitude: 10.8231, longitude: 106.6297 });
      }
    };

    getCurrentLocation();
  }, []);


  // Fetch restaurants
  const fetchRestaurants = async () => {
    // Wait for location to be available
    if (!userLocation) {
      return;
    }
    
    try {
      setLoading(true);
      
      const filters: RestaurantFilters = {
        sortBy
      };

      if (selectedDistance) {
        filters.distance = selectedDistance;
      }

      const data = await getRestaurants(
        filters,
        userLocation.latitude,
        userLocation.longitude
      );

      let processedData = data as RestaurantWithDistance[];

      // Apply status filter
      if (statusFilter === 'open') {
        processedData = processedData.filter(restaurant => {
          const isOpen = restaurant.isActive && restaurant.status === 'active';
          // Add operating hours check here if needed
          return isOpen;
        });
      } else if (statusFilter === 'active') {
        processedData = processedData.filter(restaurant => restaurant.status === 'active');
      }

      setRestaurants(processedData);
      setFilteredRestaurants(processedData);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setRestaurants([]);
      setFilteredRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [selectedDistance, sortBy, statusFilter, userLocation]);

  // Search filter - useMemo để tránh tính toán lại không cần thiết
  const filteredResults = useMemo(() => {
    if (searchQuery.trim() === '') {
      return restaurants;
    }
    const query = searchQuery.toLowerCase();
    return restaurants.filter((restaurant) =>
      restaurant.name.toLowerCase().includes(query) ||
      restaurant.address.toLowerCase().includes(query)
    );
  }, [searchQuery, restaurants]);

  useEffect(() => {
    setFilteredRestaurants(filteredResults);
  }, [filteredResults]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRestaurants();
    setRefreshing(false);
  }, []);

  // Memoize render callbacks
  const renderRestaurantItem = useCallback(({ item }: { item: RestaurantWithDistance }) => (
    <RestaurantCard restaurant={item} />
  ), []);

  const keyExtractor = useCallback((item: RestaurantWithDistance) => item.$id, []);

  const handleClearSearch = useCallback(() => setSearchQuery(''), []);

  const handleDistanceFilter = useCallback((distance: number) => {
    setSelectedDistance(prev => prev === distance ? null : distance);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedDistance(null);
    setStatusFilter('all');
    setSearchQuery('');
  }, []);

  const renderHeader = () => {
    const activeFilterCount = 
      (selectedDistance ? 1 : 0) + 
      (sortBy !== 'rating' ? 1 : 0) + 
      (statusFilter !== 'all' ? 1 : 0);

    return (
    <View className={cn(
      "pb-4",
      isDesktop ? "px-20" : "px-4"
    )}>
      {/* Search Bar */}
      <View 
        className={cn(
          "flex-row items-center bg-white rounded-xl border border-gray-200 mb-3",
          isDesktop ? "px-6 py-4 shadow-sm" : "px-4 py-3"
        )}
      >
        <Image
          source={require('@/assets/icons/search.png')}
          className={cn("mr-3", isDesktop ? "w-6 h-6" : "w-5 h-5")}
          resizeMode="contain"
          tintColor="#9CA3AF"
        />
        <TextInput
          className={cn("flex-1 text-gray-800", isDesktop ? "text-base" : "text-base")}
          placeholder="Search restaurants, cuisine, or area..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch}>
            <Text className="text-gray-400 text-lg">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters - Always Visible */}
      <View className={cn(
        "bg-white rounded-xl border border-gray-200 p-4 mb-3",
        Platform.OS === 'android' && "elevation-1"
      )}>
        {/* Quick Sort Chips */}
        <View className="mb-4">
          <Text className="text-base font-bold text-gray-800 mb-2">Filters</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row" style={{ gap: 8 }}>
              {[
                { value: 'rating', label: 'Top Rated' },
                { value: 'distance', label: 'Nearest', disabled: !userLocation },
                { value: 'newest', label: 'New' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  disabled={option.disabled}
                  className={cn(
                    'flex-row items-center rounded-xl px-4 py-2 border',
                    option.disabled 
                      ? 'bg-gray-100 border-gray-200'
                      : sortBy === option.value 
                        ? 'bg-amber-500 border-amber-500' 
                        : 'bg-white border-gray-300'
                  )}
                  onPress={() => !option.disabled && setSortBy(option.value as any)}
                >
                  <Text className={cn(
                    'font-semibold text-sm',
                    option.disabled
                      ? 'text-gray-400'
                      : sortBy === option.value ? 'text-white' : 'text-gray-700'
                  )}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
        
        {/* Distance Filter */}
        {userLocation && (
          <View className="mb-3">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Maximum Distance</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row" style={{ gap: 8 }}>
                {[2, 5, 10, 20].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    className={cn(
                      'rounded-lg border px-4 py-2',
                      selectedDistance === distance 
                        ? 'bg-amber-50 border-amber-500' 
                        : 'bg-white border-gray-300'
                    )}
                    onPress={() => handleDistanceFilter(distance)}
                  >
                    <Text className={cn(
                      'font-medium text-sm',
                      selectedDistance === distance ? 'text-amber-600' : 'text-gray-700'
                    )}>
                      {distance} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Results Summary */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className={cn(
          "text-gray-600",
          isDesktop ? "text-base font-medium" : "text-sm"
        )}>
          {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
        </Text>
        
        {/* Clear Filters */}
        {(selectedDistance || statusFilter !== 'all' || searchQuery) && (
          <TouchableOpacity
            onPress={handleResetFilters}
            className={cn(
              "bg-gray-100 rounded-lg",
              isDesktop ? "px-4 py-2" : "px-3 py-1"
            )}
          >
            <Text className={cn(
              "text-gray-600",
              isDesktop ? "text-sm" : "text-xs"
            )}>
              Clear All
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 pt-4 pb-2 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-800">Restaurants</Text>
          <Text className="text-sm text-gray-600 mt-1">
            Discovering amazing food...
          </Text>
        </View>
        <RestaurantListSkeleton count={6} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header - Better styling */}
      <View className={cn(
        "pt-4 pb-3 bg-white border-b border-gray-200",
        isDesktop ? "px-20" : "px-4"
      )}>
        <Text className={cn(
          "font-bold text-gray-800",
          isDesktop ? "text-3xl" : "text-2xl"
        )}>
          Restaurants
        </Text>
        <Text className={cn(
          "text-gray-500 mt-1",
          isDesktop ? "text-base" : "text-sm"
        )}>
          Discover amazing food delivered by drone
        </Text>
      </View>

      <WebContainer maxWidth="container">
        {isDesktop ? (
          // Desktop: ScrollView with Grid
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={['#FF7A00']} 
                tintColor="#FF7A00"
              />
            }
            contentContainerClassName="pt-6"
          >
            {renderHeader()}
            
            {filteredRestaurants.length > 0 ? (
              <View className="px-20 flex flex-row flex-wrap pb-8" style={{ gap: 24 }}>
                {filteredRestaurants.map((restaurant) => (
                  <View key={restaurant.$id} style={{ width: '48%' }}>
                    <RestaurantCard restaurant={restaurant} />
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center justify-center py-16 px-20">
                <Text className="text-xl font-bold text-gray-800 mb-2">
                  No restaurants found
                </Text>
                <Text className="text-gray-500 text-base text-center mb-6">
                  Try adjusting your filters or search terms
                </Text>
                <TouchableOpacity
                  onPress={handleResetFilters}
                  className="bg-[#FF7A00] px-6 py-3 rounded-xl shadow-sm"
                >
                  <Text className="text-white font-semibold text-base">Reset Filters</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        ) : (
          // Mobile: FlatList (original)
          <FlatList
            data={filteredRestaurants}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderHeader}
            renderItem={renderRestaurantItem}
            contentContainerClassName="px-4 pt-4"
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
            initialNumToRender={8}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh} 
                colors={['#f59e0b']} 
                tintColor="#f59e0b"
              />
            }
            ListEmptyComponent={
              <View className="items-center justify-center py-12">
                <Text className="text-lg font-semibold text-gray-800 mb-2">
                  No restaurants found
                </Text>
                <Text className="text-gray-500 text-sm text-center mb-4">
                  Try adjusting your filters or search terms
                </Text>
                <TouchableOpacity
                  onPress={handleResetFilters}
                  className="bg-amber-500 px-4 py-2 rounded-lg"
                >
                  <Text className="text-white font-semibold">Reset Filters</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </WebContainer>
    </View>
  );
};

export default RestaurantsScreen;
