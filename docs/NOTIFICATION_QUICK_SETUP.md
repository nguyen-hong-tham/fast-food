# 🚀 Quick Setup: Notification System

## ✅ Checklist Setup (30 phút)

### Step 1: Add fcmToken to User Collection (5 phút)

```
1. Vào https://cloud.appwrite.io
2. Chọn Project → Database → User Collection
3. Tab "Attributes" → "Create Attribute"
4. Cấu hình:
   ✅ Key: fcmToken
   ✅ Type: String
   ✅ Size: 500
   ✅ Required: No
   ✅ Array: No
5. Click "Create"
```

### Step 2: Check Notifications Collection (Đã có ✅)

Dựa vào screenshot bạn gửi, collection `notifications` đã được tạo với đầy đủ attributes.

**Verify Permissions**:
```
Database → notifications → Settings → Permissions

Read: Any
Create: Users, Server
Update: Owner, Server
Delete: Server
```

### Step 3: Test Push Notification Token (10 phút)

```bash
# Chạy mobile app
cd mobile
npm start

# Trong app:
1. Login với tài khoản
2. Check logs console, tìm dòng:
   "✅ Got real Expo push token: ExpoToken[...]"
3. Copy token này

# Test token với Expo Push Tool:
4. Vào: https://expo.dev/notifications
5. Paste token vào "Expo Push Token"
6. Title: "Test Notification"
7. Message: "Hello from FoodFast!"
8. Click "Send a Notification"
9. Check device có nhận được notification không
```

### Step 4: Deploy Appwrite Function (15 phút)

#### Option A: Via CLI (Nhanh hơn)
```bash
# Install CLI (nếu chưa có)
npm install -g appwrite

# Login
appwrite login

# Init project
appwrite init project
# Chọn project từ list

# Deploy function
cd functions/send-notification
npm install
appwrite deploy function
```

#### Option B: Via Console (Đơn giản hơn)
```
1. Vào Appwrite Console → Functions
2. Click "Create Function"
   - Name: send-notification
   - Runtime: Node.js 18
   - Entry point: src/main.js

3. Tab "Settings" → "Variables" → Add:
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=[your_project_id]
   APPWRITE_API_KEY=[create_below]
   DATABASE_ID=[your_database_id]

4. Create API Key:
   - Project Settings → API Keys → Create
   - Name: send-notification-function
   - Scopes: databases.read, databases.write
   - Copy key và paste vào APPWRITE_API_KEY

5. Tab "Deployments" → Manual Deployment
   - Zip folder: functions/send-notification
   - Upload ZIP
   - Click "Activate"

6. Tab "Execute" → Test:
   Body: {"userId":"[user_id]","title":"Test","body":"Hello"}
```

### Step 5: Test End-to-End (Bonus - sau khi deploy function)

```typescript
// Trong mobile app, test gửi notification:
import { sendPushNotification } from '@/lib/api-helpers';

// Thêm button test trong profile screen:
<TouchableOpacity onPress={async () => {
  await sendPushNotification({
    userId: user.$id,
    title: '🎉 Test Notification',
    body: 'This is a test from FoodFast!',
    type: 'system',
  });
  Alert.alert('Sent!', 'Check your notifications');
}}>
  <Text>Test Notification</Text>
</TouchableOpacity>
```

---

## 🎯 Kết Quả Mong Đợi

Sau khi hoàn thành:

✅ User login → FCM token tự động lưu vào database
✅ Có screen /notifications để xem danh sách
✅ Order update → Tự động gửi notification
✅ Tap notification → Navigate to order tracking
✅ Badge count hiển thị số unread notifications

---

## 📱 Usage Examples

### Gửi notification khi order được accept:

```typescript
// Restaurant portal or admin
await sendPushNotification({
  userId: order.userId,
  title: '✅ Order Confirmed',
  body: 'Your order has been accepted! Preparing now...',
  type: 'order_update',
  orderId: order.$id,
});
```

### Gửi notification khi drone đang bay:

```typescript
await sendPushNotification({
  userId: order.userId,
  title: '🚁 Order On The Way',
  body: 'Your food is flying to you! ETA: 5 minutes',
  type: 'order_update',
  orderId: order.$id,
});
```

### Gửi promotion:

```typescript
await sendPushNotification({
  userId: user.$id,
  title: '🎉 Special Offer!',
  body: 'Get 50% off your next order. Use code: FAST50',
  type: 'promotion',
  screen: '/promotions',
});
```

---

## 🐛 Quick Fixes

### Không nhận được push notification?

```
1. Check Settings → Notifications → Enable for FoodFast
2. iOS: Re-install app (provisioning profile)
3. Android: Check notification channel settings
4. Test token tại https://expo.dev/notifications
```

### Function execution fails?

```
1. Check function logs: Console → Functions → Executions
2. Verify API Key permissions: databases.read, databases.write
3. Check environment variables correctly set
4. Test with simple payload first
```

### Notification không hiển thị trong app?

```
1. Check /notifications screen có data không
2. Verify userId match
3. Pull to refresh
4. Check Appwrite Console → Database → notifications có documents không
```

---

## 📚 Full Documentation

Xem chi tiết tại: `docs/NOTIFICATION_SYSTEM_GUIDE.md`

---

**🎉 Done! Giờ bạn đã có hệ thống notification hoàn chỉnh!**
