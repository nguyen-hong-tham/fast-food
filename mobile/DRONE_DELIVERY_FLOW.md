# 🚁 Drone Delivery Simulation Flow

## Overview
Hệ thống mô phỏng giao hàng bằng drone với flow thực tế từ hub → restaurant → customer.

## 📍 Hub Location
**Trung tâm điều phối drone (Default Hub)**
- Latitude: `10.7587229`
- Longitude: `106.682131`
- Tất cả drone sẽ xuất phát từ vị trí này

## 🎯 Delivery Flow

### Phase 0: Order Placement & Confirmation
1. **Khách hàng đặt hàng**
   - Status: `pending`
   - Khách hàng chọn món và đặt hàng
   - Order được tạo trong database

2. **Nhà hàng xác nhận đơn**
   - Status chuyển: `pending` → `preparing`
   - Nhà hàng xem đơn hàng mới
   - Nhà hàng bấm "Confirm" để chấp nhận đơn

3. **Nhà hàng chuẩn bị món**
   - Status: `preparing`
   - Nhà hàng chuẩn bị món ăn
   - Sau khi hoàn tất, nhà hàng bấm "Ready" để thông báo đơn đã sẵn sàng

4. **Order Ready - Chờ admin gán drone**
   - Status chuyển: `preparing` → `ready`
   - Đơn hàng xuất hiện trong admin panel
   - Admin có thể thấy order và gán drone

### Phase 1: Admin Assigns Drone
1. **Admin gán drone cho order**
   - Admin chọn drone available
   - Thực hiện assign drone cho order ID
   - Field `order.droneId` được set
   - Drone status chuyển: `available` → `busy`

2. **Trigger simulation**
   - Mobile app nhận được update `order.droneId`
   - App tự động trigger drone simulation
   - Không cần user bấm gì thêm

### Phase 2: Drone Flight Simulation (Auto)

#### Stage 1: Hub → Restaurant (30% of total time)
```
🏠 HUB (10.7587229, 106.682131)
    ↓
    ↓ Drone bay với tốc độ cao (45 km/h)
    ↓ Thời gian: ~18 giây (của 60s total)
    ↓
🍽️ RESTAURANT (pickup location)
```

**Technical Details:**
- Duration: 30% of `SIMULATION_DURATION` (default 60s)
- Steps: 15 waypoints minimum
- Speed: 45 km/h
- Battery drain: 0.3% per step
- Altitude: 50m
- Status update: `ready` → `delivering`
- Progress callback: 0-30%

#### Loading Time
- Drone đến nhà hàng
- Chờ 5 giây để load món ăn lên drone
- Console log: "Loading food onto drone..."

#### Stage 2: Restaurant → Customer (70% of total time)
```
🍽️ RESTAURANT (with food loaded)
    ↓
    ↓ Drone bay với tốc độ động (15-40 km/h)
    ↓ Thời gian: ~42 giây (của 60s total)
    ↓ Giảm tốc độ khi gần đến
    ↓
🏠 CUSTOMER (delivery destination)
```

**Technical Details:**
- Duration: 70% of `SIMULATION_DURATION` (default 60s)
- Steps: 30 waypoints minimum
- Speed: Variable (15-40 km/h)
  - Start: 60% speed (ramp up)
  - Middle: 100% speed (cruise)
  - End: 50% speed (slow down)
- Battery drain: Dynamic based on speed
- Altitude: 80m → 30m (descending)
- Progress callback: 30-100%

#### Delivery Complete
- Drone đến địa chỉ khách hàng
- Status update: `delivering` → `delivered`
- Field `deliveredAt` được set
- Payment status: → `paid`
- Drone status: `busy` → `available`
- DroneEvent: `delivery_complete` created

## 🗺️ Map Display

### Markers on Map
1. **🍽️ Restaurant (Orange)**
   - Pickup location
   - Pin color: `#FE8C00`

2. **🏠 Customer (Green)**
   - Delivery destination
   - Pin color: `#2F9B65`

3. **🚁 Drone (Custom Icon)**
   - Icon: `assets/icons/drone.png`
   - Size: 40x40
   - Shows real-time position
   - Updates every 1.5 seconds

### Polyline (Flight Path)
- Color: `#1E90FF` (Dodger Blue)
- Width: 4
- Style: Dashed (6px dash, 6px gap)
- Shows: Hub → Restaurant → Customer path

## 📱 User Experience

### Customer View (Mobile App)
1. **Order Tracking Screen**
   - Shows order status timeline
   - Map with drone real-time position
   - ETA countdown
   - Status updates

2. **Status Timeline**
   - ✅ Order Placed (pending)
   - ✅ Restaurant Preparing (preparing)
   - ✅ Ready for Pickup (ready)
   - 🟢 Drone Delivering (delivering) ← Current
   - ⚪ Delivered (delivered)

3. **Real-time Updates**
   - Drone position updates every 1.5s
   - ETA countdown updates
   - Phase progress (to_restaurant / to_customer)
   - Status changes via Appwrite Realtime

### Debug Overlay (DEV mode only)
```
Status: delivering
Phase: to_customer (75%)
Drone: ✓ Visible
Sim: running
```

## 🔧 Technical Implementation

### Key Files Modified
1. **`mobile/type.d.ts`**
   - Added `DroneHub` interface
   - Updated `Drone` interface with `droneHub` field

2. **`mobile/lib/drone-simulator.ts`**
   - Added `DEFAULT_HUB_LOCATION` constant
   - Updated flight logic: Hub → Restaurant → Customer
   - Improved logging and progress tracking

3. **`mobile/components/tracking/DeliveryMap.tsx`**
   - Added drone custom icon display
   - Imported `icons.drone` from constants
   - Updated marker with custom image

4. **`mobile/app/order-tracking.tsx`**
   - Auto-triggers simulation when `order.droneId` is set
   - Handles real-time updates
   - Shows waiting message when no drone assigned

### Database Collections

#### Orders
- `droneId`: String (Relationship to Drone)
- `status`: Enum (pending, preparing, ready, delivering, delivered, cancelled)
- `deliveryStartedAt`: DateTime
- `deliveredAt`: DateTime
- `estimatedDeliveryTime`: DateTime

#### Drones
- `droneHub`: Relationship (Many-to-One with DroneHub)
- `status`: Enum (available, busy, maintenance, offline)
- `currentLatitude`: Float
- `currentLongitude`: Float
- `batteryLevel`: Integer (0-100)
- `assignedOrderId`: String

#### DroneEvents
- `droneId`: String (Relationship)
- `orderId`: String (Relationship)
- `eventType`: Enum (takeoff, landing, delivery_start, delivery_complete, etc.)
- `latitude`: Float
- `longitude`: Float
- `speed`: Float
- `batteryLevel`: Integer

### Appwrite Realtime Subscriptions
```typescript
// Subscribe to order updates
subscribeToOrder(orderId, callback)

// Subscribe to drone events (position updates)
subscribeToDroneEvents(orderId, callback)
```

## 🎮 Admin Panel Integration

### Admin Actions Required
1. **View pending orders**
   - Filter orders with `status = 'ready'`
   - Show orders waiting for drone assignment

2. **Assign drone**
   - Select available drone
   - Call API: `assignDroneToOrder(droneId, orderId)`
   - Drone status: `available` → `busy`
   - Order gets `droneId` field populated

3. **Monitor delivery**
   - View drone location on map
   - Track battery level
   - Monitor delivery progress

## 🚀 Quick Start

### For Restaurant
1. View new orders (`pending`)
2. Click "Confirm Order" → status: `preparing`
3. Prepare food
4. Click "Ready" → status: `ready`
5. Wait for admin to assign drone

### For Admin
1. Check orders with status `ready`
2. Select available drone
3. Click "Assign Drone" button
4. Simulation starts automatically

### For Customer
1. Place order (status: `pending`)
2. Wait for restaurant to confirm (status: `preparing`)
3. Click "Track Order" button
4. See status "Ready for Pickup" (status: `ready`)
5. See "Waiting for drone assignment..." message
6. Once admin assigns drone:
   - Drone appears on map from hub
   - Status changes to "Delivering"
   - Watch drone fly: Hub → Restaurant → Your location
   - Get real-time ETA updates

## ⚙️ Configuration

### Simulation Settings (in `drone-simulator.ts`)
```typescript
SIMULATION_DURATION = 60000 // 60 seconds total
Phase 1 (Hub → Restaurant): 30% = 18s
Loading time: 5s
Phase 2 (Restaurant → Customer): 70% = 42s
```

### Hub Location (in `drone-simulator.ts`)
```typescript
export const DEFAULT_HUB_LOCATION: Coordinate = {
  latitude: 10.7587229,
  longitude: 106.682131,
};
```

### Map Settings (in `DeliveryMap.tsx`)
```typescript
INITIAL_REGION = {
  latitude: 10.762622,
  longitude: 106.660172,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
}
```

## 🐛 Troubleshooting

### Drone not showing
- Check `order.droneId` is set
- Check order status is `ready` or `delivering`
- Check console logs for errors

### Simulation not starting
- Ensure admin has assigned drone
- Check `order.droneId` field exists
- Verify restaurant and customer coordinates

### Map not updating
- Check Appwrite Realtime connection
- Verify drone events are being created
- Check console for WebSocket errors

## 📝 Notes

- Simulation is client-side only for demo purposes
- Real production system would use actual drone telemetry
- Hub location can be changed via `DEFAULT_HUB_LOCATION`
- All times and speeds are simulated values
- Battery levels are calculated for visualization only
