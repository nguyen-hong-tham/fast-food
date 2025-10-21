# 📸 Hướng dẫn cấu hình Appwrite Console cho Collection Orders

## 🎯 Tổng quan
File này hướng dẫn chi tiết từng bước cấu hình collection `orders` trong Appwrite Console để khắc phục các lỗi:
- ❌ "Invalid document structure: Attribute 'status' has invalid format"
- ❌ "Error creating order"
- ❌ "Checkout error"

## 📋 Danh sách Attributes cần có

### 1. **userId** (Required) ⭐
- **Type**: String (Relationship)
- **Relationship Type**: Many to One
- **Related Collection**: `user`
- **Required**: ✅ Yes
- **Array**: ❌ No

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "Relationship"
3. Related collection: user
4. Type: Many to One
5. Attribute Key (in orders): userId
6. Attribute Key (in user): orders
7. On deleting a document: Set NULL
8. Click "Create"
```

---

### 2. **restaurantId** (Required) ⭐
- **Type**: String (Relationship)
- **Relationship Type**: Many to One
- **Related Collection**: `restaurants`
- **Required**: ✅ Yes
- **Array**: ❌ No

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "Relationship"
3. Related collection: restaurants
4. Type: Many to One
5. Attribute Key (in orders): restaurantId
6. Attribute Key (in restaurants): orders
7. On deleting a document: Set NULL
8. Click "Create"
```

---

### 3. **status** (Required) ⭐⭐⭐ - QUAN TRỌNG NHẤT
- **Type**: Enum
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Default**: pending
- **Elements**: 

```
pending
confirmed
preparing
ready
delivering
delivered
cancelled
```

**⚠️ LƯU Ý QUAN TRỌNG:**
- Viết thường toàn bộ
- KHÔNG có khoảng trắng đầu/cuối
- KHÔNG có ký tự đặc biệt
- Mỗi giá trị một dòng

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "Enum"
3. Attribute ID: status
4. Elements: (nhập từng dòng)
   pending
   confirmed
   preparing
   ready
   delivering
   delivered
   cancelled
5. Required: ✅ Check
6. Array: ❌ Uncheck
7. Default value: pending
8. Click "Create"
```

**Nếu đã tồn tại attribute `status`, cần UPDATE:**
```
1. Click vào attribute "status"
2. Nhấn icon "Edit" (✏️)
3. Kiểm tra lại danh sách Elements
4. Đảm bảo Default value = "pending"
5. Click "Update"
```

---

### 4. **total** (Required) ⭐
- **Type**: Float
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Min**: 0
- **Max**: 999999999

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "Float"
3. Attribute ID: total
4. Min value: 0
5. Max value: 999999999
6. Required: ✅ Check
7. Array: ❌ Uncheck
8. Click "Create"
```

---

### 5. **deliveryAddress** (Required) ⭐
- **Type**: String
- **Size**: 500
- **Required**: ✅ Yes
- **Array**: ❌ No

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "String"
3. Attribute ID: deliveryAddress
4. Size: 500
5. Required: ✅ Check
6. Array: ❌ Uncheck
7. Click "Create"
```

---

### 6. **deliveryAddressLabel** (Optional)
- **Type**: String
- **Size**: 100
- **Required**: ❌ No
- **Array**: ❌ No
- **Default**: ""

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "String"
3. Attribute ID: deliveryAddressLabel
4. Size: 100
5. Required: ❌ Uncheck
6. Array: ❌ Uncheck
7. Default: (để trống)
8. Click "Create"
```

---

### 7. **phone** (Required) ⭐
- **Type**: String
- **Size**: 20
- **Required**: ✅ Yes
- **Array**: ❌ No

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "String"
3. Attribute ID: phone
4. Size: 20
5. Required: ✅ Check
6. Array: ❌ Uncheck
7. Click "Create"
```

---

### 8. **notes** (Optional)
- **Type**: String
- **Size**: 1000
- **Required**: ❌ No
- **Array**: ❌ No

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "String"
3. Attribute ID: notes
4. Size: 1000
5. Required: ❌ Uncheck
6. Array: ❌ Uncheck
7. Click "Create"
```

---

### 9. **paymentMethod** (Required) ⭐⭐
- **Type**: Enum
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Elements**: 

```
cod
vnpay
```

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "Enum"
3. Attribute ID: paymentMethod
4. Elements: (nhập từng dòng)
   cod
   vnpay
5. Required: ✅ Check
6. Array: ❌ Uncheck
7. Click "Create"
```

---

### 10. **paymentStatus** (Required) ⭐⭐
- **Type**: Enum
- **Required**: ✅ Yes
- **Array**: ❌ No
- **Default**: pending
- **Elements**: 

```
pending
paid
failed
refunded
```

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "Enum"
3. Attribute ID: paymentStatus
4. Elements: (nhập từng dòng)
   pending
   paid
   failed
   refunded
5. Required: ✅ Check
6. Array: ❌ Uncheck
7. Default value: pending
8. Click "Create"
```

---

### 11. **items** (Required) ⭐⭐
- **Type**: String
- **Size**: 10000
- **Required**: ✅ Yes
- **Array**: ❌ No

**⚠️ LƯU Ý:** 
- Trường này lưu JSON string của danh sách món ăn
- Size phải đủ lớn để chứa nhiều món

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "String"
3. Attribute ID: items
4. Size: 10000
5. Required: ✅ Check
6. Array: ❌ Uncheck
7. Click "Create"
```

---

### 12. **recipientName** (Optional)
- **Type**: String
- **Size**: 255
- **Required**: ❌ No
- **Array**: ❌ No

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "String"
3. Attribute ID: recipientName
4. Size: 255
5. Required: ❌ Uncheck
6. Array: ❌ Uncheck
7. Click "Create"
```

---

### 13. **createdAt** (Required) ⭐
- **Type**: DateTime
- **Required**: ✅ Yes
- **Array**: ❌ No

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "DateTime"
3. Attribute ID: createdAt
4. Required: ✅ Check
5. Array: ❌ Uncheck
6. Click "Create"
```

---

### 14. **updatedAt** (Required) ⭐
- **Type**: DateTime
- **Required**: ✅ Yes
- **Array**: ❌ No

**Cách tạo:**
```
1. Click "Create attribute"
2. Select "DateTime"
3. Attribute ID: updatedAt
4. Required: ✅ Check
5. Array: ❌ Uncheck
6. Click "Create"
```

---

## 🔐 Cấu hình Permissions (Quyền truy cập)

### Settings → Permissions

**Document Security**: ✅ Enabled

**Collection Permissions:**
```
✅ Create:
   - role:all

✅ Read:
   - role:all

✅ Update:
   - role:all

✅ Delete:
   - role:all
```

**⚠️ LƯU Ý:** Trong production nên giới hạn quyền theo user cụ thể

---

## ✅ Checklist sau khi hoàn tất

- [ ] **userId** - Relationship với collection `user`
- [ ] **restaurantId** - Relationship với collection `restaurants`
- [ ] **status** - Enum với 7 giá trị (pending, confirmed, preparing, ready, delivering, delivered, cancelled)
- [ ] **total** - Float, min = 0
- [ ] **deliveryAddress** - String, size = 500
- [ ] **deliveryAddressLabel** - String, size = 100 (optional)
- [ ] **phone** - String, size = 20
- [ ] **notes** - String, size = 1000 (optional)
- [ ] **paymentMethod** - Enum với 2 giá trị (cod, vnpay)
- [ ] **paymentStatus** - Enum với 4 giá trị (pending, paid, failed, refunded)
- [ ] **items** - String, size = 10000
- [ ] **recipientName** - String, size = 255 (optional)
- [ ] **createdAt** - DateTime
- [ ] **updatedAt** - DateTime
- [ ] **Permissions** - Đã cấu hình đúng

---

## 🐛 Troubleshooting Common Errors

### ❌ Lỗi: "Attribute 'status' has invalid format"

**Nguyên nhân:**
1. Enum values không khớp với code
2. Có khoảng trắng thừa trong enum
3. Viết hoa/thường không đúng

**Giải pháp:**
1. Vào Appwrite Console → Database → orders → Columns
2. Click vào attribute `status`
3. Kiểm tra lại danh sách Elements:
   ```
   pending      ← phải viết thường, không có space
   confirmed
   preparing
   ready
   delivering
   delivered
   cancelled
   ```
4. Đảm bảo Default value = `pending`
5. Click Update

---

### ❌ Lỗi: "Missing required attribute"

**Nguyên nhân:**
- Thiếu trường bắt buộc trong code hoặc Appwrite

**Giải pháp:**
1. Kiểm tra tất cả các trường có ⭐ phải Required
2. Đảm bảo code gửi đủ các trường required

---

### ❌ Lỗi: "Document structure is invalid"

**Nguyên nhân:**
- Type không đúng (ví dụ: gửi string nhưng Appwrite expect float)

**Giải pháp:**
1. Kiểm tra type của từng attribute
2. Đảm bảo `total` là number, không phải string
3. Đảm bảo `items` là JSON string (đã stringify)

---

## 📸 So sánh với ảnh bạn gửi

Trong ảnh Appwrite Console của bạn, tôi thấy:
- ✅ `status` có label "required" (màu cam)
- ✅ `items` có label "required" và "Size: 1000"
- ⚠️ Nhưng **Size: 1000 có thể quá nhỏ** → nên tăng lên **10000**

**Cách sửa:**
1. Click vào attribute `items`
2. Click Edit (✏️)
3. Đổi Size từ 1000 → 10000
4. Click Update

---

## 📝 Example: Dữ liệu hợp lệ gửi lên Appwrite

```javascript
{
  "userId": "user_12345",
  "restaurantId": "rest_67890",
  "status": "pending",
  "total": 150000,
  "deliveryAddress": "123 Nguyễn Văn Linh, Q7, TP.HCM",
  "deliveryAddressLabel": "Home",
  "phone": "0901234567",
  "notes": "Gọi chuông 2 lần",
  "paymentMethod": "vnpay",
  "paymentStatus": "pending",
  "items": "[{\"menuItemId\":\"673975f6000ca7097ad0\",\"name\":\"Burger\",\"price\":45000,\"quantity\":2,\"image_url\":\"...\"}]",
  "recipientName": "",
  "createdAt": "2025-10-21T16:27:00.000Z",
  "updatedAt": "2025-10-21T16:27:00.000Z"
}
```

---

## 🔗 Tài nguyên hữu ích

- [Appwrite Databases Docs](https://appwrite.io/docs/products/databases)
- [Appwrite Enum Attributes](https://appwrite.io/docs/products/databases/collections#enum)
- [Appwrite Relationships](https://appwrite.io/docs/products/databases/relationships)
- [Appwrite Permissions](https://appwrite.io/docs/products/databases/permissions)
