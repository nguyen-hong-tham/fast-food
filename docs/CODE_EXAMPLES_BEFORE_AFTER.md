# 📋 Examples: Before & After Code

## Example 1: Home Screen (index.tsx)

### ❌ BEFORE - Mobile Only
```typescript
import { FlatList, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RestaurantCard from "@/components/RestaurantCard";

export default function Index() {
  const [restaurants, setRestaurants] = useState([]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Header */}
        <View className="px-5 mt-5">
          <Text className="text-2xl font-bold">Restaurants</Text>
        </View>

        {/* Restaurant List */}
        <FlatList
          data={restaurants}
          renderItem={({ item }) => <RestaurantCard restaurant={item} />}
          keyExtractor={item => item.$id}
          contentContainerClassName="px-5 gap-y-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
}
```

### ✅ AFTER - Responsive Web & Mobile
```typescript
import { FlatList, ScrollView, Text, View, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RestaurantCard from "@/components/RestaurantCard";
import WebContainer from "@/components/WebContainer";
import DevInfo from "@/components/DevInfo";
import { useResponsive } from "@/lib/responsive";

export default function Index() {
  const [restaurants, setRestaurants] = useState([]);
  const { isDesktop } = useResponsive();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <DevInfo />
      
      <WebContainer maxWidth="container">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header - Responsive spacing */}
          <View className="px-5 mt-5 lg:px-0 lg:mt-8">
            <Text className="text-2xl lg:text-3xl font-bold">
              Restaurants
            </Text>
          </View>

          {/* Restaurant List - Grid on Desktop, List on Mobile */}
          <View className="mt-6 lg:mt-10">
            {isDesktop ? (
              // Desktop: Grid Layout
              <View className="flex flex-row flex-wrap -mx-3">
                {restaurants.map((restaurant) => (
                  <View 
                    key={restaurant.$id} 
                    className="w-full md:w-1/2 lg:w-1/3 px-3 mb-6"
                  >
                    <RestaurantCard restaurant={restaurant} />
                  </View>
                ))}
              </View>
            ) : (
              // Mobile: List Layout (Original)
              <FlatList
                data={restaurants}
                renderItem={({ item }) => <RestaurantCard restaurant={item} />}
                keyExtractor={item => item.$id}
                contentContainerClassName="px-5 gap-y-4"
              />
            )}
          </View>
        </ScrollView>
      </WebContainer>
    </SafeAreaView>
  );
}
```

**Changes Made:**
- ✅ Added `WebContainer` for max-width on desktop
- ✅ Added `DevInfo` for debugging
- ✅ Responsive spacing: `mt-5 lg:mt-8`
- ✅ Responsive typography: `text-2xl lg:text-3xl`
- ✅ Conditional rendering: Grid on desktop, List on mobile
- ✅ Used `useResponsive` hook for breakpoint detection

---

## Example 2: Restaurant Card Component

### ❌ BEFORE - No Hover Effects
```typescript
import { Image, Pressable, Text, View } from "react-native";
import { router } from "expo-router";

export default function RestaurantCard({ restaurant }) {
  return (
    <Pressable
      className="bg-white rounded-2xl overflow-hidden shadow-sm"
      onPress={() => router.push(`/restaurant-detail?id=${restaurant.$id}`)}
    >
      <Image 
        source={{ uri: restaurant.image_url }}
        className="w-full h-40"
        resizeMode="cover"
      />
      
      <View className="p-4">
        <Text className="text-lg font-bold">{restaurant.name}</Text>
        <Text className="text-sm text-gray-600">{restaurant.rating} ⭐</Text>
      </View>
    </Pressable>
  );
}
```

### ✅ AFTER - Hover Effects & Responsive
```typescript
import { Image, Pressable, Text, View, Platform } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import cn from "clsx";

export default function RestaurantCard({ restaurant }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      className={cn(
        "bg-white rounded-2xl overflow-hidden shadow-sm",
        "transition-all duration-300",
        // Web-specific hover effect
        Platform.OS === 'web' && isHovered && "shadow-xl scale-[1.02]"
      )}
      onPress={() => router.push(`/restaurant-detail?id=${restaurant.$id}`)}
      // Hover handlers (web only)
      {...(Platform.OS === 'web' && {
        onHoverIn: () => setIsHovered(true),
        onHoverOut: () => setIsHovered(false),
      })}
    >
      {/* Image - Responsive height */}
      <View className="relative">
        <Image 
          source={{ uri: restaurant.image_url }}
          className="w-full h-40 lg:h-48"
          resizeMode="cover"
        />
        
        {/* Hover overlay (web only) */}
        {Platform.OS === 'web' && isHovered && (
          <View className="absolute inset-0 bg-black/20" />
        )}
      </View>
      
      {/* Content - Responsive padding */}
      <View className="p-4 lg:p-5">
        <Text className="text-lg lg:text-xl font-bold mb-1">
          {restaurant.name}
        </Text>
        
        <View className="flex-row items-center gap-2">
          <Text className="text-sm lg:text-base text-gray-600">
            {restaurant.rating} ⭐
          </Text>
          <Text className="text-sm lg:text-base text-gray-400">•</Text>
          <Text className="text-sm lg:text-base text-gray-600">
            {restaurant.delivery_time} mins
          </Text>
        </View>
        
        {/* Show button on hover (web only) */}
        {Platform.OS === 'web' && isHovered && (
          <View className="mt-3 bg-primary px-4 py-2 rounded-full self-start">
            <Text className="text-white text-sm font-medium">
              View Menu
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
```

**Changes Made:**
- ✅ Added hover state management
- ✅ Hover effects with scale and shadow
- ✅ Overlay on hover
- ✅ Responsive image height
- ✅ Responsive text sizes
- ✅ "View Menu" button appears on hover
- ✅ Platform-specific features (web only)

---

## Example 3: Restaurant Detail Screen

### ❌ BEFORE - Single Column
```typescript
import { ScrollView, View, Image, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuCard from "@/components/MenuCard";

export default function RestaurantDetail() {
  const [menuItems, setMenuItems] = useState([]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {/* Restaurant Header */}
        <Image 
          source={{ uri: restaurant.image_url }}
          className="w-full h-60"
        />
        
        <View className="p-5">
          <Text className="text-2xl font-bold">{restaurant.name}</Text>
          <Text className="text-gray-600">{restaurant.description}</Text>
        </View>

        {/* Menu Items */}
        <View className="px-5">
          {menuItems.map(item => (
            <MenuCard key={item.$id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### ✅ AFTER - Two Column Layout (Desktop)
```typescript
import { ScrollView, View, Image, Text, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MenuCard from "@/components/MenuCard";
import WebContainer from "@/components/WebContainer";
import { useResponsive } from "@/lib/responsive";

export default function RestaurantDetail() {
  const [menuItems, setMenuItems] = useState([]);
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    // Desktop: Two Column Layout
    return (
      <SafeAreaView className="flex-1 bg-white">
        <WebContainer maxWidth="container">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row gap-8 py-8">
              {/* Left Column: Restaurant Info (Sticky) */}
              <View className="w-1/3">
                <View className="sticky top-4">
                  <Image 
                    source={{ uri: restaurant.image_url }}
                    className="w-full h-64 rounded-2xl"
                    resizeMode="cover"
                  />
                  
                  <View className="mt-6">
                    <Text className="text-3xl font-bold mb-2">
                      {restaurant.name}
                    </Text>
                    <Text className="text-gray-600 leading-relaxed">
                      {restaurant.description}
                    </Text>
                    
                    <View className="mt-4 flex-row gap-4">
                      <View className="flex-row items-center">
                        <Text className="text-yellow-500 mr-1">⭐</Text>
                        <Text className="font-medium">{restaurant.rating}</Text>
                      </View>
                      <Text className="text-gray-400">•</Text>
                      <Text className="text-gray-600">
                        {restaurant.delivery_time} mins
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Right Column: Menu Grid */}
              <View className="flex-1">
                <Text className="text-2xl font-bold mb-6">Menu</Text>
                
                <View className="flex flex-row flex-wrap -mx-3">
                  {menuItems.map(item => (
                    <View 
                      key={item.$id} 
                      className="w-1/2 px-3 mb-6"
                    >
                      <MenuCard item={item} />
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
        </WebContainer>
      </SafeAreaView>
    );
  }

  // Mobile: Original Single Column Layout
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        <Image 
          source={{ uri: restaurant.image_url }}
          className="w-full h-60"
        />
        
        <View className="p-5">
          <Text className="text-2xl font-bold">{restaurant.name}</Text>
          <Text className="text-gray-600">{restaurant.description}</Text>
        </View>

        <View className="px-5">
          {menuItems.map(item => (
            <MenuCard key={item.$id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Changes Made:**
- ✅ Complete separate layouts for desktop vs mobile
- ✅ Desktop: 2-column layout (info + menu grid)
- ✅ Sticky sidebar on desktop
- ✅ Menu items in 2-column grid on desktop
- ✅ Mobile: Keep original layout untouched
- ✅ Better typography hierarchy

---

## Example 4: Cart Button

### ❌ BEFORE - Fixed Position Issues
```typescript
import { Pressable, View, Text, Image } from "react-native";
import { router } from "expo-router";
import { icons } from "@/constants";
import useCartStore from "@/store/cart.store";

export default function CartButton() {
  const { items } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Pressable
      className="absolute bottom-20 right-5 bg-primary rounded-full p-4 shadow-lg"
      onPress={() => router.push('/cart')}
    >
      <Image source={icons.cart} className="size-6" tintColor="#ffffff" />
      {totalItems > 0 && (
        <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-5 h-5">
          <Text className="text-white text-xs">{totalItems}</Text>
        </View>
      )}
    </Pressable>
  );
}
```

### ✅ AFTER - Better Web Positioning
```typescript
import { Pressable, View, Text, Image, Platform } from "react-native";
import { router } from "expo-router";
import { icons } from "@/constants";
import useCartStore from "@/store/cart.store";
import { useState } from "react";
import cn from "clsx";

export default function CartButton() {
  const { items } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const [isHovered, setIsHovered] = useState(false);

  // Platform-specific positioning
  const positionClass = Platform.OS === 'web' 
    ? 'fixed bottom-8 right-8' 
    : 'absolute bottom-20 right-5';

  return (
    <Pressable
      className={cn(
        positionClass,
        "bg-primary rounded-full shadow-2xl z-50",
        "transition-all duration-300",
        Platform.OS === 'web' && isHovered && "scale-110 shadow-3xl"
      )}
      onPress={() => router.push('/cart')}
      {...(Platform.OS === 'web' && {
        onHoverIn: () => setIsHovered(true),
        onHoverOut: () => setIsHovered(false),
      })}
    >
      <View className={cn(
        "flex-row items-center gap-3",
        Platform.OS === 'web' ? "px-6 py-4" : "p-4"
      )}>
        {/* Cart Icon */}
        <View className="relative">
          <Image 
            source={icons.cart} 
            className="size-6"
            tintColor="#ffffff"
          />
          
          {/* Badge */}
          {totalItems > 0 && (
            <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
              <Text className="text-white text-xs font-bold">
                {totalItems}
              </Text>
            </View>
          )}
        </View>
        
        {/* Text (Web only, shown on hover) */}
        {Platform.OS === 'web' && (
          <Text className={cn(
            "text-white font-bold text-base transition-all duration-300",
            isHovered ? "opacity-100 max-w-[100px]" : "opacity-0 max-w-0"
          )}>
            View Cart
          </Text>
        )}
      </View>
    </Pressable>
  );
}
```

**Changes Made:**
- ✅ Fixed positioning for web (`fixed` vs `absolute`)
- ✅ Hover scale effect
- ✅ Text appears on hover (web only)
- ✅ Better shadow on hover
- ✅ Smooth transitions
- ✅ Platform-specific padding

---

## Example 5: Navigation Tabs Layout

### ❌ BEFORE - Bottom Tabs Only
```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Image } from 'react-native';
import { icons } from '@/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FE8C00',
        tabBarInactiveTintColor: '#878787',
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Image source={icons.home} tintColor={color} />
          ),
        }}
      />
      {/* ... other tabs */}
    </Tabs>
  );
}
```

### ✅ AFTER - Sidebar for Web
```typescript
// app/(tabs)/_layout.tsx (Keep original)

// app/(tabs)/_layout.web.tsx (NEW - Web specific)
import { Tabs, router } from 'expo-router';
import { View, Text, Pressable, Image } from 'react-native';
import { icons } from '@/constants';
import { useState } from 'react';
import cn from 'clsx';

const navItems = [
  { name: 'index', label: 'Home', icon: icons.home, href: '/' },
  { name: 'restaurants', label: 'Restaurants', icon: icons.restaurant, href: '/restaurants' },
  { name: 'cart', label: 'Cart', icon: icons.cart, href: '/cart' },
  { name: 'profile', label: 'Profile', icon: icons.profile, href: '/profile' },
];

export default function WebTabLayout() {
  const [activeTab, setActiveTab] = useState('index');

  return (
    <View className="flex-row h-screen bg-gray-50">
      {/* Sidebar */}
      <View className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        {/* Logo */}
        <View className="p-6 border-b border-gray-200">
          <Text className="text-2xl font-bold text-primary">
            🍔 FoodFast
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            Fast Food Delivery
          </Text>
        </View>
        
        {/* Navigation */}
        <View className="py-4">
          {navItems.map((item) => (
            <SidebarItem
              key={item.name}
              {...item}
              isActive={activeTab === item.name}
              onPress={() => {
                setActiveTab(item.name);
                router.push(item.href);
              }}
            />
          ))}
        </View>
      </View>
      
      {/* Main Content */}
      <View className="flex-1 overflow-hidden">
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' }, // Hide bottom tabs
          }}
        />
      </View>
    </View>
  );
}

function SidebarItem({ label, icon, isActive, onPress }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      className={cn(
        "mx-3 px-4 py-3 rounded-lg transition-all duration-200",
        "flex-row items-center gap-3",
        isActive && "bg-primary/10",
        isHovered && !isActive && "bg-gray-100"
      )}
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <Image
        source={icon}
        className="size-5"
        tintColor={isActive ? '#FE8C00' : '#878787'}
      />
      <Text className={cn(
        "text-base font-medium",
        isActive ? "text-primary" : "text-gray-700"
      )}>
        {label}
      </Text>
    </Pressable>
  );
}
```

**Changes Made:**
- ✅ Created web-specific layout file (`_layout.web.tsx`)
- ✅ Sidebar navigation for desktop
- ✅ Hide bottom tabs on web
- ✅ Active state highlighting
- ✅ Hover effects
- ✅ Professional sidebar design
- ✅ Mobile layout remains unchanged

---

## 📊 Summary of Changes

| Component | Mobile | Web (Desktop) |
|-----------|--------|---------------|
| **Layout** | Full width | Max-width container |
| **Restaurant List** | Vertical list | 2-3 column grid |
| **Cards** | No hover | Hover effects + scale |
| **Navigation** | Bottom tabs | Sidebar |
| **Images** | h-40 | h-48 (responsive) |
| **Text** | text-base | text-lg (responsive) |
| **Cart Button** | Absolute | Fixed with expand |
| **Detail Page** | Single column | Two columns |

## 🎯 Key Principles

1. **Mobile First**: Start with mobile, enhance for desktop
2. **Platform Detection**: Use `Platform.OS === 'web'`
3. **Responsive Hook**: Use `useResponsive()` for breakpoints
4. **Conditional Rendering**: Different layouts for different screens
5. **Hover Effects**: Web-only, don't break mobile
6. **File Variants**: Use `.web.tsx` and `.native.tsx` when needed
7. **Keep Logic Shared**: Only UI should differ

---

**Lưu ý**: Tất cả các thay đổi này KHÔNG ảnh hưởng đến mobile app. App trên điện thoại vẫn hoạt động y như cũ!
