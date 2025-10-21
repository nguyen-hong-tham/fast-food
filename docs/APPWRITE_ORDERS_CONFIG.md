# Cấu hình Collection Orders trong Appwrite

## 🎯 Mục đích
Tài liệu này hướng dẫn cấu hình collection `orders` trong Appwrite Console để khắc phục lỗi "Invalid document structure: Attribute 'status' has invalid format".

## 📋 Các thuộc tính cần có

### Collection: `orders`

| Attribute Name | Type | Required | Array | Size/Default | Notes |
|----------------|------|----------|-------|--------------|-------|
| `userId` | String (Relationship) | ✅ Yes | ❌ No | - | One-to-Many với collection `user` |
| `restaurantId` | String (Relationship) | ✅ Yes | ❌ No | - | One-to-Many với collection `restaurants` |
| `status` | Enum | ✅ Yes | ❌ No | Default: "pending" | Giá trị: "pending", "confirmed", "preparing", "ready", "delivering", "delivered", "cancelled" |
| `total` | Float | ✅ Yes | ❌ No | Min: 0 | Tổng tiền đơn hàng |
| `deliveryAddress` | String | ✅ Yes | ❌ No | Size: 500 | Địa chỉ giao hàng |
| `deliveryAddressLabel` | String | ❌ No | ❌ No | Size: 100 | Label: Home, Work, Other |
| `phone` | String | ✅ Yes | ❌ No | Size: 20 | Số điện thoại |
| `notes` | String | ❌ No | ❌ No | Size: 1000 | Ghi chú đặc biệt |
| `paymentMethod` | Enum | ✅ Yes | ❌ No | - | Giá trị: "cod", "vnpay" |
| `paymentStatus` | Enum | ✅ Yes | ❌ No | Default: "pending" | Giá trị: "pending", "paid", "failed", "refunded" |
| `items` | String | ✅ Yes | ❌ No | Size: 10000 | JSON string chứa danh sách món ăn |
| `recipientName` | String | ❌ No | ❌ No | Size: 255 | Tên người nhận |
| `createdAt` | DateTime | ✅ Yes | ❌ No | - | Thời gian tạo |
| `updatedAt` | DateTime | ✅ Yes | ❌ No | - | Thời gian cập nhật |

## 🔧 Hướng dẫn cấu hình trong Appwrite Console

### Bước 1: Mở Appwrite Console
1. Truy cập: https://cloud.appwrite.io
2. Chọn Project: **sgu_cnpm_foodfast**
3. Vào **Databases** → Chọn database của bạn
4. Chọn collection **orders**

### Bước 2: Cấu hình thuộc tính `status`
1. Nhấp vào attribute `status`
2. Chọn **Type: Enum**
3. Nhập các giá trị (mỗi giá trị một dòng):
   ```
   pending
   confirmed
   preparing
   ready
   delivering
   delivered
   cancelled
   ```
4. **Default value**: `pending`
5. **Required**: ✅ Yes
6. **Array**: ❌ No
7. Nhấn **Update**

### Bước 3: Cấu hình thuộc tính `paymentMethod`
1. Nhấp vào attribute `paymentMethod`
2. Chọn **Type: Enum**
3. Nhập các giá trị:
   ```
   cod
   vnpay
   ```
4. **Required**: ✅ Yes
5. **Array**: ❌ No
6. Nhấn **Update**

### Bước 4: Cấu hình thuộc tính `paymentStatus`
1. Nếu chưa có, tạo attribute mới: `paymentStatus`
2. Chọn **Type: Enum**
3. Nhập các giá trị:
   ```
   pending
   paid
   failed
   refunded
   ```
4. **Default value**: `pending`
5. **Required**: ✅ Yes
6. **Array**: ❌ No
7. Nhấn **Create** hoặc **Update**

### Bước 5: Cấu hình thuộc tính `items`
1. Nhấp vào attribute `items`
2. Chọn **Type: String**
3. **Size**: `10000` (để chứa JSON dài)
4. **Required**: ✅ Yes
5. **Array**: ❌ No
6. Nhấn **Update**

## 📸 Ảnh minh họa cấu hình

### Cấu hình `status` attribute:
```
┌─────────────────────────────────────┐
│ Attribute: status                   │
├─────────────────────────────────────┤
│ Type: Enum                          │
│ Required: ✅ Yes                     │
│ Array: ❌ No                         │
│                                     │
│ Elements:                           │
│ • pending                           │
│ • confirmed                         │
│ • preparing                         │
│ • ready                             │
│ • delivering                        │
│ • delivered                         │
│ • cancelled                         │
│                                     │
│ Default: pending                    │
└─────────────────────────────────────┘
```

## ✅ Checklist sau khi cấu hình
- [ ] Attribute `status` có đúng 7 giá trị enum
- [ ] Attribute `paymentMethod` có 2 giá trị: cod, vnpay
- [ ] Attribute `paymentStatus` có 4 giá trị
- [ ] Attribute `items` có type là String với size đủ lớn (10000)
- [ ] Tất cả các attribute required đã được đánh dấu
- [ ] Đã set default value cho `status` và `paymentStatus`

## 🐛 Troubleshooting

### Lỗi: "Attribute 'status' has invalid format"
**Nguyên nhân**: Giá trị gửi lên không nằm trong danh sách enum
**Giải pháp**: 
1. Kiểm tra lại danh sách enum trong Appwrite Console
2. Đảm bảo không có khoảng trắng thừa trong các giá trị enum
3. So sánh code với enum values (phân biệt chữ hoa/thường)

### Lỗi: "Invalid document structure"
**Nguyên nhân**: Thiếu thuộc tính bắt buộc hoặc type không đúng
**Giải pháp**:
1. Kiểm tra tất cả các trường required
2. Đảm bảo `items` là string (JSON.stringify)
3. Kiểm tra `total` là number, không phải string

## 📝 Cấu trúc JSON của `items`
```json
[
  {
    "menuItemId": "673975f6000ca7097ad0",
    "name": "Burger Bò Phô Mai",
    "price": 45000,
    "quantity": 2,
    "image_url": "https://example.com/burger.jpg",
    "customizations": [
      {
        "id": "custom_001",
        "name": "Extra Cheese",
        "price": 5000,
        "type": "topping"
      }
    ]
  }
]
```

## 🔗 Liên kết hữu ích
- [Appwrite Databases Documentation](https://appwrite.io/docs/products/databases)
- [Appwrite Enum Attribute](https://appwrite.io/docs/products/databases/collections#enum)
- [Appwrite Relationships](https://appwrite.io/docs/products/databases/relationships)
