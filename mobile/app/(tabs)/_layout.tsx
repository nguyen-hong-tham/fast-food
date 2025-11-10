import { icons } from "@/constants";
import useAuthStore from "@/store/auth.store";
import { useCartStore } from "@/store/cart.store";
import { TabBarIconProps } from "@/type";
import cn from "clsx";
import { Redirect, Tabs } from "expo-router";
import { Image, Text, View } from "react-native";


const TabBarIcon = ({ focused, icon, title, badge }: TabBarIconProps & { badge?: number }) => (
    <View className="tab-icon relative">
        <Image source={icon} className="size-7" resizeMode="contain" tintColor={focused ? '#FE8C00' : '#5D5F6D'} />
        {badge !== undefined && badge > 0 && (
            <View className="absolute -top-1 -right-2 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
                <Text className="text-white text-xs font-bold">{badge > 99 ? '99+' : String(badge)}</Text>
            </View>
        )}
        <Text className={cn('text-sm font-bold', focused ? 'text-primary':'text-gray-200')}>
            {title}
        </Text>
    </View>
)

export default function TabLayout() {
    const { isAuthenticated } = useAuthStore();
    const { getTotalItems } = useCartStore();
    const cartItemCount = getTotalItems();

    // ✅ Allow browsing without login - user can view restaurants and menu
    // Authentication will be required only for cart/checkout actions

    return (
        <Tabs screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    borderTopLeftRadius: 50,
                    borderTopRightRadius: 50,
                    borderBottomLeftRadius: 50,
                    borderBottomRightRadius: 50,
                    marginHorizontal: 20,
                    height: 80,
                    position: 'absolute',
                    bottom: 40,
                    backgroundColor: 'white',
                    shadowColor: '#1a1a1a',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 5
                }
            }}>
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Home',
                    tabBarIcon: ({ focused }) => <TabBarIcon title="Home" icon={icons.home} focused={focused} />
                }}
            />
            <Tabs.Screen
                name='restaurants'
                options={{
                    title: 'Restaurants',
                    tabBarIcon: ({ focused }) => <TabBarIcon title="Places" icon={icons.restaurant} focused={focused} />
                }}
            />
            <Tabs.Screen
                name='cart'
                options={{
                    title: 'Cart',
                    tabBarIcon: ({ focused }) => <TabBarIcon title="Cart" icon={icons.bag} focused={focused} badge={cartItemCount} />
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => <TabBarIcon title="Profile" icon={icons.person} focused={focused} />
                }}
            />
        </Tabs>
    );
}
