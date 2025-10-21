# 🔧 Tổng hợp sửa lỗi "Invalid document structure" - Orders Collection

## 📋 Các lỗi gặp phải

### ❌ Lỗi 1: "Checkout error: Error: Invalid document structure"
- **Vị trí**: `mobile/app/checkout.tsx` → `handleProceedToPayment()`
- **Call stack**: `createOrderWithPayment()` trong `mobile/lib/appwrite.ts`

### ❌ Lỗi 2: "Error creating order: Invalid document structure"
- **Vị trí**: `mobile/lib/appwrite.ts` → `createOrderWithPayment()`
- **Nguyên nhân**: Attribute "status" has invalid format

### ❌ Lỗi 3: Value must be one of ("pending", "confirmed", "preparing", "ready", "delivering", "delivered", "cancelled")
- **Vị trí**: Appwrite Console → Collection `orders`
- **Nguyên nhân**: Enum không được cấu hình đúng hoặc giá trị gửi lên không đúng

---

## ✅ Các thay đổi đã thực hiện

### 1. Sửa file `mobile/lib/appwrite.ts`

**Thay đổi trong hàm `createOrderWithPayment`:**

#### ❌ TRƯỚC (Code cũ):
```typescript
export const createOrderWithPayment = async (orderData: {
    // ... các params
    paymentMethod: 'cod' | 'vnpay';
}) => {
    try {
        const getInitialOrderStatus = (paymentMethod: string): string => {
            switch (paymentMethod) {
                case 'cod':
                    return 'pending';
                case 'vnpay':
                    return 'pending';
                default:
                    return 'pending';
            }
        };

        const autoStatus = getInitialOrderStatus(orderData.paymentMethod);

        const order = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            ID.unique(),
            {
                userId: orderData.userId,
                restaurantId: orderData.restaurantId,
                status: autoStatus,
                total: orderData.total,
                deliveryAddress: orderData.deliveryAddress,
                deliveryAddressLabel: orderData.deliveryAddressLabel || '',
                phone: orderData.phone,
                notes: orderData.notes || '',
                paymentMethod: orderData.paymentMethod,
                items: orderData.items, // ❌ WRONG: Không stringify
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        );
```

#### ✅ SAU (Code mới):
```typescript
export const createOrderWithPayment = async (orderData: {
    // ... các params
    paymentMethod: 'cod' | 'vnpay';
    status?: string; // ✅ ADDED: Cho phép override status
}) => {
    try {
        // ✅ Đơn giản hóa logic
        const initialStatus = orderData.status || "pending";

        // ✅ Log chi tiết để debug
        console.log("🧾 ORDER STATUS:", initialStatus);
        console.log("💳 PAYMENT METHOD:", orderData.paymentMethod);
        console.log("📦 ORDER DATA:", {
            userId: orderData.userId,
            restaurantId: orderData.restaurantId,
            total: orderData.total,
            deliveryAddress: orderData.deliveryAddress,
            phone: orderData.phone
        });

        const order = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.ordersCollectionId,
            ID.unique(),
            {
                userId: orderData.userId,
                restaurantId: orderData.restaurantId,
                status: initialStatus,
                total: orderData.total,
                deliveryAddress: orderData.deliveryAddress,
                deliveryAddressLabel: orderData.deliveryAddressLabel || '',
                phone: orderData.phone,
                notes: orderData.notes || '',
                paymentMethod: orderData.paymentMethod,
                paymentStatus: "pending", // ✅ ADDED
                items: JSON.stringify(orderData.items), // ✅ FIXED: Stringify
                recipientName: '', // ✅ ADDED
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        );
```

**Các thay đổi chính:**
1. ✅ **Thêm `paymentStatus`**: Trường mới để theo dõi trạng thái thanh toán
2. ✅ **Thêm `recipientName`**: Trường tên người nhận (optional)
3. ✅ **Stringify `items`**: Chuyển array thành JSON string trước khi lưu
4. ✅ **Thêm logging**: Dễ dàng debug khi có lỗi
5. ✅ **Đơn giản hóa logic**: Bỏ hàm `getInitialOrderStatus()` phức tạp

---

### 2. Không thay đổi `mobile/app/checkout.tsx`

File này đã đúng, chỉ cần đảm bảo:
```typescript
const orderData = {
  userId: user.$id,
  restaurantId,
  items: items.map(item => ({
    menuItemId: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image_url: item.image_url,
    customizations: item.customizations
  })),
  total,
  deliveryAddress: deliveryAddress.trim(),
  deliveryAddressLabel: deliveryAddressLabel.trim(),
  phone: phone.trim(),
  notes: notes.trim(),
  paymentMethod: selectedPaymentMethod,
  status: "pending", // ✅ Đúng giá trị enum
};
```

---

## 🎯 Cấu hình Appwrite Console

### Bước 1: Kiểm tra attribute `status`

**Truy cập:**
```
Appwrite Console → Database → orders → Columns → status
```

**Cấu hình cần có:**
```
Type: Enum
Required: ✅ Yes
Array: ❌ No
Default: pending

Elements (viết thường, không có space):
  pending
  confirmed
  preparing
  ready
  delivering
  delivered
  cancelled
```

**⚠️ QUAN TRỌNG:**
- Phải viết **THƯỜNG TOÀN BỘ**
- KHÔNG có khoảng trắng đầu/cuối
- Mỗi giá trị một dòng

---

### Bước 2: Thêm attribute `paymentStatus` (nếu chưa có)

**Cấu hình:**
```
Type: Enum
Required: ✅ Yes
Array: ❌ No
Default: pending

Elements:
  pending
  paid
  failed
  refunded
```

**Cách tạo:**
1. Click "Create attribute"
2. Select "Enum"
3. Attribute ID: `paymentStatus`
4. Nhập elements như trên
5. Set default = "pending"
6. Click "Create"

---

### Bước 3: Kiểm tra attribute `items`

**Cấu hình cần có:**
```
Type: String
Size: 10000 (tăng từ 1000 lên 10000)
Required: ✅ Yes
Array: ❌ No
```

**⚠️ Trong ảnh của bạn, Size chỉ = 1000 → CẦN TĂNG LÊN**

**Cách sửa:**
1. Click vào attribute `items`
2. Click icon Edit (✏️)
3. Đổi Size: `1000` → `10000`
4. Click "Update"

---

### Bước 4: Thêm attribute `recipientName` (nếu chưa có)

**Cấu hình:**
```
Type: String
Size: 255
Required: ❌ No
Array: ❌ No
Default: (để trống)
```

---

## 📸 So sánh Schema với ảnh

### Theo ảnh Appwrite Console của bạn:

| Attribute | Type | Required | Hiện tại | Cần sửa |
|-----------|------|----------|----------|---------|
| `$id` | ID | - | ✅ OK | - |
| `items` | String | ✅ Yes | Size: 1000 | ❌ Tăng → 10000 |
| `status` | ? | ✅ Yes | ? | ⚠️ Kiểm tra enum |
| `deliveryAddress` | String | ✅ Yes | ✅ OK | - |
| `deliveryAddressLabel` | String | - | ? | - |
| `phone` | String | ✅ Yes | ✅ OK | - |
| `notes` | String | - | ✅ OK | - |
| `createdAt` | DateTime | ✅ Yes | ✅ OK | - |
| `updatedAt` | DateTime | ✅ Yes | ✅ OK | - |
| `recipientName` | String | - | ? | ❌ Có thể thiếu |
| `paymentStatus` | Enum | - | ❌ Thiếu | ❌ Cần thêm |
| `paymentMethod` | Enum | - | ✅ OK | - |

---

## 🧪 Cách test sau khi sửa

### 1. Restart app
```powershell
cd mobile
npx expo start --clear
```

### 2. Thử đặt hàng với COD
1. Thêm món vào giỏ
2. Vào Checkout
3. Chọn "Cash on Delivery"
4. Điền đầy đủ thông tin
5. Click "Place Order"

**Expected result:**
- ✅ Order được tạo thành công
- ✅ Navigate đến payment-result
- ✅ Không có lỗi console

### 3. Thử đặt hàng với VNPay
1. Thêm món vào giỏ
2. Vào Checkout
3. Chọn "VNPay"
4. Điền đầy đủ thông tin
5. Click "Pay with VNPay"

**Expected result:**
- ✅ Order được tạo thành công
- ✅ Navigate đến payment-selection
- ✅ Không có lỗi console

---

## 📝 Checklist hoàn tất

### Code
- [x] ✅ Sửa `mobile/lib/appwrite.ts` - thêm stringify cho `items`
- [x] ✅ Thêm `paymentStatus` field
- [x] ✅ Thêm `recipientName` field
- [x] ✅ Thêm logging để debug

### Appwrite Console
- [ ] ⏳ Kiểm tra enum `status` (7 giá trị)
- [ ] ⏳ Kiểm tra enum `paymentMethod` (2 giá trị: cod, vnpay)
- [ ] ⏳ Thêm enum `paymentStatus` (4 giá trị)
- [ ] ⏳ Tăng size của `items`: 1000 → 10000
- [ ] ⏳ Thêm attribute `recipientName` (optional)
- [ ] ⏳ Kiểm tra permissions (role:all)

### Testing
- [ ] ⏳ Test đặt hàng COD
- [ ] ⏳ Test đặt hàng VNPay
- [ ] ⏳ Kiểm tra dữ liệu trong Appwrite Console
- [ ] ⏳ Kiểm tra console logs không có lỗi

---

## 🔗 Tài liệu tham khảo

1. **APPWRITE_ORDERS_CONFIG.md** - Hướng dẫn tổng quan cấu hình
2. **APPWRITE_ORDERS_DETAILED_GUIDE.md** - Hướng dẫn chi tiết từng bước
3. [Appwrite Enum Docs](https://appwrite.io/docs/products/databases/collections#enum)

---

## 💡 Tips

### Nếu vẫn gặp lỗi "Invalid document structure"
1. Kiểm tra Appwrite Console logs
2. Thêm `console.log()` trước `createDocument()`
3. So sánh giá trị gửi lên với schema trong Appwrite
4. Kiểm tra type của từng field (string vs number)

### Nếu lỗi "Attribute not found"
- Nghĩa là code gửi field mà Appwrite không có
- Xóa field đó trong code hoặc thêm vào Appwrite

### Nếu lỗi "Missing required attribute"
- Nghĩa là thiếu field bắt buộc
- Thêm field đó vào code với giá trị hợp lệ

---

## 📞 Hỗ trợ

Nếu vẫn gặp lỗi, cung cấp:
1. Screenshot Appwrite Console → orders → Columns
2. Console logs đầy đủ
3. Dữ liệu `orderData` đang gửi lên
