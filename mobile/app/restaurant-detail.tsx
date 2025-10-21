import { View, Text, ScrollView, ActivityIndicator, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { getRestaurantById, getRestaurantMenu, getCategories } from '@/lib/appwrite';
import { Restaurant, MenuItem, Review } from '@/type';
import RestaurantHeader from '@/components/RestaurantHeader';
import MenuCard from '@/components/MenuCard';
import Filter from '@/components/Filter';
import cn from 'clsx';

const RestaurantDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  
  // Real data state
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);

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

  // Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const data = await getCategories();
        setCategories(data as any[]);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Set fallback categories if API fails
        setCategories([
          { $id: 'all', name: 'All', icon: '🍽️' },
          { $id: '1', name: 'Main Course', icon: '🍽️' },
          { $id: '2', name: 'Appetizers', icon: '🥗' },
          { $id: '3', name: 'Desserts', icon: '🍰' },
          { $id: '4', name: 'Drinks', icon: '🥤' }
        ]);
      }
    })();
  }, []);

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

  // Fetch reviews - Temporarily disabled until reviews collection is created
  useEffect(() => {
    if (!id) return;
    
    // TODO: Enable when reviews collection is created in database
    // (async () => {
    //   try {
    //     const data = await getRestaurantReviews(id);
    //     setReviews(data as any as Review[]);
    //   } catch (error) {
    //     console.error('Error fetching reviews:', error);
    //     // Set empty array if no reviews found
    //     setReviews([]);
    //   }
    // })();
    
    // For now, set empty reviews
    setReviews([]);
  }, [id]);

  // Filter menu by category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredMenuItems(menuItems);
    } else {
      // For now, skip category filtering since schema needs update
      setFilteredMenuItems(menuItems);
    }
  }, [selectedCategory, menuItems]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f59e0b" />
          <Text className="mt-4 text-gray-600">Loading restaurant...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <Text className="text-xl text-gray-600">Restaurant not found</Text>
          <TouchableOpacity 
            className="mt-4 px-6 py-3 bg-amber-500 rounded-full"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Restaurant Header */}
        <RestaurantHeader restaurant={restaurant} />

        {/* Tabs */}
        <View className="flex-row bg-white border-b border-gray-200 px-4">
          <TouchableOpacity
            className={cn(
              'flex-1 py-4 items-center border-b-2',
              activeTab === 'menu' ? 'border-amber-500' : 'border-transparent'
            )}
            onPress={() => setActiveTab('menu')}
          >
            <Text className={cn(
              'font-semibold',
              activeTab === 'menu' ? 'text-amber-500' : 'text-gray-500'
            )}>
              Menu
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className={cn(
              'flex-1 py-4 items-center border-b-2',
              activeTab === 'reviews' ? 'border-amber-500' : 'border-transparent'
            )}
            onPress={() => setActiveTab('reviews')}
          >
            <Text className={cn(
              'font-semibold',
              activeTab === 'reviews' ? 'text-amber-500' : 'text-gray-500'
            )}>
              Reviews ({reviews.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View className="px-4 py-4">
          {activeTab === 'menu' ? (
            <>
              {/* Category Filter */}
              {categories && categories.length > 0 && (
                <View className="mb-4">
                  <Filter categories={categories as any} />
                </View>
              )}

              {/* Menu Items */}
              {filteredMenuItems.length > 0 ? (
                <View className="gap-4">
                  {filteredMenuItems.map((item) => (
                    <TouchableOpacity
                      key={item.$id}
                      onPress={() => router.push({
                        pathname: '/menu-detail',
                        params: { 
                          id: item.$id,
                          restaurantId: restaurant.$id 
                        }
                      })}
                    >
                      <MenuCard item={item} restaurantId={restaurant.$id} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View className="items-center justify-center py-12">
                  <Text className="text-4xl mb-4">🍽️</Text>
                  <Text className="text-gray-600 text-center">
                    No menu items available
                  </Text>
                </View>
              )}
            </>
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
                        <Text className="text-lg">👤</Text>
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
              <View className="items-center justify-center py-12">
                <Text className="text-4xl mb-4">💬</Text>
                <Text className="text-gray-600 text-center">
                  No reviews yet
                </Text>
                <Text className="text-gray-500 text-sm text-center mt-2">
                  Be the first to review this restaurant
                </Text>
              </View>
            )
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default RestaurantDetailScreen;
