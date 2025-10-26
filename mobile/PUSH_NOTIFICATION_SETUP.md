# 🔧 Cách setup Expo Push Notifications

## Bước 1: Tạo Expo Project ID (Nếu cần EAS Build)

### Option A: Sử dụng EAS (Recommended cho production)
```bash
cd mobile
npx eas-cli login
npx eas-cli init
```

Lệnh này sẽ tạo Expo Project ID và tự động cập nhật vào `app.json`:
```json
{
  "extra": {
    "eas": {
      "projectId": "abc123xyz..."
    }
  }
}
```

### Option B: Development mode (Không cần EAS)
Code đã được cập nhật để tự động fallback sang mock token trong development.
Notifications vẫn hoạt động local (trong app), nhưng không thể gửi từ server.

---

## Bước 2: Test Push Notifications Locally

### 1. Test trong app (không cần backend):
```typescript
// Test trong debug.tsx hoặc console
import * as Notifications from 'expo-notifications';

// Schedule local notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: "Test Order Update",
    body: "Your order is being prepared!",
    data: { orderId: '12345' },
  },
  trigger: { seconds: 2 },
});
```

### 2. Test với Expo Push Tool:
1. Lấy push token từ app logs: `ExpoToken[xxxxxx]`
2. Truy cập: https://expo.dev/notifications
3. Paste token và gửi test notification

---

## Bước 3: Setup Backend (Appwrite Functions) ⚠️

### Tại sao cần Appwrite Function?
- **Mobile app** chỉ có thể **NHẬN** notifications
- **Backend** cần **GỬI** notifications khi có sự kiện (order status change)
- Appwrite Functions = serverless backend để xử lý logic này

### Cách tạo Appwrite Function:

#### 1. Vào Appwrite Console
```
https://cloud.appwrite.io
→ Chọn project
→ Functions (menu bên trái)
→ Create Function
```

#### 2. Tạo Function mới
```
Name: send-notification
Runtime: Node.js 18
Entry Point: src/main.js
```

#### 3. Upload code:

**functions/send-notification/src/main.js**
```javascript
import { Client, Databases, Query } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    const { userId, title, body, data } = JSON.parse(req.body);

    // 1. Get user's FCM token
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new Databases(client);
    
    const user = await databases.getDocument(
      process.env.DATABASE_ID,
      'user', // user collection
      userId
    );

    if (!user.fcmToken) {
      throw new Error('User has no FCM token');
    }

    // 2. Send notification via Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: user.fcmToken,
        sound: 'default',
        title,
        body,
        data: data || {},
      }),
    });

    const result = await response.json();
    log('Notification sent:', result);

    // 3. Save to notifications collection
    await databases.createDocument(
      process.env.DATABASE_ID,
      'notifications',
      'unique()',
      {
        userId,
        type: data?.type || 'order_update',
        title,
        body,
        status: 'sent',
        channel: 'push',
        sentAt: new Date().toISOString(),
      }
    );

    return res.json({
      success: true,
      data: result,
    });

  } catch (err) {
    error('Error sending notification:', err);
    return res.json({
      success: false,
      error: err.message,
    }, 500);
  }
};
```

#### 4. Configure Environment Variables
Trong Appwrite Console → Function → Settings → Variables:
```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
DATABASE_ID=your_database_id
```

#### 5. Deploy Function
```bash
# Nếu dùng Appwrite CLI
appwrite functions createDeployment \
  --functionId=send-notification \
  --entrypoint=src/main.js \
  --code=./functions/send-notification
```

Hoặc upload ZIP qua Console.

---

## Bước 4: Trigger Notifications on Events

### Option A: Appwrite Events (Automatic)
Trong Appwrite Console → Functions → send-notification → Events:
```
databases.*.collections.orders.documents.*.update
```

Cập nhật function để tự động detect status change:
```javascript
export default async ({ req, res, log }) => {
  const event = req.body;
  
  // Detect order status change
  if (event.status === 'confirmed') {
    await sendNotification(event.userId, 
      'Order Confirmed', 
      'Your order has been confirmed by restaurant!'
    );
  }
  
  if (event.status === 'delivering') {
    await sendNotification(event.userId,
      'Drone Dispatched',
      'Your order is on the way! 🚁'
    );
  }
  
  // ... more status checks
};
```

### Option B: Manual Call (from Mobile/Restaurant)
```typescript
// Trong mobile/restaurant app khi update order
await fetch('https://cloud.appwrite.io/v1/functions/send-notification/executions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': projectId,
  },
  body: JSON.stringify({
    userId: order.userId,
    title: 'Order Confirmed',
    body: `Order #${orderId} confirmed!`,
    data: { orderId, type: 'order_update' },
  }),
});
```

---

## 📊 Flow Diagram

```
┌─────────────────┐
│  Order Created  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ Appwrite Event Trigger  │ (databases.orders.update)
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Appwrite Function       │
│ "send-notification"     │
│ - Get user fcmToken     │
│ - Call Expo Push API    │
│ - Save to notifications │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ Expo Push Service       │
│ exp.host/api/v2/push    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│ User's Phone            │
│ 📱 Notification appears │
└─────────────────────────┘
```

---

## 🧪 Testing Steps

### 1. Test Local Notifications (No Backend)
```typescript
// In any screen
import * as Notifications from 'expo-notifications';

const testNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test",
      body: "This works!",
    },
    trigger: { seconds: 1 },
  });
};
```

### 2. Test with Expo Push Tool
- Get token from app logs
- Go to https://expo.dev/notifications
- Send test notification

### 3. Test with Appwrite Function
```bash
curl -X POST \
  https://cloud.appwrite.io/v1/functions/YOUR_FUNCTION_ID/executions \
  -H "X-Appwrite-Project: YOUR_PROJECT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "Test Order",
    "body": "Your order is ready!"
  }'
```

---

## ⚡ Quick Fix cho Development

Hiện tại code đã được sửa để:
1. ✅ Không crash khi thiếu projectId
2. ✅ Tự động tạo mock token trong development
3. ✅ Vẫn có thể test local notifications
4. ⚠️ Không thể nhận push từ server cho đến khi setup Appwrite Function

**Để test ngay bây giờ:**
```typescript
// Thêm vào mobile/app/debug.tsx
import * as Notifications from 'expo-notifications';

const testLocalNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Order Update 🍔",
      body: "Your order is being prepared!",
      data: { orderId: '123', screen: '/order-tracking' },
    },
    trigger: { seconds: 2 },
  });
};
```

---

## 📝 Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Local notifications | ✅ Works | Trong app |
| Permission request | ✅ Works | iOS/Android |
| Token storage | ✅ Works | Save to user.fcmToken |
| Push from server | ⚠️ Needs Appwrite Function | Backend setup required |

**Next Action:** Tạo Appwrite Function `send-notification` theo hướng dẫn trên.
