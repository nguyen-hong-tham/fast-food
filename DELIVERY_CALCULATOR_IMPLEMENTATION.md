# 🚚 Delivery Calculator Implementation - FoodFast System

## 📋 Tổng Quan

Đã implement hệ thống tính toán **thời gian ước tính giao hàng** và **phí ship** dựa trên khoảng cách thực tế từ vị trí khách hàng đến cửa hàng.

## ⚙️ Cấu Hình Delivery

### **Thông Số Tính Toán:**
- **Thời gian:** 1km = 5 phút
- **Phí ship:** 6.000₫/1km  
- **Thời gian chuẩn bị:** 15 phút (cooking time)
- **Tối thiểu:** Dưới 1km vẫn tính 1km (6k, 5 phút)

### **Formula:**
```typescript
// Khoảng cách
distance = calculateDistance(restaurantLat, restaurantLng, customerLat, customerLng);

// Thời gian giao hàng (chỉ delivery)
deliveryTime = Math.max(Math.ceil(distance * 5), 5); // phút

// Tổng thời gian (prep + delivery)  
totalTime = 15 + deliveryTime; // phút

// Phí ship
shippingCost = Math.max(Math.ceil(distance * 6000), 6000); // VND
```

---

## 🗂️ Files Đã Tạo/Chỉnh Sửa

### **1. Core Library Files:**

#### **`mobile/lib/delivery-calculator.ts`** ✨ NEW
- **Purpose:** Core logic tính toán delivery
- **Functions:**
  - `calculateDelivery()` - Tính toán từ tọa độ
  - `calculateDeliveryFromAddress()` - Tính toán từ địa chỉ string
  - `calculateDeliveryWithFallback()` - Với fallback values
  - `formatCurrency()` - Format tiền VND

#### **`mobile/hooks/useDeliveryCalculation.ts`** ✨ NEW  
- **Purpose:** React hook để sử dụng delivery calculator
- **Features:**
  - State management (calculation, loading, error)
  - `calculateFromCoords()` method
  - `calculateFromAddress()` method  
  - Error handling và fallback

#### **`mobile/components/DeliveryInfoCard.tsx`** ✨ NEW
- **Purpose:** Reusable components hiển thị delivery info
- **Components:**
  - `DeliveryInfoCard` - Main component (3 styles)
  - `DeliveryInfoBadge` - Compact badge
  - `DeliveryInfoSummary` - Checkout summary style

### **2. Updated Existing Files:**

#### **`mobile/app/checkout.tsx`** 🔄 UPDATED
- **Added:** 
  - Import delivery calculator hook
  - Restaurant data fetching  
  - Auto calculation khi address thay đổi
  - Subtotal + shipping fee breakdown
  - Updated total calculation trong button

**Before:**
```tsx
<Text>Delivery fee included</Text>
```

**After:**
```tsx
<View>Subtotal: {subtotal}₫</View>
<View>Shipping: {shippingCost}₫</View> 
<View>Total: {total}₫</View>
```

#### **`mobile/app/order-tracking.tsx`** 🔄 UPDATED
- **Added:**
  - Import delivery calculator hook
  - Auto calculation từ order delivery address
  - Display delivery info trong "Delivery Details" section

**New Section:**
```tsx
{deliveryCalc && (
  <View>
    <Text>📍 Distance: {deliveryCalc.formattedDistance}</Text>
    <Text>⏰ Time: {deliveryCalc.formattedTime}</Text>
    <Text>💰 Fee: {deliveryCalc.formattedCost}</Text>
  </View>
)}
```

---

## 🎯 Integration Points

### **1. Checkout Flow:**
```
User enters address → Geocode → Calculate distance → Show time & cost → Update total
```

### **2. Order Tracking:**
```  
Load order → Get restaurant coords → Calculate from delivery address → Display info
```

### **3. Data Flow:**
```
Address/Coords → calculateDistance() → DELIVERY_CONFIG → DeliveryCalculation → UI
```

---

## 🧪 Testing Scenarios

### **Test Cases:**

#### **Valid Addresses:**
```typescript
const testCases = [
  {
    restaurant: { lat: 10.762622, lng: 106.660172 }, // HCM center
    customer: "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
    expected: { distance: "~2km", time: "~25min", cost: "12,000₫" }
  },
  {
    restaurant: { lat: 10.762622, lng: 106.660172 },
    customer: "456 Lê Văn Việt, Quận 9, TP.HCM", 
    expected: { distance: "~8km", time: "~55min", cost: "48,000₫" }
  }
];
```

#### **Edge Cases:**
- **Empty address:** Fallback to 1km, 20min, 6k
- **Geocoding fail:** Same fallback  
- **Very close (<1km):** Still charge minimum 6k, 20min
- **Very far (>20km):** Calculate accordingly

#### **Real Distance Examples:**
```
Ben Thanh → District 9: ~15km → 90min → 90,000₫
District 1 → Airport: ~8km → 55min → 48,000₫  
Nguyen Van Cu → Tan Binh: ~5km → 40min → 30,000₫
```

---

## 🎨 UI Components Usage

### **Checkout Screen:**
```tsx
import { DeliveryInfoCard } from '@/components/DeliveryInfoCard';

// Detailed style với preparation time
<DeliveryInfoCard calculation={deliveryCalc} style="detailed" />
```

### **Order Tracking:**
```tsx
// Default style - compact trong delivery details
<DeliveryInfoCard calculation={deliveryCalc} style="default" />
```

### **Other Usage Examples:**
```tsx
// Compact badge
<DeliveryInfoBadge calculation={deliveryCalc} />

// Summary for checkout
<DeliveryInfoSummary calculation={deliveryCalc} />
```

---

## 📱 User Experience

### **Checkout Process:**
1. **Address Input** → Auto calculate delivery
2. **Real-time Updates** → Address thay đổi → Update time/cost
3. **Clear Breakdown** → Subtotal + Shipping = Total
4. **Loading States** → "Calculating delivery..." khi processing

### **Order Tracking:**
1. **Immediate Display** → Load order → Show delivery info ngay
2. **Consistent Info** → Same calculation như lúc checkout
3. **Context Info** → Distance, time estimate, shipping paid

---

## 🔧 Configuration

### **Adjustable Constants:**
```typescript
// mobile/lib/delivery-calculator.ts
export const DELIVERY_CONFIG = {
  TIME_PER_KM: 5,        // 5 phút/km
  COST_PER_KM: 6000,     // 6k/km
  PREPARATION_TIME: 15,   // 15 phút prep
  MIN_DISTANCE: 1,        // Minimum 1km
  MIN_COST: 6000,        // Minimum 6k
  MIN_TIME: 5,           // Minimum 5 phút delivery
};
```

### **Easy Updates:**
- Change `TIME_PER_KM` → Update delivery speed
- Change `COST_PER_KM` → Update pricing  
- Change `PREPARATION_TIME` → Update cooking time
- All calculations auto-update throughout app

---

## ⚡ Performance Optimizations

### **Geocoding Cache:**
- Cache address → coordinates mapping
- Avoid repeat API calls cho same address

### **Calculation Efficiency:**
- Haversine formula optimized
- Local calculations (no API calls)
- Instant updates khi address change

### **Error Handling:**
- Graceful fallbacks
- Multiple retry mechanisms
- User-friendly error states

---

## 🚀 Future Enhancements

### **Potential Improvements:**
1. **Dynamic Pricing:** Time-based, demand-based rates
2. **Multiple Delivery Options:** Standard, Express, Scheduled
3. **Route Optimization:** Consider traffic, road conditions  
4. **Delivery Zones:** Different rates per area
5. **Promo Codes:** Free shipping thresholds
6. **Real-time ETA:** Update during actual delivery

### **Integration Opportunities:**
1. **Google Maps Integration:** Real road distance vs straight-line
2. **Weather API:** Adjust time for rain/traffic
3. **Driver Tracking:** Real-time location updates
4. **Push Notifications:** ETA updates to customers

---

## 🎯 Key Benefits

### **For Users:**
- ✅ **Transparent Pricing** - Know exact shipping cost upfront
- ✅ **Accurate Timing** - Realistic delivery estimates  
- ✅ **Fair Calculation** - Distance-based, consistent pricing
- ✅ **Real-time Updates** - Instant feedback on address changes

### **For Business:**
- ✅ **Consistent Revenue** - Fair shipping charges
- ✅ **Operational Planning** - Accurate delivery estimates
- ✅ **Customer Trust** - Transparent, predictable costs
- ✅ **Scalable System** - Easy to adjust rates/timing

---

**Implementation Status:** ✅ **COMPLETE**  
**Test Status:** 🧪 **READY FOR TESTING**  
**User Impact:** 🎯 **HIGH - Better cost transparency & delivery estimates**

---

**Delivery Calculator: 6k/km, 5min/km + 15min prep** 🚚⚡💰