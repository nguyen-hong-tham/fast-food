# 🎯 FoodFast Simplified Database Setup Guide

> **Phiên bản đơn giản hóa** - Loại bỏ các tính năng phức tạp như customization, reviews, promotions, audit logs

## 📋 Mục lục
1. [Tổng quan](#tổng-quan)
2. [Thay đổi so với phiên bản cũ](#thay-đổi-so-với-phiên-bản-cũ)
3. [Danh sách 10 Collections](#danh-sách-10-collections)
4. [Hướng dẫn Setup từng Collection](#hướng-dẫn-setup-từng-collection)
5. [Setup Relationships](#setup-relationships)
6. [Setup Indexes](#setup-indexes)
7. [Permissions & Security](#permissions--security)
8. [Migration từ Database cũ](#migration-từ-database-cũ)

---

## 📊 Tổng quan

**Database ID:** `68da5e73002cb68e70af` (app)

**Số lượng Collections:** 10 collections (giảm từ 15+)

**Thời gian setup ước tính:** 6-8 giờ

**File ERD:** `drawio/foodfast-simplified-erd.drawio`

---

## 🔄 Thay đổi so với phiên bản cũ

### ✅ Giữ lại (10 collections)
1. ✅ **User** - Quản lý người dùng
2. ✅ **restaurants** - Thông tin nhà hàng
3. ✅ **categories** - Danh mục món ăn
4. ✅ **menu** - Món ăn (đơn giản hóa, bỏ customization)
5. ✅ **orders** - Đơn hàng
6. ✅ **order_items** - Chi tiết món trong đơn
7. ✅ **payments** - Thanh toán
8. ✅ **drones** - Quản lý drone
9. ✅ **drone_events** - Lịch sử hoạt động drone
10. ✅ **notifications** - Thông báo

### ❌ Loại bỏ (5 collections)
1. ❌ **reviews** - Đánh giá (quá phức tạp cho MVP)
2. ❌ **promotions** - Khuyến mãi (không cần thiết lúc đầu)
3. ❌ **menu_customizations** - Liên kết menu-customization
4. ❌ **customizations** - Tùy chọn topping (làm phức tạp order)
5. ❌ **audit_logs** - Theo dõi thay đổi (overhead không cần thiết)

### 🎯 Lợi ích của việc đơn giản hóa
- ⚡ **Giảm độ phức tạp:** Dễ phát triển và maintain hơn
- 🚀 **Tăng tốc độ phát triển:** Focus vào core features
- 🐛 **Ít bugs hơn:** Ít relationship, ít edge cases
- 💰 **Giảm chi phí:** Ít document storage, ít API calls
- 📱 **UX đơn giản hơn:** User không bị overwhelm với options

---

## 📚 Danh sách 10 Collections

| # | Collection ID | Tên hiển thị | Mục đích | Quan hệ chính |
|---|---------------|--------------|----------|---------------|
| 1 | `user` | User | Quản lý người dùng (Customer/Restaurant/Admin) | → orders, restaurants, notifications |
| 2 | `restaurants` | Restaurants | Thông tin nhà hàng đối tác | ← user (owner), → menu, orders |
| 3 | `categories` | Categories | Danh mục món ăn | → menu |
| 4 | `menu` | Menu | Món ăn (không có topping/customization) | ← restaurants, categories |
| 5 | `orders` | Orders | Đơn hàng | ← user, restaurants, drones → order_items, payments |
| 6 | `order_items` | Order Items | Chi tiết món trong đơn | ← orders |
| 7 | `payments` | Payments | Thanh toán | ← orders |
| 8 | `drones` | Drones | Quản lý drone giao hàng | → orders, drone_events |
| 9 | `drone_events` | Drone Events | Lịch sử hoạt động drone | ← drones |
| 10 | `notifications` | Notifications | Thông báo cho user | ← user |

---

## 🛠️ Hướng dẫn Setup từng Collection

### 1️⃣ Collection: `User`

**Mục đích:** Quản lý thông tin người dùng (Customer, Restaurant Owner, Admin)

#### Tạo Collection
```
1. Vào Databases → Chọn database "app" (68da5e73002cb68e70af)
2. Click "Create Collection"
3. Collection ID: user (nếu chưa có, hoặc skip nếu đã có)
4. Collection Name: User
5. Click "Create"
```

#### Các Attributes

**String Attributes:**
```javascript
// 1. name (required)
{
  key: "name",
  size: 100,
  required: true,
  default: null
}

// 2. email (required) - type: Email
{
  key: "email",
  type: "email",
  required: true
}

// 3. accountId (required) - Link to Appwrite Auth
{
  key: "accountId",
  size: 2200,
  required: true
}

// 4. avatar (optional) - type: URL
{
  key: "avatar",
  type: "url",
  required: false
}

// 5. phone (optional)
{
  key: "phone",
  size: 15,
  required: false
}

// 6. address_home (optional)
{
  key: "address_home",
  size: 255,
  required: false
}

// 7. address_home_label (optional)
{
  key: "address_home_label",
  size: 50,
  required: false,
  default: "Home"
}

// 8. role (required) - type: Enum
{
  key: "role",
  type: "enum",
  elements: ["customer", "restaurant", "admin"],
  required: true
}

// 9. status (optional) - type: Enum
{
  key: "status",
  type: "enum",
  elements: ["active", "inactive"],
  required: false,
  default: "active"
}
```

**DateTime Attributes:**
```javascript
// 10. createdAt
{
  key: "createdAt",
  type: "datetime",
  required: false
}

// 11. updatedAt
{
  key: "updatedAt",
  type: "datetime",
  required: false
}

// 12. lastLoginAt
{
  key: "lastLoginAt",
  type: "datetime",
  required: false
}
```

**Relationship Attributes:**
```javascript
// 13. restaurants (One to Many)
{
  key: "restaurants",
  type: "relationship",
  relationType: "oneToMany",
  twoWay: true,
  twoWayKey: "ownerId",
  relatedCollection: "restaurants"
}

// 14. reviews (One to Many) - BỎ VÌ KHÔNG CẦN
// SKIP

// 15. orders (One to Many)
{
  key: "orders",
  type: "relationship", 
  relationType: "oneToMany",
  twoWay: true,
  twoWayKey: "userId",
  relatedCollection: "orders"
}
```

---

### 2️⃣ Collection: `restaurants`

**Mục đích:** Quản lý thông tin nhà hàng đối tác

#### Tạo Collection
```
1. Vào Databases → Chọn database "app"
2. Click "Create Collection"
3. Collection ID: restaurants (nếu chưa có)
4. Collection Name: Restaurants
5. Click "Create"
```

#### Các Attributes

**String Attributes:**
```javascript
// 1. name (required)
{
  key: "name",
  size: 200,
  required: true
}

// 2. description (optional)
{
  key: "description",
  size: 1000,
  required: false
}

// 3. address (required)
{
  key: "address",
  size: 500,
  required: true
}

// 4. phone (required)
{
  key: "phone",
  size: 20,
  required: true
}

// 5. email (required) - type: Email
{
  key: "email",
  type: "email",
  required: true
}

// 6. logo (optional) - type: URL
{
  key: "logo",
  type: "url",
  required: false
}

// 7. coverImage (optional) - type: URL
{
  key: "coverImage",
  type: "url",
  required: false
}

// 8. cuisineType (optional)
{
  key: "cuisineType",
  size: 100,
  required: false
}

// 9. businessLicense (optional)
{
  key: "businessLicense",
  size: 100,
  required: false
}

// 10. taxCode (optional)
{
  key: "taxCode",
  size: 50,
  required: false
}

// 11. bankAccount (optional)
{
  key: "bankAccount",
  size: 100,
  required: false
}

// 12. bankName (optional)
{
  key: "bankName",
  size: 100,
  required: false
}

// 13. rejectionReason (optional)
{
  key: "rejectionReason",
  size: 2000,
  required: false
}

// 14. status (required) - type: Enum
{
  key: "status",
  type: "enum",
  elements: ["pending", "approved", "rejected", "active", "inactive"],
  required: true,
  default: "pending"
}
```

**Float Attributes:**
```javascript
// 15. latitude (required) - cho map location
{
  key: "latitude",
  type: "float",
  required: true,
  min: -90,
  max: 90
}

// 16. longitude (required)
{
  key: "longitude",
  type: "float",
  required: true,
  min: -180,
  max: 180
}

// 17. rating (optional) - calculated from reviews
{
  key: "rating",
  type: "float",
  required: false,
  default: 0,
  min: 0,
  max: 5
}

// 18. totalRevenue (optional)
{
  key: "totalRevenue",
  type: "float",
  required: false,
  default: 0
}
```

**Integer Attributes:**
```javascript
// 19. totalOrders (optional)
{
  key: "totalOrders",
  type: "integer",
  required: false,
  default: 0
}
```

**Boolean Attributes:**
```javascript
// 20. isActive (optional)
{
  key: "isActive",
  type: "boolean",
  required: false,
  default: true
}
```

**DateTime Attributes:**
```javascript
// 21. approvedAt
{
  key: "approvedAt",
  type: "datetime",
  required: false
}

// Auto-generated: $createdAt, $updatedAt
```

**Relationship Attributes:**
```javascript
// 22. ownerId (Many to One) - Link to User
{
  key: "ownerId",
  type: "relationship",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "restaurants",
  relatedCollection: "user",
  required: true
}

// 23. menuItems (One to Many)
{
  key: "menuItems",
  type: "relationship",
  relationType: "oneToMany",
  twoWay: true,
  twoWayKey: "restaurantId",
  relatedCollection: "menu"
}

// 24. orders (One to Many)
{
  key: "orders",
  type: "relationship",
  relationType: "oneToMany",
  twoWay: true,
  twoWayKey: "restaurantId",
  relatedCollection: "orders"
}

// 25. reviews (One to Many) - BỎ VÌ KHÔNG CẦN
// SKIP
```

---

### 3️⃣ Collection: `categories`

**Mục đích:** Danh mục món ăn (Pizza, Burger, Drink, etc.)

#### Tạo Collection
```
1. Vào Databases → Chọn database "app"
2. Click "Create Collection"
3. Collection ID: categories (nếu chưa có)
4. Collection Name: Categories
5. Click "Create"
```

#### Các Attributes

**String Attributes:**
```javascript
// 1. name (required)
{
  key: "name",
  size: 100,
  required: true
}

// 2. description (required)
{
  key: "description",
  size: 200,
  required: true
}

// 3. imageUrl (optional) - type: URL
{
  key: "imageUrl",
  type: "url",
  required: false
}
```

**Integer Attributes:**
```javascript
// 4. displayOrder (optional) - for sorting
{
  key: "displayOrder",
  type: "integer",
  required: false,
  default: 0
}
```

**DateTime Attributes:**
```javascript
// Auto-generated: $createdAt, $updatedAt
```

**Relationship Attributes:**
```javascript
// 5. menu (One to Many)
{
  key: "menu",
  type: "relationship",
  relationType: "oneToMany",
  twoWay: true,
  twoWayKey: "categories",
  relatedCollection: "menu"
}
```

---

### 4️⃣ Collection: `menu`

**Mục đích:** Món ăn (ĐÃ ĐƠN GIẢN HÓA - Không có customization/topping)

#### Tạo Collection
```
1. Vào Databases → Chọn database "app"
2. Click "Create Collection"
3. Collection ID: menu (nếu chưa có)
4. Collection Name: Menu
5. Click "Create"
```

#### Các Attributes

**String Attributes:**
```javascript
// 1. name (required)
{
  key: "name",
  size: 200,
  required: true
}

// 2. description (required)
{
  key: "description",
  size: 2200,
  required: true
}

// 3. image_url (required) - type: URL
{
  key: "image_url",
  type: "url",
  required: true
}
```

**Float Attributes:**
```javascript
// 4. rating (optional) - calculated
{
  key: "rating",
  type: "float",
  required: false,
  default: 0,
  min: 0,
  max: 5
}

// 5. price (required)
{
  key: "price",
  type: "float",
  required: true,
  min: 5,
  max: 10000
}
```

**Integer Attributes:**
```javascript
// 6. calories (required) - nutrition info
{
  key: "calories",
  type: "integer",
  required: true,
  min: 5,
  max: 10000
}

// 7. protein (required) - nutrition info
{
  key: "protein",
  type: "integer",
  required: true,
  min: 5,
  max: 10000
}

// 8. stock (optional) - inventory management
{
  key: "stock",
  type: "integer",
  required: false,
  default: 0,
  min: 0
}

// 9. soldCount (optional) - popularity tracking
{
  key: "soldCount",
  type: "integer",
  required: false,
  default: 0
}
```

**Boolean Attributes:**
```javascript
// 10. isAvailable (optional) - can be ordered?
{
  key: "isAvailable",
  type: "boolean",
  required: false,
  default: true
}
```

**DateTime Attributes:**
```javascript
// Auto-generated: $createdAt, $updatedAt
```

**Relationship Attributes:**
```javascript
// 11. restaurantId (Many to One) - Link to Restaurant
{
  key: "restaurantId",
  type: "relationship",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "menuItems",
  relatedCollection: "restaurants",
  required: true
}

// 12. categories (Many to One)
{
  key: "categories",
  type: "relationship",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "menu",
  relatedCollection: "categories"
}

// 13. menuCustomizations (Many to One) - BỎ VÌ KHÔNG CẦN
// SKIP - Không còn customization
```

**⚠️ Lưu ý quan trọng:**
- Món ăn giờ chỉ có giá cố định, không có topping/size/customization
- Đơn giản hóa: Customer chọn món → Thêm vào giỏ → Thanh toán
- Nếu cần variants sau này, có thể tạo nhiều menu items (VD: Pizza Small, Pizza Large)

---

### 5️⃣ Collection: `orders`

**Mục đích:** Quản lý đơn hàng

#### Tạo Collection
```
1. Vào Databases → Chọn database "app"
2. Click "Create Collection"
3. Collection ID: orders (nếu chưa có)
4. Collection Name: Orders
5. Click "Create"
```

#### Các Attributes

**String Attributes:**
```javascript
// 1. items (required) - JSON array of order items
// Lưu trữ tạm thời, chi tiết thực sự ở order_items table
{
  key: "items",
  size: 1000,
  required: true
}

// 2. deliveryAddress (required)
{
  key: "deliveryAddress",
  size: 500,
  required: true
}

// 3. deliveryAddressLabel (optional)
{
  key: "deliveryAddressLabel",
  size: 100,
  required: false
}

// 4. phone (optional)
{
  key: "phone",
  size: 20,
  required: false
}

// 5. email (optional) - type: Email
{
  key: "email",
  type: "email",
  required: false
}

// 6. notes (optional) - customer notes
{
  key: "notes",
  size: 1000,
  required: false
}

// 7. recipientName (optional)
{
  key: "recipientName",
  size: 255,
  required: false
}

// 8. status (required) - type: Enum
{
  key: "status",
  type: "enum",
  elements: ["pending", "confirmed", "preparing", "ready", "delivering", "delivered", "cancelled"],
  required: true,
  default: "pending"
}

// 9. paymentStatus (optional) - type: Enum
{
  key: "paymentStatus",
  type: "enum",
  elements: ["pending", "paid", "failed", "refunded"],
  required: false,
  default: "pending"
}

// 10. paymentMethod (optional) - type: Enum
{
  key: "paymentMethod",
  type: "enum",
  elements: ["cod", "momo", "zalopay", "vnpay"],
  required: false,
  default: "cod"
}
```

**Float Attributes:**
```javascript
// 11. total (required)
{
  key: "total",
  type: "float",
  required: true,
  min: 0
}
```

**DateTime Attributes:**
```javascript
// 12. createdAt (required)
{
  key: "createdAt",
  type: "datetime",
  required: true
}

// 13. updatedAt
{
  key: "updatedAt",
  type: "datetime",
  required: false
}

// 14. assignedAt - khi assign cho drone
{
  key: "assignedAt",
  type: "datetime",
  required: false
}

// 15. confirmedAt
{
  key: "confirmedAt",
  type: "datetime",
  required: false
}

// 16. readyAt - ready to deliver
{
  key: "readyAt",
  type: "datetime",
  required: false
}

// 17. deliveredAt
{
  key: "deliveredAt",
  type: "datetime",
  required: false
}

// 18. cancelledAt
{
  key: "cancelledAt",
  type: "datetime",
  required: false
}

// 19. estimatedDeliveryTime
{
  key: "estimatedDeliveryTime",
  type: "datetime",
  required: false
}
```

**Relationship Attributes:**
```javascript
// 20. userId (Many to One) - Link to Customer
{
  key: "userId",
  type: "relationship",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "orders",
  relatedCollection: "user"
}

// 21. restaurantId (Many to One)
{
  key: "restaurantId",
  type: "relationship",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "orders",
  relatedCollection: "restaurants"
}

// 22. droneId (Many to One) - assigned drone
{
  key: "droneId",
  type: "relationship",
  relationType: "manyToOne",
  twoWay: false,
  relatedCollection: "drones"
}

// 23. orderItems (One to Many)
{
  key: "orderItems",
  type: "relationship",
  relationType: "oneToMany",
  twoWay: true,
  twoWayKey: "orderId",
  relatedCollection: "order_items"
}

// 24. payments (One to One or One to Many)
{
  key: "payments",
  type: "relationship",
  relationType: "oneToMany",
  twoWay: true,
  twoWayKey: "orderId",
  relatedCollection: "payments"
}
```

---

### 6️⃣ Collection: `order_items`

**Mục đích:** Chi tiết món ăn trong đơn hàng

#### Tạo Collection
```
1. Vào Databases → Chọn database "app"
2. Click "Create Collection"
3. Collection ID: order_items (nếu chưa có)
4. Collection Name: Order Items
5. Click "Create"
```

#### Các Attributes

**String Attributes:**
```javascript
// 1. menuItemId (required) - reference to menu
{
  key: "menuItemId",
  size: 100,
  required: true
}

// 2. name (required) - snapshot of menu item name
{
  key: "name",
  size: 200,
  required: true
}

// 3. imageUrl (optional) - type: URL
{
  key: "imageUrl",
  type: "url",
  required: false
}

// 4. notes (optional) - customer notes for this item
{
  key: "notes",
  size: 500,
  required: false
}

// 5. customizations (optional) - BỎ VÌ KHÔNG CẦN
// SKIP - không còn topping/customization
```

**Float Attributes:**
```javascript
// 6. price (required) - price at time of order
{
  key: "price",
  type: "float",
  required: true,
  min: 0
}

// 7. subtotal (required) - price * quantity
{
  key: "subtotal",
  type: "float",
  required: true,
  min: 0
}
```

**Integer Attributes:**
```javascript
// 8. quantity (required)
{
  key: "quantity",
  type: "integer",
  required: true,
  min: 1
}
```

**DateTime Attributes:**
```javascript
// Auto-generated: $createdAt, $updatedAt
```

**Relationship Attributes:**
```javascript
// 9. orderId (Many to One) - Link to Order
{
  key: "orderId",
  type: "relationship",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "orderItems",
  relatedCollection: "orders",
  required: true
}
```

---

### 7️⃣ Collection: `payments`

**Mục đích:** Quản lý thanh toán

#### Tạo Collection
```
1. Vào Databases → Chọn database "app"
2. Click "Create Collection"
3. Collection ID: payments (nếu chưa có)
4. Collection Name: Payments
5. Click "Create"
```

#### Các Attributes

**String Attributes:**
```javascript
// 1. userId (required) - user who paid
{
  key: "userId",
  size: 100,
  required: true
}

// 2. transactionId (optional) - from payment gateway
{
  key: "transactionId",
  size: 200,
  required: false
}

// 3. transactionRef (optional) - reference from gateway
{
  key: "transactionRef",
  size: 200,
  required: false
}

// 4. currency (optional)
{
  key: "currency",
  size: 10,
  required: false,
  default: "VND"
}

// 5. failureReason (optional)
{
  key: "failureReason",
  size: 500,
  required: false
}

// 6. refundReason (optional)
{
  key: "refundReason",
  size: 500,
  required: false
}

// 7. rawResponse (optional) - full gateway response
{
  key: "rawResponse",
  size: 5000,
  required: false
}

// 8. provider (required) - type: Enum
{
  key: "provider",
  type: "enum",
  elements: ["cod", "momo", "zalopay", "vnpay"],
  required: true
}

// 9. method (optional) - type: Enum
{
  key: "method",
  type: "enum",
  elements: ["cash", "e-wallet", "bank_transfer"],
  required: false
}

// 10. status (required) - type: Enum
{
  key: "status",
  type: "enum",
  elements: ["pending", "completed", "failed", "refunded"],
  required: true
}
```

**Float Attributes:**
```javascript
// 11. amount (required)
{
  key: "amount",
  type: "float",
  required: true,
  min: 0
}

// 12. refundAmount (optional)
{
  key: "refundAmount",
  type: "float",
  required: false,
  min: 0
}
```

**DateTime Attributes:**
```javascript
// 13. refundedAt
{
  key: "refundedAt",
  type: "datetime",
  required: false
}

// Auto-generated: $createdAt, $updatedAt
```

**Relationship Attributes:**
```javascript
// 14. orderId (One to One or Many to One)
{
  key: "orderId",
  type: "relationship",
  relationType: "oneToOne",
  twoWay: true,
  twoWayKey: "payments",
  relatedCollection: "orders"
}
```

---

### 8️⃣ Collection: `drones`

**Mục đích:** Quản lý drone giao hàng

#### Tạo Collection
```
1. Vào Databases → Chọn database "app"
2. Click "Create Collection"
3. Collection ID: drones (nếu chưa có)
4. Collection Name: Drones
5. Click "Create"
```

#### Các Attributes

**String Attributes:**
```javascript
// 1. code (required) - unique drone code
{
  key: "code",
  size: 50,
  required: true
}

// 2. name (required) - display name
{
  key: "name",
  size: 100,
  required: true
}

// 3. model (optional) - drone model
{
  key: "model",
  size: 100,
  required: false
}

// 4. assignedOrderId (optional) - current order
{
  key: "assignedOrderId",
  size: 100,
  required: false
}

// 5. status (required) - type: Enum
{
  key: "status",
  type: "enum",
  elements: ["available", "busy", "maintenance", "offline"],
  required: true,
  default: "available"
}
```

**Integer Attributes:**
```javascript
// 6. batteryLevel (optional) - percentage
{
  key: "batteryLevel",
  type: "integer",
  required: false,
  default: 100,
  min: 0,
  max: 100
}

// 7. totalFlights (optional) - counter
{
  key: "totalFlights",
  type: "integer",
  required: false,
  default: 0
}
```

**Float Attributes:**
```javascript
// 8. currentLatitude (optional)
{
  key: "currentLatitude",
  type: "float",
  required: false,
  min: -90,
  max: 90
}

// 9. currentLongitude (optional)
{
  key: "currentLongitude",
  type: "float",
  required: false,
  min: -180,
  max: 180
}

// 10. maxPayload (optional) - kg
{
  key: "maxPayload",
  type: "float",
  required: false,
  default: 5
}

// 11. currentPayload (optional) - kg
{
  key: "currentPayload",
  type: "float",
  required: false,
  default: 0
}

// 12. maxSpeed (optional) - km/h
{
  key: "maxSpeed",
  type: "float",
  required: false,
  default: 50
}

// 13. maxRange (optional) - km
{
  key: "maxRange",
  type: "float",
  required: false,
  default: 10
}

// 14. totalDistance (optional) - km
{
  key: "totalDistance",
  type: "float",
  required: false,
  default: 0
}
```

**Boolean Attributes:**
```javascript
// 15. isActive (optional)
{
  key: "isActive",
  type: "boolean",
  required: false,
  default: true
}
```

**DateTime Attributes:**
```javascript
// 16. lastMaintenanceAt
{
  key: "lastMaintenanceAt",
  type: "datetime",
  required: false
}

// 17. nextMaintenanceAt
{
  key: "nextMaintenanceAt",
  type: "datetime",
  required: false
}

// Auto-generated: $createdAt, $updatedAt
```

**Relationship Attributes:**
```javascript
// 18. droneEvents (One to Many)
{
  key: "droneEvents",
  type: "relationship",
  relationType: "oneToMany",
  twoWay: true,
  twoWayKey: "droneId",
  relatedCollection: "drone_events"
}
```

---

### 9️⃣ Collection: `drone_events`

**Mục đích:** Lịch sử hoạt động của drone (logs)

#### Tạo Collection
```
1. Vào Databases → Chọn database "app"
2. Click "Create Collection"
3. Collection ID: drone_events (nếu chưa có)
4. Collection Name: Drone Events
5. Click "Create"
```

#### Các Attributes

**String Attributes:**
```javascript
// 1. orderId (optional) - related order
{
  key: "orderId",
  size: 100,
  required: false
}

// 2. payload (optional) - additional data (JSON)
{
  key: "payload",
  size: 2000,
  required: false
}

// 3. description (optional)
{
  key: "description",
  size: 500,
  required: false
}

// 4. eventType (required) - type: Enum
{
  key: "eventType",
  type: "enum",
  elements: ["takeoff", "landing", "delivery_start", "delivery_complete", "battery_low", "maintenance", "error"],
  required: true
}
```

**Float Attributes:**
```javascript
// 5. latitude (optional) - event location
{
  key: "latitude",
  type: "float",
  required: false
}

// 6. longitude (optional)
{
  key: "longitude",
  type: "float",
  required: false
}

// 7. altitude (optional) - meters
{
  key: "altitude",
  type: "float",
  required: false
}

// 8. speed (optional) - km/h
{
  key: "speed",
  type: "float",
  required: false
}
```

**Integer Attributes:**
```javascript
// 9. batteryLevel (optional) - at time of event
{
  key: "batteryLevel",
  type: "integer",
  required: false,
  default: 100,
  min: 0,
  max: 100
}
```

**DateTime Attributes:**
```javascript
// Auto-generated: $createdAt, $updatedAt
```

**Relationship Attributes:**
```javascript
// 10. droneId (Many to One) - Link to Drone
{
  key: "droneId",
  type: "relationship",
  relationType: "manyToOne",
  twoWay: true,
  twoWayKey: "droneEvents",
  relatedCollection: "drones"
}
```

---

### 🔟 Collection: `notifications`

**Mục đích:** Thông báo cho người dùng

#### Tạo Collection
```
1. Vào Databases → Chọn database "app"
2. Click "Create Collection"
3. Collection ID: notifications (nếu chưa có)
4. Collection Name: Notifications
5. Click "Create"
```

#### Các Attributes

**String Attributes:**
```javascript
// 1. userId (required) - recipient
{
  key: "userId",
  size: 100,
  required: true
}

// 2. title (required)
{
  key: "title",
  size: 200,
  required: true
}

// 3. body (required)
{
  key: "body",
  size: 1000,
  required: true
}

// 4. data (optional) - additional data (JSON)
{
  key: "data",
  size: 2000,
  required: false
}

// 5. imageUrl (optional) - type: URL
{
  key: "imageUrl",
  type: "url",
  required: false
}

// 6. actionUrl (optional) - deep link
{
  key: "actionUrl",
  size: 500,
  required: false
}

// 7. fcmToken (optional) - for push notifications
{
  key: "fcmToken",
  size: 500,
  required: false
}

// 8. type (required) - type: Enum
{
  key: "type",
  type: "enum",
  elements: ["order_status", "promotion", "system", "drone_update"],
  required: true
}

// 9. channel (required) - type: Enum
{
  key: "channel",
  type: "enum",
  elements: ["push", "email", "sms", "in_app"],
  required: true
}

// 10. status (required) - type: Enum
{
  key: "status",
  type: "enum",
  elements: ["pending", "sent", "delivered", "failed", "read"],
  required: true
}
```

**DateTime Attributes:**
```javascript
// 11. sentAt
{
  key: "sentAt",
  type: "datetime",
  required: false
}

// 12. readAt
{
  key: "readAt",
  type: "datetime",
  required: false
}

// Auto-generated: $createdAt, $updatedAt
```

---

## 🔗 Setup Relationships

### Relationship Matrix

| From Collection | To Collection | Type | Two-Way | Key Name |
|----------------|---------------|------|---------|----------|
| User | restaurants | 1:N | Yes | ownerId |
| User | orders | 1:N | Yes | userId |
| User | notifications | 1:N | No | userId |
| restaurants | menu | 1:N | Yes | restaurantId |
| restaurants | orders | 1:N | Yes | restaurantId |
| categories | menu | 1:N | Yes | categories |
| orders | order_items | 1:N | Yes | orderId |
| orders | payments | 1:1 | Yes | orderId |
| orders | drones | N:1 | No | droneId |
| drones | drone_events | 1:N | Yes | droneId |

### Setup Steps

**Lưu ý:** Appwrite sẽ tự động tạo two-way relationships khi bạn tạo relationship attribute. Đảm bảo:

1. ✅ Tạo collection trước
2. ✅ Tạo các attributes thông thường trước
3. ✅ Cuối cùng mới tạo relationship attributes
4. ✅ Kiểm tra two-way key có đúng không

---

## 📇 Setup Indexes

### Indexes cần tạo

#### Collection: `User`
```javascript
// 1. Index by email
{
  key: "idx_user_email",
  type: "key",
  attributes: ["email"],
  orders: ["ASC"]
}

// 2. Index by accountId
{
  key: "idx_user_accountId",
  type: "key",
  attributes: ["accountId"],
  orders: ["ASC"]
}

// 3. Index by role
{
  key: "idx_user_role",
  type: "key",
  attributes: ["role"],
  orders: ["ASC"]
}

// 4. Fulltext search by name
{
  key: "idx_user_name_fulltext",
  type: "fulltext",
  attributes: ["name"]
}
```

#### Collection: `restaurants`
```javascript
// 1. Index by status
{
  key: "idx_restaurants_status",
  type: "key",
  attributes: ["status"],
  orders: ["ASC"]
}

// 2. Index by ownerId
{
  key: "idx_restaurants_ownerId",
  type: "key",
  attributes: ["ownerId"],
  orders: ["ASC"]
}

// 3. Index by location (latitude, longitude)
{
  key: "idx_restaurants_location",
  type: "key",
  attributes: ["latitude", "longitude"],
  orders: ["ASC", "ASC"]
}

// 4. Fulltext search by name
{
  key: "idx_restaurants_name_fulltext",
  type: "fulltext",
  attributes: ["name"]
}
```

#### Collection: `menu`
```javascript
// 1. Index by restaurantId
{
  key: "idx_menu_restaurantId",
  type: "key",
  attributes: ["restaurantId"],
  orders: ["ASC"]
}

// 2. Index by categories
{
  key: "idx_menu_categories",
  type: "key",
  attributes: ["categories"],
  orders: ["ASC"]
}

// 3. Index by isAvailable
{
  key: "idx_menu_isAvailable",
  type: "key",
  attributes: ["isAvailable"],
  orders: ["DESC"]
}

// 4. Index by price
{
  key: "idx_menu_price",
  type: "key",
  attributes: ["price"],
  orders: ["ASC"]
}

// 5. Fulltext search by name
{
  key: "idx_menu_name_fulltext",
  type: "fulltext",
  attributes: ["name"]
}
```

#### Collection: `orders`
```javascript
// 1. Index by userId
{
  key: "idx_orders_userId",
  type: "key",
  attributes: ["userId"],
  orders: ["ASC"]
}

// 2. Index by restaurantId
{
  key: "idx_orders_restaurantId",
  type: "key",
  attributes: ["restaurantId"],
  orders: ["ASC"]
}

// 3. Index by status
{
  key: "idx_orders_status",
  type: "key",
  attributes: ["status"],
  orders: ["ASC"]
}

// 4. Index by createdAt (for sorting)
{
  key: "idx_orders_createdAt",
  type: "key",
  attributes: ["createdAt"],
  orders: ["DESC"]
}

// 5. Index by droneId
{
  key: "idx_orders_droneId",
  type: "key",
  attributes: ["droneId"],
  orders: ["ASC"]
}
```

#### Collection: `order_items`
```javascript
// 1. Index by orderId
{
  key: "idx_order_items_orderId",
  type: "key",
  attributes: ["orderId"],
  orders: ["ASC"]
}

// 2. Index by menuItemId
{
  key: "idx_order_items_menuItemId",
  type: "key",
  attributes: ["menuItemId"],
  orders: ["ASC"]
}
```

#### Collection: `payments`
```javascript
// 1. Index by orderId
{
  key: "idx_payments_orderId",
  type: "key",
  attributes: ["orderId"],
  orders: ["ASC"]
}

// 2. Index by userId
{
  key: "idx_payments_userId",
  type: "key",
  attributes: ["userId"],
  orders: ["ASC"]
}

// 3. Index by status
{
  key: "idx_payments_status",
  type: "key",
  attributes: ["status"],
  orders: ["ASC"]
}

// 4. Index by transactionId
{
  key: "idx_payments_transactionId",
  type: "key",
  attributes: ["transactionId"],
  orders: ["ASC"]
}
```

#### Collection: `drones`
```javascript
// 1. Index by status
{
  key: "idx_drones_status",
  type: "key",
  attributes: ["status"],
  orders: ["ASC"]
}

// 2. Index by code (unique)
{
  key: "idx_drones_code",
  type: "unique",
  attributes: ["code"],
  orders: ["ASC"]
}

// 3. Index by isActive
{
  key: "idx_drones_isActive",
  type: "key",
  attributes: ["isActive"],
  orders: ["DESC"]
}
```

#### Collection: `drone_events`
```javascript
// 1. Index by droneId
{
  key: "idx_drone_events_droneId",
  type: "key",
  attributes: ["droneId"],
  orders: ["ASC"]
}

// 2. Index by eventType
{
  key: "idx_drone_events_eventType",
  type: "key",
  attributes: ["eventType"],
  orders: ["ASC"]
}

// 3. Index by $createdAt
{
  key: "idx_drone_events_createdAt",
  type: "key",
  attributes: ["$createdAt"],
  orders: ["DESC"]
}
```

#### Collection: `notifications`
```javascript
// 1. Index by userId
{
  key: "idx_notifications_userId",
  type: "key",
  attributes: ["userId"],
  orders: ["ASC"]
}

// 2. Index by status
{
  key: "idx_notifications_status",
  type: "key",
  attributes: ["status"],
  orders: ["ASC"]
}

// 3. Index by type
{
  key: "idx_notifications_type",
  type: "key",
  attributes: ["type"],
  orders: ["ASC"]
}

// 4. Index by $createdAt
{
  key: "idx_notifications_createdAt",
  type: "key",
  attributes: ["$createdAt"],
  orders: ["DESC"]
}
```

---

## 🔒 Permissions & Security

### Permission Strategy

#### 1. User Collection
```javascript
// Read: Any authenticated user can read own profile
Role: user:[USER_ID]
Permission: read

// Write: User can update own profile
Role: user:[USER_ID]
Permission: update

// Create: Any (for registration)
Role: any
Permission: create

// Delete: Admin only
Role: admin
Permission: delete
```

#### 2. Restaurants Collection
```javascript
// Read: Anyone can read (public listing)
Role: any
Permission: read

// Create: Authenticated users (to register restaurant)
Role: users
Permission: create

// Update: Owner only
Role: user:[OWNER_ID]
Permission: update

// Delete: Admin only
Role: admin
Permission: delete
```

#### 3. Menu Collection
```javascript
// Read: Anyone (public menu)
Role: any
Permission: read

// Create/Update/Delete: Restaurant owner only
Role: user:[RESTAURANT_OWNER_ID]
Permission: create, update, delete
```

#### 4. Orders Collection
```javascript
// Read: Customer and Restaurant owner
Role: user:[CUSTOMER_ID], user:[RESTAURANT_OWNER_ID]
Permission: read

// Create: Customer only
Role: user:[CUSTOMER_ID]
Permission: create

// Update: Restaurant owner (for status update)
Role: user:[RESTAURANT_OWNER_ID]
Permission: update

// Delete: Admin only (for cancellation)
Role: admin
Permission: delete
```

#### 5. Payments Collection
```javascript
// Read: Customer and Admin only
Role: user:[CUSTOMER_ID], admin
Permission: read

// Create: System/Backend only
Role: admin
Permission: create

// Update: System/Backend only
Role: admin
Permission: update
```

#### 6. Drones Collection
```javascript
// Read: Admin and System
Role: admin
Permission: read

// Create/Update/Delete: Admin only
Role: admin
Permission: create, update, delete
```

#### 7. Drone Events Collection
```javascript
// Read: Admin only
Role: admin
Permission: read

// Create: System only (automated logging)
Role: admin
Permission: create
```

#### 8. Notifications Collection
```javascript
// Read: Recipient only
Role: user:[USER_ID]
Permission: read

// Create: System/Backend only
Role: admin
Permission: create

// Update: Recipient (to mark as read)
Role: user:[USER_ID]
Permission: update
```

### Security Best Practices

1. ✅ **Luôn validate user input** ở backend
2. ✅ **Không bao giờ trust client-side data**
3. ✅ **Sử dụng API Key cho server-side calls**
4. ✅ **Rate limiting** cho public endpoints
5. ✅ **Log sensitive operations** (orders, payments)
6. ✅ **Encrypt sensitive data** (payment info)
7. ✅ **Use HTTPS only**

---

## 🚀 Migration từ Database cũ

### Step-by-step Migration

#### Bước 1: Backup Database cũ
```bash
# Appwrite không có native backup tool
# Nên export data qua API hoặc manual export
```

#### Bước 2: Xóa các Collections không cần
```
1. Vào Appwrite Console
2. Database → app
3. Xóa các collections:
   - reviews
   - promotions
   - menu_customizations
   - customizations
   - audit_logs
```

#### Bước 3: Update Collection `menu`
```
1. Xóa relationship: menuCustomizations
2. Thêm attributes mới:
   - restaurantId (relationship)
   - isAvailable (boolean)
   - stock (integer)
   - soldCount (integer)
```

#### Bước 4: Migrate data
```javascript
// Script để migrate data từ collection cũ sang mới
// Run từ Node.js script

const { Client, Databases } = require('node-appwrite');

const client = new Client()
  .setEndpoint('YOUR_ENDPOINT')
  .setProject('YOUR_PROJECT_ID')
  .setKey('YOUR_API_KEY');

const databases = new Databases(client);

// Migrate menu items
async function migrateMenuItems() {
  const oldMenus = await databases.listDocuments('app', 'menu');
  
  for (const menu of oldMenus.documents) {
    // Update each menu item
    await databases.updateDocument('app', 'menu', menu.$id, {
      isAvailable: true,
      stock: 0,
      soldCount: 0
      // restaurantId sẽ cần được assign manually
    });
  }
}
```

#### Bước 5: Verify Migration
```
1. Kiểm tra tất cả relationships
2. Test CRUD operations
3. Verify indexes
4. Test permissions
```

#### Bước 6: Update Application Code
```
1. Remove code liên quan đến:
   - customizations
   - reviews
   - promotions
2. Update API calls cho menu (không có customization)
3. Simplify order flow (no topping selection)
4. Update UI/UX
```

---

## ✅ Checklist hoàn tất

### Database Setup
- [ ] Tạo đủ 10 collections
- [ ] Tất cả attributes đã được tạo đúng
- [ ] Relationships đã được setup
- [ ] Indexes đã được tạo
- [ ] Permissions đã được cấu hình

### Testing
- [ ] Test CRUD operations cho mỗi collection
- [ ] Test relationships (create, read, cascade delete)
- [ ] Test queries với indexes
- [ ] Test permissions (try unauthorized access)
- [ ] Load testing với data mẫu

### Documentation
- [ ] Update API documentation
- [ ] Update ERD diagram
- [ ] Document database changes
- [ ] Update developer guides

### Application Updates
- [ ] Remove customization UI/code
- [ ] Remove reviews UI/code
- [ ] Remove promotions UI/code
- [ ] Simplify order flow
- [ ] Update mobile app
- [ ] Update restaurant portal
- [ ] Update admin portal

---

## 🎓 Best Practices

### 1. Data Consistency
- Luôn validate data trước khi insert
- Sử dụng transactions khi có thể
- Handle relationship cleanup (orphaned records)

### 2. Performance
- Sử dụng indexes cho các query thường xuyên
- Paginate kết quả (limit 25-50 items)
- Cache data khi có thể (Redis, CDN)
- Optimize images (resize, compress)

### 3. Scalability
- Design cho horizontal scaling
- Sử dụng Appwrite Functions cho heavy tasks
- Implement queue system cho async tasks (notifications, emails)
- Monitor database performance

### 4. Security
- Validate input ở cả client và server
- Sanitize user input (prevent injection)
- Rate limit API endpoints
- Log security events
- Regular security audits

---

## 📞 Support & Resources

### Appwrite Resources
- Docs: https://appwrite.io/docs
- Discord: https://appwrite.io/discord
- GitHub: https://github.com/appwrite/appwrite

### Team Resources
- Database Schema: `docs/database/DATABASE_SCHEMA.md`
- ERD Diagram: `drawio/foodfast-simplified-erd.drawio`
- API Documentation: TBD

---

## 🏁 Kết luận

Database đã được đơn giản hóa từ **15+ collections xuống còn 10 collections** bằng cách:

1. ❌ Loại bỏ **reviews** → Giảm complexity, focus vào core features
2. ❌ Loại bỏ **promotions** → Có thể thêm sau nếu cần
3. ❌ Loại bỏ **customizations + menu_customizations** → Đơn giản hóa order flow
4. ❌ Loại bỏ **audit_logs** → Giảm overhead, có thể dùng Appwrite built-in logs

### Lợi ích:
- ⚡ **Faster development** - Ít collections = ít code = ship nhanh hơn
- 🎯 **Focus on core features** - Orders, Payments, Drone delivery
- 🐛 **Fewer bugs** - Ít relationship = ít edge cases
- 💰 **Lower costs** - Ít documents = ít storage = ít API calls
- 📱 **Better UX** - Đơn giản = dễ sử dụng

**Bước tiếp theo:**
1. Mở file `drawio/foodfast-simplified-erd.drawio` để xem ERD
2. Follow hướng dẫn setup từng collection ở trên
3. Update application code để phù hợp với database mới
4. Testing thoroughly trước khi deploy

Good luck! 🚀
