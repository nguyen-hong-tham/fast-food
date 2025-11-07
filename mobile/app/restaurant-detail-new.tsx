import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { getRestaurantById, getRestaurantMenu, getRestaurantCategories } from '@/lib/appwrite';
import { Restaurant, MenuItem } from '@/type';
import RestaurantHeader from '@/components/restaurant/RestaurantHeader';
import MenuCard from '@/components/restaurant/MenuCard';
import WebContainer from '@/components/common/WebContainer';
import { useResponsive } from '@/lib/responsive';
import cn from 'clsx';
import { getRestaurantReviewsWithUserInfo, getRestaurantAverageRating } from '@/lib/restaurant-reviews';
import ReviewCard from '@/components/rating/ReviewCard';

interface GroupedMenu {
  categoryId: string;
  categoryName: string;
  items: MenuItem[];
}

const RestaurantDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const { isDesktop } = useResponsive();
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<{ [key: string]: number }>({});
  
  // Menu data
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [groupedMenu, setGroupedMenu] = useState<GroupedMenu[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    averageByCategory: { foodQuality: 0, deliverySpeed: 0, service: 0 },
  });

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
    if (!id) return;
    (async () => {
      try {
        const data = await getRestaurantCategories(id);
        console.log('📂 Categories loaded:', data);
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
        console.log('🍽️ Menu items loaded:', data);
        setMenuItems(data as any as MenuItem[]);
      } catch (error) {
        console.error('Error fetching menu:', error);
        setMenuItems([]);
      }
    })();
  }, [id]);

  // Group menu items by category
  useEffect(() => {
    if (menuItems.length === 0) {
      setGroupedMenu([]);
      return;
    }

    const grouped: GroupedMenu[] = [];
    
    // Group items by categories
    categories.forEach((category) => {
      const items = menuItems.filter((item: any) => {
        if (!item.categories) return false;
        
        // Handle both string ID and object
        const categoryId = typeof item.categories === 'string' 
          ? item.categories 
          : item.categories.$id;
        
        return categoryId === category.$id;
      });

      if (items.length > 0) {
        grouped.push({
          categoryId: category.$id,
          categoryName: category.name,
          items,
        });
      }
    });

    // Add uncategorized items
    const uncategorized = menuItems.filter((item: any) => !item.categories);
    if (uncategorized.length > 0) {
      grouped.push({
        categoryId: 'uncategorized',
        categoryName: 'Uncategorized',
        items: uncategorized,
      });
    }

    console.log('📦 Grouped menu:', grouped);
    setGroupedMenu(grouped);
  }, [menuItems, categories]);

  // Fetch reviews
  useEffect(() => {
    if (!id) return;
    loadReviews();
  }, [id]);

  const loadReviews = async () => {
    if (!id) return;
    try {
      const [reviewsData, ratingData] = await Promise.all([
        getRestaurantReviewsWithUserInfo(id, 50),
        getRestaurantAverageRating(id),
      ]);
      setReviews(reviewsData);
      setRating(ratingData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  // Scroll to category section
  const scrollToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    if (categoryId === 'all') {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    const yOffset = sectionRefs.current[categoryId];
    if (yOffset !== undefined) {
      // Offset for header and tabs
      scrollViewRef.current?.scrollTo({ y: yOffset - 100, animated: true });
    }
  };

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

  const totalMenuCount = menuItems.length;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} // Make category tabs sticky
      >
        {/* Restaurant Header */}
        <RestaurantHeader restaurant={restaurant} />

        {/* Tabs (Menu / Reviews) */}
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
              Our Menu ({totalMenuCount})
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

        {activeTab === 'menu' ? (
          <View className="bg-gray-50">
            {/* Category Filter Tabs */}
            {categories.length > 0 && (
              <View className="bg-white py-4">
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerClassName="px-4 gap-2"
                >
                  {/* All Items Tab */}
                  <TouchableOpacity
                    onPress={() => scrollToCategory('all')}
                    className={cn(
                      'px-4 py-2 rounded-full border',
                      selectedCategory === 'all' 
                        ? 'bg-amber-500 border-amber-500' 
                        : 'bg-white border-gray-300'
                    )}
                  >
                    <Text className={cn(
                      'font-semibold text-sm',
                      selectedCategory === 'all' ? 'text-white' : 'text-gray-700'
                    )}>
                      All Items
                    </Text>
                  </TouchableOpacity>

                  {/* Category Tabs */}
                  {groupedMenu.map((group) => (
                    <TouchableOpacity
                      key={group.categoryId}
                      onPress={() => scrollToCategory(group.categoryId)}
                      className={cn(
                        'px-4 py-2 rounded-full border',
                        selectedCategory === group.categoryId 
                          ? 'bg-amber-500 border-amber-500' 
                          : 'bg-white border-gray-300'
                      )}
                    >
                      <Text className={cn(
                        'font-semibold text-sm',
                        selectedCategory === group.categoryId ? 'text-white' : 'text-gray-700'
                      )}>
                        {group.categoryName} ({group.items.length})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Grouped Menu Items */}
            <View className="px-4 py-4">
              {groupedMenu.length > 0 ? (
                groupedMenu.map((group) => (
                  <View 
                    key={group.categoryId}
                    onLayout={(event) => {
                      const layout = event.nativeEvent.layout;
                      sectionRefs.current[group.categoryId] = layout.y;
                    }}
                    className="mb-8"
                  >
                    {/* Category Title */}
                    <Text className="text-2xl font-bold text-gray-900 mb-4">
                      {group.categoryName}
                    </Text>

                    {/* Menu Items in this category */}
                    <View className="flex-row flex-wrap justify-between">
                      {group.items.map((item) => (
                        <View key={item.$id} className="w-[48%] mb-4">
                          <MenuCard item={item} restaurantId={restaurant.$id} />
                        </View>
                      ))}
                    </View>
                  </View>
                ))
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
          </View>
        ) : (
          /* Reviews Section */
          <View className="px-4 py-4">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewCard key={review.$id} review={review} />
              ))
            ) : (
              <View className="items-center py-16 bg-white rounded-2xl">
                <Text className="text-4xl mb-3">💬</Text>
                <Text className="text-gray-600">No reviews yet</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default RestaurantDetailScreen;
