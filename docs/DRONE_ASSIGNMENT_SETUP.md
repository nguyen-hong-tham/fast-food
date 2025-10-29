# 🚁 Drone Assignment System - Setup Guide

## ✅ Prerequisites

1. **Appwrite Collections** đã được tạo:
   - `orders` - với fields: droneId, assignedAt, assignedBy, assignmentType
   - `drones` - với fields: code, name, status, batteryLevel, etc.
   - `drone_events` - để log events

2. **Environment Variables** (.env):
   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id
   VITE_APPWRITE_DATABASE_ID=your_database_id
   
   # Collections
   VITE_APPWRITE_ORDERS_COLLECTION_ID=orders
   VITE_APPWRITE_DRONES_COLLECTION_ID=drones
   VITE_APPWRITE_DRONE_EVENTS_COLLECTION_ID=drone_events
   VITE_APPWRITE_USERS_COLLECTION_ID=users
   VITE_APPWRITE_RESTAURANTS_COLLECTION_ID=restaurants
   ```

---

## 📋 Database Schema Updates

### 1. Update `orders` Collection

Add these NEW fields:

```typescript
// Drone Assignment Fields
droneId: String(100) [Optional] → Relationship to drones
assignedAt: DateTime [Optional]
assignedBy: String(100) [Optional] → Admin user ID
assignmentType: Enum [Optional] → Values: manual, auto

// Ensure these exist:
status: Enum [Required] → Add 'ready' if not exists
  Values: pending, confirmed, preparing, ready, delivering, delivered, cancelled
  
deliveryLatitude: Float [Required]
deliveryLongitude: Float [Required]
```

### 2. Verify `drones` Collection

Required fields:

```typescript
$id: ID
code: String(50) [Required] → e.g., "DR001"
name: String(100) [Required] → e.g., "Drone Alpha"
model: String(100)
status: Enum [Required] → Values: available, busy, maintenance, offline
batteryLevel: Integer [Required] → Range: 0-100, Default: 100
currentLatitude: Float [Optional]
currentLongitude: Float [Optional]
maxPayload: Float [Default: 5] → kg
currentPayload: Float [Default: 0] → kg
maxSpeed: Float [Default: 50] → km/h
maxRange: Float [Default: 10] → km
assignedOrderId: String(100) [Optional]
isActive: Boolean [Default: true]
$createdAt: DateTime
$updatedAt: DateTime
```

### 3. Verify `drone_events` Collection

```typescript
$id: ID
droneId: String(100) [Required] → Relationship to drones
orderId: String(100) [Optional]
eventType: Enum [Required] → Values: takeoff, landing, delivery_start, 
                                    delivery_complete, battery_low, 
                                    maintenance, error, assigned, unassigned
description: String(500)
payload: String(2000) → JSON data
latitude: Float
longitude: Float
batteryLevel: Integer
$createdAt: DateTime
```

---

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
cd admin
npm install
```

### Step 2: Setup Environment

Tạo file `.env` trong folder `admin/`:

```env
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68c9791a002b85f096b4
VITE_APPWRITE_DATABASE_ID=68da5e73002cb68e70af

VITE_APPWRITE_ORDERS_COLLECTION_ID=orders
VITE_APPWRITE_DRONES_COLLECTION_ID=drones
VITE_APPWRITE_DRONE_EVENTS_COLLECTION_ID=drone_events
VITE_APPWRITE_USERS_COLLECTION_ID=user
VITE_APPWRITE_RESTAURANTS_COLLECTION_ID=restaurants
```

### Step 3: Create Sample Drones

Vào Appwrite Console → Database → drones collection → Create Document:

```json
{
  "code": "DR001",
  "name": "Drone Alpha",
  "model": "DJI Phantom 4",
  "status": "available",
  "batteryLevel": 95,
  "currentLatitude": 10.762622,
  "currentLongitude": 106.660172,
  "maxPayload": 5,
  "currentPayload": 0,
  "maxSpeed": 50,
  "maxRange": 10,
  "isActive": true
}
```

Tạo thêm 2-3 drones tương tự.

### Step 4: Create Test Order

Tạo order với status = 'ready':

```json
{
  "userId": "user_id_here",
  "restaurantId": "restaurant_id_here",
  "total": 150000,
  "status": "ready",
  "deliveryAddress": "123 An Phú, Thủ Đức",
  "deliveryLatitude": 10.8464,
  "deliveryLongitude": 106.7639,
  "paymentMethod": "cod",
  "paymentStatus": "pending"
}
```

### Step 5: Run Admin Portal

```bash
npm run dev
```

Navigate to: `http://localhost:3002/assign-drone`

---

## 📱 Usage Guide

### Manual Assignment

1. Vào trang **Assign Drone** (`/assign-drone`)
2. Xem danh sách orders với status = `ready`
3. Click **"Manual Select"** trên order
4. Xem danh sách drones khả dụng với:
   - Khoảng cách đến nhà hàng
   - Mức pin hiện tại
   - Score (độ phù hợp)
5. Click **"Assign"** trên drone muốn chọn

### Auto Assignment

1. Click **"Auto Assign Best Drone"** trên order
2. Hệ thống tự động chọn drone phù hợp nhất dựa trên:
   - Khoảng cách (40% weight)
   - Mức pin (30% weight)
   - Payload capacity (20% weight)
   - Availability (10% weight)

### What Happens After Assignment

1. **Order** được update:
   - `status`: ready → delivering
   - `droneId`: ID của drone
   - `assignedAt`: timestamp
   - `assignmentType`: 'auto' hoặc 'manual'

2. **Drone** được update:
   - `status`: available → busy
   - `assignedOrderId`: ID của order

3. **Drone Event** được tạo:
   - `eventType`: 'assigned'
   - Log assignment details

4. **Notifications** được gửi:
   - Khách hàng nhận thông báo "Drone đang trên đường"
   - Restaurant nhận update

---

## 🎯 Testing Scenarios

### Scenario 1: Happy Path

```
1. Create order với status = 'ready'
2. Ensure có ít nhất 1 drone với status = 'available', battery > 30%
3. Click "Auto Assign"
4. ✅ Order status → 'delivering'
5. ✅ Drone status → 'busy'
6. ✅ Event created
```

### Scenario 2: No Drones Available

```
1. Set tất cả drones thành status = 'busy' hoặc 'offline'
2. Try to assign order
3. ✅ Hiển thị message "No available drones"
```

### Scenario 3: Low Battery Drones

```
1. Set tất cả drones có batteryLevel < 30%
2. Try to assign
3. ✅ Drones không xuất hiện trong danh sách (filtered out)
```

### Scenario 4: Multiple Orders Priority

```
1. Create 3 orders với thời gian khác nhau
2. Order cũ nhất sẽ hiển thị ở trên (urgent priority)
3. ✅ Sort by waiting time
```

---

## 🔍 Troubleshooting

### Issue: "No orders found"

**Check:**
- Có orders với `status = 'ready'` không?
- `droneId` field phải null (chưa được assign)
- Collection ID đúng trong .env?

**Fix:**
```sql
-- Check in Appwrite Console
status = 'ready' AND droneId = null
```

### Issue: "No drones available"

**Check:**
- Có drones với `status = 'available'`?
- `batteryLevel >= 30`?
- `isActive = true`?

**Fix:**
```json
{
  "status": "available",
  "batteryLevel": 95,
  "isActive": true
}
```

### Issue: Assignment fails

**Check Console Logs:**
```javascript
console.log('Order:', order);
console.log('Drone:', drone);
console.log('Error:', error);
```

**Common causes:**
- Missing permissions in Appwrite
- Invalid document IDs
- Network errors

---

## 📊 Monitoring

### Key Metrics to Track

1. **Assignment Success Rate**
   - Total assignments / Total attempts
   - Target: > 95%

2. **Average Assignment Time**
   - Time from "ready" → "assigned"
   - Target: < 30 seconds

3. **Auto vs Manual Ratio**
   - Auto assignments / Total assignments
   - Target: > 80% auto

4. **Drone Utilization**
   - Busy drones / Total drones
   - Target: 60-80%

### Dashboard Queries

```typescript
// Get assignment stats
const assignments = await databases.listDocuments(
  databaseId,
  'orders',
  [
    Query.isNotNull('droneId'),
    Query.greaterThan('assignedAt', startDate)
  ]
);

// Auto vs Manual
const autoCount = assignments.documents.filter(
  o => o.assignmentType === 'auto'
).length;
```

---

## 🔐 Security & Permissions

### Appwrite Permissions Setup

**orders collection:**
```
Read: role:all
Update: role:admin
```

**drones collection:**
```
Read: role:all
Update: role:admin
Create: role:admin
```

**drone_events collection:**
```
Read: role:admin
Create: role:admin
```

---

## 🚀 Next Steps

### Phase 2 Features (Future)

1. **Real-time Tracking**
   - WebSocket updates của drone location
   - Live map với drone positions

2. **Batch Assignment**
   - Assign multiple orders at once
   - Optimize routes for multiple deliveries

3. **Predictive Assignment**
   - Machine learning để predict best times
   - Pre-assign drones based on patterns

4. **Weather Integration**
   - Check weather conditions
   - Adjust assignments based on wind, rain

5. **Maintenance Scheduling**
   - Auto-schedule maintenance
   - Predict battery degradation

---

## 📚 References

- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Appwrite Queries](https://appwrite.io/docs/queries)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/queries)

---

**Created:** 2025-10-29  
**Version:** 1.0  
**Status:** ✅ Ready for Testing

Need help? Check the [main documentation](./DRONE_ASSIGNMENT_SYSTEM.md)
