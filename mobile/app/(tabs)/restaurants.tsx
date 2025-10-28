import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl, Platform, TextInput, Image } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { getRestaurants } from '@/lib/appwrite';
import { RestaurantWithDistance, RestaurantFilters } from '@/type';
import RestaurantCard from '@/components/RestaurantCard';
import { RestaurantListSkeleton } from '@/components/LoadingSkeleton';
import cn from 'clsx';
import { icons } from '@/constants';

const RestaurantsScreen = () => {
  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
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
        userLocation?.latitude,
        userLocation?.longitude
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

  const renderHeader = () => (
    <View className="px-4 pb-2">
      {/* Search Bar */}
      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200 mb-4"
        style={Platform.OS === 'android' ? { elevation: 2 } : {}}
      >
        <Image
          source={icons.search}
          className="w-5 h-5 mr-3"
          resizeMode="contain"
          tintColor="#9CA3AF"
        />
        <TextInput
          className="flex-1 text-base"
          placeholder="Search restaurants, or area..."
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



      {/* Filters & Sort */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Filters & Sort</Text>
        
        {/* Distance Row */}
        {userLocation && (
          <View className="mb-2">
            <Text className="text-xs text-gray-600 mb-1">Max Distance</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {[2, 5, 10, 20].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border',
                      selectedDistance === distance 
                        ? 'bg-blue-100 border-blue-400' 
                        : 'bg-white border-gray-300'
                    )}
                    onPress={() => handleDistanceFilter(distance)}
                  >
                    <Text className={cn(
                      'text-xs font-medium',
                      selectedDistance === distance ? 'text-blue-700' : 'text-gray-700'
                    )}>
                      {distance} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Sort Options */}
        <View>
          <Text className="text-xs text-gray-600 mb-1">Sort By</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {[
                { value: 'rating', label: 'Rating'},
                { value: 'distance', label: 'Distance', disabled: !userLocation },
                { value: 'name', label: 'Name'},
                { value: 'newest', label: 'Newest' }
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  disabled={option.disabled}
                  className={cn(
                    'flex-row items-center px-3 py-1.5 rounded-lg border',
                    option.disabled 
                      ? 'bg-gray-200 border-gray-300'
                      : sortBy === option.value 
                        ? 'bg-green-100 border-green-400' 
                        : 'bg-white border-gray-300'
                  )}
                  onPress={() => !option.disabled && setSortBy(option.value as any)}
                >
                  <Text className={cn(
                    'text-xs font-medium',
                    option.disabled
                      ? 'text-gray-400'
                      : sortBy === option.value ? 'text-green-700' : 'text-gray-700'
                  )}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Results Summary */}
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm text-gray-600">
          {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
        </Text>
        
        {/* Clear Filters */}
        {(selectedDistance || statusFilter !== 'all') && (
          <TouchableOpacity
            onPress={() => {
              setSelectedDistance(null);
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="px-3 py-1 bg-gray-100 rounded-lg"
          >
            <Text className="text-xs text-gray-600">Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="px-4 pt-4 pb-2 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-800">Restaurants</Text>
          <Text className="text-sm text-gray-600 mt-1">
            Discovering amazing food...
          </Text>
        </View>
        <RestaurantListSkeleton count={6} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-4 pb-2 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Restaurants</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Discover amazing food delivered by drone
        </Text>
      </View>

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
            <Text className="text-6xl mb-4">🔍</Text>
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
    </SafeAreaView>
  );
};

export default RestaurantsScreen;
