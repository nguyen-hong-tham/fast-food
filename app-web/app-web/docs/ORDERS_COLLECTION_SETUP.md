# Setup Orders Collection - Appwrite Database

## 📋 HƯỚNG DẪN TẠO COLLECTION "ORDERS"

### Bước 1: Tạo Collection

1. Đăng nhập Appwrite Console
2. Databases → Chọn database hiện tại
3. Click **"Create Collection"**
4. Name: `orders`
5. Collection ID: `orders` (hoặc auto-generate)
6. Click **"Create"**

---

### Bước 2: Thêm Attributes

Click vào collection `orders` vừa tạo → Tab **"Attributes"**

#### 1. User ID
```
Type: String
Key: userId
Size: 255
Required: Yes
Array: No
```

#### 2. Items (Order Items - JSON)
```
Type: String (JSON format)
Key: items
Size: 65535 (max)
Required: Yes
Array: No
```

#### 3. Total
```
Type: Float (hoặc Integer nếu dùng cents)
Key: total
Size: -
Required: Yes
```

#### 4. Status
```
Type: Enum (hoặc String)
Key: status
Size: 50
Required: Yes
Default: pending
Allowed values: pending, preparing, ready, delivering, completed, cancelled
```

#### 5. Delivery Address
```
Type: String
Key: deliveryAddress
Size: 500
Required: Yes
```

#### 6. Delivery Address Label
```
Type: String
Key: deliveryAddressLabel
Size: 100
Required: No
Default: null
```

#### 7. Phone
```
Type: String
Key: phone
Size: 20
Required: Yes
```

#### 8. Notes
```
Type: String
Key: notes
Size: 1000
Required: No
Default: null
```

#### 9. Created At
```
Type: DateTime
Key: createdAt
Required: Yes
```

#### 10. Updated At
```
Type: DateTime
Key: updatedAt
Required: No
Default: null
```

#### 11. Estimated Delivery
```
Type: DateTime
Key: estimatedDelivery
Required: No
Default: null
```

---

### Bước 3: Set Permissions

Tab **"Settings"** → **"Permissions"**

#### Read Permission:
```
✅ Document Owner (users can read their own orders)
   Format: users/{$id}
   
✅ Any (admin) - Optional, for admin dashboard
```

#### Create Permission:
```
✅ Any (authenticated users)
```

#### Update Permission:
```
✅ Admin only (or specific role)
   - Users shouldn't update orders directly
   - Use Cloud Functions for status updates
```

#### Delete Permission:
```
✅ Admin only
```

---

### Bước 4: Create Indexes (Optional - for performance)

Tab **"Indexes"** → **"Create Index"**

#### Index 1: User Orders
```
Key: userId_createdAt_index
Type: key
Attributes: userId, createdAt
Order: ASC, DESC
```

#### Index 2: Status Index
```
Key: status_index
Type: key
Attributes: status
Order: ASC
```

---

## 📊 COLLECTION STRUCTURE

```javascript
orders Collection {
  $id: string (auto)
  userId: string (required) - Link to users collection
  items: string (JSON) (required) - Order items
  total: float (required) - Total amount
  status: enum (required) - Order status
  deliveryAddress: string (required) - Delivery address
  deliveryAddressLabel: string (optional) - Address label
  phone: string (required) - Contact phone
  notes: string (optional) - Special instructions
  createdAt: datetime (required) - Order timestamp
  updatedAt: datetime (optional) - Last update
  estimatedDelivery: datetime (optional) - ETA
}
```

---

## 🧪 TEST DATA MẪU

Sau khi tạo xong collection, tạo 1-2 documents test:

### Order 1: Completed
```json
{
  "userId": "user-account-id-here",
  "items": "[{\"menuItemId\":\"menu-1\",\"name\":\"Burger One\",\"price\":12.99,\"quantity\":2,\"image_url\":\"https://...\",\"customizations\":[{\"id\":\"c1\",\"name\":\"Extra Cheese\",\"price\":1.5,\"type\":\"addon\"}]}]",
  "total": 28.48,
  "status": "completed",
  "deliveryAddress": "123 Main Street, Springfield, IL 62704",
  "deliveryAddressLabel": "Home",
  "phone": "+1 555 123 4567",
  "notes": "Please ring the doorbell",
  "createdAt": "2025-10-01T10:30:00.000Z",
  "updatedAt": "2025-10-01T11:15:00.000Z",
  "estimatedDelivery": "2025-10-01T11:00:00.000Z"
}
```

### Order 2: Delivering
```json
{
  "userId": "user-account-id-here",
  "items": "[{\"menuItemId\":\"menu-2\",\"name\":\"Pizza One\",\"price\":18.99,\"quantity\":1,\"image_url\":\"https://...\"}]",
  "total": 18.99,
  "status": "delivering",
  "deliveryAddress": "221B Rose Street, Foodville, FL 12345",
  "deliveryAddressLabel": "Work",
  "phone": "+1 555 123 4567",
  "notes": null,
  "createdAt": "2025-10-08T14:00:00.000Z",
  "updatedAt": "2025-10-08T14:30:00.000Z",
  "estimatedDelivery": "2025-10-08T15:00:00.000Z"
}
```

### Order 3: Pending
```json
{
  "userId": "user-account-id-here",
  "items": "[{\"menuItemId\":\"menu-3\",\"name\":\"Fries\",\"price\":4.99,\"quantity\":2,\"image_url\":\"https://...\"},{\"menuItemId\":\"menu-4\",\"name\":\"Salad\",\"price\":8.99,\"quantity\":1,\"image_url\":\"https://...\"}]",
  "total": 18.97,
  "status": "pending",
  "deliveryAddress": "123 Main Street, Springfield, IL 62704",
  "deliveryAddressLabel": "Home",
  "phone": "+1 555 123 4567",
  "notes": "Extra dressing please",
  "createdAt": "2025-10-08T16:00:00.000Z",
  "updatedAt": null,
  "estimatedDelivery": "2025-10-08T17:00:00.000Z"
}
```

---

## 🔄 STATUS FLOW

```
pending → preparing → ready → delivering → completed
                                    ↓
                               cancelled
```

### Status Descriptions:
- **pending**: Order just placed, waiting confirmation
- **preparing**: Restaurant is preparing the food
- **ready**: Food ready for pickup/delivery
- **delivering**: Out for delivery
- **completed**: Successfully delivered
- **cancelled**: Order cancelled

---

## 🎯 ITEMS JSON FORMAT

Items field stores array of order items as JSON string:

```typescript
type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  customizations?: {
    id: string;
    name: string;
    price: number;
    type: string;
  }[];
}

// Store as: JSON.stringify(items)
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Collection "orders" created
- [ ] All 11 attributes added with correct types
- [ ] Permissions set correctly
- [ ] Indexes created (optional)
- [ ] Test documents created
- [ ] Collection ID copied to `lib/appwrite.ts`

---

## 📝 UPDATE APPWRITE CONFIG

Sau khi tạo xong, copy Collection ID và update file `lib/appwrite.ts`:

```typescript
export const appwriteConfig = {
  // ... other configs
  ordersCollectionId: "your-orders-collection-id-here", // ← Paste ID here
};
```

---

**DONE! Orders collection ready! 🎉**

Next: Create Order History UI screens
