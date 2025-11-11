import cn from 'clsx';
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, Text, TouchableOpacity, View, Platform } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import RestaurantCard from "@/components/restaurant/RestaurantCard";
import WebContainer from "@/components/common/WebContainer";
import { icons, offers } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { getRestaurants } from '@/lib/appwrite';
import { RestaurantWithDistance } from '@/type';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { useResponsive } from '@/lib/responsive';

export default function Index() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [popularRestaurants, setPopularRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const { location, loading: locationLoading, getCurrentLocation } = useCurrentLocation();
  const { isDesktop } = useResponsive();

  useEffect(() => {
    // Load current location on mount
    getCurrentLocation();
  }, []);

  useEffect(() => {
    const loadPopularRestaurants = async () => {
      // Don't load restaurants until we have a location (real or default)
      if (locationLoading) {
        return;
      }
      
      try {
        const userLat = location?.latitude || 10.8231;
        const userLng = location?.longitude || 106.6297;
        
        const restaurants = await getRestaurants(
          { sortBy: 'rating' },
          userLat,
          userLng
        );
        
        setPopularRestaurants(restaurants.slice(0, 5)); // Top 5
      } catch (error) {
        console.error('Failed to load restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPopularRestaurants();
  }, [location, locationLoading]);

  // Memoize render item cho offers
  const renderOfferItem = useCallback(({ item, index }: { item: typeof offers[0], index: number }) => {
    const isEven = index % 2 === 0;
    return (
      <Pressable
        className={cn("w-72 h-36 rounded-2xl overflow-hidden", isEven ? 'flex-row-reverse' : 'flex-row')}
        style={{ backgroundColor: item.color }}
      >
        {({ pressed }) => (
          <Fragment>
            <View className="h-full w-1/2">
              <Image source={item.image} className="size-full" resizeMode="contain" />
            </View>
            <View className={cn("flex-1 justify-center", isEven ? 'pl-4': 'pr-4')}>
              <Text className="text-xl font-bold text-white leading-tight">
                {item.title}
              </Text>
              <Image
                source={icons.arrowRight}
                className="size-6 mt-2"
                resizeMode="contain"
                tintColor="#ffffff"
              />
            </View>
          </Fragment>
        )}
      </Pressable>
    );
  }, []);

  // Memoize render item cho restaurants
  const renderRestaurantItem = useCallback(({ item }: { item: RestaurantWithDistance }) => (
    <RestaurantCard restaurant={item} />
  ), []);

  // Memoize key extractor
  const restaurantKeyExtractor = useCallback((item: RestaurantWithDistance) => item.$id, []);
  const offerKeyExtractor = useCallback((item: typeof offers[0], index: number) => index.toString(), []);

  return (
      <View className="flex-1 bg-gray-50">
          <WebContainer maxWidth="container">
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerClassName="pb-28"
            >
              {/* Hero Section - Web Only */}
              {isDesktop && (
                <View className="bg-gradient-to-r from-primary to-orange-500 rounded-3xl mx-20 mt-8 mb-8 overflow-hidden">
                  <View className="flex-row items-center justify-between px-12 py-10">
                    <View className="flex-1">
                      <Text className="text-4xl font-bold text-white mb-3">
                        Order amazing food{'\n'}delivered by drone
                      </Text>
                      <Text className="text-lg text-white/90 mb-6">
                        Fast, fresh, and innovative delivery right to your doorstep
                      </Text>
                      <Pressable 
                        className="bg-white rounded-xl px-6 py-3 self-start"
                        onPress={() => router.push('/(tabs)/restaurants')}
                      >
                        <Text className="text-primary font-bold text-base">Explore Now</Text>
                      </Pressable>
                    </View>
                    <View className="w-1/3">
                      <Text className="text-8xl">🍔</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Header - Responsive spacing */}
              <View 
                className="flex-between flex-row w-full px-5 mb-4 lg:px-20 lg:mt-0 lg:mb-6"
                style={{ marginTop: isDesktop ? 0 : insets.top + 20 }}
              >
                  <View className="flex-start flex-1">
                      <Text className="text-xs font-semibold text-primary">DELIVER TO</Text>
                      <TouchableOpacity 
                        className="flex-center flex-row gap-x-1 mt-0.5 max-w-full"
                        onPress={() => router.push('/location-picker')}
                        activeOpacity={0.7}
                      >
                          {locationLoading ? (
                            <ActivityIndicator size="small" color="#FF6B35" />
                          ) : (
                            <>
                              <Text className="paragraph-bold text-dark-100" numberOfLines={1} style={{ maxWidth: '85%' }}>
                                {location?.street 
                                  ? `${location.street}, ${location.district}` 
                                  : location?.district || 'Select Location'}
                              </Text>
                              <Image source={icons.arrowDown} className="size-3 ml-1" resizeMode="contain" />
                            </>
                          )}
                      </TouchableOpacity>
                  </View>
              </View>

              {/* Offers Section - Responsive with better spacing */}
              <View className="mb-8 px-5 lg:px-20">
                <Text className="lg:px-0 text-2xl lg:text-3xl font-bold text-dark-100 mb-4">Special Offers</Text>
                
                {isDesktop ? (
                  // Desktop: Grid 4 columns with proper gap
                  <View className="flex flex-row flex-wrap" style={{ gap: 16 }}>
                    {offers.map((offer, index) => {
                      const isEven = index % 2 === 0;
                      const [hovered, setHovered] = useState(false);
                      
                      return (
                        <View key={index} style={{ width: '23%' }}>
                          <Pressable
                            className={cn(
                              "rounded-2xl overflow-hidden transition-all duration-200",
                              isEven ? 'flex-row-reverse' : 'flex-row',
                              hovered && "shadow-lg"
                            )}
                            style={{ 
                              backgroundColor: offer.color,
                              height: 140,
                              transform: hovered ? [{ scale: 1.03 }] : [{ scale: 1 }]
                            }}
                            {...(Platform.OS === 'web' && {
                              // @ts-ignore
                              onMouseEnter: () => setHovered(true),
                              onMouseLeave: () => setHovered(false),
                            })}
                          >
                            <View className="h-full w-1/2">
                              <Image source={offer.image} className="size-full" resizeMode="contain" />
                            </View>
                            <View className={cn("flex-1 justify-center", isEven ? 'pl-4': 'pr-4')}>
                              <Text className="text-base font-bold text-white leading-tight">
                                {offer.title}
                              </Text>
                              <Image
                                source={icons.arrowRight}
                                className="size-5 mt-2"
                                resizeMode="contain"
                                tintColor="#ffffff"
                              />
                            </View>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  // Mobile: Horizontal scroll (original)
                  <FlatList
                    horizontal
                    data={offers}
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-x-3"
                    renderItem={renderOfferItem}
                    keyExtractor={offerKeyExtractor}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={3}
                    windowSize={3}
                  />
                )}
              </View>

            {/* Popular Restaurants - Better spacing and styling */}
            <View className="px-5 lg:px-20 mb-8">
              <View className="flex-row justify-between items-center mb-5">
                <Text className="text-2xl lg:text-3xl font-bold text-dark-100">Popular Restaurants</Text>
                <TouchableOpacity 
                  onPress={() => router.push('/(tabs)/restaurants')}
                  {...(Platform.OS === 'web' && {
                    // @ts-ignore
                    style: { cursor: 'pointer' }
                  })}
                >
                  <Text className="text-[#FF7A00] font-semibold text-base hover:underline">See All →</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <View className="py-10">
                  <ActivityIndicator size="large" color="#FF6B35" />
                </View>
              ) : popularRestaurants.length > 0 ? (
                isDesktop ? (
                  // Desktop: Grid layout (3 columns) with proper spacing
                  <View className="flex flex-row flex-wrap" style={{ gap: 24 }}>
                    {popularRestaurants.map((restaurant) => (
                      <View key={restaurant.$id} style={{ width: '31%' }}>
                        <RestaurantCard restaurant={restaurant} />
                      </View>
                    ))}
                  </View>
                ) : (
                  // Mobile: List layout (original)
                  <FlatList
                    data={popularRestaurants}
                    renderItem={renderRestaurantItem}
                    keyExtractor={restaurantKeyExtractor}
                    scrollEnabled={false}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    windowSize={5}
                  />
                )
              ) : (
                <View className="py-10 items-center">
                  <Text className="text-gray-400">No restaurants available</Text>
                </View>
              )}
            </View>

            {/* Quick Actions - Desktop only or better layout */}
            <View className="px-5 lg:px-20 mt-6 mb-8">
              <Text className="text-2xl lg:text-3xl font-bold text-dark-100 mb-4">Quick Actions</Text>
              <View className="flex-row gap-4">
                <TouchableOpacity 
                  className="flex-1 bg-white rounded-xl p-6 items-center shadow-sm border border-gray-100"
                  onPress={() => router.push('/order-history')}
                  activeOpacity={0.8}
                >
                  <Text className="text-3xl mb-2">📦</Text>
                  <Text className="font-semibold text-dark-100 text-base">My Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-1 bg-white rounded-xl p-6 items-center shadow-sm border border-gray-100"
                  onPress={() => router.push('/(tabs)/restaurants')}
                  activeOpacity={0.8}
                >
                  <Text className="text-3xl mb-2">🍽️</Text>
                  <Text className="font-semibold text-dark-100 text-base">All Restaurants</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer - Web only */}
            {isDesktop && (
              <View className="px-20 py-8 border-t border-gray-200 mt-8">
                <Text className="text-center text-gray-500 text-sm">
                  © FoodFast 2025 – All rights reserved. Powered by drone delivery technology 🚁
                </Text>
              </View>
            )}
          </ScrollView>
        </WebContainer>
      </View>
  );
}
