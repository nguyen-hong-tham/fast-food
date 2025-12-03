import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, RefreshControl, Platform, TextInput, Image } from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();
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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

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
    // Reset to page 1 when filter changes
    setCurrentPage(1);
  }, [filteredResults]);

  // Calculate paginated data
  const paginatedRestaurants = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRestaurants.slice(startIndex, endIndex);
  }, [filteredRestaurants, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRestaurants.length / itemsPerPage);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page (mobile only)
    if (!isDesktop) {
      // Will be handled by FlatList scroll
    }
  }, [isDesktop]);

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

  // Pagination Component
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = isDesktop ? 7 : 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <View className={cn(
        "py-6 bg-white border-t border-gray-200",
        isDesktop ? "px-20" : "px-4"
      )}>
        <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
          {/* Previous Button */}
          <TouchableOpacity
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={cn(
              "rounded-lg px-3 py-2 border",
              currentPage === 1 
                ? "bg-gray-100 border-gray-200" 
                : "bg-white border-gray-300"
            )}
          >
            <Text className={cn(
              "font-semibold",
              currentPage === 1 ? "text-gray-400" : "text-gray-700"
            )}>
              ←
            </Text>
          </TouchableOpacity>

          {/* First Page */}
          {startPage > 1 && (
            <>
              <TouchableOpacity
                onPress={() => handlePageChange(1)}
                className="rounded-lg px-3 py-2 border bg-white border-gray-300"
              >
                <Text className="font-semibold text-gray-700">1</Text>
              </TouchableOpacity>
              {startPage > 2 && (
                <Text className="text-gray-400 px-1">...</Text>
              )}
            </>
          )}

          {/* Page Numbers */}
          {pageNumbers.map((page) => (
            <TouchableOpacity
              key={page}
              onPress={() => handlePageChange(page)}
              className={cn(
                "rounded-lg px-3 py-2 border",
                currentPage === page
                  ? "bg-amber-500 border-amber-500"
                  : "bg-white border-gray-300"
              )}
            >
              <Text className={cn(
                "font-semibold",
                currentPage === page ? "text-white" : "text-gray-700"
              )}>
                {page}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Last Page */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <Text className="text-gray-400 px-1">...</Text>
              )}
              <TouchableOpacity
                onPress={() => handlePageChange(totalPages)}
                className="rounded-lg px-3 py-2 border bg-white border-gray-300"
              >
                <Text className="font-semibold text-gray-700">{totalPages}</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Next Button */}
          <TouchableOpacity
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={cn(
              "rounded-lg px-3 py-2 border",
              currentPage === totalPages
                ? "bg-gray-100 border-gray-200"
                : "bg-white border-gray-300"
            )}
          >
            <Text className={cn(
              "font-semibold",
              currentPage === totalPages ? "text-gray-400" : "text-gray-700"
            )}>
              →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Page Info */}
        <Text className="text-center text-gray-500 text-sm mt-3">
          Page {currentPage} of {totalPages}
        </Text>
      </View>
    );
  };

  const handleResetFilters = useCallback(() => {
    setSelectedDistance(null);
    setStatusFilter('all');
    setSearchQuery('');
    setCurrentPage(1);
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
          returnKeyType="search"
          blurOnSubmit={false}
          autoCorrect={false}
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
          Showing {paginatedRestaurants.length} of {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''}
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
        <View 
          className="pb-2 bg-white border-b border-gray-200 px-4"
          style={{ paddingTop: insets.top + 16 }}
        >
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
        "pb-3 bg-white border-b border-gray-200",
        isDesktop ? "px-20" : "px-4"
      )}
      style={{ paddingTop: isDesktop ? 16 : insets.top + 16 }}
      >
        <Text className={cn(
          "font-bold text-gray-800",
          isDesktop ? "text-3xl" : "text-xl"
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
              <>
                <View className="px-20 flex flex-row flex-wrap" style={{ gap: 24 }}>
                  {paginatedRestaurants.map((restaurant) => (
                    <View key={restaurant.$id} style={{ width: '48%' }}>
                      <RestaurantCard restaurant={restaurant} />
                    </View>
                  ))}
                </View>
                {renderPagination()}
              </>
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
            data={paginatedRestaurants}
            keyExtractor={keyExtractor}
            ListHeaderComponent={renderHeader}
            renderItem={renderRestaurantItem}
            ListFooterComponent={renderPagination}
            contentContainerClassName="px-4 pt-4 pb-24"
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
