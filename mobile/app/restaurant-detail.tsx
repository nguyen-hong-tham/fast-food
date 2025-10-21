import { View, Text, ScrollView, ActivityIndicator, FlatList, Image, TouchableOpacity, Platform } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { getRestaurantById } from '@/lib/appwrite';
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
  
  // Mock data for testing since collections don't exist yet
  const mockCategories = [
    { $id: '1', name: 'Appetizers', icon: '🥗' },
    { $id: '2', name: 'Main Course', icon: '🍽️' },
    { $id: '3', name: 'Desserts', icon: '🍰' },
    { $id: '4', name: 'Drinks', icon: '🥤' }
  ];
  
  const mockMenuItems: MenuItem[] = [
    {
      $id: '1',
      name: restaurant?.name === 'cơm sườn' ? 'Cơm sườn nướng' : 'Bún riêu cua',
      description: restaurant?.name === 'cơm sườn' ? 'Cơm sườn nướng thơm ngon' : 'Bún riêu cua đậm đà',
      price: restaurant?.name === 'cơm sườn' ? 45000 : 35000,
      image_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400',
      calories: 450,
      protein: 25,
      rating: 4.5,
      type: 'main',
      restaurantId: id!,
      isAvailable: true,
      stock: 50,
      $sequence: 1,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $permissions: [],
      $databaseId: '',
      $collectionId: ''
    },
    {
      $id: '2',
      name: restaurant?.name === 'cơm sườn' ? 'Cơm sườn đặc biệt' : 'Bún riêu đặc biệt',
      description: restaurant?.name === 'cơm sườn' ? 'Combo cơm sườn với trứng ốp la' : 'Bún riêu với chả cua',
      price: restaurant?.name === 'cơm sườn' ? 55000 : 45000,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      calories: 550,
      protein: 30,
      rating: 4.7,
      type: 'main',
      restaurantId: id!,
      isAvailable: true,
      stock: 30,
      $sequence: 2,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
      $permissions: [],
      $databaseId: '',
      $collectionId: ''
    }
  ];

  const mockReviews: Review[] = [
    {
      $id: '1',
      userId: 'user1',
      restaurantId: id!,
      orderId: 'order1',
      overallRating: 5,
      foodQuality: 5,
      deliverySpeed: 4,
      service: 5,
      comment: 'Món ăn rất ngon, giao hàng nhanh!',
      images: [],
      isVisible: true,
      restaurantResponse: '',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      $sequence: 1,
      $createdAt: new Date(Date.now() - 86400000).toISOString(),
      $updatedAt: new Date(Date.now() - 86400000).toISOString(),
      $permissions: [],
      $databaseId: '',
      $collectionId: ''
    },
    {
      $id: '2',
      userId: 'user2',
      restaurantId: id!,
      orderId: 'order2',
      overallRating: 4,
      foodQuality: 4,
      deliverySpeed: 4,
      service: 4,
      comment: 'Chất lượng tốt, sẽ quay lại lần sau.',
      images: [],
      isVisible: true,
      restaurantResponse: 'Cảm ơn quý khách đã ủng hộ!',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      $sequence: 2,
      $createdAt: new Date(Date.now() - 172800000).toISOString(),
      $updatedAt: new Date(Date.now() - 172800000).toISOString(),
      $permissions: [],
      $databaseId: '',
      $collectionId: ''
    }
  ];
  
  // Menu state
  const [categories] = useState(mockCategories);
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
        
        // Set mock data after restaurant is loaded
        setMenuItems(mockMenuItems);
        setFilteredMenuItems(mockMenuItems);
        setReviews(mockReviews);
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Use mock data instead of API calls for now
  // This prevents the collection not found errors
  
  // Fetch menu items - Commented out to avoid collection errors
  // useEffect(() => {
  //   if (!id) return;
  //   (async () => {
  //     try {
  //       const data = await getRestaurantMenu(id);
  //       setMenuItems(data as any as MenuItem[]);
  //       setFilteredMenuItems(data as any as MenuItem[]);
  //     } catch (error) {
  //       console.error('Error fetching menu:', error);
  //       setMenuItems(mockMenuItems);
  //       setFilteredMenuItems(mockMenuItems);
  //     }
  //   })();
  // }, [id]);

  // Fetch reviews - Commented out to avoid collection errors  
  // useEffect(() => {
  //   if (!id) return;
  //   (async () => {
  //     try {
  //       const data = await getRestaurantReviews(id);
  //       setReviews(data as any as Review[]);
  //     } catch (error) {
  //       console.error('Error fetching reviews:', error);
  //       setReviews(mockReviews);
  //     }
  //   })();
  // }, [id]);

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
