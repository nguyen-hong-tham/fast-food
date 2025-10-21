import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl, Platform, TextInput, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRestaurants, getAvailableCuisines } from '@/lib/appwrite';
import { RestaurantWithDistance, RestaurantFilters } from '@/type';
import RestaurantCard from '@/components/RestaurantCard';
import cn from 'clsx';
import { icons } from '@/constants';

const RestaurantsScreen = () => {
  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'name' | 'newest'>('rating');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'active'>('active');

  // Get user location (mock for Ho Chi Minh City)
  useEffect(() => {
    // Mock location for Ho Chi Minh City
    setUserLocation({ latitude: 10.8231, longitude: 106.6297 });
  }, []);

  // Fetch cuisines
  useEffect(() => {
    (async () => {
      try {
        const availableCuisines = await getAvailableCuisines();
        setCuisines(availableCuisines);
      } catch (error) {
        console.error('Error fetching cuisines:', error);
        // Fallback cuisines
        setCuisines(['Vietnamese', 'Korean', 'Japanese', 'Thai', 'Chinese', 'Western', 'Fast Food']);
      }
    })();
  }, []);

  // Fetch restaurants
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      
      const filters: RestaurantFilters = {
        sortBy
      };

      if (selectedCuisine && selectedCuisine !== 'all') {
        filters.cuisine = selectedCuisine;
      }

      if (selectedRating) {
        filters.rating = selectedRating;
      }

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
  }, [selectedCuisine, selectedRating, selectedDistance, sortBy, statusFilter, userLocation]);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, restaurants]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRestaurants();
    setRefreshing(false);
  };

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
          placeholder="Search restaurants, cuisine, or area..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text className="text-gray-400 text-lg">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Filters */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Quick Filters</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {[
              { id: 'all', label: 'All', icon: '🍽️' },
              { id: 'active', label: 'Active', icon: '✅' },
              { id: 'open', label: 'Open Now', icon: '🕐' }
            ].map((filter) => (
              <TouchableOpacity
                key={filter.id}
                className={cn(
                  'flex-row items-center px-4 py-2 rounded-full border',
                  statusFilter === filter.id 
                    ? 'bg-amber-500 border-amber-500' 
                    : 'bg-white border-gray-300'
                )}
                style={Platform.OS === 'android' ? { elevation: 2 } : {}}
                onPress={() => setStatusFilter(filter.id as any)}
              >
                <Text className="mr-2">{filter.icon}</Text>
                <Text className={cn(
                  'text-sm font-medium',
                  statusFilter === filter.id ? 'text-white' : 'text-gray-700'
                )}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Cuisine Filter */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Cuisine Types</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            <TouchableOpacity
              className={cn(
                'px-4 py-2 rounded-full border',
                selectedCuisine === 'all' 
                  ? 'bg-amber-500 border-amber-500' 
                  : 'bg-white border-gray-300'
              )}
              style={Platform.OS === 'android' ? { elevation: 2 } : {}}
              onPress={() => setSelectedCuisine('all')}
            >
              <Text className={cn(
                'text-sm font-medium',
                selectedCuisine === 'all' ? 'text-white' : 'text-gray-700'
              )}>
                All Cuisines
              </Text>
            </TouchableOpacity>
            {cuisines.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                className={cn(
                  'px-4 py-2 rounded-full border',
                  selectedCuisine === cuisine 
                    ? 'bg-amber-500 border-amber-500' 
                    : 'bg-white border-gray-300'
                )}
                style={Platform.OS === 'android' ? { elevation: 2 } : {}}
                onPress={() => setSelectedCuisine(cuisine)}
              >
                <Text className={cn(
                  'text-sm font-medium',
                  selectedCuisine === cuisine ? 'text-white' : 'text-gray-700'
                )}>
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Advanced Filters */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Filters & Sort</Text>
        
        {/* Rating & Distance Row */}
        <View className="flex-row gap-2 mb-2">
          {/* Rating */}
          <View className="flex-1">
            <Text className="text-xs text-gray-600 mb-1">Minimum Rating</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {[4.0, 4.2, 4.5, 4.8].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    className={cn(
                      'px-3 py-1.5 rounded-lg border',
                      selectedRating === rating 
                        ? 'bg-yellow-100 border-yellow-400' 
                        : 'bg-white border-gray-300'
                    )}
                    onPress={() => setSelectedRating(selectedRating === rating ? null : rating)}
                  >
                    <Text className={cn(
                      'text-xs font-medium',
                      selectedRating === rating ? 'text-yellow-700' : 'text-gray-700'
                    )}>
                      {rating}+ ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Distance */}
          {userLocation && (
            <View className="flex-1">
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
                      onPress={() => setSelectedDistance(selectedDistance === distance ? null : distance)}
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
        </View>

        {/* Sort Options */}
        <View>
          <Text className="text-xs text-gray-600 mb-1">Sort By</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {[
                { value: 'rating', label: 'Rating', icon: '⭐' },
                { value: 'distance', label: 'Distance', icon: '📍', disabled: !userLocation },
                { value: 'name', label: 'Name', icon: '🔤' },
                { value: 'newest', label: 'Newest', icon: '🆕' }
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
                  <Text className="mr-1 text-xs">{option.icon}</Text>
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
        {(selectedCuisine !== 'all' || selectedRating || selectedDistance || statusFilter !== 'active') && (
          <TouchableOpacity
            onPress={() => {
              setSelectedCuisine('all');
              setSelectedRating(null);
              setSelectedDistance(null);
              setStatusFilter('active');
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
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="mt-4 text-gray-600">Discovering restaurants...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-4 pt-4 pb-2 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Restaurants</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Discover amazing food delivered by drone 🚁
        </Text>
      </View>

      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.$id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => <RestaurantCard restaurant={item} />}
        contentContainerClassName="px-4 pt-4"
        showsVerticalScrollIndicator={false}
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
            <Text className="text-6xl mb-4">🍽️</Text>
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              No restaurants found
            </Text>
            <Text className="text-gray-500 text-sm text-center mb-4">
              Try adjusting your filters or search terms
            </Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedCuisine('all');
                setSelectedRating(null);
                setSelectedDistance(null);
                setStatusFilter('active');
                setSearchQuery('');
              }}
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
