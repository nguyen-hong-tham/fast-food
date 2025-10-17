# FoodFast Database Schema - Complete Design

## 📊 Tổng quan
Thiết kế database hoàn chỉnh cho hệ thống FoodFast với Appwrite.

**Database ID:** `68da5e73002cb68e70af` (app)

---

## ✅ COLLECTIONS ĐÃ CÓ

### 1. **User** (Collection ID: `user`)
**Mục đích:** Quản lý thông tin người dùng

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| name | String | 100 | ✓ | - | NULL | Tên người dùng |
| email | Email | - | ✓ | ✓ | NULL | Email đăng nhập |
| accountId | String | 2200 | ✓ | ✓ | NULL | Link to Auth |
| avatar | URL | - | - | - | NULL | URL avatar |
| phone | String | 15 | - | - | NULL | Số điện thoại |
| address_home | String | 255 | - | - | NULL | Địa chỉ nhà |
| address_home_label | String | 50 | - | - | Home | Label địa chỉ |
| role | Enum | - | ✓ | ✓ | NULL | customer/restaurant/admin |
| createdAt | DateTime | - | - | - | NULL | Ngày tạo |
| updatedAt | DateTime | - | - | - | NULL | Ngày cập nhật |

**Relationships:**
- Has many: orders (as customer)
- Has many: reviews
- Has many: user_vouchers

---

### 2. **categories** (Collection ID: `categories`)
**Mục đích:** Danh mục món ăn

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| name | String | 100 | ✓ | ✓ | NULL | Tên category |
| description | String | 100 | ✓ | - | NULL | Mô tả |
| menu | Relationship | - | - | - | NULL | Many to one → menu |
| $createdAt | DateTime | - | - | - | auto | Auto generated |
| $updatedAt | DateTime | - | - | - | auto | Auto generated |

**Relationships:**
- Belongs to: menu (many to one)

---

### 3. **menu** (Collection ID: `menu`)
**Mục đích:** Món ăn

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| name | String | 200 | ✓ | ✓ | NULL | Tên món |
| description | String | 2200 | ✓ | - | NULL | Mô tả chi tiết |
| image_url | URL | - | ✓ | - | NULL | Ảnh món ăn |
| rating | Float | - | ✓ | - | NULL | Đánh giá TB |
| calories | Integer | - | ✓ | - | NULL | Min:5, Max:10000 |
| protein | Integer | - | ✓ | - | NULL | Min:5, Max:10000 |
| price | Float | - | ✓ | ✓ | NULL | Min:5, Max:10000 |
| categories | Relationship | - | - | - | NULL | Many to one |
| menuCustomizations | Relationship | - | - | - | NULL | Many to one |
| $createdAt | DateTime | - | - | - | auto | Auto generated |
| $updatedAt | DateTime | - | - | - | auto | Auto generated |

**⚠️ THIẾU:** 
- `restaurantId` (relationship to restaurants)
- `isAvailable` (boolean)
- `stock` (integer - số lượng tồn kho)

**Relationships:**
- Belongs to: categories
- Has many: menuCustomizations
- **CẦN THÊM:** Belongs to: restaurants

---

### 4. **customizations** (Collection ID: `customizations`)
**Mục đích:** Các tùy chọn customization

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| name | String | 100 | ✓ | - | NULL | Tên customization |
| price | Float | - | ✓ | - | NULL | Min:5, Max:10000 |
| type | Enum | - | ✓ | - | NULL | Loại custom |
| menuCustomizations | Relationship | - | - | - | NULL | Many to one |
| $createdAt | DateTime | - | - | - | auto | Auto generated |
| $updatedAt | DateTime | - | - | - | auto | Auto generated |

**Relationships:**
- Has many: menu_customizations

---

### 5. **menu_customizations** (Collection ID: `menu_customizations`)
**Mục đích:** Bảng trung gian menu-customizations (Many-to-Many)

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| menu | Relationship | - | - | - | NULL | Many to one |
| customizations | Relationship | - | - | - | NULL | Many to one |
| $createdAt | DateTime | - | - | - | auto | Auto generated |
| $updatedAt | DateTime | - | - | - | auto | Auto generated |

---

### 6. **orders** (Collection ID: `orders`)
**Mục đích:** Đơn hàng

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| user | Relationship | - | - | - | NULL | Many to one → User |
| items | String | 1000 | ✓ | - | NULL | JSON string order items |
| total | Float | - | ✓ | - | NULL | Min:0 |
| status | Enum | - | ✓ | ✓ | NULL | Order status |
| deliveryAddress | String | 500 | ✓ | - | NULL | Địa chỉ giao |
| deliveryAddressLabel | String | 100 | - | - | NULL | Label địa chỉ |
| phone | String | 20 | ✓ | - | NULL | SĐT nhận hàng |
| notes | String | 1000 | - | - | NULL | Ghi chú |
| createdAt | DateTime | - | ✓ | ✓ | NULL | Thời gian tạo |
| updatedAt | DateTime | - | ✓ | - | NULL | Cập nhật cuối |
| recipientName | String | 255 | - | - | NULL | Tên người nhận |
| $createdAt | DateTime | - | - | - | auto | Auto generated |
| $updatedAt | DateTime | - | - | - | auto | Auto generated |

**⚠️ THIẾU:**
- `restaurantId` (relationship to restaurants)
- `paymentStatus` (enum: pending/paid/failed/refunded)
- `paymentMethod` (enum: cod/vnpay)
- `droneId` (relationship to drones)
- `preparingAt` (datetime)
- `readyAt` (datetime)
- `deliveredAt` (datetime)
- `cancelledAt` (datetime)
- `estimatedDeliveryTime` (datetime)

**Relationships:**
- Belongs to: User (as customer)
- **CẦN THÊM:**
  - Belongs to: restaurants
  - Belongs to: drones
  - Has one: payment
  - Has many: reviews

---

## ❌ COLLECTIONS CẦN TẠO MỚI

### 7. **restaurants** ⭐ MỚI
**Mục đích:** Thông tin nhà hàng đối tác

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| ownerId | Relationship | - | ✓ | ✓ | NULL | Many to one → User |
| name | String | 200 | ✓ | ✓ | NULL | Tên nhà hàng |
| description | String | 1000 | - | - | NULL | Mô tả |
| address | String | 500 | ✓ | - | NULL | Địa chỉ |
| latitude | Float | - | ✓ | - | NULL | Tọa độ |
| longitude | Float | - | ✓ | - | NULL | Tọa độ |
| phone | String | 20 | ✓ | - | NULL | Số điện thoại |
| email | Email | - | ✓ | - | NULL | Email liên hệ |
| logo | URL | - | - | - | NULL | Logo nhà hàng |
| coverImage | URL | - | - | - | NULL | Ảnh bìa |
| status | Enum | - | ✓ | ✓ | pending | pending/active/suspended/rejected |
| rating | Float | - | - | - | 0 | Đánh giá TB (0-5) |
| totalOrders | Integer | - | - | - | 0 | Tổng đơn hàng |
| totalRevenue | Float | - | - | - | 0 | Tổng doanh thu |
| operatingHours | String | 2000 | - | - | NULL | JSON operating hours |
| cuisineType | String | 100 | - | ✓ | NULL | Loại ẩm thực |
| businessLicense | String | 100 | - | - | NULL | Giấy phép KD |
| taxCode | String | 50 | - | - | NULL | Mã số thuế |
| bankAccount | String | 100 | - | - | NULL | TK ngân hàng |
| bankName | String | 100 | - | - | NULL | Tên ngân hàng |
| approvedAt | DateTime | - | - | - | NULL | Ngày duyệt |
| approvedBy | String | - | - | - | NULL | Admin duyệt |
| rejectionReason | String | 500 | - | - | NULL | Lý do từ chối |
| isActive | Boolean | - | - | ✓ | false | Đang hoạt động |
| $createdAt | DateTime | - | - | - | auto | Auto created |
| $updatedAt | DateTime | - | - | - | auto | Auto updated |

**Relationships:**
- Belongs to: User (as owner)
- Has many: menu (items)
- Has many: orders
- Has many: reviews

**Indexes cần tạo:**
- status (for filtering)
- ownerId (for query by owner)
- isActive (for active restaurants)
- cuisineType (for search)

---

### 8. **drones** ⭐ MỚI
**Mục đích:** Quản lý đội drone

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| code | String | 50 | ✓ | ✓ | NULL | Mã drone (unique) |
| name | String | 100 | ✓ | - | NULL | Tên drone |
| model | String | 100 | - | - | NULL | Model drone |
| status | Enum | - | ✓ | ✓ | idle | idle/delivering/charging/maintenance/offline |
| batteryLevel | Integer | - | - | - | 100 | % pin (0-100) |
| currentLatitude | Float | - | - | - | NULL | Vị trí hiện tại |
| currentLongitude | Float | - | - | - | NULL | Vị trí hiện tại |
| maxPayload | Float | - | - | - | 5.0 | kg - tải trọng tối đa |
| currentPayload | Float | - | - | - | 0 | kg - tải hiện tại |
| maxSpeed | Float | - | - | - | 50.0 | km/h |
| maxRange | Float | - | - | - | 10.0 | km - tầm bay |
| assignedOrderId | String | - | - | ✓ | NULL | Order đang giao |
| lastMaintenanceAt | DateTime | - | - | - | NULL | Bảo trì lần cuối |
| nextMaintenanceAt | DateTime | - | - | - | NULL | Bảo trì kế tiếp |
| totalFlights | Integer | - | - | - | 0 | Tổng chuyến bay |
| totalDistance | Float | - | - | - | 0 | km - tổng quãng đường |
| isActive | Boolean | - | - | ✓ | true | Đang hoạt động |
| $createdAt | DateTime | - | - | - | auto | Auto created |
| $updatedAt | DateTime | - | - | - | auto | Auto updated |

**Relationships:**
- Has many: drone_events
- Has many: orders (assigned orders)

**Indexes:**
- code (unique)
- status
- assignedOrderId
- isActive

---

### 9. **drone_events** ⭐ MỚI
**Mục đích:** Lịch sử và telemetry drone

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| droneId | Relationship | - | ✓ | ✓ | NULL | Many to one → drones |
| orderId | String | - | - | ✓ | NULL | Order liên quan |
| eventType | Enum | - | ✓ | ✓ | NULL | status_change/location_update/battery_update/error/maintenance |
| latitude | Float | - | - | - | NULL | Vị trí |
| longitude | Float | - | - | - | NULL | Vị trí |
| altitude | Float | - | - | - | NULL | Độ cao (m) |
| speed | Float | - | - | - | NULL | Tốc độ (km/h) |
| batteryLevel | Integer | - | - | - | NULL | % pin |
| payload | String | 2000 | - | - | NULL | JSON data |
| description | String | 500 | - | - | NULL | Mô tả event |
| $createdAt | DateTime | - | - | - | auto | Timestamp |

**Relationships:**
- Belongs to: drones

**Indexes:**
- droneId
- orderId
- eventType
- $createdAt (for time-series queries)

---

### 10. **payments** ⭐ MỚI
**Mục đích:** Quản lý thanh toán

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| orderId | Relationship | - | ✓ | ✓ | NULL | One to one → orders |
| userId | String | - | ✓ | ✓ | NULL | Customer ID |
| provider | Enum | - | ✓ | - | cod | cod/vnpay/momo |
| method | Enum | - | - | - | NULL | atm/credit/qr/wallet |
| amount | Float | - | ✓ | - | NULL | Số tiền |
| currency | String | 10 | - | - | VND | Đơn vị tiền tệ |
| status | Enum | - | ✓ | ✓ | pending | pending/processing/completed/failed/refunded |
| transactionId | String | 200 | - | ✓ | NULL | ID từ payment gateway |
| transactionRef | String | 200 | - | - | NULL | Reference code |
| rawResponse | String | 5000 | - | - | NULL | JSON response từ gateway |
| failureReason | String | 500 | - | - | NULL | Lý do thất bại |
| refundAmount | Float | - | - | - | NULL | Số tiền hoàn |
| refundedAt | DateTime | - | - | - | NULL | Thời gian hoàn |
| refundReason | String | 500 | - | - | NULL | Lý do hoàn |
| $createdAt | DateTime | - | - | - | auto | Thời gian tạo |
| $updatedAt | DateTime | - | - | - | auto | Cập nhật cuối |

**Relationships:**
- Belongs to: orders (one to one)

**Indexes:**
- orderId (unique)
- userId
- status
- transactionId
- $createdAt

---

### 11. **reviews** ⭐ MỚI
**Mục đích:** Đánh giá nhà hàng và món ăn

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| orderId | String | - | ✓ | ✓ | NULL | Order đã hoàn thành |
| userId | Relationship | - | ✓ | ✓ | NULL | Many to one → User |
| restaurantId | Relationship | - | ✓ | ✓ | NULL | Many to one → restaurants |
| menuItemId | String | - | - | ✓ | NULL | Món ăn (optional) |
| overallRating | Integer | - | ✓ | - | NULL | 1-5 sao |
| foodQuality | Integer | - | - | - | NULL | 1-5 sao |
| deliverySpeed | Integer | - | - | - | NULL | 1-5 sao |
| serviceRating | Integer | - | - | - | NULL | 1-5 sao |
| comment | String | 1000 | - | - | NULL | Nhận xét |
| images | String | 2000 | - | - | NULL | JSON array URLs |
| isVerified | Boolean | - | - | - | true | Review từ đơn thật |
| response | String | 1000 | - | - | NULL | Phản hồi từ restaurant |
| respondedAt | DateTime | - | - | - | NULL | Thời gian phản hồi |
| isVisible | Boolean | - | - | ✓ | true | Hiển thị công khai |
| $createdAt | DateTime | - | - | - | auto | Thời gian tạo |
| $updatedAt | DateTime | - | - | - | auto | Cập nhật cuối |

**Relationships:**
- Belongs to: User
- Belongs to: restaurants

**Indexes:**
- userId
- restaurantId
- orderId (unique)
- isVisible
- $createdAt

---

### 12. **promotions** ⭐ MỚI
**Mục đích:** Chương trình khuyến mãi

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| code | String | 50 | ✓ | ✓ | NULL | Mã khuyến mãi (unique) |
| title | String | 200 | ✓ | - | NULL | Tiêu đề |
| description | String | 1000 | - | - | NULL | Mô tả |
| type | Enum | - | ✓ | ✓ | NULL | percentage/fixed/free_shipping |
| discountValue | Float | - | ✓ | - | NULL | Giá trị giảm |
| maxDiscount | Float | - | - | - | NULL | Giảm tối đa (VND) |
| minOrderValue | Float | - | - | - | 0 | Giá trị đơn tối thiểu |
| maxUsage | Integer | - | - | - | NULL | Số lần dùng tối đa |
| usedCount | Integer | - | - | - | 0 | Đã dùng bao nhiêu lần |
| maxUsagePerUser | Integer | - | - | - | 1 | Giới hạn/user |
| applicableFor | Enum | - | ✓ | - | all | all/new_users/restaurants/menu_items |
| applicableIds | String | 1000 | - | - | NULL | JSON array IDs |
| startDate | DateTime | - | ✓ | ✓ | NULL | Ngày bắt đầu |
| endDate | DateTime | - | ✓ | ✓ | NULL | Ngày kết thúc |
| isActive | Boolean | - | - | ✓ | true | Đang hoạt động |
| createdBy | String | - | - | - | NULL | Admin tạo |
| $createdAt | DateTime | - | - | - | auto | Auto created |
| $updatedAt | DateTime | - | - | - | auto | Auto updated |

**Indexes:**
- code (unique)
- type
- isActive
- startDate, endDate

---

### 13. **user_vouchers** ⭐ MỚI
**Mục đích:** Voucher của user (tracking usage)

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| userId | Relationship | - | ✓ | ✓ | NULL | Many to one → User |
| promotionId | Relationship | - | ✓ | ✓ | NULL | Many to one → promotions |
| orderId | String | - | - | - | NULL | Order đã dùng |
| status | Enum | - | ✓ | ✓ | available | available/used/expired |
| usedAt | DateTime | - | - | - | NULL | Thời gian dùng |
| $createdAt | DateTime | - | - | - | auto | Auto created |

**Relationships:**
- Belongs to: User
- Belongs to: promotions

**Indexes:**
- userId
- promotionId
- status

---

### 14. **notifications** ⭐ MỚI
**Mục đích:** Thông báo người dùng

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| userId | String | - | ✓ | ✓ | NULL | Người nhận |
| type | Enum | - | ✓ | ✓ | NULL | order/payment/promotion/system/drone |
| title | String | 200 | ✓ | - | NULL | Tiêu đề |
| body | String | 1000 | ✓ | - | NULL | Nội dung |
| data | String | 2000 | - | - | NULL | JSON metadata |
| imageUrl | URL | - | - | - | NULL | Ảnh đính kèm |
| actionUrl | String | 500 | - | - | NULL | Deep link |
| channel | Enum | - | ✓ | - | push | push/email/sms/in_app |
| status | Enum | - | ✓ | ✓ | pending | pending/sent/failed/read |
| sentAt | DateTime | - | - | - | NULL | Thời gian gửi |
| readAt | DateTime | - | - | - | NULL | Thời gian đọc |
| fcmToken | String | 500 | - | - | NULL | Firebase token |
| errorMessage | String | 500 | - | - | NULL | Lỗi nếu có |
| $createdAt | DateTime | - | - | - | auto | Auto created |

**Indexes:**
- userId
- type
- status
- $createdAt

---

### 15. **audit_logs** ⭐ MỚI
**Mục đích:** Nhật ký hệ thống

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| actorId | String | - | ✓ | ✓ | NULL | User thực hiện |
| actorRole | String | 50 | - | - | NULL | Role của actor |
| action | Enum | - | ✓ | ✓ | NULL | create/update/delete/approve/reject |
| entity | String | 100 | ✓ | ✓ | NULL | Table name |
| entityId | String | - | ✓ | - | NULL | Record ID |
| before | String | 5000 | - | - | NULL | JSON data trước |
| after | String | 5000 | - | - | NULL | JSON data sau |
| changes | String | 2000 | - | - | NULL | JSON diff |
| ipAddress | String | 50 | - | - | NULL | IP address |
| userAgent | String | 500 | - | - | NULL | Browser info |
| $createdAt | DateTime | - | - | - | auto | Timestamp |

**Indexes:**
- actorId
- action
- entity
- $createdAt

---

### 16. **order_items** ⭐ MỚI (Cải thiện từ JSON string)
**Mục đích:** Chi tiết món trong đơn hàng (normalize data)

| Field | Type | Size | Required | Indexed | Default | Note |
|-------|------|------|----------|---------|---------|------|
| $id | ID | - | ✓ | ✓ | auto | Primary Key |
| orderId | Relationship | - | ✓ | ✓ | NULL | Many to one → orders |
| menuItemId | String | - | ✓ | ✓ | NULL | Món ăn |
| name | String | 200 | ✓ | - | NULL | Tên món (snapshot) |
| price | Float | - | ✓ | - | NULL | Giá (snapshot) |
| quantity | Integer | - | ✓ | - | 1 | Số lượng |
| customizations | String | 1000 | - | - | NULL | JSON customizations |
| imageUrl | URL | - | - | - | NULL | Ảnh món |
| subtotal | Float | - | ✓ | - | NULL | Thành tiền |
| notes | String | 500 | - | - | NULL | Ghi chú món |
| $createdAt | DateTime | - | - | - | auto | Auto created |

**Relationships:**
- Belongs to: orders

**Indexes:**
- orderId
- menuItemId

---

## 📋 SUMMARY

### Tổng số Collections: 16

**Đã có (6):**
1. ✅ User
2. ✅ categories
3. ✅ menu
4. ✅ customizations
5. ✅ menu_customizations
6. ✅ orders

**Cần tạo mới (10):**
7. ❌ restaurants
8. ❌ drones
9. ❌ drone_events
10. ❌ payments
11. ❌ reviews
12. ❌ promotions
13. ❌ user_vouchers
14. ❌ notifications
15. ❌ audit_logs
16. ❌ order_items

**Cần cập nhật:**
- ⚠️ **menu**: thêm `restaurantId`, `isAvailable`, `stock`
- ⚠️ **orders**: thêm nhiều fields cho payment, drone, timeline
- ⚠️ **User**: có thể thêm `status`, `lastLoginAt`

---

## 🔗 Relationships Overview

```
User (1) ─────→ (N) restaurants (as owner)
User (1) ─────→ (N) orders (as customer)
User (1) ─────→ (N) reviews
User (1) ─────→ (N) user_vouchers

restaurants (1) ──→ (N) menu
restaurants (1) ──→ (N) orders
restaurants (1) ──→ (N) reviews

orders (1) ─────→ (1) payments
orders (1) ─────→ (N) order_items
orders (N) ─────→ (1) drones

drones (1) ─────→ (N) drone_events

promotions (1) ─→ (N) user_vouchers

menu (N) ───────→ (N) customizations (via menu_customizations)
menu (N) ───────→ (1) categories
```

---

## 🎯 Ưu tiên triển khai

### Phase 1 - Critical (Tuần 1-2):
1. **restaurants** - Cần ngay cho Restaurant Portal
2. **order_items** - Normalize order data
3. Cập nhật **menu** với restaurantId
4. Cập nhật **orders** với restaurantId, payment fields

### Phase 2 - Important (Tuần 3-4):
5. **payments** - Tích hợp VNPay
6. **reviews** - Review system
7. **notifications** - Push notifications

### Phase 3 - Drone System (Tuần 5-6):
8. **drones**
9. **drone_events**

### Phase 4 - Marketing (Tuần 7-8):
10. **promotions**
11. **user_vouchers**

### Phase 5 - Operations (Tuần 9):
12. **audit_logs**

---

**Tài liệu này sẽ được sử dụng để:**
1. Tạo collections trong Appwrite Console
2. Setup relationships và indexes
3. Generate TypeScript types
4. Tham khảo khi code APIs
