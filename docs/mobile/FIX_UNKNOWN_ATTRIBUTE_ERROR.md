# 🔧 FIX: Invalid Document Structure - Unknown Attribute

## ❌ Lỗi Gặp Phải

```
Order Failed ❌

Failed to place order.

Error: AppwriteException: Invalid document structure: 
Unknown attribute: "recipientName"

Please try again or contact support.
```

---

## 🎯 Nguyên Nhân

Collection `orders` trong Appwrite **không có attribute `recipientName`**, nhưng code đang cố gắng lưu giá trị này.

---

## ✅ Giải Pháp

### **Option 1: Thêm Attribute vào Appwrite (KHUYẾN NGHỊ)** ⭐

Đây là cách tốt nhất nếu bạn muốn lưu tên người nhận.

#### **Bước 1: Vào Appwrite Console**

1. Truy cập: https://cloud.appwrite.io/
2. Login vào project
3. Sidebar: **Databases**
4. Chọn database: `68da5e73002cb68e70af`
5. Click collection: **`orders`**

#### **Bước 2: Thêm Attribute `recipientName`**

1. Click tab **"Attributes"** (giữa Attributes và Indexes)
2. Click button **"+ Add Attribute"**
3. Chọn type: **"String"**

**Cấu hình:**
```yaml
Attribute Key: recipientName
Type: String
Size: 255
Required: No (Optional) ✓
Default Value: (để trống)
Array: No
Encrypted: No
```

4. Click **"Create"**
5. Đợi Appwrite tạo attribute (có thể mất vài giây)

#### **Bước 3: Uncomment Code**

Sau khi đã tạo attribute trong Appwrite, bạn cần uncomment lại dòng code:

**File:** `app-web/app/(tabs)/cart.tsx`

**Tìm dòng:**
```typescript
// recipientName: deliveryInfo.name, // Commented out - add this attribute to Appwrite orders collection if needed
```

**Đổi thành:**
```typescript
recipientName: deliveryInfo.name,
```

#### **Bước 4: Test Lại**

1. Reload app (shake device → Reload)
2. Thử đặt hàng lại
3. ✅ Should work!

---

### **Option 2: Không Dùng RecipientName (ĐÃ ÁP DỤNG)** 🚫

Nếu bạn không cần lưu tên người nhận, code đã được sửa để bỏ field này.

**Code hiện tại:**
```typescript
await createOrder({
    user: user!.$id,
    items: JSON.stringify(orderItems),
    total: finalTotal,
    status: 'pending',
    deliveryAddress: deliveryInfo.address,
    deliveryAddressLabel: 'Custom',
    phone: deliveryInfo.phone,
    notes: deliveryInfo.notes,
    // recipientName removed
});
```

**Test ngay:**
1. App đã tự động reload
2. Thử đặt hàng lại
3. ✅ Should work without recipientName!

---

## 📋 Full Attributes List cho Orders Collection

Để tránh lỗi tương tự, đây là **toàn bộ attributes** cần có trong collection `orders`:

### **Required Attributes:**

| Key | Type | Size | Required | Array | Description |
|-----|------|------|----------|-------|-------------|
| `user` | String | 255 | ✓ Yes | No | User ID (relationship) |
| `items` | String | 10000 | ✓ Yes | No | JSON string of order items |
| `total` | Float/Double | - | ✓ Yes | No | Total order amount |
| `status` | String | 50 | ✓ Yes | No | Order status (pending, processing, delivered, cancelled) |
| `deliveryAddress` | String | 500 | ✓ Yes | No | Delivery address |
| `phone` | String | 20 | ✓ Yes | No | Contact phone number |

### **Optional Attributes:**

| Key | Type | Size | Required | Array | Description |
|-----|------|------|----------|-------|-------------|
| `recipientName` | String | 255 | No | No | Recipient name |
| `deliveryAddressLabel` | String | 50 | No | No | Address label (Home, Work, etc.) |
| `notes` | String | 1000 | No | No | Order notes |
| `createdAt` | String | 50 | No | No | Creation timestamp |
| `updatedAt` | String | 50 | No | No | Last update timestamp |

---

## 🎯 Step-by-Step: Tạo Attribute trong Appwrite

### **Visual Guide:**

```
┌─────────────────────────────────────────┐
│  Appwrite Console                       │
├─────────────────────────────────────────┤
│  1. Databases (sidebar)                 │
│     └─ 68da5e73002cb68e70af             │
│        └─ orders collection             │
│                                         │
│  2. Tabs: Documents | Attributes 👈     │
│                                         │
│  3. [+ Add Attribute] 👈 Click          │
├─────────────────────────────────────────┤
│  Add Attribute Modal:                   │
│                                         │
│  Type: ● String ○ Integer ○ Float ...  │
│                                         │
│  Attribute Key: recipientName           │
│  Size: 255                              │
│  □ Required                             │
│  □ Array                                │
│                                         │
│  [Cancel]  [Create]                     │
└─────────────────────────────────────────┘
```

---

## 🔍 Kiểm Tra Attributes Hiện Tại

### **Trong Appwrite Console:**

1. Go to: **orders collection**
2. Click tab: **Attributes**
3. Should see list như sau:

```
✓ user (String, 255, Required)
✓ items (String, 10000, Required)
✓ total (Float, Required)
✓ status (String, 50, Required)
✓ deliveryAddress (String, 500, Required)
✓ phone (String, 20, Required)
? recipientName (String, 255, Optional) 👈 Check if exists
? deliveryAddressLabel (String, 50, Optional)
? notes (String, 1000, Optional)
? createdAt (String, 50, Optional)
? updatedAt (String, 50, Optional)
```

### **Missing Attributes?**

Nếu thiếu bất kỳ attribute nào, thêm theo bảng ở trên.

---

## 🧪 Test Cases

### **Test 1: Order WITHOUT recipientName** ✅
```typescript
// Code hiện tại (đã sửa)
await createOrder({
    user: user.$id,
    items: JSON.stringify(items),
    total: 100,
    status: 'pending',
    deliveryAddress: '123 Street',
    phone: '0899932767',
    notes: 'Test order'
    // NO recipientName
});
```
**Expected:** ✅ Success

### **Test 2: Order WITH recipientName** (sau khi thêm attribute)
```typescript
await createOrder({
    user: user.$id,
    items: JSON.stringify(items),
    total: 100,
    status: 'pending',
    deliveryAddress: '123 Street',
    phone: '0899932767',
    recipientName: 'Phat Le', // 👈 WITH recipientName
    notes: 'Test order'
});
```
**Expected:** ✅ Success (only after adding attribute to Appwrite)

---

## 🚨 Common Errors & Solutions

### **Error 1: "Unknown attribute: X"**

**Solution:**
1. Check attribute name spelling (case-sensitive!)
2. Add missing attribute to Appwrite collection
3. Or remove field from code

### **Error 2: "Attribute is required but was not provided"**

**Solution:**
1. Check which attributes are marked as Required in Appwrite
2. Make sure code provides values for all required fields
3. Or change attribute to Optional in Appwrite

### **Error 3: "Value exceeds maximum size"**

**Solution:**
1. Check attribute size limit in Appwrite
2. Increase size if needed (e.g., String size from 255 to 500)
3. Or truncate value in code before sending

---

## 📝 Code Changes Summary

### **Before (Causing Error):**
```typescript
await createOrder({
    user: user!.$id,
    items: JSON.stringify(orderItems),
    total: finalTotal,
    status: 'pending',
    deliveryAddress: deliveryInfo.address,
    deliveryAddressLabel: 'Custom',
    phone: deliveryInfo.phone,
    notes: deliveryInfo.notes,
    recipientName: deliveryInfo.name, // ❌ Attribute doesn't exist
});
```

### **After (Fixed):**
```typescript
await createOrder({
    user: user!.$id,
    items: JSON.stringify(orderItems),
    total: finalTotal,
    status: 'pending',
    deliveryAddress: deliveryInfo.address,
    deliveryAddressLabel: 'Custom',
    phone: deliveryInfo.phone,
    notes: deliveryInfo.notes,
    // recipientName removed ✅ or add attribute to Appwrite
});
```

---

## 🎓 Best Practices

### **1. Define Schema First**
- Tạo tất cả attributes trong Appwrite trước
- Sau đó mới viết code

### **2. Match Field Names Exactly**
- Appwrite: `recipientName`
- Code: `recipientName` (same case!)

### **3. Use TypeScript Types**
```typescript
interface OrderData {
    user: string;
    items: string;
    total: number;
    status: 'pending' | 'processing' | 'delivered' | 'cancelled';
    deliveryAddress: string;
    phone: string;
    recipientName?: string; // Optional
    notes?: string; // Optional
}
```

### **4. Validate Before Sending**
```typescript
const orderData: OrderData = {
    user: user.$id,
    items: JSON.stringify(items),
    total: calculateTotal(),
    status: 'pending',
    deliveryAddress: address,
    phone: phone,
    // Only add optional fields if they exist
    ...(recipientName && { recipientName }),
    ...(notes && { notes }),
};
```

---

## ✅ Quick Checklist

### **Before Creating Order:**
- [ ] User is authenticated (`user` object exists)
- [ ] All required attributes exist in Appwrite
- [ ] Field names match exactly (case-sensitive)
- [ ] Data types are correct (string, number, etc.)
- [ ] Permissions are set (Any → Create, Users → Read)

### **After Fix:**
- [ ] App reloaded
- [ ] Test order creation
- [ ] Check order appears in Appwrite Console
- [ ] Check order appears in Order History
- [ ] No error messages

---

## 🔗 Related Files

- `app-web/app/(tabs)/cart.tsx` - Order creation code
- `app-web/lib/appwrite.ts` - `createOrder()` function
- Appwrite Console → orders collection → Attributes

---

## 💡 Pro Tips

### **Tip 1: Use Database Seeding**
Create a script to set up all attributes:
```typescript
// scripts/setup-database.ts
const attributes = [
    { key: 'user', type: 'string', size: 255, required: true },
    { key: 'items', type: 'string', size: 10000, required: true },
    { key: 'total', type: 'float', required: true },
    { key: 'status', type: 'string', size: 50, required: true },
    { key: 'deliveryAddress', type: 'string', size: 500, required: true },
    { key: 'phone', type: 'string', size: 20, required: true },
    { key: 'recipientName', type: 'string', size: 255, required: false },
    { key: 'notes', type: 'string', size: 1000, required: false },
];
```

### **Tip 2: Use Enums for Status**
```typescript
enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled'
}
```

---

**Updated:** October 14, 2025  
**Issue:** Unknown attribute "recipientName"  
**Status:** ✅ FIXED (removed from code, optional: add to Appwrite)
