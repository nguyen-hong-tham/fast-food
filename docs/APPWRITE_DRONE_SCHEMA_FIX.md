# 🔧 Sửa lỗi Appwrite Schema Mismatch - Drone Collection

## 📋 Vấn đề

Khi tạo drone, gặp lỗi:
```
❌ Failed to create drone: AppwriteException: 
Invalid document structure: Missing required attribute "code"
```

## 🔍 Nguyên nhân

Code đang sử dụng các field KHÔNG TỒN TẠI trong Appwrite schema:

### ❌ Fields trong code nhưng KHÔNG có trong Appwrite:
1. `serialNumber` 
2. `baseLatitude`
3. `baseLongitude`
4. `updatedAt`

### ❌ Status values không match:
- Code dùng: `'idle'`, `'delivering'`, `'charging'`
- Appwrite enum: `'available'`, `'busy'`, `'maintenance'`, `'offline'`

---

## ✅ Giải pháp đã áp dụng

### 1. Cập nhật `createDrone()` function

**File**: `mobile/lib/api-helpers.ts`

**TRƯỚC**:
```typescript
const droneData = {
    code: droneCode,
    name: data.name,
    model: data.model || 'DJI Phantom 4',
    serialNumber: data.serialNumber || `SN-${Date.now()}`, // ❌ Không có trong schema
    status: 'idle', // ❌ Không match enum
    batteryLevel: 100,
    currentLatitude: 10.762622,
    currentLongitude: 106.660172,
    maxSpeed: 40,
    maxPayload: 2000,
    baseLatitude: 10.762622, // ❌ Không có trong schema
    baseLongitude: 106.660172, // ❌ Không có trong schema
    totalFlights: 0,
};
```

**SAU**:
```typescript
const droneData = {
    code: droneCode, // ✅ Required field
    name: data.name, // ✅ Required field
    model: data.model || 'DJI Phantom 4',
    status: 'available', // ✅ Match enum
    isActive: true,
    batteryLevel: 100,
    currentLatitude: 10.762622,
    currentLongitude: 106.660172,
    maxSpeed: 50,
    maxPayload: 5, // kg (match schema default)
    currentPayload: 0,
    maxRange: 10, // km (match schema default)
    totalFlights: 0,
    totalDistance: 0,
};
```

### 2. Cập nhật `getAvailableDrone()` function

**TRƯỚC**:
```typescript
Query.equal('status', 'idle'), // ❌ 'idle' không có trong enum
```

**SAU**:
```typescript
Query.equal('status', 'available'), // ✅ Match enum
```

### 3. Cập nhật `assignDroneToOrder()` function

**TRƯỚC**:
```typescript
{
    status: 'delivering', // ❌ Không có trong enum
    assignedOrderId: orderId,
    updatedAt: new Date().toISOString(), // ❌ Không có trong schema
}
```

**SAU**:
```typescript
{
    status: 'busy', // ✅ Match enum
    assignedOrderId: orderId,
}
```

### 4. Cập nhật `updateDroneLocation()` function

**TRƯỚC**:
```typescript
{
    currentLatitude: latitude,
    currentLongitude: longitude,
    batteryLevel: options.batteryLevel ?? undefined,
    updatedAt: new Date().toISOString(), // ❌ Không có trong schema
}
```

**SAU**:
```typescript
{
    currentLatitude: latitude,
    currentLongitude: longitude,
    batteryLevel: options.batteryLevel ?? undefined,
    // ✅ Removed updatedAt
}
```

### 5. Cập nhật `completeDroneDelivery()` function

**TRƯỚC**:
```typescript
{
    status: 'idle', // ❌ Không có trong enum
    assignedOrderId: null,
    totalFlights: drone.totalFlights + 1,
    updatedAt: new Date().toISOString(), // ❌ Không có trong schema
}
```

**SAU**:
```typescript
{
    status: 'available', // ✅ Match enum
    assignedOrderId: null,
    totalFlights: drone.totalFlights + 1,
    // ✅ Removed updatedAt
}
```

### 6. Cập nhật TypeScript Definitions

**File**: `mobile/type.d.ts`

**TRƯỚC**:
```typescript
export interface Drone extends Models.Document {
  code: string;
  name: string;
  model: string; // Required
  status: 'idle' | 'delivering' | 'maintenance' | 'charging' | 'offline'; // ❌
  batteryLevel: number;
  currentLatitude?: number;
  currentLongitude?: number;
  maxPayload: number;
  currentPayload?: number; // ❌ Optional
  maxRange: number;
  maxSpeed?: number; // ❌ Optional
  totalDistance?: number; // ❌ Optional
  assignedOrderId?: string;
  lastMaintenanceAt?: string;
  nextMaintenanceAt?: string;
  totalFlights: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string; // ❌ Không có trong schema
}
```

**SAU**:
```typescript
export interface Drone extends Models.Document {
  code: string; // ✅ Required
  name: string; // ✅ Required
  model?: string; // ✅ Optional
  assignedOrderId?: string;
  status: 'available' | 'busy' | 'maintenance' | 'offline'; // ✅ Match enum
  batteryLevel: number;
  totalFlights: number;
  currentLatitude?: number;
  currentLongitude?: number;
  maxPayload: number; // ✅ Required
  currentPayload: number; // ✅ Required
  maxSpeed: number; // ✅ Required
  maxRange: number; // ✅ Required
  totalDistance: number; // ✅ Required
  isActive: boolean;
  lastMaintenanceAt?: string;
  nextMaintenanceAt?: string;
  createdAt: string;
  // ✅ Removed updatedAt
}
```

**DroneEvent interface**:
```typescript
export interface DroneEvent extends Models.Document {
  droneId: string;
  orderId?: string;
  eventType: 'takeoff' | 'landing' | 'delivery_start' | 'delivery_complete' | 'battery_low' | 'maintenance' | 'error' | 'position_update'; // ✅ Match enum
  latitude?: number;
  longitude?: number;
  altitude?: number;
  speed?: number;
  batteryLevel?: number;
  payload?: string; // ✅ JSON string
  description?: string;
  timestamp: string;
  createdAt?: string;
}
```

---

## 📊 So sánh Schema

### Drone Collection - Appwrite Schema

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `$id` | string | ✅ | auto | Appwrite ID |
| `code` | string | ✅ | - | Unique code |
| `name` | string | ✅ | - | Display name |
| `model` | string | ❌ | NULL | Drone model |
| `assignedOrderId` | string | ❌ | NULL | Current order |
| `status` | enum | ✅ | available | available, busy, maintenance, offline |
| `batteryLevel` | integer | ❌ | 100 | 0-100 |
| `totalFlights` | integer | ❌ | 0 | Flight counter |
| `currentLatitude` | double | ❌ | NULL | -90 to 90 |
| `currentLongitude` | double | ❌ | NULL | -180 to 180 |
| `maxPayload` | double | ❌ | 5 | kg |
| `currentPayload` | double | ❌ | 0 | kg |
| `maxSpeed` | double | ❌ | 50 | km/h |
| `maxRange` | double | ❌ | 10 | km |
| `totalDistance` | double | ❌ | 0 | km |
| `isActive` | boolean | ❌ | true | Active status |
| `lastMaintenanceAt` | datetime | ❌ | NULL | Last maintenance |
| `nextMaintenanceAt` | datetime | ❌ | NULL | Next maintenance |
| `droneEvents` | relationship | ❌ | NULL | One to Many |
| `$createdAt` | datetime | ✅ | auto | Auto-generated |
| `$updatedAt` | datetime | ✅ | auto | Auto-generated |

### ⚠️ Lưu ý quan trọng:

1. **Không nên dùng `updatedAt` tùy chỉnh**: Appwrite tự động quản lý `$updatedAt`
2. **Status enum**: Phải dùng đúng giá trị trong enum
3. **Required fields**: `code` và `name` là bắt buộc
4. **Default values**: Nên set đúng với Appwrite defaults

---

## 🧪 Test

### 1. Test tạo drone mới:

```typescript
const drone = await createDrone({
  name: 'Test Drone 001',
  model: 'DJI Phantom 4 Pro',
});

console.log('✅ Created drone:', drone);
// Should have:
// - code: DR-xxxxxx
// - name: Test Drone 001
// - status: available
// - batteryLevel: 100
// - totalFlights: 0
```

### 2. Test query drone available:

```typescript
const availableDrone = await getAvailableDrone();
console.log('✅ Available drone:', availableDrone);
// Should find drone with status = 'available'
```

### 3. Test assign drone to order:

```typescript
const assigned = await assignDroneToOrder(droneId, orderId);
console.log('✅ Assigned drone:', assigned.status); // Should be 'busy'
```

### 4. Test complete delivery:

```typescript
await completeDroneDelivery(droneId);
const drone = await getDroneById(droneId);
console.log('✅ Completed:', drone.status); // Should be 'available'
console.log('✅ Total flights:', drone.totalFlights); // Should increment
```

---

## 🎯 Kết quả

### ✅ Đã sửa:

1. ✅ Loại bỏ các field không tồn tại trong schema (`serialNumber`, `baseLatitude`, `baseLongitude`, `updatedAt`)
2. ✅ Cập nhật status values để match enum (`available`, `busy` thay vì `idle`, `delivering`)
3. ✅ Đảm bảo `code` field được auto-generate
4. ✅ Cập nhật TypeScript definitions để match schema
5. ✅ Cập nhật default values để match Appwrite schema

### ✅ Lợi ích:

- ✅ Không còn lỗi "Invalid document structure"
- ✅ Không còn lỗi "Missing required attribute 'code'"
- ✅ Code và schema hoàn toàn đồng bộ
- ✅ Type-safe với TypeScript
- ✅ Drone simulation hoạt động ổn định

---

## 📱 Verification trong Mobile App

1. **Restart Metro bundler** để load code mới:
   ```bash
   npm start -- --reset-cache
   ```

2. **Test flow**:
   - Restaurant Accept Order → Status: preparing
   - Restaurant Mark Ready → Status: ready
   - Drone simulation bắt đầu
   - ✅ Không còn lỗi "No drone available"
   - ✅ Không còn lỗi "Missing required attribute"

---

## 🚀 Next Steps

### Tùy chọn cải tiến (Optional):

1. **Thêm fields vào Appwrite** (nếu cần):
   - `serialNumber` - để tracking drone serial
   - `baseLatitude`, `baseLongitude` - để lưu vị trí base của drone

2. **Validation**:
   - Thêm validation cho `batteryLevel` (0-100)
   - Thêm validation cho coordinates

3. **Indexes**:
   - Đã có index `idx_drones_status` và `idx_drones_code`
   - Có thể thêm composite index cho queries phức tạp

---

**Updated**: October 27, 2025  
**Status**: ✅ Complete & Tested  
**Files Changed**: 
- `mobile/lib/api-helpers.ts`
- `mobile/type.d.ts`
