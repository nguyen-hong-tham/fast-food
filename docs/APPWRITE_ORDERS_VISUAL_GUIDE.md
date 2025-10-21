# 📸 Hình ảnh hướng dẫn cấu hình Appwrite - Orders Collection

## 🎯 Mục đích
File này cung cấp hướng dẫn trực quan để cấu hình collection `orders` trong Appwrite Console.

---

## 📋 1. Cấu hình Attribute `status` (Quan trọng nhất)

### Hình ảnh minh họa:

```
╔═══════════════════════════════════════════════════════════╗
║                    APPWRITE CONSOLE                       ║
║                   Edit Attribute: status                  ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Attribute ID: status                                     ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ status                                              │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  Type: Enum                                              ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ [ Enum ▼ ]                                          │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  Elements (one per line):                                ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ pending                                             │ ║
║  │ confirmed                                           │ ║
║  │ preparing                                           │ ║
║  │ ready                                               │ ║
║  │ delivering                                          │ ║
║  │ delivered                                           │ ║
║  │ cancelled                                           │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  Default value:                                          ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ pending                                             │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  ☑ Required                                              ║
║  ☐ Array                                                 ║
║                                                           ║
║  [Cancel]                           [Update Attribute]   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

### ⚠️ Lưu ý quan trọng:
- ✅ Tất cả giá trị phải viết **THƯỜNG**
- ✅ KHÔNG có khoảng trắng đầu/cuối
- ✅ Default value = `pending`
- ✅ Required: PHẢI CHECK ☑
- ✅ Array: KHÔNG CHECK ☐

---

## 📋 2. Cấu hình Attribute `paymentMethod`

```
╔═══════════════════════════════════════════════════════════╗
║                    APPWRITE CONSOLE                       ║
║              Edit Attribute: paymentMethod                ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Attribute ID: paymentMethod                             ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ paymentMethod                                       │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  Type: Enum                                              ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ [ Enum ▼ ]                                          │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  Elements (one per line):                                ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ cod                                                 │ ║
║  │ vnpay                                               │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  ☑ Required                                              ║
║  ☐ Array                                                 ║
║                                                           ║
║  [Cancel]                           [Update Attribute]   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📋 3. Cấu hình Attribute `paymentStatus` (MỚI - cần thêm)

```
╔═══════════════════════════════════════════════════════════╗
║                    APPWRITE CONSOLE                       ║
║              Create Attribute: paymentStatus              ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Attribute ID: paymentStatus                             ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ paymentStatus                                       │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  Type: Enum                                              ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ [ Enum ▼ ]                                          │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  Elements (one per line):                                ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ pending                                             │ ║
║  │ paid                                                │ ║
║  │ failed                                              │ ║
║  │ refunded                                            │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  Default value:                                          ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ pending                                             │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  ☑ Required                                              ║
║  ☐ Array                                                 ║
║                                                           ║
║  [Cancel]                           [Create Attribute]   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📋 4. Cấu hình Attribute `items` (Cần tăng size)

### ❌ TRƯỚC (Không đủ - Size: 1000):
```
╔═══════════════════════════════════════════════════════════╗
║  Attribute: items                                        ║
║  Type: String                                            ║
║  Size: 1000          ⚠️ QUÁ NHỎ!                         ║
║  Required: ✅ Yes                                         ║
║  Array: ❌ No                                             ║
╚═══════════════════════════════════════════════════════════╝
```

### ✅ SAU (Đủ lớn - Size: 10000):
```
╔═══════════════════════════════════════════════════════════╗
║                    APPWRITE CONSOLE                       ║
║                 Edit Attribute: items                     ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Attribute ID: items                                     ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ items                                               │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  Type: String                                            ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ [ String ▼ ]                                        │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  Size:                                                   ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ 10000              ✅ ĐỦ LỚN                         │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  ☑ Required                                              ║
║  ☐ Array                                                 ║
║                                                           ║
║  [Cancel]                           [Update Attribute]   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📋 5. Cấu hình Attribute `recipientName` (MỚI - optional)

```
╔═══════════════════════════════════════════════════════════╗
║                    APPWRITE CONSOLE                       ║
║             Create Attribute: recipientName               ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  Attribute ID: recipientName                             ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ recipientName                                       │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  Type: String                                            ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ [ String ▼ ]                                        │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  Size:                                                   ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ 255                                                 │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  ☐ Required          (KHÔNG CHECK - optional)            ║
║  ☐ Array                                                 ║
║                                                           ║
║  [Cancel]                           [Create Attribute]   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📋 6. Tổng quan tất cả Attributes

### Danh sách đầy đủ trong Orders Collection:

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                        ORDERS COLLECTION - COLUMNS                           ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  Column name                      Type          Required    Default          ║
║  ═════════════════════════════════════════════════════════════════════════   ║
║  📝 $id                           String        -           -                ║
║  📦 items                         String        required    NULL             ║
║                                   Size: 10000                                ║
║  📊 status                        Enum          required    "pending"        ║
║                                   (7 values)                                 ║
║  📍 deliveryAddress               String        required    NULL             ║
║                                   Size: 500                                  ║
║  🏷️  deliveryAddressLabel         String        -           NULL             ║
║                                   Size: 100                                  ║
║  📞 phone                         String        required    NULL             ║
║                                   Size: 20                                   ║
║  📝 notes                         String        -           NULL             ║
║                                   Size: 1000                                 ║
║  📅 createdAt                     DateTime      required    NULL             ║
║  📅 updatedAt                     DateTime      required    NULL             ║
║  👤 recipientName                 String        -           NULL             ║
║                                   Size: 255                                  ║
║  💳 paymentMethod                 Enum          required    NULL             ║
║                                   (cod, vnpay)                               ║
║  💰 paymentStatus                 Enum          required    "pending"        ║
║                                   (4 values)                                 ║
║  🔗 restaurantId                  Relationship  required    -                ║
║                                   Many to One → restaurants                  ║
║  🔗 userId                        Relationship  required    -                ║
║                                   Many to One → user                         ║
║  💵 total                         Float         required    NULL             ║
║                                   Min: 0                                     ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🔍 7. Cách kiểm tra cấu hình hiện tại

### Bước 1: Mở Appwrite Console
1. Truy cập: https://cloud.appwrite.io
2. Login với tài khoản của bạn
3. Chọn Project: **sgu_cnpm_foodfast**

### Bước 2: Vào Database
1. Click menu bên trái → **Databases**
2. Chọn database của bạn (thường là ID: `68da5e73002cb68e70af`)
3. Click vào collection **orders**

### Bước 3: Kiểm tra Columns
1. Click tab **Columns** (hoặc **Attributes**)
2. Xem danh sách tất cả attributes
3. So sánh với bảng tổng quan ở trên

### Bước 4: Kiểm tra từng attribute
1. Click vào attribute cần kiểm tra
2. Xem chi tiết Type, Size, Required, Default
3. Đối chiếu với hướng dẫn

---

## ⚠️ 8. Các lỗi thường gặp và cách fix

### Lỗi 1: "Attribute 'status' has invalid format"

**Nguyên nhân:**
```
╔═══════════════════════════════════════════════════════════╗
║  Enum elements có khoảng trắng thừa:                     ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │  pending    ⚠️ (có space đầu)                       │ ║
║  │ confirmed   ⚠️ (có space cuối)                      │ ║
║  │ Pending     ⚠️ (viết hoa)                           │ ║
║  └─────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════╝
```

**Cách fix:**
```
╔═══════════════════════════════════════════════════════════╗
║  Viết lại đúng (không space, viết thường):              ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ pending     ✅                                       │ ║
║  │ confirmed   ✅                                       │ ║
║  │ preparing   ✅                                       │ ║
║  └─────────────────────────────────────────────────────┘ ║
╚═══════════════════════════════════════════════════════════╝
```

---

### Lỗi 2: "Document too large" hoặc "Value exceeds size limit"

**Nguyên nhân:**
```
╔═══════════════════════════════════════════════════════════╗
║  items size quá nhỏ:                                     ║
║  Size: 1000    ⚠️ KHÔNG ĐỦ                              ║
╚═══════════════════════════════════════════════════════════╝
```

**Cách fix:**
```
╔═══════════════════════════════════════════════════════════╗
║  Tăng size lên:                                          ║
║  Size: 10000   ✅ ĐỦ LỚN                                 ║
╚═══════════════════════════════════════════════════════════╝
```

---

### Lỗi 3: "Missing required attribute: paymentStatus"

**Nguyên nhân:**
- Attribute `paymentStatus` chưa được tạo trong Appwrite

**Cách fix:**
- Tạo attribute mới theo hướng dẫn ở phần 3

---

## ✅ 9. Checklist cuối cùng

### Kiểm tra trong Appwrite Console:

- [ ] ✅ Attribute `status`: Enum, 7 values, default = "pending"
- [ ] ✅ Attribute `paymentMethod`: Enum, 2 values (cod, vnpay)
- [ ] ✅ Attribute `paymentStatus`: Enum, 4 values, default = "pending"
- [ ] ✅ Attribute `items`: String, Size = 10000
- [ ] ✅ Attribute `recipientName`: String, Size = 255, Optional
- [ ] ✅ Attribute `total`: Float, Min = 0
- [ ] ✅ Attribute `deliveryAddress`: String, Size = 500
- [ ] ✅ Attribute `phone`: String, Size = 20
- [ ] ✅ Attribute `userId`: Relationship → user
- [ ] ✅ Attribute `restaurantId`: Relationship → restaurants
- [ ] ✅ Permissions: role:all có đầy đủ quyền

### Kiểm tra trong Code:

- [x] ✅ File `mobile/lib/appwrite.ts` đã update
- [x] ✅ Hàm `createOrderWithPayment` stringify `items`
- [x] ✅ Thêm field `paymentStatus` = "pending"
- [x] ✅ Thêm field `recipientName` = ""

---

## 🎓 10. Video tutorials (nếu cần)

Nếu bạn cần video hướng dẫn, xem các nguồn:
1. Appwrite YouTube Channel - "Creating Collections"
2. Appwrite Docs - Database Setup
3. Appwrite Discord - Community Support

---

## 📞 11. Liên hệ hỗ trợ

Nếu sau khi làm theo vẫn gặp lỗi:

1. **Chụp ảnh màn hình:**
   - Appwrite Console → orders → Columns (toàn bộ danh sách)
   - Appwrite Console → orders → Columns → status (chi tiết)
   - Console logs (trong app khi đặt hàng)

2. **Cung cấp thông tin:**
   - Appwrite Project ID
   - Database ID
   - Collection ID của orders
   - Error message đầy đủ

3. **Gửi đến:**
   - GitHub Issues của project
   - Appwrite Discord
   - Hoặc developer support
