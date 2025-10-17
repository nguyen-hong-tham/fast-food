# Hướng Dẫn Setup Database trong Appwrite Console

## 📋 Mục lục
1. [Tổng quan](#tổng-quan)
2. [Chuẩn bị](#chuẩn-bị)
3. [Phase 1 - Collections Critical (Tuần 1-2)](#phase-1---collections-critical)
4. [Phase 2 - Reviews & Notifications (Tuần 3)](#phase-2---reviews--notifications)
5. [Phase 3 - Drone System (Tuần 4-5)](#phase-3---drone-system)
6. [Phase 4 - Marketing & Audit (Tuần 6)](#phase-4---marketing--audit)
7. [Cập nhật Collections Hiện Có](#cập-nhật-collections-hiện-có)
8. [Setup Relationships](#setup-relationships)
9. [Setup Indexes](#setup-indexes)
10. [Permissions & Security Rules](#permissions--security-rules)

---

## Tổng quan

**Database ID:** `68da5e73002cb68e70af` (app)

**Tổng số Collections cần tạo:** 10 collections mới + cập nhật 3 collections hiện có

**Ước tính thời gian setup:** 
- Phase 1: 4-6 giờ
- Phase 2: 2-3 giờ
- Phase 3: 2-3 giờ
- Phase 4: 2 giờ
- **Total: ~12-14 giờ**

---

## Chuẩn bị

### 1. Truy cập Appwrite Console
- URL: `https://cloud.appwrite.io` hoặc self-hosted URL
- Login với tài khoản admin
- Chọn project: **FoodFast**
- Database ID: `68da5e73002cb68e70af`

### 2. Checklist trước khi bắt đầu
- [ ] Backup database hiện tại
- [ ] Chuẩn bị file DATABASE_SCHEMA.md để tham khảo
- [ ] Mở sẵn ERD diagram (foodfast-database-erd.drawio)
- [ ] Có quyền admin trên Appwrite project

---

## Phase 1 - Collections Critical

### 🔴 1. Collection: `restaurants`

**Mục đích:** Quản lý thông tin nhà hàng đối tác (CRITICAL cho Restaurant Portal)

#### Bước 1: Tạo Collection
```
1. Vào Databases → Chọn database "app"
2. Click "Create Collection"
3. Collection ID: restaurants (để Appwrite auto-generate hoặc set manual)
4. Collection Name: restaurants
5. Click "Create"
```

#### Bước 2: Thêm Attributes

**String Attributes:**
```javascript
// 1. name (required)
{
  key: "name",
  size: 200,
  required: true,
  default: null,
  array: false
}

// 2. description
{
  key: "description",
  size: 1000,
  required: false,
  default: null,
  array: false
}

// 3. address (required)
{
  key: "address",
  size: 500,
  required: true,
  default: null,
  array: false
}

// 4. phone (required)
{
  key: "phone",
  size: 20,
  required: true,
  default: null,
  array: false
}

// 5. email (required)
{
  key: "email",
  size: 320, // Standard email max length
  required: true,
  default: null,
  array: false,
  format: "email" // Nếu Appwrite hỗ trợ validation
}

// 6. logo
{
  key: "logo",
  size: 2048, // URL length
  required: false,
  default: null,
  array: false,
  format: "url"
}

// 7. coverImage
{
  key: "coverImage",
  size: 2048,
  required: false,
  default: null,
  array: false,
  format: "url"
}

// 8. cuisineType
{
  key: "cuisineType",
  size: 100,
  required: false,
  default: null,
  array: false
}

// 9. businessLicense
{
  key: "businessLicense",
  size: 100,
  required: false,
  default: null,
  array: false
}

// 10. taxCode
{
  key: "taxCode",
  size: 50,
  required: false,
  default: null,
  array: false
}

// 11. bankAccount
{
  key: "bankAccount",
  size: 100,
  required: false,
  default: null,
  array: false
}

// 12. bankName
{
  key: "bankName",
  size: 100,
  required: false,
  default: null,
  array: false
}

// 13. approvedBy
{
  key: "approvedBy",
  size: 100,
  required: false,
  default: null,
  array: false
}

// 14. rejectionReason
{
  key: "rejectionReason",
  size: 500,
  required: false,
  default: null,
  array: false
}

// 15. operatingHours (JSON string)
{
  key: "operatingHours",
  size: 2000,
  required: false,
  default: null,
  array: false
}
```

**Float Attributes:**
```javascript
// 16. latitude (required)
{
  key: "latitude",
  min: -90,
  max: 90,
  required: true,
  default: null,
  array: false
}

// 17. longitude (required)
{
  key: "longitude",
  min: -180,
  max: 180,
  required: true,
  default: null,
  array: false
}

// 18. rating
{
  key: "rating",
  min: 0,
  max: 5,
  required: false,
  default: 0,
  array: false
}

// 19. totalRevenue
{
  key: "totalRevenue",
  min: 0,
  max: null,
  required: false,
  default: 0,
  array: false
}
```

**Integer Attributes:**
```javascript
// 20. totalOrders
{
  key: "totalOrders",
  min: 0,
  max: null,
  required: false,
  default: 0,
  array: false
}
```

**Enum Attributes:**
```javascript
// 21. status (required)
{
  key: "status",
  elements: ["pending", "active", "suspended", "rejected"],
  required: true,
  default: "pending",
  array: false
}
```

**Boolean Attributes:**
```javascript
// 22. isActive
{
  key: "isActive",
  required: false,
  default: false,
  array: false
}
```

**DateTime Attributes:**
```javascript
// 23. approvedAt
{
  key: "approvedAt",
  required: false,
  default: null,
  array: false
}
```

#### Bước 3: Tạo Relationship

**⚠️ CHÚ Ý:** Tạo sau khi đã có collection `User`

```javascript
// ownerId → User (Many to One)
{
  key: "ownerId",
  relatedCollection: "user", // Collection ID của User
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "restaurants", // Key trong User collection
  onDelete: "setNull" // Hoặc "cascade" nếu muốn xóa nhà hàng khi xóa user
}
```

#### Bước 4: Tạo Indexes

```javascript
// Index 1: status
{
  key: "status_idx",
  type: "key",
  attributes: ["status"]
}

// Index 2: ownerId
{
  key: "ownerId_idx",
  type: "key",
  attributes: ["ownerId"]
}

// Index 3: isActive
{
  key: "isActive_idx",
  type: "key",
  attributes: ["isActive"]
}

// Index 4: cuisineType (cho search/filter)
{
  key: "cuisineType_idx",
  type: "key",
  attributes: ["cuisineType"]
}

// Index 5: name (cho search)
{
  key: "name_idx",
  type: "fulltext",
  attributes: ["name"]
}
```

#### Bước 5: Permissions

**Document-level Permissions:**
```javascript
// Read permissions
- Role: any (public có thể đọc danh sách nhà hàng active)
- Role: users (authenticated users)
- Role: owner (owner của document)

// Create permissions
- Role: users (authenticated users có thể đăng ký nhà hàng mới)

// Update permissions
- Role: owner (chỉ owner mới update được)
- Role: team:admin (admin có thể update)

// Delete permissions
- Role: team:admin (chỉ admin mới xóa được)
```

---

### 🔴 2. Collection: `order_items`

**Mục đích:** Normalize dữ liệu order items (thay vì JSON string trong orders)

#### Bước 1: Tạo Collection
```
Collection ID: order_items
Collection Name: order_items
```

#### Bước 2: Thêm Attributes

```javascript
// String Attributes
{
  key: "menuItemId",
  size: 100,
  required: true
}

{
  key: "name",
  size: 200,
  required: true
}

{
  key: "imageUrl",
  size: 2048,
  required: false,
  format: "url"
}

{
  key: "customizations",
  size: 1000,
  required: false,
  default: null
}

{
  key: "notes",
  size: 500,
  required: false
}

// Float Attributes
{
  key: "price",
  min: 0,
  required: true
}

{
  key: "subtotal",
  min: 0,
  required: true
}

// Integer Attributes
{
  key: "quantity",
  min: 1,
  required: true,
  default: 1
}
```

#### Bước 3: Relationship

```javascript
// orderId → orders (Many to One)
{
  key: "orderId",
  relatedCollection: "orders",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "orderItems",
  onDelete: "cascade" // Xóa order thì xóa luôn items
}
```

#### Bước 4: Indexes

```javascript
{
  key: "orderId_idx",
  type: "key",
  attributes: ["orderId"]
}

{
  key: "menuItemId_idx",
  type: "key",
  attributes: ["menuItemId"]
}
```

---

### 🔴 3. Collection: `payments`

**Mục đích:** Quản lý thanh toán (VNPay integration)

#### Bước 1: Tạo Collection
```
Collection ID: payments
Collection Name: payments
```

#### Bước 2: Thêm Attributes

```javascript
// String Attributes
{
  key: "userId",
  size: 100,
  required: true
}

{
  key: "transactionId",
  size: 200,
  required: false
}

{
  key: "transactionRef",
  size: 200,
  required: false
}

{
  key: "currency",
  size: 10,
  required: false,
  default: "VND"
}

{
  key: "failureReason",
  size: 500,
  required: false
}

{
  key: "refundReason",
  size: 500,
  required: false
}

{
  key: "rawResponse",
  size: 5000,
  required: false
}

// Enum Attributes
{
  key: "provider",
  elements: ["cod", "vnpay", "momo"],
  required: true,
  default: "cod"
}

{
  key: "method",
  elements: ["atm", "credit", "qr", "wallet"],
  required: false
}

{
  key: "status",
  elements: ["pending", "processing", "completed", "failed", "refunded"],
  required: true,
  default: "pending"
}

// Float Attributes
{
  key: "amount",
  min: 0,
  required: true
}

{
  key: "refundAmount",
  min: 0,
  required: false
}

// DateTime Attributes
{
  key: "refundedAt",
  required: false
}
```

#### Bước 3: Relationship

```javascript
// orderId → orders (One to One)
{
  key: "orderId",
  relatedCollection: "orders",
  relationType: "oneToOne",
  twoWay: true,
  twoWayKey: "payment",
  onDelete: "cascade"
}
```

#### Bước 4: Indexes

```javascript
{
  key: "orderId_idx",
  type: "unique",
  attributes: ["orderId"]
}

{
  key: "userId_idx",
  type: "key",
  attributes: ["userId"]
}

{
  key: "status_idx",
  type: "key",
  attributes: ["status"]
}

{
  key: "transactionId_idx",
  type: "key",
  attributes: ["transactionId"]
}

{
  key: "createdAt_idx",
  type: "key",
  attributes: ["$createdAt"]
}
```

---

## Phase 2 - Reviews & Notifications

### 4. Collection: `reviews`

#### Tạo Collection
```
Collection ID: reviews
Collection Name: reviews
```

#### Attributes

```javascript
// String
{
  key: "orderId",
  size: 100,
  required: true
}

{
  key: "menuItemId",
  size: 100,
  required: false
}

{
  key: "comment",
  size: 1000,
  required: false
}

{
  key: "images",
  size: 2000,
  required: false // JSON array of URLs
}

{
  key: "response",
  size: 1000,
  required: false
}

// Integer (1-5 stars)
{
  key: "overallRating",
  min: 1,
  max: 5,
  required: true
}

{
  key: "foodQuality",
  min: 1,
  max: 5,
  required: false
}

{
  key: "deliverySpeed",
  min: 1,
  max: 5,
  required: false
}

{
  key: "serviceRating",
  min: 1,
  max: 5,
  required: false
}

// Boolean
{
  key: "isVerified",
  required: false,
  default: true
}

{
  key: "isVisible",
  required: false,
  default: true
}

// DateTime
{
  key: "respondedAt",
  required: false
}
```

#### Relationships

```javascript
// userId → User
{
  key: "userId",
  relatedCollection: "user",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "reviews",
  onDelete: "setNull" // tránh mất dữ liệu đánh giá khi user bị xóa
}

// restaurantId → restaurants
{
  key: "restaurantId",
  relatedCollection: "restaurants",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "reviews"
}
```

#### Indexes

```javascript
{
  key: "userId_idx",
  type: "key",
  attributes: ["userId"]
}

{
  key: "restaurantId_idx",
  type: "key",
  attributes: ["restaurantId"]
}

{
  key: "orderId_idx",
  type: "unique",
  attributes: ["orderId"]
}

{
  key: "isVisible_idx",
  type: "key",
  attributes: ["isVisible"]
}
```

---

### 5. Collection: `notifications`

#### Tạo Collection
```
Collection ID: notifications
Collection Name: notifications
```

#### Attributes

```javascript
// String
{
  key: "userId",
  size: 100,
  required: true
}

{
  key: "title",
  size: 200,
  required: true
}

{
  key: "body",
  size: 1000,
  required: true
}

{
  key: "data",
  size: 2000,
  required: false // JSON metadata
}

{
  key: "imageUrl",
  size: 2048,
  required: false
}

{
  key: "actionUrl",
  size: 500,
  required: false
}

{
  key: "fcmToken",
  size: 500,
  required: false
}

{
  key: "errorMessage",
  size: 500,
  required: false
}

// Enum
{
  key: "type",
  elements: ["order", "payment", "promotion", "system", "drone"],
  required: true
}

{
  key: "channel",
  elements: ["push", "email", "sms", "in_app"],
  required: true,
  default: "push"
}

{
  key: "status",
  elements: ["pending", "sent", "failed", "read"],
  required: true,
  default: "pending"
}

// DateTime
{
  key: "sentAt",
  required: false
}

{
  key: "readAt",
  required: false
}
```

#### Indexes

```javascript
{
  key: "userId_idx",
  type: "key",
  attributes: ["userId"]
}

{
  key: "type_idx",
  type: "key",
  attributes: ["type"]
}

{
  key: "status_idx",
  type: "key",
  attributes: ["status"]
}

{
  key: "createdAt_idx",
  type: "key",
  attributes: ["$createdAt"]
}
```

---

## Phase 3 - Drone System

### 6. Collection: `drones`

#### Tạo Collection
```
Collection ID: drones
Collection Name: drones
```

#### Attributes

```javascript
// String
{
  key: "code",
  size: 50,
  required: true // Unique drone code
}

{
  key: "name",
  size: 100,
  required: true
}

{
  key: "model",
  size: 100,
  required: false
}

{
  key: "assignedOrderId",
  size: 100,
  required: false
}

// Enum
{
  key: "status",
  elements: ["idle", "delivering", "charging", "maintenance", "offline"],
  required: true,
  default: "idle"
}

// Integer
{
  key: "batteryLevel",
  min: 0,
  max: 100,
  required: false,
  default: 100
}

{
  key: "totalFlights",
  min: 0,
  required: false,
  default: 0
}

// Float
{
  key: "currentLatitude",
  min: -90,
  max: 90,
  required: false
}

{
  key: "currentLongitude",
  min: -180,
  max: 180,
  required: false
}

{
  key: "maxPayload",
  min: 0,
  required: false,
  default: 5.0 // kg
}

{
  key: "currentPayload",
  min: 0,
  required: false,
  default: 0
}

{
  key: "maxSpeed",
  min: 0,
  required: false,
  default: 50.0 // km/h
}

{
  key: "maxRange",
  min: 0,
  required: false,
  default: 10.0 // km
}

{
  key: "totalDistance",
  min: 0,
  required: false,
  default: 0
}

// Boolean
{
  key: "isActive",
  required: false,
  default: true
}

// DateTime
{
  key: "lastMaintenanceAt",
  required: false
}

{
  key: "nextMaintenanceAt",
  required: false
}
```

#### Indexes

```javascript
{
  key: "code_idx",
  type: "unique",
  attributes: ["code"]
}

{
  key: "status_idx",
  type: "key",
  attributes: ["status"]
}

{
  key: "assignedOrderId_idx",
  type: "key",
  attributes: ["assignedOrderId"]
}

{
  key: "isActive_idx",
  type: "key",
  attributes: ["isActive"]
}
```

---

### 7. Collection: `drone_events`

#### Tạo Collection
```
Collection ID: drone_events
Collection Name: drone_events
```

#### Attributes

```javascript
// String
{
  key: "orderId",
  size: 100,
  required: false
}

{
  key: "payload",
  size: 2000,
  required: false // JSON data
}

{
  key: "description",
  size: 500,
  required: false
}

// Enum
{
  key: "eventType",
  elements: ["status_change", "location_update", "battery_update", "error", "maintenance"],
  required: true
}

// Float
{
  key: "latitude",
  required: false
}

{
  key: "longitude",
  required: false
}

{
  key: "altitude",
  required: false // meters
}

{
  key: "speed",
  required: false // km/h
}

// Integer
{
  key: "batteryLevel",
  min: 0,
  max: 100,
  required: false
}
```

#### Relationships

```javascript
// droneId → drones
{
  key: "droneId",
  relatedCollection: "drones",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "events",
  onDelete: "cascade"
}
```

#### Indexes

```javascript
{
  key: "droneId_idx",
  type: "key",
  attributes: ["droneId"]
}

{
  key: "orderId_idx",
  type: "key",
  attributes: ["orderId"]
}

{
  key: "eventType_idx",
  type: "key",
  attributes: ["eventType"]
}

{
  key: "createdAt_idx",
  type: "key",
  attributes: ["$createdAt"]
}
```

---

## Phase 4 - Marketing & Audit

### 8. Collection: `promotions`

#### Attributes Summary
```javascript
// Key fields
code (String, unique)
title (String)
description (String)
type (Enum: percentage/fixed/free_shipping)
discountValue (Float)
maxDiscount (Float)
minOrderValue (Float)
maxUsage (Integer)
usedCount (Integer)
maxUsagePerUser (Integer)
applicableFor (Enum: all/new_users/restaurants/menu_items)
applicableIds (String - JSON)
startDate (DateTime)
endDate (DateTime)
isActive (Boolean)
createdBy (String)
```

### 9. Collection: `user_vouchers`

#### Relationships
```javascript
userId → User
promotionId → promotions
```

### 10. Collection: `audit_logs`

#### Key Fields
```javascript
actorId (String)
actorRole (String)
action (Enum: create/update/delete/approve/reject)
entity (String)
entityId (String)
before (String - JSON)
after (String - JSON)
changes (String - JSON)
ipAddress (String)
userAgent (String)
```

---

## Cập nhật Collections Hiện Có

### ⚠️ Cập nhật `menu`

**Thêm attributes:**

```javascript
// Relationship
{
  key: "restaurantId",
  relatedCollection: "restaurants",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "menuItems",
  onDelete: "cascade"
}

// Boolean
{
  key: "isAvailable",
  required: false,
  default: true
}

// Integer
{
  key: "stock",
  min: 0,
  required: false,
  default: null
}
```

**Thêm index:**
```javascript
{
  key: "restaurantId_idx",
  type: "key",
  attributes: ["restaurantId"]
}

{
  key: "isAvailable_idx",
  type: "key",
  attributes: ["isAvailable"]
}
```

---

### ⚠️ Cập nhật `orders`

**Thêm attributes:**

```javascript
// Enum
{
  key: "paymentStatus",
  elements: ["pending", "paid", "failed", "refunded"],
  required: false,
  default: "pending"
}

{
  key: "paymentMethod",
  elements: ["cod", "vnpay", "momo"],
  required: false,
  default: "cod"
}

// String
{
  key: "droneId",
  size: 100,
  required: false
}

// DateTime
{
  key: "preparingAt",
  required: false
}

{
  key: "readyAt",
  required: false
}

{
  key: "deliveredAt",
  required: false
}

{
  key: "cancelledAt",
  required: false
}

{
  key: "estimatedDeliveryTime",
  required: false
}
```

**Thêm relationship:**
```javascript
// restaurantId → restaurants
{
  key: "restaurantId",
  relatedCollection: "restaurants",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "orders",
  onDelete: "setNull"
}
```

**Thêm indexes:**
```javascript
{
  key: "restaurantId_idx",
  type: "key",
  attributes: ["restaurantId"]
}

{
  key: "paymentStatus_idx",
  type: "key",
  attributes: ["paymentStatus"]
}

{
  key: "droneId_idx",
  type: "key",
  attributes: ["droneId"]
}
```

---

### ⚠️ Cập nhật `User` (Optional)

**Thêm attributes:**

```javascript
// Enum
{
  key: "status",
  elements: ["active", "suspended", "banned", "pending"],
  required: false,
  default: "active"
}

// DateTime
{
  key: "lastLoginAt",
  required: false
}
```

---

## Setup Permissions & Security Rules

### Collection-level Permissions Template

#### Public Collections (readable by anyone):
- `restaurants` (chỉ những active)
- `menu` (chỉ những available)
- `categories`
- `reviews` (chỉ những visible)

#### Authenticated User Collections:
- `orders` (chỉ owner hoặc admin)
- `payments` (chỉ owner hoặc admin)
- `user_vouchers` (chỉ owner)
- `notifications` (chỉ owner)

#### Admin-only Collections:
- `drones`
- `drone_events`
- `audit_logs`

### Permission Rules Example:

```javascript
// restaurants - Read permissions
permissions: [
  Permission.read(Role.any()), // Public có thể đọc
  Permission.create(Role.users()), // Authenticated users có thể tạo (đăng ký)
  Permission.update(Role.user("[USER_ID]")), // Owner
  Permission.update(Role.team("admin")), // Admin
  Permission.delete(Role.team("admin"))
]

// orders - Read/Write permissions
permissions: [
  Permission.read(Role.user("[USER_ID]")), // Chỉ owner
  Permission.read(Role.team("admin")), // Admin
  Permission.create(Role.users()),
  Permission.update(Role.user("[USER_ID]")),
  Permission.update(Role.team("admin")),
  Permission.delete(Role.team("admin"))
]
```

---

## Checklist Hoàn Thành

### Phase 1 (Critical)
- [ ] Tạo collection `restaurants` với đầy đủ 22 attributes
- [ ] Setup relationship `restaurants.ownerId → User`
- [ ] Tạo 5 indexes cho `restaurants`
- [ ] Tạo collection `order_items`
- [ ] Setup relationship `order_items.orderId → orders`
- [ ] Tạo collection `payments`
- [ ] Setup relationship `payments.orderId → orders`
- [ ] Cập nhật `menu`: thêm `restaurantId`, `isAvailable`, `stock`
- [ ] Cập nhật `orders`: thêm payment & drone fields

### Phase 2
- [ ] Tạo collection `reviews`
- [ ] Setup relationships cho `reviews`
- [ ] Tạo collection `notifications`
- [ ] Setup indexes cho notifications

### Phase 3
- [ ] Tạo collection `drones`
- [ ] Tạo collection `drone_events`
- [ ] Setup relationships

### Phase 4
- [ ] Tạo collection `promotions`
- [ ] Tạo collection `user_vouchers`
- [ ] Tạo collection `audit_logs`

### Security
- [ ] Configure permissions cho tất cả collections
- [ ] Test permissions với các roles khác nhau
- [ ] Setup API keys nếu cần

---

## Tips & Best Practices

### 1. Thứ tự tạo Collections
Tạo theo thứ tự dependency để tránh lỗi relationship:
1. User (đã có)
2. restaurants (depends on User)
3. menu (update to depend on restaurants)
4. orders (update to depend on restaurants)
5. order_items, payments (depends on orders)
6. Các collections còn lại

### 2. Testing
Sau khi tạo mỗi collection:
- [ ] Test CRUD operations qua Appwrite Console
- [ ] Test relationships
- [ ] Test permissions
- [ ] Insert sample data

### 3. Backup
- Backup database sau mỗi phase
- Export schema definition

### 4. Documentation
- Document lại Collection IDs
- Lưu lại attribute keys chính xác
- Update file `.env` với collection IDs mới

---

## Troubleshooting

### Lỗi thường gặp:

**1. Cannot create relationship**
- ✅ Đảm bảo collection đích đã tồn tại
- ✅ Check collection ID chính xác
- ✅ Verify permissions

**2. Index creation failed**
- ✅ Attribute đã tồn tại
- ✅ Không trùng index name
- ✅ Attribute type phù hợp với index type

**3. Permission denied**
- ✅ Check API key permissions
- ✅ Verify user role
- ✅ Review collection-level permissions

---

## Next Steps

Sau khi setup xong database:

1. **Update code:**
   - Update `appwriteConfig` trong `/mobile/lib/appwrite.ts`
   - Update `appwriteConfig` trong `/admin/src/lib/appwrite.ts`
   - Thêm collection IDs mới

2. **Generate TypeScript types:**
   - Tạo types cho tất cả collections mới
   - Update file `types/index.ts`

3. **Create API functions:**
   - CRUD functions cho từng collection
   - Query helpers
   - Relationship loaders

4. **Test integration:**
   - Test mobile app với collections mới
   - Test admin dashboard
   - Verify data flow

---

**Created:** October 17, 2025  
**Version:** 1.0  
**Author:** FoodFast Development Team
