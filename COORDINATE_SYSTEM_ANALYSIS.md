# 🗺️ Phân Tích Nguồn Gốc Tọa Độ Bản Đồ - FoodFast System

## 📋 Tổng Quan

Hệ thống FoodFast sử dụng nhiều nguồn khác nhau để lấy tọa độ bản đồ cho việc tracking drone và giao hàng. Dưới đây là phân tích chi tiết về từng nguồn tọa độ.

## 🎯 Các Nguồn Tọa Độ

### **1. Tọa Độ Nhà Hàng (Restaurant Coordinates)**

#### **Nguồn:** Database restaurants collection
```typescript
// Từ database restaurants
interface Restaurant {
  latitude: number;    // Tọa độ được lưu sẵn trong DB
  longitude: number;   // Tọa độ được lưu sẵn trong DB
  // ... other fields
}

// order-tracking.tsx - Line 78
setRestaurantCoords({
  latitude: restaurantDoc.latitude,   // Từ DB
  longitude: restaurantDoc.longitude, // Từ DB
});
```

#### **Cách Thức:**
- Tọa độ nhà hàng được **lưu sẵn trong database** khi tạo restaurant
- Admin/Restaurant owner nhập tọa độ khi đăng ký
- Có thể được lấy từ Google Maps API hoặc nhập thủ công

#### **Example Data:**
```typescript
// Restaurant trong DB
{
  name: "KFC Nguyễn Văn Cừ",
  latitude: 10.762622,    // Tọa độ HCM cụ thể
  longitude: 106.660172,
  address: "123 Nguyễn Văn Cừ, Q5, HCM"
}
```

---

### **2. Tọa Độ Khách Hàng (Customer Coordinates)**

#### **Nguồn:** 3-tier fallback system

#### **Tier 1: Geocoding từ Delivery Address**
```typescript
// order-tracking.tsx - Line 101
const geocoded = await Location.geocodeAsync(order.deliveryAddress);
if (geocoded.length > 0) {
  setCustomerCoords({ 
    latitude: geocoded[0].latitude, 
    longitude: geocoded[0].longitude 
  });
}
```

**Cách hoạt động:**
- Lấy `deliveryAddress` từ order (string address)
- Sử dụng **Expo Location.geocodeAsync()** 
- Expo gọi native geocoding service (Google/Apple)
- Convert địa chỉ text → tọa độ lat/lng

**Example:**
```
Input:  "123 Lê Văn Việt, Quận 9, TP.HCM"
Output: { latitude: 10.841117, longitude: 106.810370 }
```

#### **Tier 2: GPS Device Location**
```typescript
// order-tracking.tsx - Line 113
const position = await Location.getCurrentPositionAsync({});
setCustomerCoords({
  latitude: position.coords.latitude,
  longitude: position.coords.longitude,
});
```

**Cách hoạt động:**
- Request location permission từ user
- Sử dụng **device GPS** để lấy vị trí hiện tại
- Fallback khi geocoding fail

#### **Tier 3: Default Coordinates**
```typescript
// order-tracking.tsx - Line 24
const DEFAULT_COORDINATE: LatLng = {
  latitude: 10.762622,   // HCM City center
  longitude: 106.660172,
};
```

**Khi sử dụng:**
- Geocoding fail
- GPS permission denied 
- Location service unavailable

---

### **3. Tọa Độ Drone (Drone Coordinates)**

#### **Nguồn:** Simulation Algorithm + Real-time Updates

#### **3.1 Drone Base Location:**
```typescript
// drone-simulator.ts - Line 80
const droneBaseCoords: Coordinate = {
  latitude: restaurantCoords.latitude + 0.005,  // ~500m from restaurant
  longitude: restaurantCoords.longitude + 0.005,
};
```

**Logic:**
- Drone bắt đầu từ "base" gần nhà hàng (~500m)
- Tính toán relative từ restaurant coordinates
- `0.005` degree ≈ 500 meters

#### **3.2 Waypoint Calculation:**
```typescript
// drone-simulator.ts - Line 28
export const calculateWaypoints = (
  start: Coordinate,
  end: Coordinate,
  steps: number = 24
): Coordinate[] => {
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const easeInOut = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    waypoints.push({
      latitude: start.latitude + (end.latitude - start.latitude) * easeInOut,
      longitude: start.longitude + (end.longitude - start.longitude) * easeInOut,
    });
  }
};
```

**Cách tính:**
- **Linear interpolation** giữa 2 điểm
- **Easing function** cho movement mượt mà
- Chia thành nhiều steps (default 24 steps)
- Mỗi step = 1 coordinate point

#### **3.3 Real-time Position Updates:**
```typescript
// api-helpers.ts - updateDroneLocation
await databases.updateDocument(
  databaseId,
  appwriteConfig.dronesCollectionId,
  droneId,
  {
    currentLatitude: latitude,    // Update DB
    currentLongitude: longitude,
  }
);

// Create event cho real-time tracking
await databases.createDocument(
  databaseId,
  appwriteConfig.droneEventsCollectionId,
  ID.unique(),
  {
    droneId,
    latitude,        // Event coordinates
    longitude,
    eventType: 'position_update',
    timestamp: new Date().toISOString(),
  }
);
```

---

## 🗃️ Database Schema cho Coordinates

### **1. Restaurants Collection:**
```typescript
interface Restaurant {
  name: string;
  latitude: number;     // Static - nhập khi tạo restaurant
  longitude: number;    // Static - nhập khi tạo restaurant
  address: string;      // Text address
}
```

### **2. Orders Collection:**
```typescript
interface Order {
  deliveryAddress: string;    // Text address từ user input
  deliveryLatitude?: number;  // Optional - có thể cache geocoded result
  deliveryLongitude?: number; // Optional - có thể cache geocoded result
}
```

### **3. Drones Collection:**
```typescript
interface Drone {
  currentLatitude?: number;   // Real-time position
  currentLongitude?: number;  // Real-time position
  baseLatitude: number;       // Home base coordinates
  baseLongitude: number;      // Home base coordinates
}
```

### **4. Drone Events Collection:**
```typescript
interface DroneEvent {
  droneId: string;
  latitude?: number;          // Event location
  longitude?: number;         // Event location
  eventType: string;          // position_update, takeoff, landing, etc.
  timestamp: string;
}
```

---

## 🔄 Coordinate Flow trong System

### **Phase 1: Order Creation**
```
User Input Address → Order.deliveryAddress (string)
Example: "123 Lê Văn Việt, Q9, HCM"
```

### **Phase 2: Order Tracking Initialization**
```
1. Restaurant coords: Database → setRestaurantCoords()
2. Customer coords:   
   ├─ Try geocodeAsync(deliveryAddress) 
   ├─ Fallback: getCurrentPositionAsync()
   └─ Final fallback: DEFAULT_COORDINATE
```

### **Phase 3: Drone Simulation**
```
1. Base coords: restaurant + offset (500m)
2. Waypoints: calculateWaypoints(base → restaurant → customer)
3. Real-time: updateDroneLocation() every step
```

### **Phase 4: Real-time Tracking**
```
UI Subscribe → DroneEvents → Update map markers
```

---

## 🌍 Coordinate Systems & Standards

### **Coordinate Format:**
- **Standard:** WGS84 (World Geodetic System 1984)
- **Format:** Decimal degrees (DD)
- **Precision:** 6 decimal places ≈ 0.1 meter accuracy

### **HCM City Reference Points:**
```typescript
// District 1 center
latitude: 10.762622, longitude: 106.660172

// Common areas:
Ben Thanh Market:  10.772431, 106.698240
Tan Son Nhat:      10.818700, 106.651290
HCMC University:   10.762622, 106.660172 (default)
```

### **Distance Calculations:**
```typescript
// 1 degree latitude ≈ 111 km
// 1 degree longitude (tại VN) ≈ 111 * cos(10.7°) ≈ 109 km
// 0.001 degree ≈ 100-110 meters
// 0.005 degree ≈ 500-550 meters (drone base offset)
```

---

## 🧪 Testing Coordinates

### **Test Scenarios:**

#### **Valid Addresses:**
```typescript
const testAddresses = [
  "123 Nguyễn Văn Cừ, Quận 5, TP.HCM",
  "456 Lê Văn Việt, Quận 9, TP.HCM", 
  "789 Trần Hưng Đạo, Quận 1, TP.HCM"
];

// Expected: All should geocode successfully
```

#### **Invalid/Edge Cases:**
```typescript
const edgeCases = [
  "",                    // Empty string
  "Invalid address",     // Non-existent 
  "123 XYZ Street",      // Vague address
  null,                  // Null value
  undefined              // Undefined
];

// Expected: Fallback to GPS or DEFAULT_COORDINATE
```

### **Coordinate Validation:**
```typescript
const isValidCoordinate = (lat: number, lng: number): boolean => {
  // Vietnam boundaries (approximate)
  const vietnamBounds = {
    north: 23.393,    // Cao Bang
    south: 8.180,     // Ca Mau
    east: 109.464,    // Quang Ninh
    west: 102.148     // Dien Bien
  };
  
  return lat >= vietnamBounds.south && 
         lat <= vietnamBounds.north && 
         lng >= vietnamBounds.west && 
         lng <= vietnamBounds.east;
};
```

---

## ⚡ Performance & Optimization

### **Geocoding Optimization:**
```typescript
// Cache geocoded results
const geocodeCache = new Map<string, {lat: number, lng: number}>();

const geocodeWithCache = async (address: string) => {
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address);
  }
  
  const result = await Location.geocodeAsync(address);
  if (result.length > 0) {
    const coords = { lat: result[0].latitude, lng: result[0].longitude };
    geocodeCache.set(address, coords);
    return coords;
  }
  
  return null;
};
```

### **Rate Limiting:**
```typescript
// Limit geocoding requests
const geocodingQueue = new Queue(1); // 1 request at a time
const GEOCODING_DELAY = 100; // 100ms between requests
```

---

## 🔧 Development Tools

### **Debug Coordinates:**
```typescript
// order-tracking.tsx debug
console.log('🏪 Restaurant:', restaurantCoords);
console.log('🏠 Customer:', customerCoords);  
console.log('🚁 Drone:', droneCoords);
console.log('📍 Path:', dronePath);
```

### **Coordinate Conversion Utils:**
```typescript
// Utils for coordinate handling
export const formatCoordinate = (coord: number): string => {
  return coord.toFixed(6); // 6 decimal precision
};

export const calculateDistance = (
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number => {
  // Haversine formula implementation
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
            
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
};
```

---

## 🎯 Key Takeaways

### **Coordinate Sources Summary:**
1. **Restaurant:** Database (static, pre-stored)
2. **Customer:** Geocoding → GPS → Default fallback
3. **Drone:** Algorithmic calculation + real-time simulation

### **Precision Levels:**
- **Restaurant:** High (manually verified)
- **Customer:** Medium (geocoding dependent)
- **Drone:** High (calculated/simulated)

### **Error Handling:**
- Multiple fallback layers
- Graceful degradation
- Default coordinates for worst case

### **Real-time Updates:**
- WebSocket-based event system
- Database-driven coordinate storage
- UI reactive to coordinate changes

---

**Tech Stack:** 📍 **Expo Location API + Appwrite Database**  
**Coordinate System:** 🌐 **WGS84 Decimal Degrees**  
**Fallback Strategy:** 🔄 **3-tier: Geocoding → GPS → Default**  
**Real-time:** ⚡ **WebSocket + Database Events**