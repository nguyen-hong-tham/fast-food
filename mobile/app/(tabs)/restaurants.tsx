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
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'name'>('rating');

  // Get user location (optional - will work without location)
  useEffect(() => {
    (async () => {
      try {
        // For now, we'll skip location to avoid dependency
        // You can add expo-location later if needed
        // const { status } = await Location.requestForegroundPermissionsAsync();
        // if (status !== 'granted') return;
        // const location = await Location.getCurrentPositionAsync({});
        // setUserLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
        
        // Mock location for Ho Chi Minh City
        setUserLocation({ latitude: 10.8231, longitude: 106.6297 });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    })();
  }, []);

  // Fetch cuisines
  useEffect(() => {
    (async () => {
      try {
        const availableCuisines = await getAvailableCuisines();
        setCuisines(availableCuisines);
      } catch (error) {
        console.error('Error fetching cuisines:', error);
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

      setRestaurants(data as RestaurantWithDistance[]);
      setFilteredRestaurants(data as RestaurantWithDistance[]);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [selectedCuisine, selectedRating, selectedDistance, sortBy, userLocation]);

  // Search filter
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter((restaurant) =>
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <View className="flex-row items-center bg-white rounded-xl px-4 py-3 border border-gray-200"
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
          placeholder="Search restaurants or cuisine..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Cuisine Filter */}
      <View className="mt-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Cuisine</Text>
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
                All
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

      {/* Rating & Distance Filter */}
      <View className="mt-4 flex-row gap-2">
        {/* Rating */}
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-700 mb-2">Min Rating</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {[4.0, 4.5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  className={cn(
                    'px-3 py-2 rounded-full border',
                    selectedRating === rating 
                      ? 'bg-amber-500 border-amber-500' 
                      : 'bg-white border-gray-300'
                  )}
                  style={Platform.OS === 'android' ? { elevation: 2 } : {}}
                  onPress={() => setSelectedRating(selectedRating === rating ? null : rating)}
                >
                  <Text className={cn(
                    'text-sm font-medium',
                    selectedRating === rating ? 'text-white' : 'text-gray-700'
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
            <Text className="text-sm font-semibold text-gray-700 mb-2">Max Distance</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {[5, 10, 15].map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    className={cn(
                      'px-3 py-2 rounded-full border',
                      selectedDistance === distance 
                        ? 'bg-amber-500 border-amber-500' 
                        : 'bg-white border-gray-300'
                    )}
                    style={Platform.OS === 'android' ? { elevation: 2 } : {}}
                    onPress={() => setSelectedDistance(selectedDistance === distance ? null : distance)}
                  >
                    <Text className={cn(
                      'text-sm font-medium',
                      selectedDistance === distance ? 'text-white' : 'text-gray-700'
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
      <View className="mt-4">
        <Text className="text-sm font-semibold text-gray-700 mb-2">Sort By</Text>
        <View className="flex-row gap-2">
          {[
            { value: 'rating', label: 'Rating' },
            { value: 'distance', label: 'Distance', disabled: !userLocation },
            { value: 'name', label: 'Name' }
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              disabled={option.disabled}
              className={cn(
                'px-4 py-2 rounded-full border',
                option.disabled 
                  ? 'bg-gray-200 border-gray-300'
                  : sortBy === option.value 
                    ? 'bg-amber-500 border-amber-500' 
                    : 'bg-white border-gray-300'
              )}
              style={Platform.OS === 'android' ? { elevation: 2 } : {}}
              onPress={() => !option.disabled && setSortBy(option.value as any)}
            >
              <Text className={cn(
                'text-sm font-medium',
                option.disabled
                  ? 'text-gray-400'
                  : sortBy === option.value ? 'text-white' : 'text-gray-700'
              )}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Results Count */}
      <View className="mt-4 mb-2">
        <Text className="text-sm text-gray-600">
          Found {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
        </Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="mt-4 text-gray-600">Loading restaurants...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Restaurants</Text>
        <Text className="text-sm text-gray-600 mt-1">
          Discover great food near you
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#f59e0b']} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-4xl mb-4">🍽️</Text>
            <Text className="text-gray-600 text-center">
              No restaurants found
            </Text>
            <Text className="text-gray-500 text-sm text-center mt-2">
              Try adjusting your filters
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default RestaurantsScreen;
