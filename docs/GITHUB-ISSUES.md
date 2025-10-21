# GitHub Issues Template - FoodFast Project

> Copy các issue dưới đây vào GitHub repository để track progress

---

## 🔴 PHASE 0: DATABASE FOUNDATION (Priority: P0-Critical)

### Issue #1: [DB] Create Critical Collections (restaurants, order_items, payments)

**Labels**: `db`, `p0-critical`, `phase-0`

**Description**:
Tạo 3 collections quan trọng nhất để hệ thống có thể hoạt động cơ bản:
1. `restaurants` - Quản lý nhà hàng đối tác
2. `order_items` - Chi tiết món ăn trong đơn hàng
3. `payments` - Quản lý thanh toán

**Acceptance Criteria**:
- [ ] Collection `restaurants` created với 15 attributes theo schema
- [ ] Collection `order_items` created với 7 attributes
- [ ] Collection `payments` created với 9 attributes
- [ ] Indexes created: `ownerId`, `status`, `name` (restaurants), `orderId` (order_items, payments)
- [ ] Permissions configured (Read: Any, Create: Users, Update/Delete: Owner/Admin)
- [ ] Tested: Can create/read/update documents in all 3 collections

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` (Sections 2.1, 2.3, 2.4)
- Setup Guide: `docs/database/APPWRITE_SETUP_GUIDE.md` (Phase 1)

**Estimated Time**: 4-6 hours

**Depends On**: None (Start immediately)

**Blocks**: All other development work

---

### Issue #2: [DB] Update Existing Collections (menu, orders)

**Labels**: `db`, `p0-critical`, `phase-0`

**Description**:
Cập nhật 2 collections hiện tại để tương thích với restaurants và payments:
1. `menu` - Thêm restaurantId, isAvailable, stock
2. `orders` - Thêm restaurantId, paymentStatus, paymentMethod, droneId

**Acceptance Criteria**:
- [ ] Collection `menu`: Added 3 new attributes (restaurantId, isAvailable, stock)
- [ ] Collection `orders`: Added 4 new attributes (restaurantId, paymentStatus, paymentMethod, droneId)
- [ ] Indexes updated: `restaurantId` for both collections
- [ ] Existing data migrated (if any test data exists)
- [ ] Test queries work with new attributes

**Migration Script**:
```typescript
// Update existing menu items
const menuItems = await databases.listDocuments(databaseId, 'menu');
for (const item of menuItems.documents) {
  await databases.updateDocument(databaseId, 'menu', item.$id, {
    restaurantId: 'default-restaurant-id', // Set default
    isAvailable: true,
    stock: 999
  });
}
```

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` (Sections 1.3, 1.6)
- Setup Guide: `docs/database/APPWRITE_SETUP_GUIDE.md` (Phase 1)

**Estimated Time**: 2-3 hours

**Depends On**: Issue #1 (restaurants must exist first)

**Blocks**: Mobile payment flow, Restaurant portal

---

### Issue #3: [DB] Create High Priority Collections (reviews, notifications)

**Labels**: `db`, `p1-high`, `phase-0`

**Description**:
Tạo 2 collections cần thiết cho user experience:
1. `reviews` - Đánh giá nhà hàng/món ăn
2. `notifications` - Thông báo cho users

**Acceptance Criteria**:
- [ ] Collection `reviews` created với 10 attributes
- [ ] Collection `notifications` created với 9 attributes
- [ ] Indexes: `userId`, `restaurantId`, `orderId` (reviews), `userId`, `status`, `type` (notifications)
- [ ] Permissions: Reviews (Any Read, User Create), Notifications (Owner Read only)
- [ ] Test: Create review after completing order
- [ ] Test: Send notification và mark as read

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` (Sections 2.6, 2.9)
- Setup Guide: `docs/database/APPWRITE_SETUP_GUIDE.md` (Phase 2)

**Estimated Time**: 3-4 hours

**Depends On**: Issue #1, #2

**Blocks**: Review system, Push notifications

---

### Issue #4: [DB] Create Medium Priority Collections (drones, drone_events)

**Labels**: `db`, `p2-medium`, `phase-0`

**Description**:
Tạo collections cho hệ thống drone delivery:
1. `drones` - Quản lý đội drone
2. `drone_events` - Log sự kiện và telemetry drone

**Acceptance Criteria**:
- [ ] Collection `drones` created với 13 attributes
- [ ] Collection `drone_events` created với 10 attributes
- [ ] Indexes: `code`, `status` (drones), `droneId`, `orderId`, `eventType` (drone_events)
- [ ] Permissions: Admin-only access for both collections
- [ ] Test: Create drone, assign to order, log events
- [ ] Test: Query drone telemetry by orderId

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` (Sections 2.5, 2.10)
- Setup Guide: `docs/database/APPWRITE_SETUP_GUIDE.md` (Phase 3)

**Estimated Time**: 3-4 hours

**Depends On**: Issue #2 (orders need droneId field)

**Blocks**: Drone management, Real-time tracking

---

### Issue #5: [DB] Create Low Priority Collections (promotions, user_vouchers, audit_logs)

**Labels**: `db`, `p3-low`, `phase-0`

**Description**:
Tạo collections cho tính năng nâng cao:
1. `promotions` - Mã khuyến mãi/voucher
2. `user_vouchers` - Voucher của user
3. `audit_logs` - Log hành động quan trọng

**Acceptance Criteria**:
- [ ] Collection `promotions` created với 13 attributes
- [ ] Collection `user_vouchers` created với 6 attributes
- [ ] Collection `audit_logs` created với 9 attributes
- [ ] Indexes created cho tất cả collections
- [ ] Permissions: Promotions (Any Read, Admin Create), Vouchers (User Read Own), Audit (Admin only)
- [ ] Test: Create promotion, assign voucher, apply to order
- [ ] Test: Audit logs capture admin actions

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` (Sections 2.7, 2.8, 2.11)
- Setup Guide: `docs/database/APPWRITE_SETUP_GUIDE.md` (Phase 4)

**Estimated Time**: 2-3 hours

**Depends On**: Issue #1-4 completed

**Blocks**: Promotion system, Admin audit trail

---

### Issue #6: [DB] Update Appwrite Config in All Apps

**Labels**: `db`, `p0-critical`, `phase-0`, `mobile`, `admin`

**Description**:
Cập nhật file config trong Mobile App và Admin Dashboard với collection IDs mới

**Files to Update**:
1. `mobile/lib/appwrite.ts`
2. `admin/src/lib/appwrite.ts`

**Acceptance Criteria**:
- [ ] Mobile config updated với 10 collection IDs mới
- [ ] Admin config updated với 10 collection IDs mới
- [ ] TypeScript types updated in `mobile/type.d.ts`
- [ ] Environment variables documented in `.env.example`
- [ ] Test: Import và sử dụng config thành công
- [ ] No TypeScript errors

**Code Template**:
```typescript
// mobile/lib/appwrite.ts
export const appwriteConfig = {
  // ... existing fields
  restaurantsCollectionId: "restaurants",
  orderItemsCollectionId: "order_items",
  paymentsCollectionId: "payments",
  reviewsCollectionId: "reviews",
  notificationsCollectionId: "notifications",
  dronesCollectionId: "drones",
  droneEventsCollectionId: "drone_events",
  promotionsCollectionId: "promotions",
  userVouchersCollectionId: "user_vouchers",
  auditLogsCollectionId: "audit_logs",
};
```

**Documentation Reference**:
- Current config: `mobile/lib/appwrite.ts` line 6-22
- Schema: All collections in `docs/database/DATABASE_SCHEMA.md`

**Estimated Time**: 1-2 hours

**Depends On**: Issue #1-5 (All collections created)

**Blocks**: All feature development

---

## 🏗️ PHASE 1: RESTAURANT PORTAL MVP

### Issue #7: [Portal] Setup Next.js Restaurant Portal Project

**Labels**: `portal`, `p0-critical`, `phase-1`, `setup`

**Description**:
Tạo project Next.js mới cho Restaurant Portal với cấu trúc tương tự Admin Dashboard

**Acceptance Criteria**:
- [ ] Next.js 14 project created in `/restaurant-portal`
- [ ] TypeScript, TailwindCSS, ESLint configured
- [ ] Appwrite SDK installed và configured
- [ ] Project structure: `/app`, `/components`, `/lib`, `/types`
- [ ] Environment variables setup (`.env.example`)
- [ ] Can run `npm run dev` successfully
- [ ] Basic layout với header, sidebar created

**Tech Stack**:
- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Appwrite SDK
- React Hook Form + Zod
- Recharts (for analytics)

**File Structure**:
```
restaurant-portal/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── menu/
│   │   ├── orders/
│   │   ├── analytics/
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Layout.tsx
│   ├── Sidebar.tsx
│   └── Header.tsx
├── lib/
│   ├── appwrite.ts
│   └── api.ts
├── types/
│   └── index.ts
├── package.json
└── tsconfig.json
```

**Documentation Reference**:
- Similar structure: `admin/` directory
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.3

**Estimated Time**: 6-8 hours

**Depends On**: Issue #6

**Blocks**: All Restaurant Portal features

---

### Issue #8: [Portal] Implement Authentication & Role Management

**Labels**: `portal`, `p0-critical`, `phase-1`, `auth`

**Description**:
Implement login/register cho nhà hàng với role-based access

**Acceptance Criteria**:
- [ ] Login page với email/password
- [ ] Register page với restaurant info (name, address, phone, email, license)
- [ ] Store created session in Appwrite
- [ ] Redirect based on `status`: pending → waiting page, active → dashboard
- [ ] Logout functionality
- [ ] Protected routes middleware (can't access dashboard if not active)
- [ ] Show user info in header

**API Functions Needed**:
```typescript
// lib/api.ts
export const registerRestaurant = async (data: RestaurantRegisterData) => {
  // 1. Create account in Auth
  // 2. Create user document với role='restaurant'
  // 3. Create restaurant document với status='pending'
  // 4. Return restaurant document
};

export const loginRestaurant = async (email: string, password: string) => {
  // 1. Login với Appwrite
  // 2. Get user document
  // 3. Check role === 'restaurant'
  // 4. Get restaurant document
  // 5. Return user + restaurant
};
```

**Documentation Reference**:
- Similar flow: `mobile/lib/appwrite.ts` createUser, signIn
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.3.1

**Estimated Time**: 8-10 hours

**Depends On**: Issue #7

**Blocks**: All authenticated features

---

### Issue #9: [Portal] Create Restaurant Onboarding Flow

**Labels**: `portal`, `p1-high`, `phase-1`, `enhancement`

**Description**:
Tạo form đăng ký chi tiết và waiting page cho nhà hàng chờ duyệt

**Acceptance Criteria**:
- [ ] Multi-step registration form:
  - Step 1: Basic Info (name, email, phone, password)
  - Step 2: Business Info (address, map picker, operating hours)
  - Step 3: Legal (business license upload, owner ID)
  - Step 4: Review & Submit
- [ ] Map integration để pick location (latitude, longitude)
- [ ] File upload cho documents (businessLicense)
- [ ] Waiting/Pending page showing application status
- [ ] Email notification sent to admin when new restaurant registers
- [ ] Form validation với Zod schema

**Components**:
- `OnboardingForm.tsx`
- `MapPicker.tsx`
- `FileUpload.tsx`
- `PendingApproval.tsx`

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` Section 2.1 (restaurants)
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.3.1

**Estimated Time**: 12-15 hours

**Depends On**: Issue #8

**Blocks**: Restaurant can't get approved

---

### Issue #10: [Portal] Build Menu Management (CRUD + Categories)

**Labels**: `portal`, `p0-critical`, `phase-1`, `enhancement`

**Description**:
Tạo giao diện quản lý menu với categories và menu items

**Acceptance Criteria**:
- [ ] Menu page với tabs/sections cho categories
- [ ] Create/Edit/Delete menu items
- [ ] Fields: name, description, price, image, categoryId, isAvailable, stock
- [ ] Image upload to Appwrite Storage
- [ ] Category management (create/edit/delete)
- [ ] Bulk actions (enable/disable multiple items)
- [ ] Search và filter menu items
- [ ] Preview mode (see menu như customer thấy)

**Components**:
- `MenuList.tsx`
- `MenuItemForm.tsx`
- `CategoryManager.tsx`
- `ImageUploader.tsx`

**API Functions**:
```typescript
export const createMenuItem = async (data: MenuItemData) => {
  // Upload image to storage first
  // Create menu document
};

export const updateMenuItem = async (id: string, data: Partial<MenuItemData>) => {
  // Update image if changed
  // Update menu document
};

export const getMenuByRestaurant = async (restaurantId: string) => {
  // Get all menu items for restaurant
  // Group by category
};
```

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` Section 1.3 (menu)
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.3.3

**Estimated Time**: 15-20 hours

**Depends On**: Issue #7, #8

**Blocks**: Restaurant can't add menu

---

### Issue #11: [Portal] Implement Order Management Dashboard

**Labels**: `portal`, `p0-critical`, `phase-1`, `enhancement`

**Description**:
Tạo dashboard theo dõi và quản lý đơn hàng real-time

**Acceptance Criteria**:
- [ ] Real-time order list (use Appwrite Realtime)
- [ ] Filter by status: pending, preparing, ready, delivering, completed
- [ ] Order detail modal showing items, customer info, total
- [ ] Action buttons: Accept, Reject, Mark as Preparing, Mark as Ready
- [ ] Auto-refresh khi có đơn mới (sound notification)
- [ ] Show preparation timer/SLA (target: 20 minutes)
- [ ] Warning cho đơn trễ
- [ ] Order history với search/filter

**Components**:
- `OrderDashboard.tsx`
- `OrderCard.tsx`
- `OrderDetailModal.tsx`
- `OrderStatusBadge.tsx`

**API Functions**:
```typescript
export const subscribeToOrders = (restaurantId: string, callback: Function) => {
  // Subscribe to orders collection where restaurantId matches
  // Call callback when new order or status change
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  // Update order status
  // Create notification for customer
  // Log in audit_logs
};
```

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` Section 1.6 (orders), 2.3 (order_items)
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.3.4

**Estimated Time**: 12-15 hours

**Depends On**: Issue #7, #8

**Blocks**: Restaurant can't process orders

---

### Issue #12: [Portal] Add Restaurant Profile & Settings

**Labels**: `portal`, `p2-medium`, `phase-1`, `enhancement`

**Description**:
Trang cài đặt để nhà hàng cập nhật thông tin

**Acceptance Criteria**:
- [ ] Profile page với form edit:
  - Basic: name, description, phone, email
  - Address: street, city, map picker for lat/lng
  - Operating hours (JSON editor or time picker)
  - Images: logo, cover photo
- [ ] Save changes button
- [ ] Change password functionality
- [ ] Toggle restaurant availability (isActive)
- [ ] Preview how restaurant appears to customers

**Components**:
- `ProfileSettings.tsx`
- `OperatingHoursEditor.tsx`
- `ChangePassword.tsx`

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` Section 2.1
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.3.2

**Estimated Time**: 8-10 hours

**Depends On**: Issue #8

**Blocks**: None (Nice to have)

---

### Issue #13: [Portal] Create Analytics Dashboard (Revenue, Best Sellers)

**Labels**: `portal`, `p2-medium`, `phase-1`, `enhancement`

**Description**:
Dashboard thống kê doanh thu và món ăn bán chạy

**Acceptance Criteria**:
- [ ] Revenue chart (by day/week/month)
- [ ] Total orders count
- [ ] Top 5 best selling items
- [ ] Order completion vs cancellation rate
- [ ] Average order value
- [ ] Export data as CSV
- [ ] Date range filter

**Components**:
- `AnalyticsDashboard.tsx`
- `RevenueChart.tsx`
- `BestSellersTable.tsx`
- `StatsCard.tsx`

**Charts** (use Recharts):
- Line chart for revenue over time
- Bar chart for best sellers
- Pie chart for order status distribution

**Documentation Reference**:
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.3.5

**Estimated Time**: 10-12 hours

**Depends On**: Issue #11 (Need order data)

**Blocks**: None (Analytics only)

---

### Issue #14: [Portal] Implement Image Upload for Menu Items

**Labels**: `portal`, `p1-high`, `phase-1`, `enhancement`

**Description**:
Component upload ảnh cho menu items lên Appwrite Storage

**Acceptance Criteria**:
- [ ] Drag-and-drop image upload
- [ ] Image preview before upload
- [ ] Upload to Appwrite Storage bucket
- [ ] Generate thumbnail (optional)
- [ ] Delete old image when replacing
- [ ] Validation: file type (jpg, png), max size (5MB)
- [ ] Show upload progress
- [ ] Store image URL in menu document

**Component**:
```typescript
// components/ImageUpload.tsx
interface ImageUploadProps {
  currentImage?: string;
  onUploadComplete: (imageUrl: string) => void;
}
```

**API Function**:
```typescript
export const uploadMenuImage = async (file: File): Promise<string> => {
  // 1. Upload to storage
  const response = await storage.createFile(bucketId, ID.unique(), file);
  // 2. Get file view URL
  const url = storage.getFileView(bucketId, response.$id);
  // 3. Return URL
  return url.toString();
};
```

**Documentation Reference**:
- Appwrite Storage API
- Similar: Admin dashboard has image handling

**Estimated Time**: 6-8 hours

**Depends On**: Issue #10

**Blocks**: Menu can't have images

---

## 📱 PHASE 2: MOBILE APP ENHANCEMENT

### Issue #15: [Mobile] Integrate Restaurant Selection

**Labels**: `mobile`, `p0-critical`, `phase-2`, `enhancement`

**Description**:
Thêm tính năng browse và chọn nhà hàng trước khi xem menu

**Acceptance Criteria**:
- [ ] Restaurant list screen với filters (cuisine, rating, distance)
- [ ] Search restaurants by name
- [ ] Restaurant card showing: logo, name, rating, ETA, status (open/closed)
- [ ] Restaurant detail screen: info, menu, reviews
- [ ] Navigate from restaurant → menu → add to cart
- [ ] Show "Currently Unavailable" if restaurant is not active
- [ ] Distance calculation from user location

**Screens to Create**:
- `app/(tabs)/restaurants.tsx`
- `app/restaurant-detail.tsx`

**Components**:
- `RestaurantCard.tsx`
- `RestaurantHeader.tsx`
- `Filter.tsx` (update existing)

**API Functions**:
```typescript
export const getRestaurants = async (filters?: RestaurantFilters) => {
  const queries = [Query.equal('isActive', true)];
  if (filters?.cuisine) queries.push(Query.equal('cuisine', filters.cuisine));
  // ...
  return await databases.listDocuments(databaseId, restaurantsCollectionId, queries);
};
```

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` Section 2.1
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.2.2

**Estimated Time**: 10-12 hours

**Depends On**: Issue #1, #6

**Blocks**: User can't select restaurant

---

### Issue #16: [Mobile] Implement VNPay Payment Integration

**Labels**: `mobile`, `p0-critical`, `phase-2`, `backend`, `payment`

**Description**:
Tích hợp VNPay để thanh toán online

**Acceptance Criteria**:
- [ ] Payment screen với options: VNPay, COD
- [ ] Create payment intent in backend
- [ ] Open VNPay web view for payment
- [ ] Handle payment callback (success/fail)
- [ ] Update order paymentStatus after payment
- [ ] Show payment success/fail screen
- [ ] Save payment record in `payments` collection

**Flow**:
1. User clicks "Place Order"
2. Backend creates order với paymentStatus='pending'
3. Backend creates payment intent with VNPay
4. Mobile opens VNPay URL in WebView
5. User completes payment
6. VNPay redirects back với result
7. Backend webhook updates payment status
8. Mobile shows success và navigates to order tracking

**Backend Function** (Appwrite Function):
```typescript
// functions/create-vnpay-payment/src/main.ts
export default async ({ req, res, log, error }: Context) => {
  const { orderId, amount } = JSON.parse(req.body);
  
  // Generate VNPay payment URL
  const vnpayUrl = generateVNPayUrl({ orderId, amount });
  
  // Create payment document
  await databases.createDocument(databaseId, paymentsCollectionId, ID.unique(), {
    orderId,
    provider: 'vnpay',
    amount,
    status: 'pending'
  });
  
  return res.json({ paymentUrl: vnpayUrl });
};
```

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` Section 2.4
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.6
- VNPay docs: https://sandbox.vnpayment.vn/apis/docs/

**Estimated Time**: 15-20 hours

**Depends On**: Issue #1, #6

**Blocks**: Online payment không hoạt động

---

### Issue #17: [Mobile] Add Real-time Order Tracking with Map

**Labels**: `mobile`, `p0-critical`, `phase-2`, `enhancement`

**Description**:
Tracking đơn hàng real-time với bản đồ và countdown

**Acceptance Criteria**:
- [ ] Order tracking screen với map (Google Maps / Mapbox)
- [ ] Show restaurant location, customer location, drone path
- [ ] Status timeline: Pending → Preparing → En Route → Delivered
- [ ] Countdown timer (60 seconds simulation)
- [ ] Real-time position updates (subscribe to drone_events)
- [ ] Estimated time of arrival (ETA)
- [ ] Order details (items, total, address)
- [ ] Contact restaurant button

**Components**:
- `OrderTracking.tsx`
- `DeliveryMap.tsx`
- `StatusTimeline.tsx`
- `CountdownTimer.tsx`

**API Functions**:
```typescript
export const subscribeToDroneEvents = (orderId: string, callback: Function) => {
  // Subscribe to drone_events where orderId matches
  // Update drone position on map
};

export const getDroneLocation = async (droneId: string) => {
  // Get latest drone_events for droneId
  // Return current position
};
```

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` Section 2.10 (drone_events)
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.2.3

**Estimated Time**: 15-18 hours

**Depends On**: Issue #4, #6

**Blocks**: Real-time tracking không hoạt động

---

### Issue #18: [Mobile] Implement Drone Simulation Visualization

**Labels**: `mobile`, `p1-high`, `phase-2`, `enhancement`

**Description**:
Mô phỏng drone bay từ nhà hàng đến customer với animation

**Acceptance Criteria**:
- [ ] Animate drone marker moving along path
- [ ] Smooth interpolation between waypoints
- [ ] Show drone icon (custom marker)
- [ ] Trail/path behind drone
- [ ] Speed varies (takeoff, cruising, landing)
- [ ] Trigger simulation when order status = 'delivering'
- [ ] Auto-complete order khi drone arrives

**Animation Logic**:
```typescript
const simulateDroneFlight = async (restaurantCoords, customerCoords, orderId) => {
  const duration = 60000; // 60 seconds
  const waypoints = calculateWaypoints(restaurantCoords, customerCoords);
  
  for (let i = 0; i < waypoints.length; i++) {
    const position = waypoints[i];
    
    // Create drone event
    await databases.createDocument(databaseId, droneEventsCollectionId, ID.unique(), {
      droneId,
      orderId,
      eventType: 'position_update',
      latitude: position.lat,
      longitude: position.lng,
      timestamp: new Date()
    });
    
    await sleep(duration / waypoints.length);
  }
  
  // Mark order as delivered
  await updateOrderStatus(orderId, 'delivered');
};
```

**Documentation Reference**:
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.5

**Estimated Time**: 12-15 hours

**Depends On**: Issue #17

**Blocks**: Drone animation not working

---

### Issue #19: [Mobile] Add Push Notifications (FCM)

**Labels**: `mobile`, `p1-high`, `phase-2`, `backend`, `enhancement`

**Description**:
Push notifications cho order status updates

**Acceptance Criteria**:
- [ ] Setup Firebase Cloud Messaging in Expo
- [ ] Request notification permissions
- [ ] Save FCM token to user document
- [ ] Backend function sends notification on order update
- [ ] Notifications for: Order Accepted, Preparing, En Route, Delivered
- [ ] Tap notification navigates to order detail
- [ ] Notification badge count
- [ ] Test on iOS và Android

**Events to Notify**:
- Order accepted by restaurant
- Order preparing
- Drone dispatched
- Order delivered
- Order cancelled

**Backend Function**:
```typescript
// functions/send-notification/src/main.ts
export default async ({ req, res }: Context) => {
  const { userId, title, body, data } = JSON.parse(req.body);
  
  // Get user FCM token
  const user = await databases.getDocument(databaseId, userCollectionId, userId);
  const fcmToken = user.fcmToken;
  
  // Send via FCM
  await sendFCMNotification(fcmToken, { title, body, data });
  
  // Save to notifications collection
  await databases.createDocument(databaseId, notificationsCollectionId, ID.unique(), {
    userId,
    type: data.type,
    title,
    body,
    status: 'sent',
    sentAt: new Date()
  });
  
  return res.json({ success: true });
};
```

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` Section 2.9
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.7
- Expo Notifications: https://docs.expo.dev/push-notifications/overview/

**Estimated Time**: 10-12 hours

**Depends On**: Issue #3, #6

**Blocks**: Users don't get notified

---

### Issue #20: [Mobile] Create Review & Rating System

**Labels**: `mobile`, `p1-high`, `phase-2`, `enhancement`

**Description**:
Cho phép user đánh giá nhà hàng sau khi hoàn thành đơn

**Acceptance Criteria**:
- [ ] Review prompt after order delivered
- [ ] Rating: Overall (1-5 stars), Food Quality, Delivery Speed, Service
- [ ] Comment text area (optional)
- [ ] Submit review to `reviews` collection
- [ ] Show reviews on restaurant detail screen
- [ ] Can only review once per order
- [ ] Calculate average rating và update restaurant document

**Screens**:
- `app/leave-review.tsx`

**Components**:
- `ReviewForm.tsx`
- `StarRating.tsx`
- `ReviewCard.tsx`

**API Functions**:
```typescript
export const submitReview = async (reviewData: ReviewData) => {
  // Create review document
  const review = await databases.createDocument(databaseId, reviewsCollectionId, ID.unique(), reviewData);
  
  // Update restaurant rating (calculate new average)
  await updateRestaurantRating(reviewData.restaurantId);
  
  return review;
};

export const getRestaurantReviews = async (restaurantId: string) => {
  return await databases.listDocuments(
    databaseId, 
    reviewsCollectionId,
    [Query.equal('restaurantId', restaurantId), Query.orderDesc('$createdAt')]
  );
};
```

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` Section 2.6
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.2.4

**Estimated Time**: 8-10 hours

**Depends On**: Issue #3, #6

**Blocks**: No review system

---

### Issue #21: [Mobile] Implement Voucher/Promotion System

**Labels**: `mobile`, `p2-medium`, `phase-2`, `enhancement`

**Description**:
Apply vouchers/promo codes trong checkout

**Acceptance Criteria**:
- [ ] "Have a promo code?" input on checkout screen
- [ ] Validate promo code (check valid, not expired, usage limit)
- [ ] Apply discount to order total
- [ ] Show discount breakdown
- [ ] Save used voucher in `user_vouchers` collection
- [ ] Decrement promotion usage count
- [ ] Show available vouchers in profile

**Flow**:
1. User enters promo code
2. Validate: exists, active, not expired, usage < maxUsage
3. Calculate discount (percentage or fixed)
4. Apply to order total
5. Create user_voucher document với status='used'
6. Update promotion currentUsage

**API Functions**:
```typescript
export const validatePromoCode = async (code: string, userId: string, orderTotal: number) => {
  // Get promotion by code
  const promotion = await databases.listDocuments(databaseId, promotionsCollectionId, [
    Query.equal('code', code),
    Query.equal('isActive', true)
  ]);
  
  if (!promotion.documents.length) throw new Error('Invalid code');
  
  const promo = promotion.documents[0];
  
  // Check expiry, usage, min order
  if (promo.currentUsage >= promo.maxUsage) throw new Error('Code limit reached');
  if (new Date(promo.endDate) < new Date()) throw new Error('Code expired');
  if (orderTotal < promo.minOrderValue) throw new Error('Order too small');
  
  // Calculate discount
  let discount = 0;
  if (promo.type === 'percentage') {
    discount = orderTotal * (promo.discountValue / 100);
    if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
      discount = promo.maxDiscountAmount;
    }
  } else {
    discount = promo.discountValue;
  }
  
  return { promo, discount };
};
```

**Documentation Reference**:
- Schema: `docs/database/DATABASE_SCHEMA.md` Sections 2.7, 2.8
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section 4.2.3

**Estimated Time**: 10-12 hours

**Depends On**: Issue #5, #6

**Blocks**: Promo codes don't work

---

### Issue #22: [Mobile] Fix Cart Multi-Restaurant Issue

**Labels**: `mobile`, `bug`, `p1-high`, `phase-2`

**Description**:
Hiện tại cart không handle trường hợp items từ nhiều nhà hàng khác nhau

**Current Bug**:
User có thể add items từ Restaurant A và Restaurant B vào cùng 1 cart → Không thể checkout

**Acceptance Criteria**:
- [ ] Detect khi user adds item from different restaurant
- [ ] Show alert: "Clear cart to add from different restaurant?"
- [ ] Options: Cancel hoặc Clear cart and add
- [ ] Cart badge shows restaurant name
- [ ] Checkout validates all items from same restaurant

**Cart Store Update**:
```typescript
// store/cart.store.ts
interface CartState {
  items: CartItem[];
  restaurantId: string | null; // NEW: Track which restaurant
  
  addItem: (item: CartItem, restaurantId: string) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  restaurantId: null,
  
  addItem: (item, restaurantId) => {
    const { items, restaurantId: currentRestaurantId } = get();
    
    // Check if different restaurant
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      Alert.alert(
        'Different Restaurant',
        'Your cart has items from another restaurant. Clear cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear & Add', 
            onPress: () => set({ items: [item], restaurantId }) 
          }
        ]
      );
      return;
    }
    
    // Same restaurant or first item
    set({ items: [...items, item], restaurantId });
  },
  
  clearCart: () => set({ items: [], restaurantId: null }),
}));
```

**Documentation Reference**:
- Current cart: `mobile/store/cart.store.ts`

**Estimated Time**: 4-6 hours

**Depends On**: Issue #15

**Blocks**: Cart confusion

---

## 🎛️ PHASE 3: ADMIN DASHBOARD ENHANCEMENT

*(Tương tự format, tôi sẽ tóm tắt)*

### Issue #23-30: Admin Features
- **#23**: Restaurant approval system
- **#24**: Drone fleet management
- **#25**: Drone simulation engine
- **#26**: System-wide order monitoring
- **#27**: Analytics dashboard (GMV, KPIs)
- **#28**: User management (ban, reset)
- **#29**: Audit logs viewer
- **#30**: Notification broadcast

---

## 🔗 PHASE 4: INTEGRATION & POLISH

*(Backend functions, testing, docs)*

### Issue #31-40: Integration
- **#31**: VNPay webhook handler
- **#32**: Order status automation
- **#33**: Email notification system
- **#34**: Payment refund flow
- **#35**: Real-time WebSocket
- **#36-38**: E2E Testing
- **#39-40**: Documentation

---

## 📝 Issue Template

**Khi tạo issue mới trên GitHub, dùng template này**:

```markdown
## 🎯 Objective
[Mô tả ngắn gọn mục tiêu của issue]

## 📋 Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## 🔗 Dependencies
**Depends On**: #issue-number (Phải hoàn thành trước)
**Blocks**: #issue-number (Block issue khác)

## 📚 Documentation Reference
- Schema: `docs/database/DATABASE_SCHEMA.md` Section X.X
- Requirements: `docs/PROJECT_REQUIREMENTS_vi.md` Section X.X

## ⏱️ Estimated Time
X-Y hours

## ✅ Definition of Done
- [ ] Code implemented
- [ ] Tests written (if applicable)
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Merged to main branch

## 💡 Implementation Notes
[Code snippets, technical details]

## 🧪 Testing Checklist
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Tested on iOS/Android (for mobile)
- [ ] Tested on Chrome/Safari (for web)
```

---

**Sử dụng GitHub Projects để track**:
1. Tạo Project Board: "FoodFast Development"
2. Columns: Backlog, To Do, In Progress, Review, Done
3. Link issues to milestones:
   - Milestone 1: Database Foundation (Week 1)
   - Milestone 2: Restaurant Portal (Week 2-3)
   - Milestone 3: Mobile Enhancement (Week 3-4)
   - Milestone 4: Admin Enhancement (Week 4-5)
   - Milestone 5: Integration (Week 5-6)

**Labels to create**:
- `phase-0`, `phase-1`, `phase-2`, `phase-3`, `phase-4`
- `p0-critical`, `p1-high`, `p2-medium`, `p3-low`
- `db`, `mobile`, `portal`, `admin`, `backend`
- `bug`, `enhancement`, `documentation`, `setup`, `testing`
