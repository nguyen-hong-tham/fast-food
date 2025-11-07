import { View, Text, ScrollView, ActivityIndicator, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { getRestaurantById, getRestaurantMenu, getRestaurantCategories } from '@/lib/appwrite';
import { Restaurant, MenuItem, Review } from '@/type';
import RestaurantHeader from '@/components/restaurant/RestaurantHeader';
import MenuCard from '@/components/restaurant/MenuCard';
import Filter from '@/components/restaurant/Filter';
import WebContainer from '@/components/common/WebContainer';
import { useResponsive } from '@/lib/responsive';
import cn from 'clsx';
import { getRestaurantReviewsWithUserInfo, getRestaurantAverageRating } from '@/lib/restaurant-reviews';
import ReviewCard from '@/components/rating/ReviewCard';

const RestaurantDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const { isDesktop } = useResponsive();
  const scrollViewRef = useRef<ScrollView>(null);
  const categoryRefs = useRef<{ [key: string]: number }>({});
  
  // Real data state
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [groupedMenuItems, setGroupedMenuItems] = useState<{ [key: string]: MenuItem[] }>({});
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    averageByCategory: {
      foodQuality: 0,
      deliverySpeed: 0,
      service: 0,
    },
  });
  const [reviewSortBy, setReviewSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest');
  const [minRatingFilter, setMinRatingFilter] = useState<number | undefined>(undefined);

  // Fetch restaurant details
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const data = await getRestaurantById(id);
        setRestaurant(data as any as Restaurant);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Fetch categories for this restaurant
  useEffect(() => {
    if (!id) return;
    
    (async () => {
      try {
        const data = await getRestaurantCategories(id);
        setCategories(data as any);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    })();
  }, [id]);

  // Fetch menu items
  useEffect(() => {
    if (!id) return;
    
    (async () => {
      try {
        const data = await getRestaurantMenu(id);
        setMenuItems(data as any as MenuItem[]);
        setFilteredMenuItems(data as any as MenuItem[]);
      } catch (error) {
        console.error('Error fetching menu:', error);
        // Set empty array if no menu items found
        setMenuItems([]);
        setFilteredMenuItems([]);
      }
    })();
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    if (!id) return;
    
    loadReviews();
  }, [id, reviewSortBy, minRatingFilter]);

  const loadReviews = async () => {
    if (!id) return;
    
    try {
      const [reviewsData, ratingData] = await Promise.all([
        getRestaurantReviewsWithUserInfo(id, 50),
        getRestaurantAverageRating(id),
      ]);

      // Apply filters and sorting
      let filteredReviews = reviewsData;
      
      if (minRatingFilter) {
        filteredReviews = filteredReviews.filter((r: any) => r.overallRating >= minRatingFilter);
      }

      // Sort
      if (reviewSortBy === 'highest') {
        filteredReviews.sort((a: any, b: any) => b.overallRating - a.overallRating);
      } else if (reviewSortBy === 'lowest') {
        filteredReviews.sort((a: any, b: any) => a.overallRating - b.overallRating);
      }
      // 'newest' is default from API

      setReviews(filteredReviews);
      setRating(ratingData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  // Filter menu by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredMenuItems(menuItems);
    } else {
      // Filter by category relationship
      const filtered = menuItems.filter((item: any) => {
        // Check if item has categories relationship
        if (!item.categories) return false;
        
        // Handle both array and single object
        if (Array.isArray(item.categories)) {
          return item.categories.some((cat: any) => cat.$id === selectedCategory);
        }
        
        // Single category object
        return item.categories.$id === selectedCategory;
      });
      
      setFilteredMenuItems(filtered);
    }
  }, [selectedCategory, menuItems]);

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className="mt-4 text-gray-600">Loading restaurant...</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-xl text-gray-600">Restaurant not found</Text>
        <TouchableOpacity 
          className="mt-4 px-6 py-3 bg-amber-500 rounded-full"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      
      {isDesktop ? (
        // Desktop: 2-Column Layout with better styling
        <WebContainer maxWidth="container">
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-20"
          >
            <View className="flex-row gap-8 px-20 py-8">
              {/* Left: Restaurant Info (Sticky) */}
              <View className="w-1/3">
                <View className="sticky top-4">
                  <RestaurantHeader restaurant={restaurant} />
                  
                  {/* Tabs - Better styling */}
                  <View className="mt-8 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                    <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                      Browse
                    </Text>
                    
                    <TouchableOpacity
                      className={cn(
                        'py-3.5 px-4 rounded-xl transition-all duration-200 mb-2',
                        activeTab === 'menu' ? 'bg-primary shadow-sm' : 'bg-transparent hover:bg-gray-50'
                      )}
                      onPress={() => setActiveTab('menu')}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Text className="text-xl mr-3">🍽️</Text>
                          <Text className={cn(
                            'font-semibold text-base',
                            activeTab === 'menu' ? 'text-white' : 'text-gray-700'
                          )}>
                            Our Menu
                          </Text>
                        </View>
                        <View className={cn(
                          'px-2 py-1 rounded-lg',
                          activeTab === 'menu' ? 'bg-white/20' : 'bg-gray-100'
                        )}>
                          <Text className={cn(
                            'text-xs font-bold',
                            activeTab === 'menu' ? 'text-white' : 'text-gray-600'
                          )}>
                            {filteredMenuItems.length}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      className={cn(
                        'py-3.5 px-4 rounded-xl transition-all duration-200',
                        activeTab === 'reviews' ? 'bg-primary shadow-sm' : 'bg-transparent hover:bg-gray-50'
                      )}
                      onPress={() => setActiveTab('reviews')}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Text className="text-xl mr-3">⭐</Text>
                          <Text className={cn(
                            'font-semibold text-base',
                            activeTab === 'reviews' ? 'text-white' : 'text-gray-700'
                          )}>
                            Reviews
                          </Text>
                        </View>
                        <View className={cn(
                          'px-2 py-1 rounded-lg',
                          activeTab === 'reviews' ? 'bg-white/20' : 'bg-gray-100'
                        )}>
                          <Text className={cn(
                            'text-xs font-bold',
                            activeTab === 'reviews' ? 'text-white' : 'text-gray-600'
                          )}>
                            {reviews.length}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Restaurant Info Card */}
                  <View className="mt-6 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <Text className="text-sm font-semibold text-gray-700 mb-4">Restaurant Info</Text>
                    
                    <View className="space-y-3">
                      <View className="flex-row items-center">
                        <Text className="text-base mr-2">Location: </Text>
                        <Text className="text-sm text-gray-600 flex-1" numberOfLines={2}>
                          {restaurant.address}
                        </Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <Text className="text-base mr-2">⏱️</Text>
                        <Text className="text-sm text-gray-600">
                          {restaurant.estimatedDeliveryTime || 30}-{(restaurant.estimatedDeliveryTime || 30) + 15} min
                        </Text>
                      </View>
                      
                      {restaurant.minimumOrder && (
                        <View className="flex-row items-center">
                          <Text className="text-base mr-2">💰</Text>
                          <Text className="text-sm text-gray-600">
                            Min. order: {restaurant.minimumOrder.toLocaleString('vi-VN')}₫
                          </Text>
                        </View>
                      )}
                      
                      <View className="flex-row items-center">
                        <Text className="text-base mr-2">
                          {restaurant.status === 'active' ? '✅' : '❌'}
                        </Text>
                        <Text className={cn(
                          'text-sm font-medium',
                          restaurant.status === 'active' ? 'text-green-600' : 'text-gray-500'
                        )}>
                          {restaurant.status === 'active' ? 'Open Now' : 'Closed'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Right: Content (Menu/Reviews) - Wider */}
              <View className="flex-1">
                {activeTab === 'menu' ? (
                  <View>
                    {/* Category Filter - Horizontal Tabs for Desktop */}
                    {categories && categories.length > 0 && (
                      <View className="mb-8 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          Filter by Category
                        </Text>
                        
                        <View className="flex-row flex-wrap gap-3">
                          {/* All Items */}
                          <TouchableOpacity
                            onPress={() => setSelectedCategory('all')}
                            className={cn(
                              'px-5 py-2.5 rounded-xl border-2 transition-all duration-200',
                              selectedCategory === 'all' 
                                ? 'bg-primary border-primary shadow-sm' 
                                : 'bg-white border-gray-200 hover:border-primary/30'
                            )}
                          >
                            <Text className={cn(
                              'font-semibold text-sm',
                              selectedCategory === 'all' ? 'text-white' : 'text-gray-700'
                            )}>
                              All Items ({menuItems.length})
                            </Text>
                          </TouchableOpacity>

                          {/* Category Tabs */}
                          {categories.map((category: any) => {
                            const categoryItemCount = menuItems.filter((item: any) => {
                              if (!item.categories) return false;
                              if (Array.isArray(item.categories)) {
                                return item.categories.some((cat: any) => cat.$id === category.$id);
                              }
                              return item.categories.$id === category.$id;
                            }).length;

                            return (
                              <TouchableOpacity
                                key={category.$id}
                                onPress={() => setSelectedCategory(category.$id)}
                                className={cn(
                                  'px-5 py-2.5 rounded-xl border-2 transition-all duration-200',
                                  selectedCategory === category.$id 
                                    ? 'bg-primary border-primary shadow-sm' 
                                    : 'bg-white border-gray-200 hover:border-primary/30'
                                )}
                              >
                                <Text className={cn(
                                  'font-semibold text-sm',
                                  selectedCategory === category.$id ? 'text-white' : 'text-gray-700'
                                )}>
                                  {category.name} ({categoryItemCount})
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    )}

                    {/* Menu Items Header - Better styling */}
                    {filteredMenuItems.length > 0 && (
                      <View className="mb-8">
                        <Text className="text-3xl font-bold text-gray-900 mb-2">
                          {selectedCategory === 'all' 
                            ? 'All Dishes' 
                            : categories.find((c: any) => c.$id === selectedCategory)?.name || 'Popular Dishes'}
                        </Text>
                        <Text className="text-base text-gray-500">
                          {filteredMenuItems.length} delicious items to choose from
                        </Text>
                      </View>
                    )}

                    {/* Menu Items - 2 Column Grid with better spacing */}
                    {filteredMenuItems.length > 0 ? (
                      <View className="flex flex-row flex-wrap" style={{ gap: 24 }}>
                        {filteredMenuItems.map((item) => (
                          <View key={item.$id} style={{ width: '48%' }}>
                            <MenuCard item={item} restaurantId={restaurant.$id} />
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View className="items-center justify-center py-16 bg-white rounded-2xl">
                        <Text className="text-6xl mb-4">🍽️</Text>
                        <Text className="text-lg font-semibold text-gray-700 mb-2">
                          No Menu Items
                        </Text>
                        <Text className="text-sm text-gray-500 text-center px-8">
                          This restaurant hasn't added any menu items yet.
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View className="bg-white rounded-2xl p-6">
                    <Text className="text-xl font-bold mb-4">Customer Reviews</Text>
                    {reviews.length > 0 ? (
                      <View>
                        {/* Reviews content */}
                      </View>
                    ) : (
                      <View className="items-center py-12">
                        <Text className="text-4xl mb-3">💬</Text>
                        <Text className="text-gray-600">No reviews yet</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </WebContainer>
      ) : (
        // Mobile: Original Single Column Layout
        <ScrollView showsVerticalScrollIndicator={false}>
        {/* Restaurant Header */}
        <RestaurantHeader restaurant={restaurant} />

        {/* Tabs */}
        <View className="flex-row bg-white shadow-sm px-4">
          <TouchableOpacity
            className={cn(
              'flex-1 py-4 items-center border-b-3',
              activeTab === 'menu' ? 'border-amber-500' : 'border-transparent'
            )}
            onPress={() => setActiveTab('menu')}
          >
            <Text className={cn(
              'font-bold text-base',
              activeTab === 'menu' ? 'text-amber-500' : 'text-gray-400'
            )}>
              Our Menu
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={cn(
              'flex-1 py-4 items-center border-b-3',
              activeTab === 'reviews' ? 'border-amber-500' : 'border-transparent'
            )}
            onPress={() => setActiveTab('reviews')}
          >
            <Text className={cn(
              'font-bold text-base',
              activeTab === 'reviews' ? 'text-amber-500' : 'text-gray-400'
            )}>
              Reviews ({reviews.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="flex-1 bg-gray-50">
          {activeTab === 'menu' ? (
            <View className="pt-6">
              {/* Category Filter - Horizontal Scrollable Tabs */}
              {categories && categories.length > 0 && (
                <View className="mb-6">
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="px-4 gap-3"
                  >
                    {/* All Items Tab */}
                    <TouchableOpacity
                      onPress={() => setSelectedCategory('all')}
                      className={cn(
                        'px-5 py-3 rounded-full border-2',
                        selectedCategory === 'all' 
                          ? 'bg-amber-500 border-amber-500' 
                          : 'bg-white border-gray-200'
                      )}
                    >
                      <Text className={cn(
                        'font-semibold text-sm',
                        selectedCategory === 'all' ? 'text-white' : 'text-gray-700'
                      )}>
                        All ({menuItems.length})
                      </Text>
                    </TouchableOpacity>

                    {/* Category Tabs */}
                    {categories.map((category: any) => {
                      const categoryItemCount = menuItems.filter((item: any) => {
                        if (!item.categories) return false;
                        if (Array.isArray(item.categories)) {
                          return item.categories.some((cat: any) => cat.$id === category.$id);
                        }
                        return item.categories.$id === category.$id;
                      }).length;

                      return (
                        <TouchableOpacity
                          key={category.$id}
                          onPress={() => setSelectedCategory(category.$id)}
                          className={cn(
                            'px-5 py-3 rounded-full border-2',
                            selectedCategory === category.$id 
                              ? 'bg-amber-500 border-amber-500' 
                              : 'bg-white border-gray-200'
                          )}
                        >
                          <Text className={cn(
                            'font-semibold text-sm',
                            selectedCategory === category.$id ? 'text-white' : 'text-gray-700'
                          )}>
                            {category.name} ({categoryItemCount})
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              <View className="px-4">
                {/* Menu Items Header */}
                {filteredMenuItems.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-xl font-bold text-gray-900 mb-1">
                      {selectedCategory === 'all' 
                        ? 'All Dishes' 
                        : categories.find((c: any) => c.$id === selectedCategory)?.name || 'Dishes'}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {filteredMenuItems.length} items available
                    </Text>
                  </View>
                )}

                {/* Menu Items */}
                {filteredMenuItems.length > 0 ? (
                  <View className="flex-row flex-wrap justify-between">
                    {filteredMenuItems.map((item) => (
                      <View key={item.$id} className="w-[48%] mb-4">
                        <MenuCard item={item} restaurantId={restaurant.$id} />
                      </View>
                    ))}
                  </View>
                ) : (
                  <View className="items-center justify-center py-16 bg-white rounded-2xl mx-2">
                    <Text className="text-6xl mb-4">🍽️</Text>
                    <Text className="text-lg font-semibold text-gray-700 mb-2">
                      No Menu Items
                    </Text>
                    <Text className="text-sm text-gray-500 text-center px-8">
                      {selectedCategory === 'all' 
                        ? "This restaurant hasn't added any menu items yet. Check back later!"
                        : "No items in this category yet."}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            /* Reviews Section */
            reviews.length > 0 ? (
              <View className="gap-4">
                {reviews.map((review) => (
                  <View 
                    key={review.$id}
                    className="bg-white rounded-xl p-4"
                    style={Platform.OS === 'android' ? { elevation: 2 } : {}}
                  >
                    {/* Reviewer Info */}
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mr-3">
                        <Text className="text-lg"></Text>
                      </View>
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-800">
                          Customer
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>

                    {/* Ratings */}
                    <View className="flex-row items-center mb-2">
                      <Text className="text-yellow-500 text-base mr-2">
                        {'★'.repeat(Math.round(review.overallRating))}
                        {'☆'.repeat(5 - Math.round(review.overallRating))}
                      </Text>
                      <Text className="text-sm font-semibold text-gray-700">
                        {review.overallRating.toFixed(1)}
                      </Text>
                    </View>

                    {/* Comment */}
                    {review.comment && (
                      <Text className="text-gray-700 leading-5">
                        {review.comment}
                      </Text>
                    )}

                    {/* Detailed Ratings */}
                    {(review.foodQuality || review.deliverySpeed || review.service) && (
                      <View className="mt-3 pt-3 border-t border-gray-200 flex-row justify-around">
                        {review.foodQuality && (
                          <View className="items-center">
                            <Text className="text-xs text-gray-500 mb-1">Food</Text>
                            <Text className="text-sm font-semibold">{review.foodQuality.toFixed(1)}</Text>
                          </View>
                        )}
                        {review.deliverySpeed && (
                          <View className="items-center">
                            <Text className="text-xs text-gray-500 mb-1">Delivery</Text>
                            <Text className="text-sm font-semibold">{review.deliverySpeed.toFixed(1)}</Text>
                          </View>
                        )}
                        {review.service && (
                          <View className="items-center">
                            <Text className="text-xs text-gray-500 mb-1">Service</Text>
                            <Text className="text-sm font-semibold">{review.service.toFixed(1)}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Restaurant Response */}
                    {review.restaurantResponse && (
                      <View className="mt-3 bg-amber-50 rounded-lg p-3">
                        <Text className="text-xs font-semibold text-gray-700 mb-1">
                          Response from {restaurant.name}
                        </Text>
                        <Text className="text-sm text-gray-700">
                          {review.restaurantResponse}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center justify-center py-16 bg-white rounded-2xl mx-6 mt-6">
                <Text className="text-6xl mb-4">⭐</Text>
                <Text className="text-lg font-semibold text-gray-700 mb-2">
                  No Reviews Yet
                </Text>
                <Text className="text-sm text-gray-500 text-center px-8">
                  Be the first to share your experience about this restaurant!
                </Text>
                <TouchableOpacity className="mt-4 bg-amber-100 px-6 py-2 rounded-full">
                  <Text className="text-amber-600 font-semibold">Write a Review</Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="h-32" />
      </ScrollView>
      )}
    </View>
  );
};

export default RestaurantDetailScreen;
