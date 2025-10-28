import cn from 'clsx';
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from 'expo-router';

import CartButton from "@/components/CartButton";
import RestaurantCard from "@/components/RestaurantCard";
import { icons, offers } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { getRestaurants } from '@/lib/appwrite';
import { RestaurantWithDistance } from '@/type';

export default function Index() {
  const { user } = useAuthStore();
  const [popularRestaurants, setPopularRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPopularRestaurants = async () => {
      try {
        const restaurants = await getRestaurants(
          { sortBy: 'rating' },
          10.8231, // HCM City default
          106.6297
        );
        setPopularRestaurants(restaurants.slice(0, 5)); // Top 5
      } catch (error) {
        console.error('Failed to load restaurants:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPopularRestaurants();
  }, []);

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
      <SafeAreaView className="flex-1 bg-white">
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-28"
          >
            {/* Header */}
            <View className="flex-between flex-row w-full px-5 mt-5 mb-4">
                <View className="flex-start">
                    <Text className="small-bold text-primary">DELIVER TO</Text>
                    <TouchableOpacity className="flex-center flex-row gap-x-1 mt-0.5">
                        <Text className="paragraph-bold text-dark-100">District 7</Text>
                        <Image source={icons.arrowDown} className="size-3" resizeMode="contain" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Offers Section */}
            <View className="mb-6">
              <Text className="px-5 h3-bold text-dark-100 mb-3">Special Offers</Text>
              <FlatList
                horizontal
                data={offers}
                showsHorizontalScrollIndicator={false}
                contentContainerClassName="px-5 gap-x-3"
                renderItem={renderOfferItem}
                keyExtractor={offerKeyExtractor}
                removeClippedSubviews={true}
                maxToRenderPerBatch={3}
                windowSize={3}
              />
            </View>

            {/* Popular Restaurants */}
            <View className="px-5">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="h3-bold text-dark-100">Popular Restaurants</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/restaurants')}>
                  <Text className="text-primary font-semibold">See All →</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <View className="py-10">
                  <ActivityIndicator size="large" color="#FF6B35" />
                </View>
              ) : popularRestaurants.length > 0 ? (
                <FlatList
                  data={popularRestaurants}
                  renderItem={renderRestaurantItem}
                  keyExtractor={restaurantKeyExtractor}
                  scrollEnabled={false}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={5}
                  windowSize={5}
                />
              ) : (
                <View className="py-10 items-center">
                  <Text className="text-gray-400">No restaurants available</Text>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View className="px-5 mt-6">
              <Text className="h3-bold text-dark-100 mb-3">Quick Actions</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  className="flex-1 bg-primary/10 rounded-xl p-4 items-center"
                  onPress={() => router.push('/order-history')}
                >
                  <Text className="text-2xl mb-2">📦</Text>
                  <Text className="font-semibold text-dark-100">My Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="flex-1 bg-amber-500/10 rounded-xl p-4 items-center"
                  onPress={() => router.push('/(tabs)/restaurants')}
                >
                  <Text className="text-2xl mb-2">🍽️</Text>
                  <Text className="font-semibold text-dark-100">All Restaurants</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
      </SafeAreaView>
  );
}
