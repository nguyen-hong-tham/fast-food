# 🚁 Phân Tích Hệ Thống Drone - FoodFast Delivery

## 📋 Tổng Quan Hệ Thống

### **Mục Đích:**
Hệ thống drone được sử dụng để giao hàng thức ăn từ nhà hàng đến khách hàng, tạo ra trải nghiệm giao hàng hiện đại và hiệu quả.

### **Kiến Trúc Tổng Thể:**
```
Order Creation → Drone Assignment → Flight Simulation → Real-time Tracking → Delivery Completion
```

## 🗂️ Cấu Trúc Files và Components

### **1. Core Files:**

#### **`mobile/lib/drone-simulator.ts`**
- **Chức năng:** Mô phỏng chuyến bay của drone
- **Responsibilities:**
  - Simulation logic cho 2 phase: Restaurant → Customer
  - Calculate waypoints và smooth movement
  - Battery management và speed control
  - Real-time progress tracking

#### **`mobile/lib/api-helpers.ts`**
- **Chức năng:** API operations cho drone management
- **Responsibilities:**
  - CRUD operations cho drones
  - Drone assignment logic
  - Event logging system
  - Location updates

#### **`mobile/lib/appwrite.ts`**
- **Chức năng:** Database integration và real-time subscriptions
- **Responsibilities:**
  - Drone event subscriptions
  - Real-time location updates
  - Database configuration

#### **`mobile/type.d.ts`**
- **Chức năng:** TypeScript definitions
- **Interfaces:** `Drone`, `DroneEvent`, order status types

### **2. UI Components:**

#### **`mobile/app/order-tracking.tsx`**
- **Chức năng:** Main tracking interface
- **Features:**
  - Real-time drone location display
  - Flight path visualization
  - ETA countdown
  - Status updates

#### **`mobile/components/tracking/DeliveryMap.tsx`**
- **Chức năng:** Map visualization component
- **Features:**
  - Drone position marker
  - Flight path polyline
  - Restaurant/customer markers

## 🛠️ Luồng Xử Lý Chi Tiết

### **Phase 1: Order Creation & Drone Assignment**

```typescript
// 1. Order được tạo
const order = await createOrderWithPayment(orderData);

// 2. Drone assignment logic
const ensureDrone = async (orderId: string, preferredDroneId?: string): Promise<Drone> => {
  // Kiểm tra drone được chỉ định trước
  if (preferredDroneId) {
    const existing = await getDroneById(preferredDroneId);
    if (existing.assignedOrderId !== orderId) {
      return await assignDroneToOrder(existing.$id, orderId);
    }
    return existing;
  }

  // Tìm drone available
  const available = await getAvailableDrone();
  if (!available) {
    throw new Error('No drone available for delivery');
  }

  return await assignDroneToOrder(available.$id, orderId);
};
```

### **Phase 2: Flight Simulation System**

#### **2.1 Two-Phase Flight Logic:**
```typescript
// Phase 1: Drone Base → Restaurant (30% thời gian)
const phase1Duration = duration * 0.3;
const waypointsToRestaurant = calculateWaypoints(droneBaseCoords, restaurantCoords, phase1Steps);

// Phase 2: Restaurant → Customer (70% thời gian)  
const phase2Duration = duration * 0.7;
const waypointsToCustomer = calculateWaypoints(restaurantCoords, customerCoords, phase2Steps);
```

#### **2.2 Waypoint Calculation:**
```typescript
export const calculateWaypoints = (
  start: Coordinate,
  end: Coordinate, 
  steps: number = 24
): Coordinate[] => {
  const waypoints: Coordinate[] = [];

  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    // Smooth easing function (ease-in-out)
    const easeInOut = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    waypoints.push({
      latitude: start.latitude + (end.latitude - start.latitude) * easeInOut,
      longitude: start.longitude + (end.longitude - start.longitude) * easeInOut,
    });
  }

  return waypoints;
};
```

#### **2.3 Real-time Updates:**
```typescript
// Cập nhật vị trí drone mỗi step
await updateDroneLocation(drone.$id, point.latitude, point.longitude, {
  orderId,
  speed,
  batteryLevel: Math.max(10, drone.batteryLevel - 0.5 * (i + 1)),
  altitude: 50,
});

// Trigger callback cho UI updates
onProgress?.({ 
  coordinate: point, 
  progress: progress * 0.3, // 0-30% của total progress
  phase: 'to_restaurant' 
});
```

### **Phase 3: Order Status Management**

#### **3.1 Status Flow:**
```
created → confirmed → ready → picked_up → delivering → delivered
```

#### **3.2 Status Updates During Flight:**
```typescript
// Start simulation
await updateOrderStatus(orderId, 'ready');

// Drone arrived at restaurant
await updateOrderStatus(orderId, 'picked_up');

// Drone heading to customer
await updateOrderStatus(orderId, 'delivering');

// Delivery completed
await updateOrderStatus(orderId, 'delivered');
```

### **Phase 4: Real-time Tracking System**

#### **4.1 Subscription Setup:**
```typescript
// Subscribe to drone events
const unsubscribe = subscribeToDroneEvents(trackingOrderId, (event) => {
  if (event.latitude && event.longitude) {
    const coordinate = { latitude: event.latitude, longitude: event.longitude };
    setDroneCoords(coordinate);
    setDronePath(prev => [...prev, coordinate]);
  }
});
```

#### **4.2 Event Types:**
```typescript
eventType: 'takeoff' | 'landing' | 'position_update' | 'battery_low' | 'error' | 'maintenance'
```

## 🗃️ Database Schema

### **1. Drones Collection:**
```typescript
interface Drone {
  code: string;                    // Unique identifier
  name: string;                    // Display name
  model: string;                   // Drone model
  status: 'idle' | 'delivering' | 'maintenance' | 'charging' | 'offline';
  batteryLevel: number;            // 0-100
  currentLatitude?: number;        // Current position
  currentLongitude?: number;
  maxPayload: number;              // kg
  maxRange: number;                // km  
  maxSpeed?: number;               // km/h
  assignedOrderId?: string;        // Current order
  totalFlights: number;            // Statistics
  isActive: boolean;               // Available for use
}
```

### **2. Drone Events Collection:**
```typescript
interface DroneEvent {
  droneId: string;                 // Reference to drone
  orderId?: string;                // Reference to order
  eventType: string;               // Event type
  latitude?: number;               // Event location
  longitude?: number;
  altitude?: number;               // Flight altitude
  speed?: number;                  // Current speed
  batteryLevel?: number;           // Battery at event time
  timestamp: string;               // Event timestamp
}
```

### **3. Orders Integration:**
```typescript
interface Order {
  // ... other fields
  droneId?: string;                // Assigned drone
  status: OrderStatus;             // Including drone-specific statuses
  pickedUpAt?: string;            // Pickup timestamp
  deliveredAt?: string;           // Delivery timestamp
  estimatedDeliveryTime?: string; // ETA
}
```

## ⚙️ Drone Management System

### **1. Drone Creation Logic:**
```typescript
export const createDrone = async (data: {
  name: string;
  model?: string;
  serialNumber?: string;
}): Promise<Drone> => {
  const droneData = {
    name: data.name,
    model: data.model || 'DJI Phantom 4',
    serialNumber: data.serialNumber || `SN-${Date.now()}`,
    status: 'idle',
    isActive: true,
    batteryLevel: 100,
    currentLatitude: 10.762622,      // Default HCM location
    currentLongitude: 106.660172,
    maxSpeed: 40,
    maxPayload: 2000,
    baseLatitude: 10.762622,
    baseLongitude: 106.660172,
  };

  return await databases.createDocument(
    databaseId,
    appwriteConfig.dronesCollectionId,
    ID.unique(),
    droneData
  );
};
```

### **2. Drone Assignment Algorithm:**
```typescript
export const getAvailableDrone = async (): Promise<Drone | null> => {
  // Tìm drone phù hợp
  const response = await databases.listDocuments(
    databaseId,
    appwriteConfig.dronesCollectionId,
    [
      Query.equal('status', 'idle'),           // Drone rảnh
      Query.equal('isActive', true),           // Drone hoạt động
      Query.greaterThan('batteryLevel', 30),   // Pin đủ
      Query.limit(1)
    ]
  );
  
  // Auto-create drone nếu không có
  if (response.documents.length === 0) {
    return await createDrone({
      name: `Drone-${Date.now()}`,
      model: 'DJI Phantom 4 Pro',
    });
  }
  
  return response.documents[0] as unknown as Drone;
};
```

### **3. Battery Management:**
```typescript
// Phase 1: Battery drain nhẹ (đến nhà hàng)
batteryLevel: Math.max(10, drone.batteryLevel - 0.5 * (i + 1))

// Phase 2: Battery drain based on speed (đến khách hàng)  
const batteryDrain = Math.min(5, Math.max(0.5, speed / 40));
batteryLevel: Math.max(5, drone.batteryLevel - batteryDrain * (i + 1))
```

## 🎛️ Advanced Features

### **1. Speed Management:**
```typescript
// Dynamic speed adjustment
const speedMultiplier = progress < 0.2 ? 0.6 :  // Slow start
                       progress > 0.8 ? 0.5 :   // Slow landing
                       1;                        // Normal speed

const speed = Math.max(15, (drone.maxSpeed || 40) * speedMultiplier);
```

### **2. Altitude Control:**
```typescript
// Altitude decreases as approaching customer
altitude: 80 - progress * 50  // 80m → 30m
```

### **3. Error Handling:**
```typescript
// Drone assignment fallback
if (!available) {
  throw new Error('No drone available for delivery');
}

// Battery level protection
batteryLevel: Math.max(5, calculatedBattery)  // Never below 5%
```

## 🔄 Integration Points

### **1. Order Creation:**
```typescript
// checkout.tsx / cart.tsx
const order = await createOrderWithPayment(orderData);
// → Drone assignment happens automatically in background
```

### **2. Real-time UI Updates:**
```typescript
// order-tracking.tsx
useEffect(() => {
  const unsubscribe = subscribeToDroneEvents(orderId, (event) => {
    setDroneCoords(event.coordinate);
    setDronePath(prev => [...prev, event.coordinate]);
  });
  
  return unsubscribe;
}, [orderId]);
```

### **3. Map Visualization:**
```typescript
// DeliveryMap.tsx
<DeliveryMap
  restaurant={restaurantCoords}
  customer={customerCoords}
  drone={droneCoords}        // Real-time drone position
  path={dronePath}          // Flight trajectory
  etaMinutes={etaMinutes}   // Estimated arrival
/>
```

## 🧪 Testing Scenarios

### **1. Normal Delivery Flow:**
```
1. Order created → Drone assigned
2. Drone flies to restaurant (30% time)
3. Package pickup → Status: picked_up
4. Drone flies to customer (70% time)  
5. Delivery complete → Status: delivered
```

### **2. Edge Cases:**
```
- No drone available → Auto-create new drone
- Low battery → Continue with minimum 5%
- Network issues → Graceful degradation
- Simulation interruption → State preservation
```

## 🎯 Benefits & Features

### **✅ Advantages:**
- **Real-time tracking:** Khách hàng thấy drone bay trên map
- **Accurate ETA:** Tính toán thời gian giao chính xác
- **Scalable system:** Auto-create drones khi cần
- **Battery simulation:** Realistic battery drain
- **Smooth animations:** Easing functions cho movement
- **Event-driven:** Real-time updates qua WebSocket

### **🔧 Technical Highlights:**
- **Two-phase flight simulation:** Restaurant pickup + Customer delivery
- **Waypoint interpolation:** Smooth flight paths
- **Speed/altitude dynamics:** Realistic flight behavior  
- **Event logging:** Complete audit trail
- **Auto-fallback:** Create drone if none available
- **Battery management:** Realistic power consumption

## 🚀 Future Enhancements

### **Potential Improvements:**
1. **Weather integration:** Affect flight speed/battery
2. **Traffic avoidance:** Dynamic route planning
3. **Multiple drones:** Parallel deliveries
4. **Maintenance scheduling:** Predictive maintenance
5. **Load balancing:** Optimal drone assignment
6. **Cost optimization:** Distance-based pricing

---

**Architecture:** 🏗️ **Event-driven with real-time simulation**  
**Database:** 📊 **Appwrite with real-time subscriptions**  
**UI Updates:** ⚡ **WebSocket-based live tracking**  
**Simulation:** 🎮 **Physics-based flight modeling**