# 🚁 Drone Assignment System - Complete Guide

## 📋 Overview

Hệ thống gán drone tự động và thủ công cho đơn hàng trong FoodFast Delivery System.

---

## 🎯 Business Flow

```
1. Customer đặt hàng → Order (status: pending)
2. Restaurant xác nhận → Order (status: confirmed)
3. Restaurant chuẩn bị món → Order (status: preparing)
4. Món ăn sẵn sàng → Order (status: ready)
   ↓
5. Admin nhận thông báo "Order ready for delivery"
   ↓
6. DRONE ASSIGNMENT (2 options):
   ├─ A. Manual Assignment (Admin chọn drone)
   └─ B. Auto Assignment (Hệ thống tự chọn drone tốt nhất)
   ↓
7. Drone được gán → Order (status: delivering, droneId assigned)
8. Drone giao hàng → Cập nhật realtime vị trí
9. Hoàn thành → Order (status: delivered)
```

---

## 🗄️ Database Schema Updates

### 1. **orders** Collection (Already exists - Need updates)

```typescript
interface Order {
  $id: string;
  userId: string;
  restaurantId: string;
  items: string; // JSON array
  total: number;
  
  // Order status flow
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 
          'delivering' | 'delivered' | 'cancelled';
  
  // Delivery info
  deliveryAddress: string;
  deliveryLatitude: number;
  deliveryLongitude: number;
  phone: string;
  notes?: string;
  
  // 🆕 DRONE ASSIGNMENT FIELDS
  droneId?: string;              // ID of assigned drone
  assignedAt?: string;           // Timestamp when drone assigned
  assignedBy?: string;           // Admin user ID who assigned
  assignmentType?: 'manual' | 'auto';  // How was drone assigned
  
  // Timeline
  confirmedAt?: string;
  readyAt?: string;             // 🔑 Key trigger for assignment
  pickupAt?: string;            // Drone picked up from restaurant
  deliveredAt?: string;
  cancelledAt?: string;
  estimatedDeliveryTime?: string;
  
  // Payment
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cod' | 'momo' | 'vnpay';
  
  $createdAt: string;
  $updatedAt: string;
}
```

### 2. **drones** Collection (Already exists)

```typescript
interface Drone {
  $id: string;
  code: string;              // e.g., "DR001", "DR002"
  name: string;              // e.g., "Drone Alpha"
  model: string;             // e.g., "DJI Phantom 4"
  
  // 🔑 Assignment tracking
  assignedOrderId?: string;  // Currently assigned order
  status: 'available' | 'busy' | 'maintenance' | 'offline';
  
  // Location (last known)
  currentLatitude?: number;
  currentLongitude?: number;
  
  // Specs
  batteryLevel: number;      // 0-100%
  maxPayload: number;        // kg (e.g., 5kg)
  currentPayload: number;    // kg
  maxSpeed: number;          // km/h
  maxRange: number;          // km
  
  // Stats
  totalFlights: number;
  totalDistance: number;     // km
  
  // Maintenance
  isActive: boolean;
  lastMaintenanceAt?: string;
  nextMaintenanceAt?: string;
  
  $createdAt: string;
  $updatedAt: string;
}
```

### 3. **drone_events** Collection (Already exists)

```typescript
interface DroneEvent {
  $id: string;
  droneId: string;
  orderId?: string;
  
  eventType: 'takeoff' | 'landing' | 'delivery_start' | 
             'delivery_complete' | 'battery_low' | 
             'maintenance' | 'error' | 'assigned' | 'unassigned';
  
  description?: string;
  payload?: string;          // JSON data
  
  // Location at time of event
  latitude?: number;
  longitude?: number;
  altitude?: number;
  speed?: number;
  batteryLevel?: number;
  
  $createdAt: string;
}
```

---

## 🎨 UI/UX Design

### Page 1: **Order Assignment Dashboard** (`/admin/assign-drone`)

**Purpose:** Xem các đơn hàng sẵn sàng để giao và gán drone

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  📦 Orders Ready for Delivery                      🔔 (3)   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  🔍 Search orders...        [Filter: All | Urgent | Normal] │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Order #89D933FB                         ⏰ 10 mins ago │  │
│  │ 🍔 Gà rán ngon nhất thế giới                          │  │
│  │ 📍 123 An Phú, Thủ Đức (5.2 km from restaurant)      │  │
│  │ 💰 475,000₫ | 📦 2.5 kg                               │  │
│  │                                                        │  │
│  │ Available Drones (3):                                 │  │
│  │  ○ DR001 - 2.1 km away | 🔋 95% | 🚀 Available       │  │
│  │  ○ DR002 - 3.8 km away | 🔋 87% | 🚀 Available       │  │
│  │  ○ DR003 - 1.5 km away | 🔋 62% | 🚀 Available       │  │
│  │                                                        │  │
│  │  [Auto Assign] [Manual Select]                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Order #A268572                          ⏰ 5 mins ago  │  │
│  │ 🍜 Phở bò                                              │  │
│  │ ...                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- ✅ Real-time list of orders với `status: ready`
- ✅ Hiển thị thông tin order: món ăn, địa chỉ, khoảng cách, trọng lượng
- ✅ Danh sách drone khả dụng với khoảng cách, pin, status
- ✅ 2 buttons: "Auto Assign" (tự động) và "Manual Select" (chọn thủ công)
- ✅ Sorting theo priority (urgent orders first)
- ✅ Real-time notifications khi có order mới sẵn sàng

---

### Page 2: **Drone Fleet Overview** (`/admin/drones`)

**Purpose:** Xem tổng quan và quản lý fleet

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  🚁 Drone Fleet Management                         + Add     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────┬────────────┬────────────┬──────────────┐   │
│  │ Available  │ In Service │ Maintenance│ Offline      │   │
│  │     3      │     2      │     1      │     0        │   │
│  └────────────┴────────────┴────────────┴──────────────┘   │
│                                                               │
│  🎯 Active Deliveries                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ 🚁 DR001 → Order #89D933FB                           │  │
│  │ 📍 Currently at (10.123, 106.456) → Delivery ETA 8m  │  │
│  │ 🔋 89% | 📦 2.5kg | 🏁 3.2km remaining                │  │
│  │                                          [Track Live] │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  📋 All Drones                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Code | Name    | Status      | Battery | Location    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ DR001│ Alpha   │ 🚀 Busy     │ 🔋 89%  │ In Transit  │  │
│  │ DR002│ Beta    │ ✅ Available│ 🔋 95%  │ Base        │  │
│  │ DR003│ Gamma   │ ✅ Available│ 🔋 62%  │ Base        │  │
│  │ DR004│ Delta   │ ⚙️ Maint.   │ 🔋 45%  │ Service     │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 Smart Assignment Algorithm

### **Auto-Assignment Logic** (Recommended)

```typescript
function calculateDroneScore(drone: Drone, order: Order): number {
  // Multi-factor scoring system
  const factors = {
    distance: calculateDistance(
      drone.currentLatitude, 
      drone.currentLongitude,
      order.restaurantLatitude,
      order.restaurantLongitude
    ),
    battery: drone.batteryLevel,
    payload: drone.maxPayload - drone.currentPayload,
    availability: drone.status === 'available' ? 1 : 0
  };
  
  // Scoring weights
  const weights = {
    distance: -0.4,    // Closer is better (negative weight)
    battery: 0.3,      // Higher battery is better
    payload: 0.2,      // More capacity is better
    availability: 0.1  // Available drones preferred
  };
  
  // Calculate weighted score
  const score = 
    (1 / (factors.distance + 1)) * weights.distance * 100 +
    factors.battery * weights.battery +
    (factors.payload / drone.maxPayload) * weights.payload * 100 +
    factors.availability * weights.availability * 100;
  
  return score;
}

function autoAssignDrone(order: Order): Drone | null {
  // 1. Get all available drones
  const availableDrones = getDrones({
    status: 'available',
    batteryLevel: { $gte: 30 },  // Min 30% battery
    isActive: true
  });
  
  // 2. Filter by capability
  const capableDrones = availableDrones.filter(drone => {
    // Check payload capacity
    const orderWeight = calculateOrderWeight(order);
    if (orderWeight > drone.maxPayload) return false;
    
    // Check range
    const distance = calculateDistance(
      drone.currentLatitude,
      drone.currentLongitude,
      order.deliveryLatitude,
      order.deliveryLongitude
    );
    if (distance > drone.maxRange) return false;
    
    return true;
  });
  
  if (capableDrones.length === 0) return null;
  
  // 3. Calculate scores and select best
  const dronesWithScores = capableDrones.map(drone => ({
    drone,
    score: calculateDroneScore(drone, order)
  }));
  
  // Sort by score (highest first)
  dronesWithScores.sort((a, b) => b.score - a.score);
  
  return dronesWithScores[0].drone;
}
```

**Factors considered:**
1. **Distance** (40% weight): Drone gần nhất với nhà hàng
2. **Battery** (30% weight): Đủ pin để bay đến + giao hàng + về
3. **Payload** (20% weight): Capacity đủ cho order weight
4. **Availability** (10% weight): Status = available

---

## 🔌 API Endpoints & Functions

### 1. **GET /orders?status=ready**
Get all orders ready for delivery

### 2. **GET /drones?status=available**
Get all available drones

### 3. **POST /assign-drone (Manual)**

```typescript
interface AssignDroneRequest {
  orderId: string;
  droneId: string;
  assignedBy: string; // Admin user ID
}

async function assignDroneManually(req: AssignDroneRequest) {
  // 1. Validate drone availability
  const drone = await getDrone(req.droneId);
  if (drone.status !== 'available') {
    throw new Error('Drone not available');
  }
  
  // 2. Validate order status
  const order = await getOrder(req.orderId);
  if (order.status !== 'ready') {
    throw new Error('Order not ready for delivery');
  }
  
  // 3. Update order
  await updateOrder(req.orderId, {
    droneId: req.droneId,
    assignedAt: new Date().toISOString(),
    assignedBy: req.assignedBy,
    assignmentType: 'manual',
    status: 'delivering'
  });
  
  // 4. Update drone
  await updateDrone(req.droneId, {
    assignedOrderId: req.orderId,
    status: 'busy'
  });
  
  // 5. Create drone event
  await createDroneEvent({
    droneId: req.droneId,
    orderId: req.orderId,
    eventType: 'assigned',
    description: 'Manually assigned to order'
  });
  
  // 6. Send notifications
  await sendNotification({
    userId: order.userId,
    title: '🚁 Drone đang trên đường!',
    body: `Đơn hàng của bạn đang được giao bởi drone ${drone.name}`
  });
  
  // 7. Start drone simulation
  await startDroneDelivery(req.droneId, req.orderId);
  
  return { success: true, drone, order };
}
```

### 4. **POST /auto-assign-drone**

```typescript
async function autoAssignDrone(orderId: string) {
  const order = await getOrder(orderId);
  
  // Use smart algorithm to select best drone
  const bestDrone = await selectBestDrone(order);
  
  if (!bestDrone) {
    throw new Error('No suitable drone available');
  }
  
  // Same assignment process as manual
  return await assignDroneManually({
    orderId,
    droneId: bestDrone.$id,
    assignedBy: 'system'
  });
}
```

### 5. **Cloud Function: Monitor Ready Orders**

```typescript
// Runs every 30 seconds to check for ready orders
async function monitorReadyOrders() {
  const readyOrders = await databases.listDocuments(
    databaseId,
    'orders',
    [
      Query.equal('status', 'ready'),
      Query.isNull('droneId')  // Not yet assigned
    ]
  );
  
  if (readyOrders.total > 0) {
    // Send notifications to admin
    await notifyAdmins({
      title: `📦 ${readyOrders.total} đơn hàng sẵn sàng giao`,
      body: 'Vui lòng gán drone để giao hàng'
    });
  }
}
```

---

## 📱 Component Structure

```
admin/src/
├── pages/
│   ├── AssignDronePage.tsx          # Main assignment dashboard
│   ├── DroneFleetPage.tsx           # Fleet overview (exists)
│   └── OrderTrackingPage.tsx        # Live tracking
│
├── components/
│   ├── OrderCard.tsx                # Display order info
│   ├── DroneSelector.tsx            # Drone selection UI
│   ├── AutoAssignButton.tsx         # Trigger auto-assignment
│   ├── DroneStatusBadge.tsx         # Status indicators
│   └── LiveDroneMap.tsx             # Real-time map
│
├── services/
│   ├── droneService.ts              # Drone CRUD & assignment
│   ├── orderService.ts              # Order management
│   └── assignmentService.ts         # Assignment logic
│
└── utils/
    ├── droneAlgorithm.ts            # Smart selection algorithm
    ├── distanceCalculator.ts        # Haversine formula
    └── weightCalculator.ts          # Order weight estimation
```

---

## 🚀 Implementation Steps

### **Phase 1: Database Updates** (Day 1)
1. ✅ Add fields to `orders`: droneId, assignedAt, assignedBy, assignmentType
2. ✅ Verify `drones` schema
3. ✅ Test relationships

### **Phase 2: Assignment UI** (Day 2-3)
1. Create `AssignDronePage.tsx`
2. Build `OrderCard` component
3. Build `DroneSelector` component
4. Add auto-assign button

### **Phase 3: Smart Algorithm** (Day 4)
1. Implement `droneAlgorithm.ts`
2. Distance calculation (Haversine)
3. Weight estimation
4. Scoring system

### **Phase 4: Backend Integration** (Day 5-6)
1. Create assignment APIs
2. Update order status flow
3. Drone status management
4. Event logging

### **Phase 5: Real-time Features** (Day 7)
1. WebSocket for live updates
2. Admin notifications
3. Customer notifications
4. Live tracking

### **Phase 6: Testing & Optimization** (Day 8-9)
1. Test all assignment scenarios
2. Handle edge cases
3. Performance optimization
4. UI/UX refinement

---

## 🎯 Success Metrics

- ⚡ **Assignment Time**: < 30 seconds from ready → assigned
- 🎯 **Success Rate**: > 95% successful assignments
- 🔋 **Battery Efficiency**: Average battery usage < 40% per delivery
- 📍 **Distance Optimization**: Average distance reduction by 30%
- ⏱️ **Delivery Time**: Average < 15 minutes
- 🤖 **Automation Rate**: > 80% auto-assignments

---

## 🔐 Security & Permissions

```typescript
// Only admins can assign drones
const canAssignDrone = (user: User) => {
  return user.role === 'admin';
};

// Validate order ownership
const validateOrderRestaurant = (order: Order, restaurant: Restaurant) => {
  return order.restaurantId === restaurant.$id;
};
```

---

## 📊 Monitoring & Analytics

**Dashboard Metrics:**
- Total assignments today
- Auto vs Manual ratio
- Average assignment time
- Drone utilization rate
- Failed assignment reasons
- Battery consumption patterns

**Alerts:**
- No drones available
- Low battery fleet
- Assignment failures
- Delivery delays

---

## 🔄 Future Enhancements

1. **Machine Learning**: Predict delivery time based on historical data
2. **Weather Integration**: Adjust assignments based on weather
3. **Traffic Patterns**: Consider airspace traffic
4. **Multi-drop**: Single drone handling multiple orders
5. **Battery Swap Stations**: Automated battery management
6. **Drone Scheduling**: Pre-assignment based on predictions

---

## 📚 References

- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula) for distance calculation
- [Traveling Salesman Problem](https://en.wikipedia.org/wiki/Travelling_salesman_problem) for route optimization
- [Load Balancing Algorithms](https://www.nginx.com/resources/glossary/load-balancing/) for drone distribution

---

Created: 2025-10-29
Version: 1.0
Status: ✅ Ready for Implementation
