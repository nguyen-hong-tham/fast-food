# 🛍️ Hướng Dẫn Tạo Orders Collection Trong Appwrite

## 📌 Tổng Quan

Để giỏ hàng có thể đặt hàng và lưu vào Order History, bạn cần tạo collection **orders** với các attributes (cột) sau:

---

## 🎯 Bước 1: Vào Orders Collection

1. Mở Appwrite Console: https://cloud.appwrite.io/console
2. Chọn project của bạn
3. Click **Databases** ở sidebar bên trái
4. Click vào database của bạn (vd: `jsm-food-ordering`)
5. Click vào collection **orders** (bạn đã tạo rồi)

---

## 🔧 Bước 2: Tạo Attributes (Columns)

Click vào tab **"Columns"** và tạo **10 attributes** sau:

### ✅ Attribute 1: userId (RELATIONSHIP) ⭐

**⚠️ QUAN TRỌNG: Đây là RELATIONSHIP, không phải String!**

- **Attribute ID**: `userId`
- **Type**: Relationship
- **Related Collection**: User (chọn từ dropdown)
- **Relationship Type**: Many to One
  - Many orders → One user
- **On Delete**: Set Null (khuyên dùng) hoặc Cascade
  - Set Null: Xóa user → userId trong order = null
  - Cascade: Xóa user → xóa luôn tất cả orders
- **Two Way**: ❌ No (one-way relationship)
- **Two Way Attribute Key**: (bỏ trống)

**Mục đích**: Link order với user đã đặt hàng

**Lợi ích của Relationship so với String:**
- ✅ Appwrite tự động validate (user phải tồn tại)
- ✅ Có thể lấy luôn thông tin user khi query order (name, email, avatar)
- ✅ Data integrity tốt hơn
- ✅ Không bị orphan records
- ✅ Dễ maintain và scale

**Giải thích One-way vs Two-way:**
- **One-way** (khuyên dùng): Order → User (có thể lấy user từ order)
- **Two-way**: Order ↔ User (user cũng tự động có list orders)
  - Không dùng vì user có thể có hàng trăm orders → document quá lớn

---

### ✅ Attribute 2: items
- **Attribute ID**: `items`
- **Type**: String
- **Size**: 10000
- **Required**: ✅ Yes
- **Default**: (để trống)
- **Array**: ❌ No

**Mục đích**: Lưu danh sách món ăn dạng JSON string

**Ví dụ nội dung:**
```json
[
  {
    "menuItemId": "abc123",
    "name": "Burger",
    "price": 9.99,
    "quantity": 2,
    "image_url": "https://...",
    "customizations": ["Extra Cheese", "No Onions"]
  }
]
```

---

### ✅ Attribute 3: total
- **Attribute ID**: `total`
- **Type**: Float (hoặc Double)
- **Required**: ✅ Yes
- **Default**: (để trống)
- **Min**: 0
- **Max**: (để trống)

**Mục đích**: Tổng tiền đơn hàng (bao gồm delivery fee, discount)

---

### ✅ Attribute 4: status
- **Attribute ID**: `status`
- **Type**: Enum
- **Required**: ✅ Yes
- **Elements**: Nhập 6 giá trị sau (mỗi dòng 1 giá trị):
  ```
  pending
  preparing
  ready
  delivering
  completed
  cancelled
  ```
- **Default**: `pending`

**Mục đích**: Trạng thái đơn hàng

---

### ✅ Attribute 5: deliveryAddress
- **Attribute ID**: `deliveryAddress`
- **Type**: String
- **Size**: 500
- **Required**: ✅ Yes
- **Default**: (để trống)
- **Array**: ❌ No

**Mục đích**: Địa chỉ giao hàng

**Ví dụ**: "123 Main St, Apt 4B, New York, NY 10001"

---

### ✅ Attribute 6: deliveryAddressLabel
- **Attribute ID**: `deliveryAddressLabel`
- **Type**: String
- **Size**: 100
- **Required**: ❌ No
- **Default**: (để trống)
- **Array**: ❌ No

**Mục đích**: Nhãn địa chỉ (Home, Work, etc.)

**Ví dụ**: "Home", "Office", "My House"

---

### ✅ Attribute 7: phone
- **Attribute ID**: `phone`
- **Type**: String
- **Size**: 20
- **Required**: ✅ Yes
- **Default**: (để trống)
- **Array**: ❌ No

**Mục đích**: Số điện thoại người nhận

**Ví dụ**: "+1 555 123 4567"

---

### ✅ Attribute 8: notes
- **Attribute ID**: `notes`
- **Type**: String
- **Size**: 1000
- **Required**: ❌ No
- **Default**: (để trống)
- **Array**: ❌ No

**Mục đích**: Ghi chú của khách hàng

**Ví dụ**: "Ring the doorbell twice", "Leave at door"

---

### ✅ Attribute 9: createdAt
- **Attribute ID**: `createdAt`
- **Type**: DateTime
- **Required**: ✅ Yes
- **Default**: `now()`

**Mục đích**: Thời gian tạo đơn hàng

---

### ✅ Attribute 10: updatedAt
- **Attribute ID**: `updatedAt`
- **Type**: DateTime
- **Required**: ✅ Yes
- **Default**: `now()`

**Mục đích**: Thời gian cập nhật đơn hàng

---

### ✅ Attribute 11: orderId (tự động tạo)

Appwrite tự động tạo field `$id` cho mỗi document, đây sẽ là Order ID.

---

## 🔐 Bước 3: Cấu Hình Permissions

Sau khi tạo xong tất cả attributes, cần set permissions:

1. Click vào tab **"Settings"** của collection orders
2. Scroll xuống phần **"Permissions"**
3. Click **"Add Role"**

### Permission Rules:

#### Rule 1: Users can read their own orders
- **Role**: Any
- **Permissions**: 
  - ✅ Read
  - ❌ Create
  - ❌ Update
  - ❌ Delete

#### Rule 2: Users can create orders
- **Role**: Users
- **Permissions**:
  - ❌ Read (đã set ở Any)
  - ✅ Create
  - ❌ Update
  - ❌ Delete

#### Rule 3: Document-level permissions
Hoặc đơn giản hơn, set Document-level permissions:
- Click **"Document Security"**
- Enable: ✅ "Users can only read/write their own documents"

---

## 📊 Bước 4: Tạo Indexes (Tùy Chọn Nhưng Khuyến Nghị)

Để tăng tốc độ query, tạo các indexes:

1. Click vào tab **"Indexes"**
2. Click **"Create Index"**

### Index 1: userId_index
- **Key**: `userId_index`
- **Type**: Key
- **Attributes**: `userId`
- **Orders**: ASC

### Index 2: status_index
- **Key**: `status_index`
- **Type**: Key
- **Attributes**: `status`
- **Orders**: ASC

### Index 3: createdAt_index
- **Key**: `createdAt_index`
- **Type**: Key
- **Attributes**: `createdAt`
- **Orders**: DESC

---

## 🧪 Bước 5: Test Với Sample Data

Sau khi tạo xong attributes, test bằng cách tạo 1 document mẫu:

1. Click vào tab **"Documents"**
2. Click **"Create row"** (hoặc "Create document")
3. Điền thông tin:

```json
{
  "userId": "[USER_ID_CỦA_BẠN]",
  "items": "[{\"menuItemId\":\"123\",\"name\":\"Burger\",\"price\":9.99,\"quantity\":2,\"image_url\":\"https://example.com/burger.jpg\",\"customizations\":[\"Extra Cheese\"]}]",
  "total": 24.98,
  "status": "pending",
  "deliveryAddress": "123 Test Street, City, Country",
  "deliveryAddressLabel": "Home",
  "phone": "+1234567890",
  "notes": "Test order",
  "createdAt": "2025-10-08T10:00:00.000+00:00",
  "updatedAt": "2025-10-08T10:00:00.000+00:00"
}
```

4. Click **"Create"**

---

## ✅ Bước 6: Cập Nhật Collection ID Trong Code

Kiểm tra `lib/appwrite.ts` có đúng collection ID không:

```typescript
export const appwriteConfig = {
    endpoint: "https://cloud.appwrite.io/v1",
    projectId: "YOUR_PROJECT_ID",
    databaseId: "YOUR_DATABASE_ID",
    userCollectionId: "YOUR_USER_COLLECTION_ID",
    menuCollectionId: "YOUR_MENU_COLLECTION_ID",
    categoriesCollectionId: "YOUR_CATEGORIES_COLLECTION_ID",
    ordersCollectionId: "orders", // ← ĐẢM BẢO CÓ DÒNG NÀY
    customizationsCollectionId: "YOUR_CUSTOMIZATIONS_COLLECTION_ID",
    storageId: "YOUR_STORAGE_ID",
};
```

---

## 🎯 Tóm Tắt Nhanh

| Attribute | Type | Size/Config | Required | Default |
|-----------|------|-------------|----------|---------|
| userId | Relationship | → User (Many to One, One-way) | ✅ | - |
| items | String | 10000 | ✅ | - |
| total | Float | - | ✅ | - |
| status | Enum | pending, preparing, ready, delivering, completed, cancelled | ✅ | pending |
| deliveryAddress | String | 500 | ✅ | - |
| deliveryAddressLabel | String | 100 | ❌ | - |
| phone | String | 20 | ✅ | - |
| notes | String | 1000 | ❌ | - |
| createdAt | DateTime | - | ✅ | now() |
| updatedAt | DateTime | - | ✅ | now() |

**⭐ Điểm khác biệt quan trọng:** `userId` là **Relationship**, không phải String!

---

## 🚀 Flow Hoàn Chỉnh

```
User thêm món vào giỏ
    ↓
User nhấn "Order Now" ở Cart
    ↓
App kiểm tra: Login? ✅ → Address? ✅ → Cart không rỗng? ✅
    ↓
App gọi createOrder() trong lib/appwrite.ts
    ↓
Tạo document mới trong orders collection
    ↓
Document được lưu với:
    - userId: ID người dùng
    - items: JSON string các món ăn
    - total: Tổng tiền
    - status: "pending"
    - deliveryAddress: Địa chỉ từ profile
    - phone: SĐT từ profile
    ↓
Xóa giỏ hàng
    ↓
Hiển thị "Order Placed! 🎉"
    ↓
User có thể xem order trong Order History
```

---

## ❓ Troubleshooting

### Lỗi: "Attribute already exists"
- **Nguyên nhân**: Bạn đã tạo attribute này rồi
- **Giải pháp**: Skip attribute đó hoặc xóa và tạo lại

### Lỗi: "Permission denied"
- **Nguyên nhân**: Chưa set permissions đúng
- **Giải pháp**: Kiểm tra lại Bước 3

### Lỗi: "Collection not found"
- **Nguyên nhân**: ordersCollectionId trong code không khớp
- **Giải pháp**: Copy đúng ID từ Appwrite Console

### Order không hiện trong Order History
- **Nguyên nhân**: userId không khớp hoặc permissions sai
- **Giải pháp**: 
  1. Check userId trong document có khớp với user đang login không
  2. Kiểm tra permissions cho phép user read documents

---

## 🎉 Kết Luận

Sau khi làm xong các bước trên:
- ✅ Giỏ hàng có thể đặt hàng thành công
- ✅ Orders được lưu vào Appwrite
- ✅ User có thể xem Order History
- ✅ User có thể xem chi tiết từng order
- ✅ Admin có thể quản lý orders (update status)

**Thời gian thực hiện**: ~10-15 phút

Chúc bạn thành công! 🚀
