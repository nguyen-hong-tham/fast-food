# 🎬 Video Hướng Dẫn: Tạo Orders Collection Từng Bước

## 📺 Hướng Dẫn Chi Tiết Có Hình Ảnh

---

## 🎯 BƯỚC 1: MỞ ORDERS COLLECTION

### Hình ảnh bạn đã gửi cho thấy:
```
✅ Bạn đã tạo collection "orders"
✅ Bạn đang ở tab "Rows" (Documents)
⚠️ Collection chưa có dữ liệu (You have no rows yet)
```

### Điều cần làm tiếp:
👉 **Click vào tab "Columns"** (bên cạnh tab "Rows")

---

## 🎯 BƯỚC 2: TẠO CÁC ATTRIBUTES (COLUMNS)

Bạn sẽ tạo **11 attributes**. Sau đây là từng bước chi tiết:

---

### 📝 ATTRIBUTE 1: user (RELATIONSHIP) ⭐ QUAN TRỌNG!

1. Click button **"+ Create Attribute"** (hoặc "Add Column")
2. Chọn type: **Relationship** (KHÔNG phải String!)
3. Điền form:
   ```
   Column key: user
   
   Related table: User (user)
   (Chọn collection User từ dropdown)
   
   Relation: Many to one
   (Many orders → One user)
   
   On deleting: Set NULL - set row ID as NULL in all related rows
   (Khi xóa user → user trong order = null)
   
   Two-way relationship: ❌ KHÔNG tick (one-way relationship)
   ```
4. Click **Create**

**💡 Giải thích**: 
- `userId` là **relationship** đến User collection
- **Many to One**: Nhiều orders thuộc về 1 user
- **One-way**: Từ order có thể lấy user info, nhưng user không tự động có list orders
- **Set Null**: Nếu xóa user, orders vẫn giữ nhưng userId = null (an toàn hơn)

**✅ Lợi ích so với String:**
- Appwrite tự động validate (user phải tồn tại)
- Có thể lấy luôn thông tin user khi query order
- Data integrity tốt hơn
- Dễ maintain

---

### 📝 ATTRIBUTE 2: items

1. Click **"+ Create Attribute"**
2. Chọn type: **String**
3. Điền form:
   ```
   Attribute ID: items
   Size: 10000
   Required: ✅ (tick vào)
   Array: ❌ (không tick)
   Default Value: (để trống)
   ```
4. Click **Create**

**💡 Giải thích**: `items` lưu danh sách món ăn dạng JSON. Ví dụ:
```json
[{"menuItemId":"abc","name":"Burger","price":9.99,"quantity":2}]
```

---

### 📝 ATTRIBUTE 3: total

1. Click **"+ Create Attribute"**
2. Chọn type: **Float** (hoặc **Double** nếu có)
3. Điền form:
   ```
   Attribute ID: total
   Required: ✅ (tick vào)
   Min: 0
   Max: (để trống)
   ```
4. Click **Create**

**💡 Giải thích**: `total` là tổng tiền đơn hàng. Ví dụ: `24.99`

---

### 📝 ATTRIBUTE 4: status (QUAN TRỌNG!)

1. Click **"+ Create Attribute"**
2. Chọn type: **Enum** (rất quan trọng!)
3. Điền form:
   ```
   Attribute ID: status
   Required: ✅ (tick vào)
   
   Elements (Nhập 6 giá trị, mỗi dòng 1 giá trị):
   pending
   preparing
   ready
   delivering
   completed
   cancelled
   
   Default Value: pending
   ```
4. Click **Create**

**💡 Giải thích**: `status` là trạng thái đơn hàng:
- `pending` = Đang chờ xử lý
- `preparing` = Đang chuẩn bị
- `ready` = Sẵn sàng giao
- `delivering` = Đang giao hàng
- `completed` = Đã hoàn thành
- `cancelled` = Đã hủy

---

### 📝 ATTRIBUTE 5: deliveryAddress

1. Click **"+ Create Attribute"**
2. Chọn type: **String**
3. Điền form:
   ```
   Attribute ID: deliveryAddress
   Size: 500
   Required: ✅ (tick vào)
   Array: ❌ (không tick)
   ```
4. Click **Create**

**💡 Giải thích**: Địa chỉ giao hàng. Ví dụ: `"123 Main St, New York, NY 10001"`

---

### 📝 ATTRIBUTE 6: deliveryAddressLabel

1. Click **"+ Create Attribute"**
2. Chọn type: **String**
3. Điền form:
   ```
   Attribute ID: deliveryAddressLabel
   Size: 100
   Required: ❌ (KHÔNG tick - field này optional)
   Array: ❌ (không tick)
   ```
4. Click **Create**

**💡 Giải thích**: Nhãn địa chỉ. Ví dụ: `"Home"`, `"Office"`

---

### 📝 ATTRIBUTE 7: phone

1. Click **"+ Create Attribute"**
2. Chọn type: **String**
3. Điền form:
   ```
   Attribute ID: phone
   Size: 20
   Required: ✅ (tick vào)
   Array: ❌ (không tick)
   ```
4. Click **Create**

**💡 Giải thích**: Số điện thoại người nhận. Ví dụ: `"+1234567890"`

---

### 📝 ATTRIBUTE 8: notes

1. Click **"+ Create Attribute"**
2. Chọn type: **String**
3. Điền form:
   ```
   Attribute ID: notes
   Size: 1000
   Required: ❌ (KHÔNG tick - field này optional)
   Array: ❌ (không tick)
   ```
4. Click **Create**

**💡 Giải thích**: Ghi chú của khách. Ví dụ: `"Ring the doorbell twice"`

---

### 📝 ATTRIBUTE 9: createdAt

1. Click **"+ Create Attribute"**
2. Chọn type: **DateTime**
3. Điền form:
   ```
   Attribute ID: createdAt
   Required: ✅ (tick vào)
   Default Value: now()  ← QUAN TRỌNG! Gõ "now()"
   ```
4. Click **Create**

**💡 Giải thích**: Thời gian tạo đơn hàng, tự động lấy thời gian hiện tại

---

### 📝 ATTRIBUTE 10: updatedAt

1. Click **"+ Create Attribute"**
2. Chọn type: **DateTime**
3. Điền form:
   ```
   Attribute ID: updatedAt
   Required: ✅ (tick vào)
   Default Value: now()  ← QUAN TRỌNG! Gõ "now()"
   ```
4. Click **Create**

**💡 Giải thích**: Thời gian cập nhật, tự động lấy thời gian hiện tại

---

## ✅ BƯỚC 3: KIỂM TRA

Sau khi tạo xong 10 attributes, tab **Columns** của bạn sẽ hiển thị:

```
✅ $id (tự động tạo bởi Appwrite)
✅ userId (Relationship → User, Many to One) ⭐
✅ items (String, 10000)
✅ total (Float)
✅ status (Enum: pending, preparing, ready, delivering, completed, cancelled)
✅ deliveryAddress (String, 500)
✅ deliveryAddressLabel (String, 100)
✅ phone (String, 20)
✅ notes (String, 1000)
✅ createdAt (DateTime)
✅ updatedAt (DateTime)
✅ $createdAt (tự động tạo bởi Appwrite)
✅ $updatedAt (tự động tạo bởi Appwrite)
```

**Tổng cộng: 13 columns** (10 của bạn + 3 của Appwrite)

**📌 Lưu ý:** `userId` là **Relationship**, không phải String!

---

## 🔐 BƯỚC 4: CẤU HÌNH PERMISSIONS

**Rất quan trọng!** Không có permissions thì app không đọc/ghi được.

### Cách 1: Document Security (Đơn Giản Nhất) ⭐ KHUYÊN DÙNG

1. Click tab **"Settings"** (bên cạnh tab Columns)
2. Scroll xuống phần **"Permissions"**
3. Tìm checkbox **"Document Security"**
4. ✅ Tick vào: **"Document Security"**
5. Chọn: **"Users"** can read/create/update/delete their own documents

### Cách 2: Manual Permissions (Nâng Cao)

1. Click tab **"Settings"**
2. Scroll xuống **"Permissions"**
3. Click **"Add Role"**

**Role 1 - Any (Guest):**
```
Role: Any
Permissions:
✅ Read
❌ Create
❌ Update
❌ Delete
```

**Role 2 - Users:**
```
Role: Users (all authenticated users)
Permissions:
✅ Read (to read their orders)
✅ Create (to create new orders)
❌ Update (admin only)
❌ Delete (admin only)
```

4. Click **Save** hoặc **Update**

---

## 🧪 BƯỚC 5: TEST VỚI 1 ORDER MẪU

Để test xem collection hoạt động chưa:

1. Quay lại tab **"Rows"** (hoặc "Documents")
2. Click button **"+ Create row"**
3. Điền form:

**📌 LƯU Ý QUAN TRỌNG:**
- `userId`: **CHỌN TỪ DROPDOWN**, không paste string!
- Appwrite sẽ hiện danh sách users, chọn 1 user

```json
{
  "userId": [CHỌN USER TỪ DROPDOWN, KHÔNG PASTE STRING],
  "items": "[{\"menuItemId\":\"test123\",\"name\":\"Test Burger\",\"price\":9.99,\"quantity\":1,\"image_url\":\"https://via.placeholder.com/150\",\"customizations\":[]}]",
  "total": 14.49,
  "status": "pending",
  "deliveryAddress": "123 Test Street, Test City, TC 12345",
  "deliveryAddressLabel": "Home",
  "phone": "+1234567890",
  "notes": "This is a test order",
  "createdAt": "2025-10-08T10:00:00.000+00:00",
  "updatedAt": "2025-10-08T10:00:00.000+00:00"
}
```

**🎯 Cách điền userId (Relationship):**
1. Khi tạo document, field `userId` sẽ là **dropdown**
2. Click vào dropdown
3. Appwrite hiện list tất cả users
4. Chọn user bạn muốn
5. Appwrite tự động link relationship

**Không cần copy/paste ID nữa!** 🎉

4. Click **Create**

Nếu tạo thành công → Collection đã hoạt động! ✅

---

## 📱 BƯỚC 6: TEST TRÊN APP

Bây giờ test trên app:

### Test Flow:
1. **Mở app** → Đăng nhập
2. **Thêm món vào giỏ hàng**
   - Vào tab Home hoặc Search
   - Chọn món
   - Thêm vào giỏ
3. **Kiểm tra địa chỉ**
   - Vào Profile
   - Click "Edit Profile"
   - Nhập địa chỉ (Address 1 hoặc Address 2)
   - Nhập số điện thoại
   - Click Save
4. **Đặt hàng**
   - Vào tab Cart
   - Click **"Order Now"**
   - Nếu thành công → Hiện "Order Placed! 🎉"
5. **Xem Order History**
   - Vào Profile
   - Click "Order History"
   - Thấy order vừa tạo
   - Click vào order → Xem chi tiết

---

## ❌ TROUBLESHOOTING

### Lỗi: "Collection not found"
**Nguyên nhân**: Collection ID trong code không đúng

**Giải pháp**:
1. Vào Appwrite Console
2. Vào orders collection
3. Copy **Collection ID** (ở góc trên bên phải)
4. Mở file `lib/appwrite.ts`
5. Tìm dòng:
   ```typescript
   ordersCollectionId: "orders",
   ```
6. Thay `"orders"` bằng Collection ID vừa copy

---

### Lỗi: "Permission denied"
**Nguyên nhân**: Chưa set permissions

**Giải pháp**: Làm lại Bước 4

---

### Lỗi: "Missing required attribute"
**Nguyên nhân**: Thiếu attribute nào đó

**Giải pháp**: 
1. Check lại 10 attributes đã tạo đủ chưa
2. Check chính tả của attribute ID (phải giống y hệt)

---

### Order không hiện trong Order History
**Nguyên nhân**: 
- User ID không khớp
- Permissions chưa đúng
- Collection ID sai

**Giải pháp**:
1. Check console log trong app (có lỗi gì không)
2. Vào Appwrite → orders collection → check có document không
3. Check document có đúng userId của user đang login không

---

## ✨ CHECKLIST HOÀN THÀNH

Đánh dấu ✅ khi hoàn thành:

- [ ] Tạo 10 attributes trong orders collection
  - [ ] userId (Relationship → User, Many to One, One-way) ⭐
  - [ ] items (String, 10000, Required)
  - [ ] total (Float, Required)
  - [ ] status (Enum, Required, Default: pending)
  - [ ] deliveryAddress (String, 500, Required)
  - [ ] deliveryAddressLabel (String, 100)
  - [ ] phone (String, 20, Required)
  - [ ] notes (String, 1000)
  - [ ] createdAt (DateTime, Required, Default: now())
  - [ ] updatedAt (DateTime, Required, Default: now())
- [ ] Set permissions (Document Security hoặc Manual)
- [ ] Test tạo 1 document mẫu trong Appwrite (userId chọn từ dropdown)
- [ ] Check code có ordersCollectionId trong appwrite.ts
- [ ] Test đặt hàng trên app
- [ ] Test xem Order History
- [ ] Test xem Order Detail

---

## 🎉 KẾT QUẢ MONG ĐỢI

Sau khi hoàn thành, bạn sẽ có:

✅ **Giỏ hàng hoạt động**
- Thêm món vào giỏ
- Tính tổng tiền
- Áp dụng delivery fee và discount

✅ **Đặt hàng thành công**
- Click "Order Now"
- Tạo order trong Appwrite
- Xóa giỏ hàng
- Hiện thông báo thành công

✅ **Order History hoạt động**
- Xem danh sách orders
- Filter theo status
- Pull to refresh
- Xem chi tiết order

✅ **Quản lý đơn hàng**
- Admin có thể update status
- User nhận thông báo
- Track đơn hàng

---

## 📞 CẦN GIÚP ĐỠ?

Nếu gặp lỗi, gửi cho tôi:
1. Screenshot màn hình lỗi
2. Code trong console log
3. Screenshot Appwrite collection (tab Columns)

Tôi sẽ giúp bạn fix ngay! 💪

---

**Chúc bạn thành công! 🚀**
