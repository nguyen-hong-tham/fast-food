# 🔔 Hệ Thống Notification - FoodFast

## 📋 Tổng Quan

Hệ thống notification gồm 3 phần chính:
1. **Appwrite Database** - Lưu trữ notifications
2. **Expo Push Notifications** - Gửi push notifications đến device
3. **Appwrite Function** - Backend service để gửi notifications

---

## 🗄️ PHẦN 1: DATABASE (ĐÃ HOÀN THÀNH ✅)

### Collection: `notifications`

Dựa vào ảnh screenshot bạn gửi, collection đã có sẵn với các attributes:

| Attribute | Type | Required | Indexed | Description |
|-----------|------|----------|---------|-------------|
| `$id` | string | ✅ | ✅ | Document ID |
| `userId` | string | ✅ | ✅ | User nhận notification |
| `title` | string | ✅ | ❌ | Tiêu đề notification |
| `body` | string | ✅ | ❌ | Nội dung notification |
| `data` | string | ❌ | ❌ | JSON data (orderId, screen, etc.) |
| `imageUrl` | url | ❌ | ❌ | Ảnh đính kèm |
| `actionUrl` | string | ❌ | ❌ | Deep link URL |
| `fcmToken` | string | ❌ | ❌ | (Deprecated - moved to User collection) |
| `type` | enum | ✅ | ✅ | order_update, promotion, system, review_request |
| `channel` | enum | ✅ | ❌ | push, email, in_app |
| `status` | enum | ✅ | ✅ | sent, read |
| `sentAt` | datetime | ❌ | ❌ | Thời gian gửi |
| `readAt` | datetime | ❌ | ❌ | Thời gian đọc |
| `$createdAt` | datetime | ✅ | ✅ | Auto |
| `$updatedAt` | datetime | ✅ | ❌ | Auto |

### Permissions

Thiết lập trong Appwrite Console → Database → notifications → Settings → Permissions:

```
Read:
- Role: Any (Users can read their own notifications)

Create:
- Role: Server (Appwrite Functions can create)
- Role: Users (Optional: allow users to create)

Update:
- Role: Owner (User can mark as read)
- Role: Server (Functions can update)

Delete:
- Role: Server
```

---

## 📱 PHẦN 2: MOBILE APP (ĐÃ HOÀN THÀNH ✅)

### 1. Expo Push Notifications Setup

File: `mobile/lib/notifications.ts`

```typescript
// Đã có sẵn các functions:
- registerForPushNotificationsAsync() // Đăng ký push token
- addNotificationListeners() // Listen foreground/background notifications
- ensureNotificationHandlerConfigured() // Config notification behavior
```

### 2. Store FCM Token in User Document

**QUAN TRỌNG**: Phải lưu `fcmToken` vào User collection, KHÔNG phải Notifications collection.

**Cập nhật User Collection**:
```
1. Vào Appwrite Console
2. Database → User collection → Attributes
3. Thêm attribute mới:
   - Key: fcmToken
   - Type: String
   - Size: 500
   - Required: No
```

**Code đã có sẵn** trong `mobile/lib/appwrite.ts`:
```typescript
export const saveUserPushToken = async (userId: string, pushToken: string) => {
  // Updates user document with fcmToken
};
```

### 3. Notification Store

File: `mobile/store/notification.store.ts` ✅

```typescript
// Đã có sẵn:
- unreadCount: number
- increment(): void
- reset(): void
- setCount(count: number): void
```

### 4. Notification Hook

File: `mobile/hooks/useNotificationSetup.ts` ✅

Tự động:
- Register push token khi user login
- Listen notifications
- Navigate khi tap notification
- Update badge count

### 5. Notification Screen

File: `mobile/app/notifications.tsx` ✅ (MỚI TẠO)

Features:
- Hiển thị list notifications
- Mark as read khi tap
- Navigate to order tracking
- Pull to refresh
- Empty state
- Unread count badge

### 6. API Helpers

File: `mobile/lib/api-helpers.ts` ✅

Functions:
```typescript
// Đã có sẵn:
createNotification(data) // Save to database
getUserNotifications(userId) // Get user's notifications
markNotificationAsRead(notificationId) // Mark 1 as read
markAllNotificationsAsRead(userId) // Mark all as read
sendPushNotification(data) // Send push (calls Function)
```

---

## 🚀 PHẦN 3: APPWRITE FUNCTION (CẦN DEPLOY)

### Function: `send-notification`

**Location**: `functions/send-notification/`

**Purpose**: Gửi push notification qua Expo Push API và lưu vào database

### Deploy Steps:

#### Option 1: Via Appwrite CLI (Recommended)

```bash
# 1. Install Appwrite CLI (nếu chưa có)
npm install -g appwrite

# 2. Login to Appwrite
appwrite login

# 3. Init project (nếu chưa init)
appwrite init project

# 4. Deploy function
cd functions/send-notification
npm install
appwrite functions createDeployment \
  --functionId=send-notification \
  --entrypoint=src/main.js \
  --code=.
```

#### Option 2: Via Appwrite Console (Manual)

```
1. Vào Appwrite Console → Functions
2. Create Function:
   - Name: send-notification
   - Runtime: Node.js 18
   - Entry point: src/main.js
   
3. Add Environment Variables:
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=<your_project_id>
   APPWRITE_API_KEY=<create_api_key_with_database_permissions>
   DATABASE_ID=<your_database_id>
   
4. Upload Code:
   - Zip folder `functions/send-notification`
   - Upload trong Deployments tab
   
5. Activate Deployment
```

### Create API Key

```
1. Appwrite Console → Project Settings → API Keys
2. Create API Key với scopes:
   ✅ databases.read
   ✅ databases.write
3. Copy API Key vào function environment variables
```

### Test Function

```bash
# Test via CLI
appwrite functions createExecution \
  --functionId=send-notification \
  --data='{"userId":"user123","title":"Test","body":"Hello"}'
  
# Or test via Console:
1. Functions → send-notification → Execute
2. Body: {"userId":"user123","title":"Test Notification","body":"This is a test"}
```

---

## 🔄 PHẦN 4: INTEGRATION - GỬI NOTIFICATIONS KHI ORDER UPDATE

### Trigger Notifications

Khi order status thay đổi, tự động gửi notification:

**File**: `mobile/lib/appwrite.ts` hoặc backend

```typescript
import { sendPushNotification } from '@/lib/api-helpers';

// Ví dụ: Khi restaurant accept order
export const acceptOrder = async (orderId: string, userId: string) => {
  // 1. Update order status
  await databases.updateDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    orderId,
    { status: 'confirmed' }
  );
  
  // 2. Send notification
  await sendPushNotification({
    userId,
    title: '✅ Order Confirmed',
    body: 'Your order has been accepted by the restaurant!',
    type: 'order_update',
    orderId,
  });
};

// Ví dụ: Khi drone đang giao hàng
export const notifyDelivering = async (orderId: string, userId: string) => {
  await sendPushNotification({
    userId,
    title: '🚁 Order On The Way',
    body: 'Your food is flying to you! ETA: 5 minutes',
    type: 'order_update',
    orderId,
  });
};

// Ví dụ: Khi đã giao xong
export const notifyDelivered = async (orderId: string, userId: string) => {
  await sendPushNotification({
    userId,
    title: '🎉 Order Delivered',
    body: 'Enjoy your meal! Please rate your experience.',
    type: 'order_update',
    orderId,
  });
};
```

### Auto-trigger với Appwrite Events (Advanced)

Configure trong Appwrite Function → Settings → Events:

```
Event: databases.*.collections.orders.documents.*.update
```

Function sẽ tự động chạy khi order được update.

Update `functions/send-notification/src/main.js`:

```javascript
export default async ({ req, res, log, error }) => {
  // Check if triggered by event
  if (req.variables.APPWRITE_FUNCTION_EVENT) {
    const event = req.variables.APPWRITE_FUNCTION_EVENT;
    const document = JSON.parse(req.variables.APPWRITE_FUNCTION_EVENT_DATA);
    
    // Parse order status
    const order = document;
    const userId = order.userId;
    const status = order.status;
    
    // Send notification based on status
    let title, body;
    switch (status) {
      case 'confirmed':
        title = '✅ Order Confirmed';
        body = 'Restaurant is preparing your order!';
        break;
      case 'preparing':
        title = '👨‍🍳 Order Preparing';
        body = 'Your food is being cooked with care!';
        break;
      case 'delivering':
        title = '🚁 On The Way';
        body = 'Drone is flying to you! Track it now.';
        break;
      case 'delivered':
        title = '🎉 Delivered';
        body = 'Enjoy your meal! Please leave a review.';
        break;
      default:
        return res.json({ skipped: true });
    }
    
    // Send notification (reuse existing logic)
    // ... rest of code
  }
};
```

---

## 📊 PHẦN 5: TESTING

### Test Checklist

#### 1. Database Test
```
✅ Create notification document manually in Appwrite Console
✅ Query notifications by userId
✅ Update status from 'sent' to 'read'
✅ Check indexes work (userId, status, type)
```

#### 2. Mobile App Test
```
✅ Register for push notifications (check logs for token)
✅ Token saved to User document (check in Appwrite Console)
✅ Navigate to /notifications screen
✅ See list of notifications
✅ Tap notification → mark as read
✅ Tap notification with orderId → navigate to order tracking
✅ Pull to refresh
✅ Badge count updates
```

#### 3. Push Notification Test
```
✅ Send test via Expo Push Tool: https://expo.dev/notifications
   Token: ExpoToken[...] (from app logs)
   Title: Test Order Update
   Body: Your order is ready!
   
✅ Receive notification on device
✅ Tap notification → app opens → navigate correctly
✅ Notification appears in /notifications screen
```

#### 4. Appwrite Function Test
```
✅ Deploy function successfully
✅ Execute manually with test data
✅ Check function logs (Console → Functions → Executions)
✅ Verify notification created in database
✅ Verify push sent via Expo API
```

#### 5. Integration Test
```
✅ Create order → Restaurant accepts → User receives notification
✅ Order status changes → Notification sent automatically
✅ Multiple users → Each gets their own notifications
✅ Notification data includes orderId → Navigation works
```

---

## 🎯 PHẦN 6: USAGE EXAMPLES

### Example 1: Gửi notification khi place order

```typescript
// In checkout.tsx
const handlePlaceOrder = async () => {
  // Create order
  const order = await createOrder({...});
  
  // Send confirmation notification
  await sendPushNotification({
    userId: user.$id,
    title: '📦 Order Placed',
    body: `Order #${order.$id.slice(-6)} has been placed successfully!`,
    type: 'order_update',
    orderId: order.$id,
  });
  
  router.push('/order-tracking', { orderId: order.$id });
};
```

### Example 2: Gửi promotion notification

```typescript
// Admin sends promo
await sendPushNotification({
  userId: 'all', // Broadcast to all (implement in function)
  title: '🎉 Special Offer!',
  body: 'Get 50% off on your next order. Use code: FAST50',
  type: 'promotion',
  screen: '/promotions',
});
```

### Example 3: Request review

```typescript
// After order delivered
setTimeout(async () => {
  await sendPushNotification({
    userId: order.userId,
    title: '⭐ How was your meal?',
    body: 'We'd love to hear your feedback!',
    type: 'review_request',
    orderId: order.$id,
    screen: `/leave-review?orderId=${order.$id}`,
  });
}, 5 * 60 * 1000); // 5 minutes after delivery
```

---

## 🛠️ TROUBLESHOOTING

### Issue 1: Không nhận được push notification

**Giải pháp**:
```
1. Check push token có được lưu vào User document chưa
2. Check permissions của User collection (có thể update fcmToken không)
3. Test token với Expo Push Tool trước
4. Check device có grant notification permission chưa
5. iOS: Check provisioning profile có enable push notifications chưa
```

### Issue 2: Function execution fails

**Giải pháp**:
```
1. Check function logs trong Appwrite Console
2. Verify API Key có đủ permissions
3. Check environment variables
4. Test with simple payload first
5. Check Expo Push API response
```

### Issue 3: Notification không hiển thị trong app

**Giải pháp**:
```
1. Check notifications collection có documents không
2. Check userId match với logged-in user
3. Check query permissions
4. Verify indexes được tạo đúng
5. Check mobile app có call getUserNotifications() không
```

### Issue 4: Badge count không update

**Giải pháp**:
```
1. iOS: Check notification settings có enable badge không
2. Android: Badge depends on launcher support
3. Check useNotificationStore có được gọi không
4. Verify Notifications.setBadgeCountAsync() works
```

---

## 📝 NEXT STEPS (Issue #19)

### ✅ Đã hoàn thành:
- [x] Database collection `notifications` created
- [x] Mobile notification setup (Expo)
- [x] Notification store & hooks
- [x] Notification screen UI
- [x] API helpers (create, read, mark as read)
- [x] Function code written

### ⏳ Cần làm tiếp:
- [ ] Add `fcmToken` attribute to User collection
- [ ] Deploy Appwrite Function `send-notification`
- [ ] Create API Key for function
- [ ] Test end-to-end flow
- [ ] Integrate with order status updates
- [ ] Add notification badge to tab bar
- [ ] Setup auto-trigger với Appwrite Events (optional)

### 🎯 Priority Actions:

**1. Add fcmToken to User (5 minutes)**
```
Appwrite Console → Database → User → Attributes → Create
- Key: fcmToken
- Type: String
- Size: 500
- Required: No
```

**2. Deploy Function (15 minutes)**
```bash
cd functions/send-notification
npm install
appwrite functions createDeployment --functionId=send-notification --code=. --entrypoint=src/main.js
```

**3. Test Notification (10 minutes)**
```
1. Login to mobile app
2. Check fcmToken saved
3. Send test via Appwrite Function
4. Verify notification received
5. Check /notifications screen
```

---

## 📚 REFERENCES

- Expo Notifications: https://docs.expo.dev/push-notifications/overview/
- Expo Push API: https://docs.expo.dev/push-notifications/sending-notifications/
- Appwrite Functions: https://appwrite.io/docs/functions
- Appwrite Databases: https://appwrite.io/docs/databases

---

**🎉 Sau khi hoàn thành, bạn sẽ có hệ thống notification hoàn chỉnh theo Issue #19!**
