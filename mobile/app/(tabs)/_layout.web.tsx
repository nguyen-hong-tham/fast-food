import { icons } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { Redirect, Tabs, router, usePathname } from "expo-router";
import { Image, Text, View, Pressable, Platform } from "react-native";
import { useState } from "react";
import cn from "clsx";

/**
 * Web-specific layout with cleaner navigation
 * Hides bottom tabs and uses subtle top navigation
 */
export default function WebTabLayout() {
    const { isAuthenticated } = useAuthStore();
    const pathname = usePathname();
    const [hoveredTab, setHoveredTab] = useState<string | null>(null);

    // ✅ Allow browsing without login - user can view restaurants and menu
    // Authentication will be required only for cart/checkout actions

    const navItems = [
        { name: 'index', label: 'Home', icon: icons.home, href: '/' },
        { name: 'restaurants', label: 'Restaurants', icon: icons.restaurant, href: '/(tabs)/restaurants' },
        { name: 'cart', label: 'Cart', icon: icons.bag, href: '/(tabs)/cart' },
        { name: 'profile', label: 'Profile', icon: icons.person, href: '/(tabs)/profile' },
    ];

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/(tabs)' || pathname === '/';
        return pathname === href;
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Top Navigation Bar for Web - Professional Layout */}
            <View className="bg-white border-b border-gray-200 shadow-sm">
                <View className="max-w-[1200px] mx-auto px-20">
                    <View className="flex-row items-center justify-between h-14">
                        {/* Logo/Brand */}
                        <Pressable 
                            className="flex-row items-center gap-3"
                            onPress={() => router.push('/')}
                        >
                            <Text className="text-2xl">🍔</Text>
                            <Text className="text-lg font-bold text-primary">FoodFast</Text>
                        </Pressable>

                        {/* Navigation Items - Text only, no icons */}
                        <View className="flex-row items-center" style={{ gap: 32 }}>
                            {navItems.map((item) => {
                                const active = isActive(item.href);
                                const hovered = hoveredTab === item.name;

                                return (
                                    <Pressable
                                        key={item.name}
                                        className={cn(
                                            "px-4 py-2 rounded-lg transition-all duration-200",
                                            active && "bg-primary/10",
                                            hovered && !active && "bg-gray-100"
                                        )}
                                        onPress={() => router.push(item.href as any)}
                                        {...(Platform.OS === 'web' && {
                                            // @ts-ignore
                                            onMouseEnter: () => setHoveredTab(item.name),
                                            onMouseLeave: () => setHoveredTab(null),
                                        })}
                                    >
                                        <Text 
                                            className={cn(
                                                "text-base font-medium",
                                                active ? "text-primary" : hovered ? "text-primary" : "text-gray-600"
                                            )}
                                        >
                                            {item.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </View>

            {/* Content Area */}
            <View className="flex-1">
                <Tabs 
                    screenOptions={{
                        headerShown: false,
                        tabBarStyle: { display: 'none' }, // Hide bottom tabs on web
                    }}
                >
                    <Tabs.Screen name='index' />
                    <Tabs.Screen name='restaurants' />
                    <Tabs.Screen name='cart' />
                    <Tabs.Screen name='profile' />
                </Tabs>
            </View>
        </View>
    );
}
