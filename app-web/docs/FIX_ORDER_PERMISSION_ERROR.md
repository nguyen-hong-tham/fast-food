# 🔧 FIX: Order Failed - Appwrite Permissions Setup

## ❌ Lỗi Gặp Phải

```
Order Failed
Failed to place order. Please make sure you have added 
the orders permissions in Appwrite Console.
```

**Error Log:**
```
Order error: Error: AppwriteException...
```

---

## 🎯 Nguyên Nhân

Collection `orders` trong Appwrite **chưa có permissions** cho phép users tạo documents mới.

---

## ✅ Giải Pháp - Cấu Hình Permissions

### **Bước 1: Truy Cập Appwrite Console**

1. Mở browser, truy cập: **https://cloud.appwrite.io/**
2. Đăng nhập vào account của bạn
3. Chọn project: **SGU Fastfood Deli** (hoặc tên project của bạn)

---

### **Bước 2: Vào Collection Orders**

1. Click **Databases** trong sidebar bên trái
2. Click vào database có ID: `68da5e73002cb68e70af`
3. Tìm và click vào collection: **`orders`**

---

### **Bước 3: Cấu Hình Permissions**

#### **Tab Settings → Permissions**

Trong collection `orders`, click tab **Settings** (góc phải màn hình), sau đó scroll xuống **Permissions**.

#### **Xóa Permissions Cũ (nếu có)**
- Click vào icon 🗑️ để xóa các permissions cũ không đúng

#### **Thêm Permissions Mới:**

##### **1. Permission cho "Any" - Cho phép tạo order**

Click **"Add Role"**, chọn:
```
Role Type: Any
Permissions:
  ✓ Create
  ✗ Read
  ✗ Update
  ✗ Delete
```

**Giải thích:** 
- `Any` = Bất kỳ user đã authenticated nào
- Cho phép họ **tạo** orders mới

---

##### **2. Permission cho "Users" - Cho phép đọc orders của mình**

Click **"Add Role"**, chọn:
```
Role Type: Users
Permissions:
  ✗ Create
  ✓ Read
  ✗ Update
  ✗ Delete
```

**Giải thích:**
- Users có thể **xem** (Read) các orders
- Appwrite sẽ tự động filter để users chỉ thấy orders của họ (nếu bạn dùng Query.equal('user', userId))

---

##### **3. Permission cho Admin (Optional - nếu có admin role)**

Nếu bạn có admin users (với attribute `role: 'admin'`), thêm:

Click **"Add Role"**, chọn:
```
Role Type: Custom
Label: admin
Permissions:
  ✓ Create
  ✓ Read
  ✓ Update
  ✓ Delete
```

**Giải thích:**
- Admin có full permissions để quản lý orders

---

### **Bước 4: Enable Document Security**

Trong **Settings** tab của collection `orders`:

1. Scroll xuống phần **Security**
2. Đảm bảo **Document Security** is **Enabled** (màu xanh)

```
Document Security: [Enabled]
```

**Giải thích:**
- Document Security cho phép bạn set permissions chi tiết hơn
- Mỗi document có thể có permissions riêng

---

### **Bước 5: Kiểm Tra Permissions Attributes**

Đảm bảo collection `orders` có các attributes sau:

#### **Required Attributes:**

1. **user** (String, required)
   - Relationship to users collection
   - Stores user ID who created the order

2. **items** (String, required)
   - JSON string of order items

3. **total** (Float/Double, required)
   - Total order amount

4. **status** (String, required)
   - Order status: pending, processing, delivered, cancelled

5. **deliveryAddress** (String, required)
   - Delivery address

6. **phone** (String, required)
   - Contact phone number

7. **recipientName** (String, optional)
   - Recipient name

8. **notes** (String, optional)
   - Order notes

9. **createdAt** (DateTime, required)
   - Order creation timestamp

10. **updatedAt** (DateTime, required)
    - Last update timestamp

---

## 🔍 Permissions Summary

### **Final Permissions Setup:**

```yaml
Collection: orders
Document Security: Enabled

Permissions:
  1. Role: Any
     - Create: ✓
     Purpose: Allow authenticated users to create orders

  2. Role: Users
     - Read: ✓
     Purpose: Allow users to read orders (filtered by user ID)

  3. Role: Custom (admin) [Optional]
     - Create: ✓
     - Read: ✓
     - Update: ✓
     - Delete: ✓
     Purpose: Admin full control
```

---

## 🧪 Test Sau Khi Cấu Hình

### **Bước 1: Restart App**

```bash
# Trong terminal node (nơi chạy expo)
# Press Ctrl+C để stop
# Sau đó:
cd app-web
npm start
```

### **Bước 2: Test Order Flow**

1. Mở app trong Expo Go
2. Đăng nhập với user account
3. Thêm items vào cart
4. Click "Confirm Order"
5. Điền thông tin delivery
6. Click "Confirm"

### **Bước 3: Verify**

✅ **Success Indicators:**
- Modal "Order Placed! 🎉" hiển thị
- Order history có order mới
- Không có error "AppwriteException"

❌ **Still Failing?**
- Check Appwrite Console → Logs
- Verify user is authenticated
- Check permissions again

---

## 🔥 Common Issues & Solutions

### **Issue 1: "Unauthorized" Error**

**Nguyên nhân:** User chưa đăng nhập hoặc session expired

**Fix:**
```typescript
// Check trong code cart.tsx
if (!user) {
    Alert.alert('Login Required', 'Please login to place an order.');
    return;
}
```

---

### **Issue 2: "Invalid Document Structure" Error**

**Nguyên nhân:** Thiếu required fields hoặc sai data type

**Fix:** Kiểm tra orderData trong `cart.tsx`:

```typescript
await createOrder({
    user: user!.$id,              // ✓ Required
    items: JSON.stringify(items), // ✓ Required, must be string
    total: finalTotal,            // ✓ Required, must be number
    status: 'pending',            // ✓ Required
    deliveryAddress: address,     // ✓ Required
    phone: phone,                 // ✓ Required
    recipientName: name,          // ✓ Optional
    notes: notes,                 // ✓ Optional
});
```

---

### **Issue 3: "Permission Denied" Even After Setup**

**Nguyên nhân:** Cache hoặc session cũ

**Fix:**
1. Clear Expo cache:
   ```bash
   npx expo start -c
   ```
2. Logout và login lại trong app
3. Check Appwrite Console → Authentication → Sessions
4. Delete old sessions nếu có

---

## 📊 Verification Checklist

### **Before Testing:**
- [ ] Appwrite Console → Database → orders collection exists
- [ ] Permissions tab has "Any" with Create permission
- [ ] Permissions tab has "Users" with Read permission
- [ ] Document Security is Enabled
- [ ] All required attributes exist in collection
- [ ] User is logged in (check AuthStore)

### **During Testing:**
- [ ] No console errors in Metro bundler
- [ ] No red error screen in Expo Go
- [ ] Network request to Appwrite succeeds

### **After Success:**
- [ ] Order appears in Appwrite Console → Database → orders
- [ ] Order appears in app's Order History
- [ ] Order has correct user ID
- [ ] Order has correct data (items, total, address)

---

## 🎯 Alternative: Programmatic Permission Setup

Nếu bạn muốn setup permissions bằng code (advanced):

```typescript
// File: scripts/setup-permissions.js
import { Client, Databases, Permission, Role } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('YOUR_PROJECT_ID')
    .setKey('YOUR_API_KEY'); // API Key from Appwrite Console

const databases = new Databases(client);

async function setupOrdersPermissions() {
    try {
        // Update collection permissions
        await databases.updateCollection(
            '68da5e73002cb68e70af', // Database ID
            'orders',                // Collection ID
            'orders',                // Collection Name
            [
                Permission.create(Role.any()),
                Permission.read(Role.users()),
            ]
        );
        
        console.log('✅ Permissions updated successfully!');
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

setupOrdersPermissions();
```

**Run:**
```bash
node scripts/setup-permissions.js
```

---

## 📝 Code Changes (If Needed)

### **Update Error Handling in cart.tsx:**

```typescript
} catch (error) {
    console.error('Order error:', error);
    
    // Better error message
    const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
    
    if (errorMessage.includes('permission') || errorMessage.includes('Unauthorized')) {
        Alert.alert(
            'Permission Error',
            'Unable to create order. Please contact support.\n\nTechnical: ' + errorMessage,
            [{ text: 'OK' }]
        );
    } else {
        Alert.alert(
            'Order Failed',
            'Failed to place order. Please try again.\n\nError: ' + errorMessage,
            [{ text: 'OK' }]
        );
    }
} finally {
    setIsOrdering(false);
}
```

---

## 🔗 Related Documentation

- [Appwrite Permissions Guide](https://appwrite.io/docs/permissions)
- [Appwrite Database Documentation](https://appwrite.io/docs/databases)
- [Collection Security](https://appwrite.io/docs/databases#security)

---

## ✅ Success Criteria

After following this guide, you should be able to:

1. ✅ Create orders without "Permission Denied" errors
2. ✅ See orders in Appwrite Console → Database → orders
3. ✅ View orders in app's Order History
4. ✅ Admin can see all orders in admin dashboard

---

## 📞 Still Having Issues?

1. **Check Appwrite Logs:**
   - Appwrite Console → Overview → Logs
   - Look for error details

2. **Check App Logs:**
   - Metro bundler terminal
   - Expo Go app console

3. **Verify User Authentication:**
   ```typescript
   // Add this log in cart.tsx before createOrder
   console.log('User ID:', user.$id);
   console.log('User authenticated:', !!user);
   ```

4. **Test with Appwrite REST API:**
   ```bash
   curl -X POST \
     https://cloud.appwrite.io/v1/databases/68da5e73002cb68e70af/collections/orders/documents \
     -H "X-Appwrite-Project: YOUR_PROJECT_ID" \
     -H "X-Appwrite-JWT: YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "documentId": "unique()",
       "data": {
         "user": "USER_ID",
         "items": "[]",
         "total": 100,
         "status": "pending"
       }
     }'
   ```

---

**Updated**: October 14, 2025  
**Issue**: Order Creation Permission Denied  
**Status**: ✅ Fixed with proper permissions setup
