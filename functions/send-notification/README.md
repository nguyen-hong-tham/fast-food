# Send Notification Function

Appwrite Function để gửi push notifications đến mobile app khi có order updates.

## Setup

### 1. Tạo Function trong Appwrite Console
```
1. Vào Appwrite Console (https://cloud.appwrite.io)
2. Chọn Project
3. Functions → Create Function
4. Name: send-notification
5. Runtime: Node.js 18
6. Entry Point: src/main.js
```

### 2. Configure Environment Variables
Trong Function Settings → Variables:
```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key (with databases.read, databases.write permissions)
DATABASE_ID=your_database_id
```

### 3. Deploy Function

#### Option A: Via Appwrite CLI
```bash
cd functions/send-notification
npm install
appwrite functions createDeployment \
  --functionId=send-notification \
  --entrypoint=src/main.js \
  --code=.
```

#### Option B: Via Console (Manual Upload)
1. Zip folder này (chứa package.json và src/main.js)
2. Upload ZIP trong Appwrite Console → Functions → Deployments
3. Set Entry Point: `src/main.js`

### 4. Configure Events (Optional - Auto-trigger)
Trong Function → Settings → Events, thêm:
```
databases.*.collections.orders.documents.*.update
```

Function sẽ tự động chạy khi order được update.

## Usage

### Manual Call (REST API)
```bash
curl -X POST \
  https://cloud.appwrite.io/v1/functions/YOUR_FUNCTION_ID/executions \
  -H "X-Appwrite-Project: YOUR_PROJECT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "Order Confirmed",
    "body": "Your order has been confirmed!",
    "data": {
      "orderId": "order123",
      "type": "order_update"
    }
  }'
```

### From Mobile/Restaurant App
```typescript
import { functions } from './appwrite';

const sendNotification = async (userId: string, title: string, body: string, data: any) => {
  await functions.createExecution(
    'send-notification', // Function ID
    JSON.stringify({ userId, title, body, data }),
    false // async
  );
};

// Example: Khi restaurant confirm order
await sendNotification(
  order.userId,
  'Order Confirmed',
  `Order #${order.$id.slice(-6)} has been confirmed by the restaurant!`,
  { orderId: order.$id, type: 'order_update' }
);
```

## Notification Events

### Order Status Updates
```typescript
// Order Confirmed
{
  title: "Order Confirmed ✅",
  body: "Your order has been accepted by the restaurant",
  data: { orderId, type: "order_confirmed" }
}

// Order Preparing
{
  title: "Preparing Your Order 👨‍🍳",
  body: "Your food is being prepared",
  data: { orderId, type: "order_preparing" }
}

// Drone Dispatched
{
  title: "Drone On The Way! 🚁",
  body: "Your order is on the way. ETA: 10 minutes",
  data: { orderId, type: "order_delivering" }
}

// Order Delivered
{
  title: "Order Delivered 🎉",
  body: "Your order has been delivered. Enjoy!",
  data: { orderId, type: "order_delivered" }
}

// Order Cancelled
{
  title: "Order Cancelled ❌",
  body: "Your order has been cancelled",
  data: { orderId, type: "order_cancelled" }
}
```

## Testing

### 1. Test Function Manually
```bash
curl -X POST http://localhost:3000/execute \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-id",
    "title": "Test Notification",
    "body": "This is a test"
  }'
```

### 2. Check Logs
Trong Appwrite Console → Functions → send-notification → Executions

### 3. Verify on Device
- Mở mobile app
- Check notification appears
- Tap notification → should navigate to order tracking

## Troubleshooting

### Error: User has no FCM token
**Solution:** User chưa login hoặc chưa grant notification permission. 
Check `user.fcmToken` field trong database.

### Error: Expo Push API failed
**Solution:** 
1. Check FCM token format (phải bắt đầu bằng `ExpoToken[...]`)
2. Check Expo project ID trong mobile/app.json
3. Try sending test notification via https://expo.dev/notifications

### Error: Permission denied
**Solution:** API Key cần có permissions:
- `databases.read` (để đọc user.fcmToken)
- `databases.write` (để lưu notification record)

## Production Checklist

- [ ] API Key với proper permissions
- [ ] Environment variables configured
- [ ] Function deployed successfully
- [ ] Test notification sent
- [ ] Event triggers configured (optional)
- [ ] Error logging enabled
- [ ] Rate limiting considered (nếu volume cao)
