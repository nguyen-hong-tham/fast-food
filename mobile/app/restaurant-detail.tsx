import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Modal, TextInput, Image } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getRestaurantById, getRestaurantMenu, getRestaurantCategories } from '@/lib/appwrite';
import { Restaurant, MenuItem } from '@/type';
import RestaurantHeader from '@/components/restaurant/RestaurantHeader';
import MenuListItem from '../components/restaurant/MenuListItem';
import WebContainer from '@/components/common/WebContainer';
import { useResponsive } from '@/lib/responsive';
import cn from 'clsx';
import { getRestaurantReviewsWithUserInfo, getRestaurantAverageRating } from '@/lib/restaurant-reviews';
import ReviewCard from '@/components/rating/ReviewCard';
import { icons } from '../constants';


interface GroupedMenu {
  categoryId: string;
  categoryName: string;
  items: MenuItem[];
}

const RestaurantDetailScreen = () => {
  const params = useLocalSearchParams<{ id: string }>();
  const id = params?.id;
  const { isDesktop } = useResponsive();
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<{ [key: string]: number }>({});
  const [navigationReady, setNavigationReady] = useState(false);
  
  // Menu data
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [groupedMenu, setGroupedMenu] = useState<GroupedMenu[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    averageByCategory: { foodQuality: 0, deliverySpeed: 0, service: 0 },
  });

  // Initialize navigation ready state after first render
  useEffect(() => {
    // Small delay to ensure navigation context is ready
    const timer = setTimeout(() => {
      setNavigationReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Fetch restaurant details
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const data = await getRestaurantById(id);
        setRestaurant(data as any as Restaurant);
        
        // Lấy reviews từ relationship
        if (data.reviews && Array.isArray(data.reviews)) {
          setReviews(data.reviews.filter((r: any) => r.isVisible !== false));
        }
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
        setCategories(data as any);
      } catch (error) {
        // Silently handle - categories collection may not exist
        // Will use auto-categorization instead
        setCategories([]);
        if (__DEV__) {
          console.log('ℹ️ No categories collection - using auto-categorization');
        }
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
      } catch (error) {
        console.error('Error fetching menu:', error);
        setMenuItems([]);
      }
    })();
  }, [id]);

  // Group menu items by category - ALWAYS include categories for dropdown
  useEffect(() => {
    if (menuItems.length === 0) {
      setGroupedMenu([]);
      return;
    }

    const grouped: GroupedMenu[] = [];
    
    // If no categories, create fake categories by analyzing menu items
    if (categories.length === 0) {
      // Try to auto-categorize by item name patterns
      const pizzas = menuItems.filter((item: any) => 
        item.name.toLowerCase().includes('pizza')
      );
      const pastas = menuItems.filter((item: any) => 
        item.name.toLowerCase().includes('pasta') || 
        item.name.toLowerCase().includes('spaghetti')
      );
      const others = menuItems.filter((item: any) => 
        !item.name.toLowerCase().includes('pizza') &&
        !item.name.toLowerCase().includes('pasta') &&
        !item.name.toLowerCase().includes('spaghetti')
      );

      if (pizzas.length > 0) {
        grouped.push({
          categoryId: 'auto-pizza',
          categoryName: 'Pizza',
          items: pizzas,
        });
      }
      if (pastas.length > 0) {
        grouped.push({
          categoryId: 'auto-pasta',
          categoryName: 'Pasta & Spaghetti',
          items: pastas,
        });
      }
      if (others.length > 0) {
        grouped.push({
          categoryId: 'auto-others',
          categoryName: 'Other Items',
          items: others,
        });
      }
      
      // If still no categories, just create one "All Items"
      if (grouped.length === 0) {
        grouped.push({
          categoryId: 'all',
          categoryName: 'All Items',
          items: menuItems,
        });
      }
      
      setGroupedMenu(grouped);
      setSelectedCategory('all');
      return;
    }
    
    // Has categories - group by them
    categories.forEach((category) => {
      const items = menuItems.filter((item: any) => {
        if (!item.categories) return false;
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

    const categorizedItemIds = new Set(grouped.flatMap(g => g.items.map(i => i.$id)));
    const uncategorized = menuItems.filter((item: any) => !categorizedItemIds.has(item.$id));
    
    if (uncategorized.length > 0) {
      grouped.push({
        categoryId: 'uncategorized',
        categoryName: 'Other Items',
        items: uncategorized,
      });
    }

    setGroupedMenu(grouped);
    if (__DEV__ && grouped.length > 0) {
      console.log('📋 Categories:', grouped.map(g => `${g.categoryName} (${g.items.length})`).join(', '));
    }
  }, [menuItems, categories]);

  // Calculate rating stats from reviews
  useEffect(() => {
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum: number, r: any) => sum + (r.overallRating || 0), 0);
      const average = totalRating / reviews.length;
      
      const distribution = reviews.reduce(
        (acc: any, review: any) => {
          const rating = review.overallRating || 0;
          if (rating >= 1 && rating <= 5) {
            acc[rating as 1 | 2 | 3 | 4 | 5]++;
          }
          return acc;
        },
        { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      );
      
      setRating({
        average: Math.round(average * 10) / 10,
        total: reviews.length,
        distribution,
        averageByCategory: {
          foodQuality: 0,
          deliverySpeed: 0,
          service: 0,
        },
      });
    }
  }, [reviews]);

  const scrollToCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setTimeout(() => {
      const yOffset = sectionRefs.current[categoryId];
      if (yOffset !== undefined) {
        const headerOffset = isDesktop ? 200 : 250;
        scrollViewRef.current?.scrollTo({ 
          y: Math.max(0, yOffset - headerOffset), 
          animated: true 
        });
      }
    }, 100);
  };

  // Get category icon based on name
  const getCategoryIcon = (categoryId: string) => {
    const category = groupedMenu.find(g => g?.categoryId === categoryId);
    if (!category) return '🍽️';
    
    const name = category.categoryName.toLowerCase();
    if (name.includes('pizza')) return '🍕';
    if (name.includes('pasta') || name.includes('spaghetti')) return '🍝';
    if (name.includes('burger') || name.includes('sandwich')) return '🍔';
    if (name.includes('drink') || name.includes('beverage')) return '🥤';
    if (name.includes('dessert') || name.includes('cake')) return '🍰';
    if (name.includes('salad')) return '🥗';
    if (name.includes('soup')) return '🍲';
    if (name.includes('meat') || name.includes('steak')) return '🥩';
    if (name.includes('chicken')) return '🍗';
    if (name.includes('fish') || name.includes('seafood')) return '🐟';
    if (name.includes('coffee')) return '☕';
    if (name.includes('ice cream')) return '🍦';
    return '🍽️';
  };

  // Safe navigation handler
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback: Navigate to home
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  // Early return if no ID
  if (!id) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Text className="text-xl text-gray-600">Invalid restaurant</Text>
      </View>
    );
  }

  // Wait for navigation context to be ready
  if (!navigationReady) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text className="mt-4 text-gray-600">Initializing...</Text>
      </View>
    );
  }

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
          onPress={handleGoBack}
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalMenuCount = menuItems.length;

  // Filter menu based on selected category - with safety checks
  const categoryFilteredMenu = (selectedCategory === 'all' || !selectedCategory
    ? groupedMenu
    : groupedMenu.filter(g => g?.categoryId === selectedCategory)
  ).filter(Boolean); // Remove any null/undefined items
  
  // Safe grouped menu with validation
  const safeGroupedMenu = groupedMenu.filter(g => 
    g && 
    g.categoryId && 
    g.categoryName && 
    Array.isArray(g.items) &&
    g.items.length > 0
  );

  // Filter by search term - apply to category filtered menu
  const searchFilteredMenu = searchTerm.trim()
    ? categoryFilteredMenu.map(group => ({
        ...group,
        items: group.items.filter(item => 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })).filter(group => group.items.length > 0)
    : categoryFilteredMenu;

  // Final displayed menu
  const displayedMenu = searchFilteredMenu;

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={isDesktop ? { maxWidth: 1200, alignSelf: 'center', width: '100%' } : {}}
      >
        {/* Restaurant Header */}
        <RestaurantHeader restaurant={restaurant} />

        {/* Desktop: 2 Column Layout | Mobile: Full Width */}
        <View className={cn(
          "bg-gray-50",
          isDesktop ? "flex-row gap-6 px-8 pb-8" : "pb-4"
        )}>
          {/* LEFT SIDEBAR - Categories (Desktop Only) */}
          {isDesktop && safeGroupedMenu.length > 1 && (
            <View className="w-72 shrink-0">
              {/* Sticky Categories Sidebar */}
              <View className="sticky top-4">
                <View className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <Text className="text-lg font-bold text-gray-900 mb-4 px-2">Categories</Text>
                  
                  <View className="space-y-1">
                    {/* All Items Option */}
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedCategory('all');
                        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                      }}
                      className={cn(
                        'px-4 py-3 rounded-xl transition-all',
                        selectedCategory === 'all' 
                          ? 'bg-amber-50 border-2 border-amber-500' 
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      )}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center justify-between">
                        <View>
                          <Text className={cn(
                            'text-base font-semibold mb-1',
                            selectedCategory === 'all' ? 'text-amber-600' : 'text-gray-700'
                          )}>
                            All Menu Items
                          </Text>
                          <Text className="text-xs text-gray-500">
                            {totalMenuCount} items
                          </Text>
                        </View>
                        {selectedCategory === 'all' && (
                          <View className="w-5 h-5 bg-amber-500 rounded-full items-center justify-center">
                            <Text className="text-white text-xs font-bold">✓</Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Category List */}
                    {safeGroupedMenu.map((group) => {
                      const isSelected = selectedCategory === group.categoryId;
                      return (
                        <TouchableOpacity
                          key={group.categoryId}
                          onPress={() => scrollToCategory(group.categoryId)}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderRadius: 12,
                            backgroundColor: isSelected ? '#fffbeb' : '#f9fafb',
                            borderWidth: 2,
                            borderColor: isSelected ? '#f59e0b' : 'transparent',
                            marginBottom: 4,
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                              <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                marginBottom: 4,
                                color: isSelected ? '#d97706' : '#374151'
                              }}>
                                {group.categoryName}
                              </Text>
                              <Text style={{ fontSize: 12, color: '#6b7280' }}>
                                {group.items.length} items
                              </Text>
                            </View>
                            {isSelected && (
                              <View style={{ 
                                width: 20, 
                                height: 20, 
                                backgroundColor: '#f59e0b', 
                                borderRadius: 10, 
                                alignItems: 'center', 
                                justifyContent: 'center' 
                              }}>
                                <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                              </View>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* MAIN CONTENT AREA */}
          <View className="flex-1">
            {/* Tabs */}
            <View className={cn(
              "flex-row bg-white shadow-sm border-b border-gray-200",
              isDesktop ? "rounded-t-2xl" : "px-4"
            )}>
              <TouchableOpacity
                className={cn(
                  'flex-1 py-4 items-center border-b-3 transition-all',
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
                  'flex-1 py-4 items-center border-b-3 transition-all',
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
              <View className={cn(
                "bg-white",
                isDesktop ? "rounded-b-2xl shadow-sm border border-t-0 border-gray-100" : ""
              )}>
                {/* Mobile Category Dropdown + Search - Clean Design */}
                {!isDesktop && safeGroupedMenu.length > 0 && (
                  <View className="px-4 py-4 bg-white border-b border-gray-100">
                    <View className="flex-row gap-2">
                      {/* Category Picker Button */}
                      <TouchableOpacity
                        onPress={() => setShowCategoryPicker(true)}
                        className="flex-1 rounded-2xl p-4 border border-gray"
                        activeOpacity={0.7}
                        style={{ elevation: 2 }}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className="text-xs text-black-400 font-quicksand-bold mb-1 uppercase tracking-wider">
                              CATEGORY
                            </Text>
                            <Text className="text-base font-quicksand-bold text-black" numberOfLines={1}>
                              All Menu
                            </Text>
                          </View>
                          <View className="w-8 h-8 bg-white/20 rounded-xl items-center justify-center">
                            <Text className="text-black text-lg font-bold">▼</Text>
                          </View>
                        </View>
                      </TouchableOpacity>

                      {/* Search Button */}
                      <TouchableOpacity
                        onPress={() => setShowSearch(!showSearch)}
                        className="w-16 h-16 rounded-2xl items-center justify-center border border-gray"
                        activeOpacity={0.7}
                        style={{ elevation: 2 }}
                      >
                        <Image
                          source={icons.search}
                          style={{ width: 28, height: 28, tintColor: 'black' }}
                          resizeMode="contain"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Search Input */}
                    {showSearch && (
                      <View className="mt-3">
                        <TextInput
                          value={searchTerm}
                          onChangeText={setSearchTerm}
                          placeholder="Finding cuisine..."
                          className="bg-gray-50 rounded-xl px-4 py-3 border-2 border-gray-200 font-quicksand-semibold text-base"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                    )}
                  </View>
                )}

                {/* Category Picker Modal - REDESIGNED */}
                <Modal
                  visible={showCategoryPicker}
                  transparent={true}
                  animationType="slide"
                  onRequestClose={() => setShowCategoryPicker(false)}
                >
                  <TouchableOpacity 
                    className="flex-1 bg-black/60 justify-end"
                    activeOpacity={1}
                    onPress={() => setShowCategoryPicker(false)}
                  >
                    <View className="bg-white rounded-t-3xl shadow-2xl" style={{ maxHeight: '75%' }}>
                      {/* Modal Header */}
                      <View className="px-6 py-5 border-b border-gray-200 bg-gray-900">
                        <View className="flex-row items-center justify-between">
                          <View>
                            <Text className="text-xl font-quicksand-bold text-white">Select Category</Text>
                            <Text className="text-sm text-gray-400 font-quicksand-medium mt-1">
                              Browse menu by category
                            </Text>
                          </View>
                          <TouchableOpacity 
                            onPress={() => setShowCategoryPicker(false)}
                            className="w-10 h-10 items-center justify-center bg-white/20 rounded-xl"
                            activeOpacity={0.7}
                          >
                            <Text className="text-white text-xl font-bold">✕</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <ScrollView className="px-4 py-3" showsVerticalScrollIndicator={false}>
                        {/* All Items Option */}
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedCategory('all');
                            setShowCategoryPicker(false);
                            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                          }}
                          className="bg-white rounded-2xl p-4 mb-3 border-2 border-gray-900"
                          activeOpacity={0.7}
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                              <Text className="text-lg font-quicksand-bold text-gray-900 mb-1">
                                All Menu Items
                              </Text>
                              <Text className="text-sm text-gray-600 font-quicksand-semibold">
                                {totalMenuCount} items available
                              </Text>
                            </View>
                            <View className="w-10 h-10 bg-gray-900 rounded-full items-center justify-center">
                              <Text className="text-white text-lg font-bold">↑</Text>
                            </View>
                          </View>
                        </TouchableOpacity>

                        {/* Category Options */}
                        {safeGroupedMenu.map((group) => (
                            <TouchableOpacity
                              key={group.categoryId}
                              onPress={() => {
                                scrollToCategory(group.categoryId);
                                setShowCategoryPicker(false);
                              }}
                              className="bg-white rounded-2xl p-4 mb-3 border border-gray-200"
                              activeOpacity={0.7}
                            >
                              <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                  <Text className="text-lg font-quicksand-bold text-gray-900 mb-1">
                                    {group.categoryName}
                                  </Text>
                                  <Text className="text-sm text-gray-600 font-quicksand-semibold">
                                    {group.items.length} items available
                                  </Text>
                                </View>
                                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                                  <Text className="text-gray-900 text-lg font-bold">→</Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  </TouchableOpacity>
                </Modal>

                {/* Menu Items Grid */}
                <View className="p-4">
                  {displayedMenu.length > 0 ? (
                    displayedMenu.map((group) => (
                      <View 
                        key={group.categoryId}
                        onLayout={(event) => {
                          const layout = event.nativeEvent.layout;
                          sectionRefs.current[group.categoryId] = layout.y;
                        }}
                        className="mb-8"
                      >
                        {/* Category Header - Clean */}
                        <View className="mb-4 pb-3 border-b-2 border-amber-200">
                          <Text className="text-2xl font-quicksand-bold text-gray-900 mb-1">
                            {group.categoryName}
                          </Text>
                          <Text className="text-sm text-gray-600 font-quicksand-semibold">
                            {group.items.length} item{group.items.length > 1 ? 's' : ''} available
                          </Text>
                        </View>

                        {/* List Layout */}
                        <View>
                          {group.items.map((item) => (
                            <MenuListItem 
                              key={item.$id} 
                              item={item} 
                              restaurantId={restaurant.$id}
                              searchTerm={searchTerm}
                            />
                          ))}
                        </View>
                      </View>
                    ))
                  ) : (
                    <View className="items-center justify-center py-16">
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
              <View className={cn(
                "p-4",
                isDesktop ? "bg-white rounded-b-2xl shadow-sm border border-t-0 border-gray-100" : ""
              )}>
                {reviews.length > 0 ? (
                  <View className={isDesktop ? "space-y-4" : ""}>
                    {reviews.map((review) => (
                      <ReviewCard key={review.$id} review={review} />
                    ))}
                  </View>
                ) : (
                  <View className="items-center py-16">
                    <Text className="text-4xl mb-3">💬</Text>
                    <Text className="text-gray-600">No reviews yet</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RestaurantDetailScreen;