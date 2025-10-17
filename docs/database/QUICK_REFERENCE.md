# Quick Reference - FoodFast Database Collections

## 📊 Tổng Quan Nhanh

| # | Collection | Status | Priority | Purpose |
|---|------------|--------|----------|---------|
| 1 | User | ✅ Có | - | Quản lý người dùng |
| 2 | categories | ✅ Có | - | Danh mục món ăn |
| 3 | menu | ⚠️ Cần update | 🔴 | Món ăn (cần thêm restaurantId) |
| 4 | customizations | ✅ Có | - | Tùy chọn món ăn |
| 5 | menu_customizations | ✅ Có | - | Junction table |
| 6 | orders | ⚠️ Cần update | 🔴 | Đơn hàng (cần thêm payment, drone fields) |
| 7 | **restaurants** | ❌ **Cần tạo** | 🔴 **Critical** | **Nhà hàng đối tác** |
| 8 | **order_items** | ❌ **Cần tạo** | 🔴 **Critical** | **Chi tiết đơn hàng** |
| 9 | **payments** | ❌ **Cần tạo** | 🔴 **Critical** | **Thanh toán** |
| 10 | **reviews** | ❌ Cần tạo | 🟠 High | Đánh giá nhà hàng |
| 11 | **notifications** | ❌ Cần tạo | 🟠 High | Thông báo |
| 12 | **drones** | ❌ Cần tạo | 🟡 Medium | Quản lý drone |
| 13 | **drone_events** | ❌ Cần tạo | 🟡 Medium | Telemetry drone |
| 14 | **promotions** | ❌ Cần tạo | 🟢 Low | Khuyến mãi |
| 15 | **user_vouchers** | ❌ Cần tạo | 🟢 Low | Voucher người dùng |
| 16 | **audit_logs** | ❌ Cần tạo | 🟢 Low | Nhật ký hệ thống |

---

## 🔴 PHASE 1 - CRITICAL (Làm ngay)

### 1. Collection: `restaurants`
**Mục đích:** Lưu thông tin nhà hàng đối tác

**Key Attributes:**
- `ownerId` → User (FK)
- `name`, `address`, `phone`, `email`
- `latitude`, `longitude` (tọa độ)
- `status` (pending/active/suspended/rejected)
- `rating`, `totalOrders`, `totalRevenue`
- `operatingHours` (JSON)
- `businessLicense`, `taxCode`, `bankAccount`

**Indexes:**
- `status`, `ownerId`, `isActive`, `cuisineType`, `name`

**Permissions:**
- Read: any (public)
- Create: users (đăng ký nhà hàng)
- Update: owner, admin
- Delete: admin only

---

### 2. Collection: `order_items`
**Mục đích:** Normalize order items (thay vì JSON string)

**Key Attributes:**
- `orderId` → orders (FK)
- `menuItemId` (reference to menu)
- `name`, `price`, `quantity`, `subtotal`
- `customizations` (JSON)
- `imageUrl`, `notes`

**Indexes:**
- `orderId`, `menuItemId`

**Relationship:**
- orders (1) → order_items (N)

---

### 3. Collection: `payments`
**Mục đích:** Quản lý thanh toán VNPay

**Key Attributes:**
- `orderId` → orders (FK, 1:1)
- `userId`
- `provider` (cod/vnpay/momo)
- `method` (atm/credit/qr)
- `status` (pending/completed/failed/refunded)
- `amount`, `currency`
- `transactionId`, `transactionRef`
- `rawResponse` (JSON từ gateway)
- `refundAmount`, `refundReason`

**Indexes:**
- `orderId` (unique), `userId`, `status`, `transactionId`

---

### ⚠️ Update: `menu`
**Thêm:**
- `restaurantId` → restaurants (FK) **CRITICAL**
- `isAvailable` (Boolean)
- `stock` (Integer)

---

### ⚠️ Update: `orders`
**Thêm:**
- `restaurantId` → restaurants (FK) **CRITICAL**
- `paymentStatus` (pending/paid/failed/refunded)
- `paymentMethod` (cod/vnpay/momo)
- `droneId` (String)
- `preparingAt`, `readyAt`, `deliveredAt`, `cancelledAt` (DateTime)
- `estimatedDeliveryTime` (DateTime)

---

## 🟠 PHASE 2 - HIGH PRIORITY

### 4. Collection: `reviews`
**Attributes:**
- `orderId`, `userId`, `restaurantId`, `menuItemId`
- `overallRating` (1-5)
- `foodQuality`, `deliverySpeed`, `serviceRating` (1-5)
- `comment`, `images` (JSON array)
- `response` (from restaurant)
- `isVerified`, `isVisible`

---

### 5. Collection: `notifications`
**Attributes:**
- `userId`, `type`, `title`, `body`
- `channel` (push/email/sms/in_app)
- `status` (pending/sent/failed/read)
- `data` (JSON), `actionUrl`, `imageUrl`
- `fcmToken`, `sentAt`, `readAt`

---

## 🟡 PHASE 3 - DRONE SYSTEM

### 6. Collection: `drones`
**Attributes:**
- `code` (unique), `name`, `model`
- `status` (idle/delivering/charging/maintenance/offline)
- `batteryLevel` (0-100)
- `currentLatitude`, `currentLongitude`
- `maxPayload`, `currentPayload`
- `maxSpeed`, `maxRange`
- `assignedOrderId`
- `totalFlights`, `totalDistance`

---

### 7. Collection: `drone_events`
**Attributes:**
- `droneId` → drones (FK)
- `orderId`, `eventType`
- `latitude`, `longitude`, `altitude`, `speed`
- `batteryLevel`, `payload` (JSON)

---

## 🟢 PHASE 4 - MARKETING & AUDIT

### 8-10. Collections: `promotions`, `user_vouchers`, `audit_logs`

---

## 🔗 Quan Hệ Chính (Relationships)

```
User (1) ──→ (N) restaurants [owner]
User (1) ──→ (N) orders [customer]
User (1) ──→ (N) reviews
User (1) ──→ (N) user_vouchers

restaurants (1) ──→ (N) menu
restaurants (1) ──→ (N) orders
restaurants (1) ──→ (N) reviews

menu (N) ──→ (1) restaurants
menu (N) ←──→ (N) customizations [via menu_customizations]

orders (1) ──→ (N) order_items
orders (1) ──→ (1) payments
orders (N) ──→ (1) drones

drones (1) ──→ (N) drone_events

promotions (1) ──→ (N) user_vouchers
```

---

## 📝 Appwrite Collection IDs (Cập nhật sau khi tạo)

```javascript
export const appwriteConfig = {
  // ... existing config
  
  // ✅ Existing Collections
  userCollectionId: "user",
  categoriesCollectionId: "categories",
  menuCollectionId: "menu",
  customizationsCollectionId: "customizations",
  menuCustomizationsCollectionId: "menu_customizations",
  ordersCollectionId: "orders",
  
  // ❌ New Collections - UPDATE THESE AFTER CREATION
  restaurantsCollectionId: "restaurants", // TODO
  orderItemsCollectionId: "order_items", // TODO
  paymentsCollectionId: "payments", // TODO
  reviewsCollectionId: "reviews", // TODO
  notificationsCollectionId: "notifications", // TODO
  dronesCollectionId: "drones", // TODO
  droneEventsCollectionId: "drone_events", // TODO
  promotionsCollectionId: "promotions", // TODO
  userVouchersCollectionId: "user_vouchers", // TODO
  auditLogsCollectionId: "audit_logs", // TODO
};
```

---

## ⏱️ Timeline Ước Tính

| Phase | Collections | Thời gian | Công việc |
|-------|------------|-----------|-----------|
| **Phase 1** | restaurants, order_items, payments + updates | **4-6 giờ** | Setup critical collections |
| **Phase 2** | reviews, notifications | **2-3 giờ** | Reviews & notifications |
| **Phase 3** | drones, drone_events | **2-3 giờ** | Drone system |
| **Phase 4** | promotions, user_vouchers, audit_logs | **2 giờ** | Marketing & audit |
| **Testing** | All collections | **2 giờ** | Integration testing |
| **TOTAL** | 16 collections | **12-16 giờ** | Complete setup |

---

## ✅ Checklist Nhanh

### Trước khi bắt đầu:
- [ ] Backup database hiện tại
- [ ] Có quyền admin Appwrite
- [ ] Đọc qua DATABASE_SCHEMA.md
- [ ] Mở APPWRITE_SETUP_GUIDE.md

### Phase 1 (Critical - Làm ngay):
- [ ] Tạo `restaurants` collection (22 attributes)
- [ ] Tạo `order_items` collection
- [ ] Tạo `payments` collection
- [ ] Update `menu`: thêm restaurantId, isAvailable, stock
- [ ] Update `orders`: thêm payment & drone fields
- [ ] Test relationships
- [ ] Test permissions

### Phase 2:
- [ ] Tạo `reviews` collection
- [ ] Tạo `notifications` collection

### Phase 3:
- [ ] Tạo `drones` collection
- [ ] Tạo `drone_events` collection

### Phase 4:
- [ ] Tạo `promotions` collection
- [ ] Tạo `user_vouchers` collection
- [ ] Tạo `audit_logs` collection

### Sau khi hoàn thành:
- [ ] Update appwriteConfig trong code
- [ ] Generate TypeScript types
- [ ] Create API functions
- [ ] Integration testing
- [ ] Update documentation

---

## 📚 Tài Liệu Liên Quan

1. **DATABASE_SCHEMA.md** - Chi tiết đầy đủ về tất cả collections
2. **APPWRITE_SETUP_GUIDE.md** - Hướng dẫn step-by-step setup Appwrite
3. **foodfast-database-erd.drawio** - ERD diagram (mở bằng draw.io)
4. **PROJECT_REQUIREMENTS_vi.md** - Yêu cầu dự án gốc

---

## 🚀 Next Steps

Sau khi setup database xong:

1. **Code Integration**
   - Update appwrite config files
   - Generate TypeScript types
   - Create CRUD functions

2. **Restaurant Portal Development**
   - Build registration form
   - Menu management UI
   - Order dashboard

3. **Payment Integration**
   - VNPay SDK setup
   - Webhook handlers
   - Transaction logging

4. **Testing**
   - Unit tests cho API functions
   - Integration tests
   - E2E testing

---

**Version:** 1.0  
**Last Updated:** October 17, 2025  
**Status:** Ready for Implementation 🚀
