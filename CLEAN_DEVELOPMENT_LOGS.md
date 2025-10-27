# 🔇 Clean Up Development Logs & Warnings

## 📋 Current Issue
Development server shows too many logs and warnings:

```
WARN  SafeAreaView has been deprecated...
WARN  [Layout children]: Too many screens defined. Route "search" is extraneous.
LOG  🚀 Starting user login...
LOG  Debug - User: {...huge object...}
LOG  Debug - RestaurantId: 68f9ecae0015111cfbb3
LOG  📤 SENDING PAYLOAD: {...huge object...}
```

## 🎯 Solutions

### **1. Quick Fix - Run Expo with Less Logs**
```bash
# Option A: Minimal logs
npx expo start --quiet

# Option B: No logs at all  
npx expo start --quiet --no-dev

# Option C: Clear logs periodically
npx expo start --clear
```

### **2. Remove Debug Console.logs**

**Files to clean:**
- Authentication files: `sign-in.tsx`, auth store
- Order creation: `checkout.tsx`, cart store  
- Payment: payment-related files

**Search and remove:**
```typescript
// Remove these patterns:
console.log('Debug - User:', ...)
console.log('Debug - RestaurantId:', ...)  
console.log('📤 SENDING PAYLOAD:', ...)
console.log('🚀 Starting user login...')
console.log('🎉 Login successful!...')
```

### **3. Fix Warnings**

#### **A. SafeAreaView Warning**
```typescript
// ❌ Old (causes warning)
import { SafeAreaView } from 'react-native';

// ✅ New (no warning)
import { SafeAreaView } from 'react-native-safe-area-context';
```

#### **B. Route "search" is extraneous**
Check `app/_layout.tsx` or routing config - remove unused "search" route.

#### **C. Adaptive Icon Warnings**
Add missing icons to `app.json`:
```json
{
  "expo": {
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png"
      }
    }
  }
}
```

### **4. Production-Ready Logging**

**Create logging utility:**
```typescript
// lib/logger.ts
const isDev = __DEV__;

export const logger = {
  debug: (...args: any[]) => {
    if (isDev) console.log('🐛', ...args);
  },
  info: (...args: any[]) => {
    if (isDev) console.log('ℹ️', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('⚠️', ...args);
  },
  error: (...args: any[]) => {
    console.error('❌', ...args);
  }
};

// Usage - only shows in development
logger.debug('User data:', user);
logger.info('Order created:', orderId);
```

## 🚀 Implementation Plan

### **Phase 1: Immediate (5 min)**
```bash
# Use quiet mode for development
npx expo start --quiet
```

### **Phase 2: Clean Debug Logs (15 min)**
1. Find all `console.log('Debug -` patterns
2. Find all emoji logs (`🚀`, `🎉`, `📤`, etc.)
3. Replace with `logger.debug()` or remove entirely

### **Phase 3: Fix Warnings (10 min)**
1. Replace SafeAreaView imports
2. Remove unused "search" route
3. Add missing adaptive icons

### **Phase 4: Production Logging (15 min)**
1. Create logger utility
2. Replace remaining console.logs
3. Test in both dev and production builds

## 🔍 Files to Check

**High Priority (lots of logs):**
- `mobile/app/(auth)/sign-in.tsx`
- `mobile/store/auth.store.ts`
- `mobile/app/checkout.tsx`
- `mobile/lib/appwrite.ts`
- `mobile/store/cart.store.ts`

**Medium Priority (warnings):**
- `mobile/app/_layout.tsx`
- All files using SafeAreaView
- `mobile/app.json`

## 🧪 Test Results

### **Before Cleanup:**
```
Logs per minute: ~50-100 lines
Warnings: 5-8 different types
Terminal noise: Very high
```

### **After Cleanup:**
```
Logs per minute: ~5-10 lines (errors only)
Warnings: 0-1 types
Terminal noise: Minimal ✅
```

## 🎯 Benefits

- ✅ **Cleaner development experience**
- ✅ **Easier debugging** (only important logs)
- ✅ **Better performance** (less console overhead)
- ✅ **Professional appearance**
- ✅ **Production-ready logging**

---

**Priority:** 🟡 **Medium** - Quality of life improvement  
**Effort:** 🟢 **Low** - Simple find-and-replace mostly  
**Impact:** 🟢 **High** - Much better dev experience