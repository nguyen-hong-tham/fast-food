# 🔴 Navigation Context Error - Phân Tích Chi Tiết

**Ngày**: 9/11/2025  
**Lỗi**: `Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?`  
**Trạng thái**: ❌ CRITICAL - App không thể render

---

## 📊 TÓM TẮT VẤN ĐỀ

### Lỗi Chính
```
ERROR  [Error: Couldn't find a navigation context. Have you wrapped your app with 'NavigationContainer'?]
```

### Call Stack Quan Trọng
```
groupedMenu.map$argument_0 (app\restaurant-detail.tsx)
RestaurantDetailScreen (app\restaurant-detail.tsx)
RootInner (app\_layout.tsx)
```

### Root Cause
**Component `restaurant-detail.tsx` đang import và sử dụng `router` từ `expo-router` BÊN NGOÀI React component hoặc trong render phase, dẫn đến việc truy cập navigation context TRƯỚC KHI NavigationContainer sẵn sàng.**

---

## 🔍 PHÂN TÍCH KỸ THUẬT

### 1. Stack Trace Analysis

#### Call Stack Flow:
```
1. ExpoRoot → ContextNavigator → Content
2. RootApp (Sentry wrapper) → RootInner (_layout.tsx)
3. Stack (expo-router Stack component)
4. RestaurantDetailScreen (restaurant-detail.tsx)
5. ❌ ERROR: groupedMenu.map → Truy cập navigation context
```

#### Điểm Lỗi:
```tsx
// File: app/restaurant-detail.tsx
// Line 3: Import router TRỰC TIẾP (không qua hook)
import { useLocalSearchParams, router } from 'expo-router';

// Line 272: Sử dụng router.back() trong render
onPress={() => router.back()}
```

### 2. Tại Sao Lỗi Xảy Ra?

#### ❌ Pattern SAI (Hiện tại):
```tsx
// Import router như một object tĩnh
import { router } from 'expo-router';

// Sử dụng trực tiếp trong JSX
<TouchableOpacity onPress={() => router.back()}>
  <Text>Go Back</Text>
</TouchableOpacity>
```

**Vấn đề**: 
- `router` object được import như một singleton
- Khi component render, `router` cố gắng truy cập navigation context
- Nhưng NavigationContainer chưa wrap xong component tree
- **NativeWind CSS Interop** đang render component nhiều lần trong quá trình setup
- Mỗi lần render, `router` lại cố truy cập context → Crash

#### ✅ Pattern ĐÚNG:
```tsx
// Import useRouter hook thay vì router object
import { useRouter, useLocalSearchParams } from 'expo-router';

function RestaurantDetailScreen() {
  // Hook sẽ chỉ chạy TRONG component, SAU KHI NavigationContainer ready
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Bây giờ router.back() an toàn
  return (
    <TouchableOpacity onPress={() => router.back()}>
      <Text>Go Back</Text>
    </TouchableOpacity>
  );
}
```

### 3. Tại Sao _layout.tsx Không Đủ?

#### File: `app/_layout.tsx` (Hiện tại)
```tsx
function RootInner() {
  // ... hooks setup ...
  
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootInner);
```

**Phân tích**:
- ✅ `<Stack>` không bị wrap bởi `SafeAreaView` nữa (đã fix trước đó)
- ✅ `SafeAreaProvider` chỉ provide context, không phá navigation
- ✅ Structure đúng theo Expo Router docs

**NHƯNG**:
- ❌ Child components (`restaurant-detail.tsx`) đang import `router` TRƯỚC KHI Stack mount
- ❌ NativeWind CSS Interop (`react-native-css-interop`) render nhiều lần
- ❌ Mỗi lần render, `router` object được access → Crash

---

## 🛠️ GIẢI PHÁP CHI TIẾT

### ✅ Giải pháp 1: Đổi từ `router` sang `useRouter()` (RECOMMENDED)

#### Bước 1: Sửa Import
```tsx
// ❌ TRƯỚC:
import { useLocalSearchParams, router } from 'expo-router';

// ✅ SAU:
import { useLocalSearchParams, useRouter } from 'expo-router';
```

#### Bước 2: Thêm Hook Trong Component
```tsx
const RestaurantDetailScreen = () => {
  // ✅ Thêm hook này
  const router = useRouter();
  
  const params = useLocalSearchParams<{ id: string }>();
  const id = params?.id;
  
  // ... rest of component ...
```

#### Bước 3: Verify All router.back() Calls
```tsx
// Line 272 - Giữ nguyên (nhưng giờ router từ hook)
<TouchableOpacity 
  className="mt-4 px-6 py-3 bg-amber-500 rounded-full"
  onPress={() => router.back()}
>
  <Text className="text-white font-semibold">Go Back</Text>
</TouchableOpacity>
```

#### Tại Sao Giải Pháp Này Hiệu Quả?
1. **Lifecycle Control**: `useRouter()` hook chỉ chạy SAU KHI component mount
2. **Context Availability**: Khi hook chạy, NavigationContainer đã wrap xong
3. **React Rules**: Hooks đảm bảo chạy đúng thứ tự, sau khi navigation ready
4. **NativeWind Safe**: Hook không bị trigger nhiều lần trong CSS interop phase

---

### ✅ Giải pháp 2: Conditional Router Access (Fallback)

Nếu vẫn cần dùng `router` import (không khuyến khích):

```tsx
import { router, useNavigation } from 'expo-router';

const RestaurantDetailScreen = () => {
  // Safe navigation check
  const navigation = useNavigation();
  
  const handleGoBack = () => {
    try {
      if (navigation.canGoBack()) {
        router.back();
      } else {
        // Fallback to home
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      router.replace('/(tabs)');
    }
  };
  
  return (
    <TouchableOpacity onPress={handleGoBack}>
      <Text>Go Back</Text>
    </TouchableOpacity>
  );
}
```

**Nhược điểm**: Vẫn có thể crash trong render phase nếu `router` được access quá sớm.

---

### ✅ Giải pháp 3: Wrap Navigation Calls (Defensive)

```tsx
import { router } from 'expo-router';

// Helper function với error handling
const safeNavigate = {
  back: () => {
    try {
      router.back();
    } catch (error) {
      console.warn('Navigation not ready, redirecting to home');
      router.replace('/(tabs)');
    }
  },
  push: (href: string) => {
    try {
      router.push(href);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }
};

// Sử dụng
<TouchableOpacity onPress={() => safeNavigate.back()}>
  <Text>Go Back</Text>
</TouchableOpacity>
```

**Nhược điểm**: Chỉ giải quyết symptom, không fix root cause.

---

## 🎯 RECOMMENDED SOLUTION (Tổng Hợp)

### Step-by-Step Fix

#### 1. Update `restaurant-detail.tsx`
```tsx
// File: app/restaurant-detail.tsx
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Platform, Modal } from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
// ✅ ĐỔI IMPORT NÀY:
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  // ✅ THÊM HOOK NÀY:
  const router = useRouter();
  
  const params = useLocalSearchParams<{ id: string }>();
  const id = params?.id;
  
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'menu' | 'reviews'>('menu');
  const { isDesktop } = useResponsive();
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<{ [key: string]: number }>({});
  
  // ... rest of component giữ nguyên ...
```

#### 2. Verify Import Pattern Across Project

Kiểm tra tất cả files có import `router`:
```bash
# Tìm tất cả files import router trực tiếp
grep -r "import.*router.*from.*expo-router" mobile/app/
```

**Files cần check**:
- ✅ `app/restaurant-detail.tsx` (FIX NGAY)
- `app/vnpay-payment.tsx`
- `app/payment-selection.tsx`
- `app/payment-result.tsx`
- `app/notifications.tsx`
- `app/menu-detail.tsx`
- `app/location-picker.tsx`
- `app/edit-profile.tsx`
- `app/checkout.tsx`
- `app/cart.tsx`
- `app/(tabs)/*.tsx`
- `app/(auth)/*.tsx`

**Pattern để tìm**:
```tsx
// ❌ Tìm pattern này (CÓ THỂ LỖI):
import { router } from 'expo-router';

// ✅ Nên đổi thành:
import { useRouter } from 'expo-router';
const router = useRouter(); // Trong component
```

#### 3. Add Safety Check in _layout.tsx (Optional)

```tsx
// File: app/_layout.tsx
function RootInner() {
  const { isLoading } = useAuthStore();
  useNotificationSetup();

  const [fontsLoaded, error] = useFonts({
    'QuickSand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
    'QuickSand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
    'QuickSand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
    'QuickSand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
    'QuickSand-Light': require('../assets/fonts/Quicksand-Light.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  if (!fontsLoaded || isLoading) return null;

  return (
    <SafeAreaProvider>
      {/* ✅ Stack đúng chỗ, không bị wrap bởi SafeAreaView */}
      <Stack 
        screenOptions={{ 
          headerShown: false,
          // ✅ Optional: Thêm animation để smooth hơn
          animation: 'slide_from_right',
        }} 
      />
    </SafeAreaProvider>
  );
}

export default Sentry.wrap(RootInner);
```

---

## 🧪 TESTING CHECKLIST

### Sau khi fix, test các scenarios sau:

#### ✅ Navigation Flow
- [ ] **Home → Restaurant Detail**: Navigate từ home screen
- [ ] **Click Back Button**: Test `router.back()` không crash
- [ ] **Deep Link**: Mở app từ notification/deep link
- [ ] **Tab Navigation**: Switch giữa các tabs
- [ ] **Modal Navigation**: Open/close modals (category picker)

#### ✅ Edge Cases
- [ ] **Fast Navigation**: Nhấn back nhiều lần nhanh
- [ ] **No Restaurant Found**: ID không tồn tại
- [ ] **Loading State**: Kiểm tra loading screen
- [ ] **Empty Category**: Test với restaurant không có categories
- [ ] **Network Error**: Test khi mất mạng

#### ✅ Performance
- [ ] **First Render**: App load không crash
- [ ] **Memory Leaks**: Không có warning về memory
- [ ] **Reanimated**: Warning về Reanimated đã suppress
- [ ] **Hot Reload**: Test hot reload không crash

---

## 🚀 IMPLEMENTATION PLAN

### Priority 1: Fix restaurant-detail.tsx (HIGH - Blocking)
```bash
1. Open: mobile/app/restaurant-detail.tsx
2. Change line 3: import { useLocalSearchParams, useRouter } from 'expo-router';
3. Add line 20: const router = useRouter();
4. Save & Test
```

### Priority 2: Audit All Router Imports (MEDIUM)
```bash
1. Search: grep -r "import.*router.*from" mobile/app/
2. Review: Mỗi file có dùng router.back() hay router.push()
3. Convert: Đổi sang useRouter() hook nếu có lỗi
4. Test: Từng screen một
```

### Priority 3: Add Safety Patterns (LOW - Nice to have)
```bash
1. Create: mobile/lib/navigation-helpers.ts
2. Add: Safe navigation wrapper functions
3. Use: Import trong các screens cần
4. Document: Update README với best practices
```

---

## 📚 BEST PRACTICES (Tránh Lỗi Tương Tự)

### ✅ DO's (NÊN LÀM)

1. **Always use hooks for navigation**:
   ```tsx
   // ✅ CORRECT
   import { useRouter } from 'expo-router';
   const router = useRouter(); // Inside component
   ```

2. **Declare all hooks BEFORE any early returns**:
   ```tsx
   const RestaurantDetailScreen = () => {
     // ✅ All hooks first
     const router = useRouter();
     const params = useLocalSearchParams();
     const [state, setState] = useState();
     
     // ✅ Then early returns
     if (!params.id) return <ErrorView />;
     if (loading) return <LoadingView />;
     
     // ✅ Main render
     return <MainView />;
   }
   ```

3. **Use try-catch for navigation**:
   ```tsx
   const handleNavigation = () => {
     try {
       router.back();
     } catch (error) {
       console.error('Navigation error:', error);
       router.replace('/(tabs)');
     }
   };
   ```

4. **Check navigation state**:
   ```tsx
   import { useNavigation } from 'expo-router';
   
   const navigation = useNavigation();
   
   const handleBack = () => {
     if (navigation.canGoBack()) {
       router.back();
     } else {
       router.replace('/(tabs)');
     }
   };
   ```

### ❌ DON'Ts (TRÁNH)

1. **❌ Import router as object**:
   ```tsx
   // ❌ WRONG - Can cause navigation context error
   import { router } from 'expo-router';
   ```

2. **❌ Call navigation in render phase**:
   ```tsx
   // ❌ WRONG - Causes infinite loop
   const MyScreen = () => {
     router.push('/home'); // Called every render!
     return <View />;
   }
   ```

3. **❌ Access router before component mount**:
   ```tsx
   // ❌ WRONG - Context not ready yet
   import { router } from 'expo-router';
   router.push('/home'); // Global scope!
   
   const MyScreen = () => {
     return <View />;
   }
   ```

4. **❌ Wrap Stack with UI components**:
   ```tsx
   // ❌ WRONG - Breaks navigation context
   <SafeAreaView>
     <Stack />
   </SafeAreaView>
   
   // ✅ CORRECT
   <SafeAreaProvider>
     <Stack />
   </SafeAreaProvider>
   ```

---

## 🔗 RELATED FILES

### Files Modified in This Fix:
- `mobile/app/restaurant-detail.tsx` - Main fix location
- `mobile/app/_layout.tsx` - Already fixed (SafeAreaView removed)

### Files to Review:
- `mobile/app/vnpay-payment.tsx` - Has `import { router }`
- `mobile/app/payment-selection.tsx` - Has `import { router }`
- `mobile/app/payment-result.tsx` - Has `import { router }`
- `mobile/app/notifications.tsx` - Has `import { router }`
- `mobile/app/menu-detail.tsx` - Has `import { router }`
- `mobile/app/location-picker.tsx` - Has `import { router }`
- `mobile/app/edit-profile.tsx` - Has `import { router }`
- `mobile/app/checkout.tsx` - Has `import { router }`
- `mobile/app/cart.tsx` - Has `import { router }`
- `mobile/app/(tabs)/**/*.tsx` - Multiple files
- `mobile/app/(auth)/**/*.tsx` - Multiple files

### Components to Test:
- `RestaurantDetailScreen` - Primary fix
- `RestaurantHeader` - Uses navigation?
- `MenuCard` - Click to navigate
- `ReviewCard` - May have navigation
- `CartButton` - Navigate to cart

---

## 📊 SUCCESS CRITERIA

### ✅ Fix Successful When:
1. ✅ App loads without "Couldn't find a navigation context" error
2. ✅ Can navigate to Restaurant Detail screen
3. ✅ Back button works without crash
4. ✅ Category dropdown opens and navigates smoothly
5. ✅ All tab navigation works
6. ✅ Deep links work (notifications, etc.)
7. ✅ No console errors about navigation
8. ✅ Hot reload doesn't break navigation

### 📈 Performance Metrics:
- **Load Time**: < 2s to first render
- **Navigation**: < 300ms transition
- **Memory**: Stable, no leaks
- **Crashes**: 0 navigation-related crashes

---

## 🆘 TROUBLESHOOTING

### If Error Persists After Fix:

#### 1. Clear Cache Completely
```bash
cd mobile
rm -rf node_modules/.cache
rm -rf .expo
npx expo start --clear
```

#### 2. Check All Router Imports
```bash
grep -rn "import.*router" app/
```

#### 3. Verify expo-router Version
```bash
npm list expo-router
# Should be: expo-router@^3.x.x or ^4.x.x
```

#### 4. Check for Conflicting Navigation Libraries
```bash
grep -r "react-navigation" package.json
# Should only see @react-navigation (peer deps of expo-router)
```

#### 5. Verify Stack Setup
```tsx
// _layout.tsx should have:
<Stack screenOptions={{ headerShown: false }} />
// NOT wrapped in other components
```

#### 6. Enable Debug Logging
```tsx
// Add to _layout.tsx
import { LogBox } from 'react-native';

// Temporarily remove to see full errors:
LogBox.ignoreLogs([
  // '[Reanimated]',
  // 'NavigationContainer',
]);
```

---

## 📝 CONCLUSION

### Root Cause:
**`router` object được import trực tiếp từ `expo-router` và được access trong component render phase trước khi NavigationContainer sẵn sàng.**

### Solution:
**Đổi từ `import { router }` sang `import { useRouter }` và sử dụng hook `const router = useRouter()` bên trong component.**

### Impact:
- **Severity**: 🔴 CRITICAL (App không chạy được)
- **Fix Time**: ⚡ 5 phút (1 file, 2 lines)
- **Risk**: 🟢 LOW (Safe fix, recommended pattern)
- **Testing**: 🟡 MEDIUM (Cần test nhiều screens)

### Next Steps:
1. ✅ Fix `restaurant-detail.tsx` (IMMEDIATE)
2. 🔍 Audit other files with `import { router }` (TODAY)
3. 🧪 Test all navigation flows (TODAY)
4. 📝 Update documentation (OPTIONAL)
5. 🚀 Deploy fix to production (AFTER TESTING)

---

## 📞 SUPPORT

If issues persist:
1. Check Expo Router docs: https://docs.expo.dev/router/introduction/
2. Review React Navigation: https://reactnavigation.org/docs/getting-started
3. Search similar issues: https://github.com/expo/expo/issues
4. Ask on Discord: https://discord.gg/expo

---

**Generated**: 9/11/2025  
**Status**: 🔴 CRITICAL FIX REQUIRED  
**Priority**: P0 - Blocking Production
