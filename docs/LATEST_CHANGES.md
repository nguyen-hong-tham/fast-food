# 🔧 Cập nhật: Sửa lỗi Orders và thay đổi Tab Layout

**Ngày:** 22 Tháng 10, 2025  
**Trạng thái:** ✅ Hoàn tất

---

## 📋 Những gì đã thay đổi

### 1. ✅ Sửa lỗi tạo đơn hàng (Orders)

#### Vấn đề:
- Lỗi "Invalid document structure: Attribute 'status' has invalid format"
- Appwrite reject giá trị dù enum đã đúng

#### Giải pháp:
Thay đổi cách gửi payload trong `mobile/lib/appwrite.ts`:

**TRƯỚC:**
```typescript
const order = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    ID.unique(),
    {
        userId: orderData.userId,
        restaurantId: orderData.restaurantId,
        status: initialStatus,
        // ... tất cả fields một lần
        recipientName: '',  // ❌ Empty string có thể gây lỗi
    }
);
```

**SAU:**
```typescript
// ✅ Tạo payload động, chỉ thêm fields có giá trị
const orderPayload: any = {
    userId: orderData.userId,
    restaurantId: orderData.restaurantId,
    total: orderData.total,
    deliveryAddress: orderData.deliveryAddress,
    phone: orderData.phone,
    items: JSON.stringify(orderData.items),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

// Chỉ thêm optional fields nếu có giá trị
if (orderData.deliveryAddressLabel) {
    orderPayload.deliveryAddressLabel = orderData.deliveryAddressLabel;
}
if (orderData.notes) {
    orderPayload.notes = orderData.notes;
}

// Thêm enum fields cuối cùng
orderPayload.status = initialStatus;
orderPayload.paymentMethod = orderData.paymentMethod;
orderPayload.paymentStatus = "pending";

// Log để debug
console.log("📤 SENDING PAYLOAD:", JSON.stringify(orderPayload, null, 2));

const order = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.ordersCollectionId,
    ID.unique(),
    orderPayload
);
```

**Lý do thay đổi:**
1. ✅ Không gửi `recipientName: ''` (empty string) - có thể gây conflict với schema
2. ✅ Chỉ gửi các optional fields khi có giá trị thực
3. ✅ Thêm log chi tiết để debug
4. ✅ Đảm bảo enum values được set chính xác cuối cùng

---

### 2. ✅ Thay đổi Tab Layout

#### Vấn đề:
- User muốn bỏ tab "Menu" (search.tsx)
- Thay thế bằng tab "Restaurants"

#### Giải pháp:
Cập nhật `mobile/app/(tabs)/_layout.tsx`:

**TRƯỚC:**
```tsx
<Tabs.Screen
    name='search'
    options={{
        title: 'Menu',
        tabBarIcon: ({ focused }) => <TabBarIcon title="Menu" icon={icons.menu} focused={focused} />
    }}
/>
```

**SAU:**
```tsx
<Tabs.Screen
    name='restaurants'
    options={{
        title: 'Restaurants',
        tabBarIcon: ({ focused }) => <TabBarIcon title="Restaurants" icon={icons.location} focused={focused} />
    }}
/>
{/* Hidden tabs */}
<Tabs.Screen
    name='search'
    options={{
        href: null, // Hide from tab bar
    }}
/>
```

**Thay đổi:**
1. ✅ Tab thứ 2 giờ là `restaurants` thay vì `search`
2. ✅ Dùng icon `location` cho restaurants
3. ✅ Tab `search` vẫn tồn tại nhưng ẩn khỏi tab bar (`href: null`)
4. ✅ Vẫn có thể navigate đến search screen bằng code

**Tab bar mới:**
```
┌─────────────────────────────────────────────┐
│  🏠 Home  📍 Restaurants  🛍️ Cart  👤 Profile │
└─────────────────────────────────────────────┘
```

---

## 🧪 Cách test

### Test 1: Tạo đơn hàng
1. Thêm món vào giỏ hàng
2. Vào Cart → Checkout
3. Điền thông tin đầy đủ
4. Chọn COD hoặc VNPay
5. Click "Place Order"

**Expected:**
- ✅ Không có lỗi console
- ✅ Order được tạo thành công
- ✅ Navigate đến payment-result hoặc payment-selection
- ✅ Console log hiển thị payload đầy đủ

**Console log mẫu:**
```
🧾 ORDER STATUS: pending
💳 PAYMENT METHOD: cod
📦 ORDER DATA: {
  userId: "user_12345",
  restaurantId: "rest_67890",
  total: 150000,
  deliveryAddress: "123 Nguyễn Văn Linh",
  phone: "0901234567"
}
📤 SENDING PAYLOAD: {
  "userId": "user_12345",
  "restaurantId": "rest_67890",
  "total": 150000,
  "deliveryAddress": "123 Nguyễn Văn Linh",
  "phone": "0901234567",
  "items": "[{...}]",
  "createdAt": "2025-10-22T...",
  "updatedAt": "2025-10-22T...",
  "deliveryAddressLabel": "Home",
  "notes": "Gọi chuông 2 lần",
  "status": "pending",
  "paymentMethod": "cod",
  "paymentStatus": "pending"
}
✅ Order created successfully: order_abc123
```

---

### Test 2: Tab Navigation
1. Mở app
2. Kiểm tra bottom tab bar

**Expected:**
- ✅ Tab thứ 2 hiển thị "Restaurants" với icon 📍
- ✅ Click vào tab Restaurants → Hiển thị danh sách nhà hàng
- ✅ Không còn tab "Menu"
- ✅ Search screen vẫn hoạt động nếu navigate bằng code

---

## 🔍 Debug nếu vẫn lỗi

### Nếu vẫn gặp lỗi "Invalid document structure":

1. **Kiểm tra console logs:**
   ```
   🧾 ORDER STATUS: ?
   📤 SENDING PAYLOAD: ?
   ```
   - Xem giá trị `status` có đúng là "pending" không
   - Xem payload có field nào lạ không

2. **Kiểm tra Appwrite Console:**
   - Vào Database → orders → Columns
   - Click vào attribute `status`
   - Đảm bảo:
     - ✅ Type: Enum
     - ✅ Elements: pending, confirmed, preparing, ready, delivering, delivered, cancelled
     - ✅ KHÔNG có khoảng trắng trong elements
     - ✅ Default value: `pending` (nếu có checkbox Required)

3. **Kiểm tra attribute `paymentStatus`:**
   - ✅ Type: Enum
   - ✅ Elements: pending, paid, failed, refunded
   - ✅ Default value: `pending`

4. **Kiểm tra attribute `items`:**
   - ✅ Type: String
   - ✅ Size: 10000 (đủ lớn)
   - ✅ Required: Yes

---

## 📝 Files đã thay đổi

### 1. `mobile/lib/appwrite.ts`
- Thay đổi hàm `createOrderWithPayment()`
- Tạo payload động thay vì static object
- Thêm logging chi tiết
- Lines thay đổi: ~315-350

### 2. `mobile/app/(tabs)/_layout.tsx`
- Thay thế tab `search` bằng `restaurants`
- Ẩn tab `search` khỏi tab bar
- Đổi icon và title
- Lines thay đổi: ~50-70

---

## ⚠️ Lưu ý quan trọng

### Về Orders:
1. **KHÔNG** gửi `recipientName` nếu không có giá trị
2. **CHỈ** gửi `deliveryAddressLabel` và `notes` nếu user nhập
3. **LUÔN** stringify `items` array thành JSON string
4. **LUÔN** set `paymentStatus` = "pending" khi tạo order mới

### Về Appwrite Schema:
1. Attribute `status` phải có **CHÍNH XÁC** 7 enum values
2. Không được có khoảng trắng trong enum elements
3. Phân biệt chữ hoa/thường (dùng lowercase: "pending" không phải "Pending")
4. Size của `items` phải đủ lớn (khuyến nghị: 10000)

### Về Tab Navigation:
1. Tab `search` vẫn tồn tại, chỉ ẩn khỏi tab bar
2. Có thể navigate đến search bằng: `router.push('/(tabs)/search')`
3. Tab `restaurants` sử dụng file `restaurants.tsx` đã có sẵn

---

## ✅ Checklist hoàn tất

- [x] ✅ Sửa code `createOrderWithPayment` trong appwrite.ts
- [x] ✅ Thêm payload logging
- [x] ✅ Chỉ gửi optional fields khi có giá trị
- [x] ✅ Thay đổi tab layout
- [x] ✅ Thay `search` bằng `restaurants`
- [x] ✅ Ẩn tab search khỏi tab bar
- [x] ✅ Không có compile errors

---

## 🚀 Next Steps

1. **Restart app để apply changes:**
   ```powershell
   cd mobile
   npx expo start --clear
   ```

2. **Test đặt hàng:**
   - Thử cả COD và VNPay
   - Kiểm tra console logs
   - Verify order trong Appwrite Console

3. **Test tab navigation:**
   - Click vào tab Restaurants
   - Xem danh sách nhà hàng
   - Verify icon và title đúng

4. **Nếu vẫn lỗi:**
   - Chụp screenshot console logs đầy đủ
   - Chụp screenshot Appwrite Console (columns tab)
   - Cung cấp payload đang gửi lên

---

## 📞 Support

Nếu cần hỗ trợ thêm, cung cấp:
1. Console logs từ `📤 SENDING PAYLOAD`
2. Error message đầy đủ
3. Screenshot Appwrite Console → orders → Columns
4. Screenshot của attribute `status` và `paymentStatus`
