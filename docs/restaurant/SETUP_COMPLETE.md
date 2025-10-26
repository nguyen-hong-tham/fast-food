# Hướng Dẫn Setup Database - FoodFast

## ✅ Đã Hoàn Thành

Bạn đã hoàn thành việc setup cơ sở dữ liệu trên Appwrite Console. Các file sau đã được cập nhật tự động:

### 1. Config Files
- ✅ `mobile/lib/appwrite.ts` - Đã thêm 10 collection IDs mới
- ✅ `admin/src/lib/appwrite.ts` - Đã thêm 10 collection IDs mới

### 2. Type Definitions
- ✅ `mobile/type.d.ts` - Đã thêm 10+ TypeScript interfaces mới

### 3. API Helper Functions
- ✅ `mobile/lib/api-helpers.ts` - Đã tạo helper functions cho tất cả collections

### 4. Seed Data Script
- ✅ `mobile/lib/seed-enhanced.ts` - Script để tạo dữ liệu test

---

## 🚀 Các Bước Tiếp Theo

### Bước 1: Cập Nhật Collection IDs

Các file config đang sử dụng placeholder IDs. Bạn cần thay thế bằng Collection IDs thực tế từ Appwrite Console:

```typescript
// mobile/lib/appwrite.ts và admin/src/lib/appwrite.ts
export const appwriteConfig = {
    // ... existing fields ...
    
    // TODO: Thay thế các IDs sau bằng Collection IDs thực từ Appwrite Console:
    restaurantsCollectionId: "YOUR_RESTAURANTS_COLLECTION_ID",
    orderItemsCollectionId: "YOUR_ORDER_ITEMS_COLLECTION_ID",
    paymentsCollectionId: "YOUR_PAYMENTS_COLLECTION_ID",
    reviewsCollectionId: "YOUR_REVIEWS_COLLECTION_ID",
    notificationsCollectionId: "YOUR_NOTIFICATIONS_COLLECTION_ID",
    dronesCollectionId: "YOUR_DRONES_COLLECTION_ID",
    droneEventsCollectionId: "YOUR_DRONE_EVENTS_COLLECTION_ID",
    promotionsCollectionId: "YOUR_PROMOTIONS_COLLECTION_ID",
    userVouchersCollectionId: "YOUR_USER_VOUCHERS_COLLECTION_ID",
    auditLogsCollectionId: "YOUR_AUDIT_LOGS_COLLECTION_ID",
};
```

**Làm thế nào lấy Collection IDs?**
1. Mở Appwrite Console
2. Vào Database `68da5e73002cb68e70af`
3. Click vào từng collection
4. Copy Collection ID từ URL hoặc Settings tab

### Bước 2: Tạo Tài Khoản Test Users

Script seed data cần user IDs thực. Có 2 cách:

**Cách 1: Tạo qua Mobile App**
```bash
cd mobile
npm start
```
- Chạy app và đăng ký 2 tài khoản:
  - User 1: Customer (role: 'customer')
  - User 2: Restaurant Owner (role: 'restaurant')
- Lấy User IDs từ Appwrite Console → Auth → Users

**Cách 2: Tạo qua Admin Script**
```bash
cd admin
node scripts/create-admin.js
```

Sau đó mở `mobile/lib/seed-enhanced.ts` và thay thế:
```typescript
const TEST_USER_ID = 'YOUR_CUSTOMER_USER_ID'; // Thay bằng ID thực
const TEST_OWNER_ID = 'YOUR_OWNER_USER_ID';   // Thay bằng ID thực
```

### Bước 3: Chạy Seed Script

Sau khi cập nhật Collection IDs và User IDs:

```powershell
cd mobile
npx ts-node lib/seed-enhanced.ts
```

Script sẽ tạo:
- ✅ 1 nhà hàng test (The Burger House)
- ✅ 4 categories (Burgers, Sides, Drinks, Desserts)
- ✅ 7 menu items với giá VND
- ✅ 2 drones (DRONE-001, DRONE-002)
- ✅ 1 order mẫu (2 burgers + fries)
- ✅ 2 order items
- ✅ 1 payment record

### Bước 4: Kiểm Tra Database

Mở Appwrite Console và xác nhận dữ liệu đã được tạo:

```
Database: foodfast-db (68da5e73002cb68e70af)
├── restaurants (1 document)
├── categories (4 documents)
├── menu (7 documents)
├── drones (2 documents)
├── orders (1 document)
├── order_items (2 documents)
└── payments (1 document)
```

### Bước 5: Test Mobile App

```powershell
cd mobile
npm start
```

**Kiểm tra các tính năng:**
- [ ] Login với tài khoản test
- [ ] Xem danh sách restaurants
- [ ] Browse menu items theo category
- [ ] Add items vào cart
- [ ] Checkout và tạo order
- [ ] Xem order history
- [ ] Apply promo code (nếu có)

---

## 📚 API Helper Functions

File `mobile/lib/api-helpers.ts` cung cấp các functions ready-to-use:

### Restaurants
```typescript
import { getRestaurants, getRestaurantById } from '@/lib/api-helpers';

// Get all restaurants
const restaurants = await getRestaurants({
    status: 'active',
    cuisine: 'Vietnamese',
});

// Get restaurant by ID
const restaurant = await getRestaurantById('restaurant-id');

// Get restaurant menu
const menuItems = await getRestaurantMenuItems('restaurant-id');
```

### Orders
```typescript
import { createOrderWithDetails } from '@/lib/api-helpers';

const { order, payment, orderItems } = await createOrderWithDetails({
    userId: 'user-id',
    restaurantId: 'restaurant-id',
    items: [
        {
            menuItemId: 'item-id',
            name: 'Classic Burger',
            price: 85000,
            quantity: 2,
        }
    ],
    total: 170000,
    deliveryAddress: '123 Main St, District 1',
    phone: '+84901234567',
    paymentMethod: 'cod',
    promoCode: 'WELCOME10', // Optional
});
```

### Payments
```typescript
import { updatePaymentStatus } from '@/lib/api-helpers';

// Update payment after COD delivery
await updatePaymentStatus('payment-id', 'completed');

// Mark payment as failed
await updatePaymentStatus('payment-id', 'failed', 'transaction-xxx');
```

### Reviews
```typescript
import { createReview } from '@/lib/api-helpers';

await createReview({
    userId: 'user-id',
    restaurantId: 'restaurant-id',
    orderId: 'order-id',
    overallRating: 5,
    foodQuality: 5,
    deliverySpeed: 4,
    service: 5,
    comment: 'Amazing food and fast delivery!',
});
```

### Notifications
```typescript
import { createNotification, getUserNotifications } from '@/lib/api-helpers';

// Send notification
await createNotification({
    userId: 'user-id',
    type: 'order_update',
    title: 'Order Delivered',
    body: 'Your order has been delivered successfully!',
    data: { orderId: 'order-id' },
    channel: 'push',
});

// Get user notifications
const notifications = await getUserNotifications('user-id');
```

### Drones
```typescript
import { getAvailableDrone, assignDroneToOrder, updateDroneLocation } from '@/lib/api-helpers';

// Get available drone
const drone = await getAvailableDrone();

if (drone) {
    // Assign to order
    await assignDroneToOrder(drone.$id, 'order-id');
    
    // Update location during delivery
    await updateDroneLocation(
        drone.$id,
        10.7769,  // latitude
        106.7009, // longitude
        50,       // altitude (meters)
        15,       // speed (m/s)
        85        // battery %
    );
}
```

### Promotions
```typescript
import { validatePromoCode, applyPromoCode } from '@/lib/api-helpers';

// Validate promo code before checkout
const validation = await validatePromoCode('WELCOME10', 'user-id', 170000);

if (validation.valid) {
    console.log(`Discount: ${validation.discount} VND`);
    
    // Apply after order created
    await applyPromoCode(validation.promotion.$id, 'user-id', 'order-id');
}
```

---

## 🔍 Troubleshooting

### Lỗi: "Collection not found"
**Nguyên nhân:** Collection IDs chưa được cập nhật trong config files.
**Giải pháp:** Xem lại Bước 1.

### Lỗi: "User not found"
**Nguyên nhân:** User IDs trong seed script là placeholder.
**Giải pháp:** Xem lại Bước 2.

### Lỗi: "Unauthorized"
**Nguyên nhân:** Permissions chưa được set đúng trong Appwrite Console.
**Giải pháp:** Xem `docs/database/APPWRITE_SETUP_GUIDE.md` Phase 4.

### Lỗi TypeScript: "Type ... is not assignable"
**Nguyên nhân:** Types chưa được import đúng.
**Giải pháp:** 
```typescript
import type { Restaurant, Order, Payment } from '@/type';
```

---

## 📖 Tài Liệu Tham Khảo

- [Database Schema](../docs/database/DATABASE_SCHEMA.md) - Chi tiết 16 collections
- [Appwrite Setup Guide](../docs/database/APPWRITE_SETUP_GUIDE.md) - Hướng dẫn setup từ đầu
- [Quick Reference](../docs/database/QUICK_REFERENCE.md) - Tham khảo nhanh
- [Development Roadmap](../docs/DEVELOPMENT_ROADMAP.md) - Kế hoạch 6 tuần
- [GitHub Issues](../docs/GITHUB_ISSUES.md) - 40 issues chi tiết

---

## ✨ Tính Năng Mới Được Kích Hoạt

Sau khi setup xong, các tính năng này sẽ hoạt động:

### ✅ Đã Sẵn Sàng
- [x] Multiple restaurants support
- [x] Order items tracking (chi tiết từng món)
- [x] Payment gateway integration (COD + VNPay)
- [x] Review system với rating
- [x] Push notifications
- [x] Promotion codes & vouchers
- [x] Drone fleet management
- [x] Real-time drone tracking

### 🔄 Cần Phát Triển UI (Phase 1-3)
- [ ] Restaurant portal (owners)
- [ ] Drone control dashboard
- [ ] Payment processing UI
- [ ] Review submission form
- [ ] Notification center
- [ ] Promo code redemption UI

---

## 🎯 Next Steps

1. **Hoàn thành setup** (hôm nay):
   - Update Collection IDs
   - Create test users
   - Run seed script
   - Test mobile app

2. **Bắt đầu Phase 1** (tuần tới):
   - Create Restaurant Portal
   - Setup Next.js project
   - Implement restaurant dashboard
   - (Xem Issue #7-14 trong `docs/GITHUB_ISSUES.md`)

3. **GitHub Issues** (optional):
   - Copy 40 issues từ `docs/GITHUB_ISSUES_QUICK_COPY.md`
   - Tạo milestones cho 4 phases
   - Setup labels (backend, frontend, database, etc.)

---

## 💡 Tips

- **Development**: Dùng seed script để reset database khi cần
- **Testing**: Tạo nhiều test users với roles khác nhau
- **Performance**: Index các fields thường query (restaurantId, userId, status)
- **Security**: Double-check permissions trước khi deploy production

---

**Cần hỗ trợ?** Xem các file trong thư mục `docs/` hoặc hỏi lại tôi!
