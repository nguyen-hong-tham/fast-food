# 🔗 Hiểu Về Relationship Trong Appwrite

## 📚 userId: String vs Relationship

Khi tạo Orders collection, có 2 cách lưu `userId`:

---

## ❌ CÁCH 1: String (Không khuyên dùng)

```typescript
{
  "$id": "order123",
  "userId": "673ecb8e000e1d2a3f4b",  // ← String
  "total": 24.99,
  ...
}
```

### Nhược điểm:
- ❌ Phải tự quản lý foreign key
- ❌ Không tự động validate (có thể lưu user ID không tồn tại)
- ❌ Không thể lấy thông tin user trực tiếp
- ❌ Xóa user nhưng orders vẫn còn userId cũ → orphan data
- ❌ Phải query 2 lần: 1 lần lấy order, 1 lần lấy user

### Code phải làm:
```typescript
// Lấy order
const order = await getOrderById(orderId);

// Phải query thêm lần nữa để lấy user
const user = await getUserById(order.userId);

console.log(user.name); // Mới lấy được tên
```

---

## ✅ CÁCH 2: Relationship (Khuyên dùng) ⭐

```typescript
{
  "$id": "order123",
  "userId": {  // ← Object (relationship)
    "$id": "673ecb8e000e1d2a3f4b",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://..."
  },
  "total": 24.99,
  ...
}
```

### Ưu điểm:
- ✅ Appwrite tự động validate (user phải tồn tại)
- ✅ Lấy luôn thông tin user khi query order (1 lần query duy nhất!)
- ✅ Data integrity tốt
- ✅ Có thể set cascade delete
- ✅ Dễ maintain và debug

### Code đơn giản hơn:
```typescript
// Lấy order (đã bao gồm user info)
const order = await getOrderById(orderId);

// Truy cập trực tiếp, không cần query thêm!
console.log(order.userId.name);    // "John Doe"
console.log(order.userId.email);   // "john@example.com"
console.log(order.userId.avatar);  // "https://..."
```

---

## 🔄 One-Way vs Two-Way Relationship

### 📌 ONE-WAY (Khuyên dùng cho Orders)

**Định nghĩa:**
- Order → User (order biết user của nó)
- User ❌ Orders (user KHÔNG tự động biết orders của nó)

**Cấu trúc:**
```javascript
// Order document
{
  "$id": "order123",
  "userId": {
    "$id": "user123",
    "name": "John",
    ...
  }
}

// User document (không có orders field)
{
  "$id": "user123",
  "name": "John",
  "email": "john@example.com"
  // ❌ Không có field "orders"
}
```

**Cách lấy orders của user:**
```typescript
// Phải query orders collection
const orders = await databases.listDocuments(
    databaseId,
    ordersCollectionId,
    [Query.equal('userId', userId)]
);
```

**Ưu điểm:**
- ✅ User document nhỏ gọn (không chứa list orders)
- ✅ Performance tốt (không phải update user khi có order mới)
- ✅ Phù hợp khi 1 user có NHIỀU orders

**Nhược điểm:**
- ❌ Muốn lấy orders của user → phải query thủ công

---

### 📌 TWO-WAY (Không khuyên dùng cho Orders)

**Định nghĩa:**
- Order ↔ User (cả 2 đều biết nhau)
- Order → User (order biết user)
- User → Orders (user tự động có list orders)

**Cấu trúc:**
```javascript
// Order document
{
  "$id": "order123",
  "userId": {
    "$id": "user123",
    "name": "John",
    ...
  }
}

// User document (CÓ orders field)
{
  "$id": "user123",
  "name": "John",
  "email": "john@example.com",
  "orders": [  // ← Tự động tạo
    {
      "$id": "order123",
      "total": 24.99,
      ...
    },
    {
      "$id": "order456",
      "total": 35.50,
      ...
    },
    // ... hàng trăm orders nữa
  ]
}
```

**Cách lấy orders của user:**
```typescript
// Lấy user → tự động có orders
const user = await getUser(userId);
console.log(user.orders); // Array of orders
```

**Ưu điểm:**
- ✅ Lấy user → tự động có orders (không cần query thêm)

**Nhược điểm:**
- ❌ User document "phình" lên (chứa tất cả orders)
- ❌ Performance chậm (user có 1000 orders → document rất lớn)
- ❌ Giới hạn: Appwrite giới hạn document size
- ❌ Mỗi order mới → phải update user document

---

## 🎯 Kết Luận: Nên Dùng Gì?

### Cho Orders Collection:

```
✅ userId: Relationship (One-Way)
✅ Type: Many to One
✅ Related: User collection
✅ Two Way: NO
✅ On Delete: Set Null
```

**Lý do:**
1. User có thể có hàng trăm/hàng nghìn orders
2. One-way giữ user document nhỏ gọn
3. Performance tốt hơn
4. Dễ scale

---

## 📊 So Sánh Tổng Hợp

| Tiêu chí | String | Relationship (One-Way) | Relationship (Two-Way) |
|----------|--------|------------------------|------------------------|
| **Data integrity** | ❌ Yếu | ✅ Tốt | ✅ Tốt |
| **Auto validation** | ❌ Không | ✅ Có | ✅ Có |
| **Lấy user info từ order** | ❌ Phải query 2 lần | ✅ 1 lần | ✅ 1 lần |
| **Lấy orders từ user** | ❌ Phải query | ❌ Phải query | ✅ Tự động có |
| **User document size** | ✅ Nhỏ | ✅ Nhỏ | ❌ Lớn (chứa orders) |
| **Performance** | ⚠️ Trung bình | ✅ Tốt | ❌ Chậm |
| **Phù hợp cho** | - | ✅ 1-to-many | 1-to-few |
| **Khuyên dùng cho Orders?** | ❌ Không | ✅✅✅ **YES** | ❌ Không |

---

## 🛠️ Cách Tạo Trong Appwrite

### Bước 1: Vào Orders Collection
1. Appwrite Console
2. Databases → orders collection
3. Tab **Columns**

### Bước 2: Tạo Relationship
1. Click **"+ Create Attribute"**
2. Chọn type: **Relationship**

### Bước 3: Điền Form
```
Attribute ID: userId

Related Collection: User
(Chọn User từ dropdown)

Relationship Type: Many to One
(Many orders → One user)

On Delete: Set Null
(Khuyên dùng - an toàn hơn)

Two Way: ❌ NO
(Không tick checkbox)

Two Way Attribute Key: (bỏ trống)
```

### Bước 4: Click Create

---

## 💻 Code Không Đổi!

Tin tốt: Code **KHÔNG CẦN** thay đổi nhiều!

### Khi tạo order (vẫn pass string):
```typescript
await createOrder({
    userId: user.$id,  // ← Vẫn là string!
    // Appwrite tự động convert thành relationship
    ...
});
```

### Khi query orders:
```typescript
const orders = await databases.listDocuments(
    databaseId,
    ordersCollectionId,
    [Query.equal('userId', userId)]  // ← Vẫn dùng như cũ!
);
```

### Khi đọc order:
```typescript
const order = await getOrderById(orderId);

// Nếu dùng String
console.log(order.userId); // "673ecb8e000e1d2a3f4b"

// Nếu dùng Relationship
console.log(order.userId.$id);    // "673ecb8e000e1d2a3f4b"
console.log(order.userId.name);   // "John Doe" ← BONUS!
console.log(order.userId.email);  // "john@example.com" ← BONUS!
```

---

## 🎁 Bonus: Hiển Thị User Info Trong Order Detail

Với Relationship, bạn có thể hiển thị thông tin user ngay trong Order Detail:

```tsx
// app/order-detail.tsx

<View className="border-t border-gray-200 mt-4 pt-4">
    <Text className="h4-bold mb-3">Customer Information</Text>
    
    {/* Avatar */}
    <Image 
        source={{ uri: order.userId.avatar }}
        className="size-12 rounded-full mb-2"
    />
    
    {/* Name */}
    <Text className="paragraph-bold">
        {order.userId.name}
    </Text>
    
    {/* Email */}
    <Text className="body-regular text-gray-500">
        {order.userId.email}
    </Text>
</View>
```

**Không cần query thêm User collection!** 🎉

---

## ❓ FAQ

### Q: Đã tạo userId dạng String, phải làm sao?

**A:** Có 2 options:

**Option 1: Xóa và tạo lại (Khuyên dùng)**
1. Xóa attribute `userId` (String)
2. Tạo lại attribute `userId` (Relationship)
3. ⚠️ Lưu ý: Mất hết data cũ!

**Option 2: Giữ nguyên**
- Nếu đã có data quan trọng
- Vẫn chạy được bình thường
- Nhưng không có lợi ích của Relationship

---

### Q: Set Null hay Cascade khi xóa user?

**A:** Tùy business logic:

**Set Null (Khuyên dùng):**
- Xóa user → userId = null
- Orders vẫn giữ lại (để audit trail)
- An toàn hơn

**Cascade:**
- Xóa user → xóa luôn tất cả orders
- Dùng khi orders không có giá trị nếu không có user
- Nguy hiểm! Cẩn thận

---

### Q: Có thể đổi từ One-Way sang Two-Way sau này?

**A:** Có, nhưng:
- Phải xóa relationship cũ
- Tạo lại relationship mới
- Mất data
- Nên quyết định ngay từ đầu

---

## 🎉 Tóm Tắt

1. ✅ **Dùng Relationship**, không dùng String
2. ✅ **One-Way** (Many to One), không dùng Two-Way
3. ✅ **On Delete: Set Null** (an toàn)
4. ✅ Code **không cần đổi** nhiều
5. ✅ Lợi ích: Data integrity, validation, join tự động

**Chúc bạn thành công! 🚀**
