# 🔗 STRING vs RELATIONSHIP trong Appwrite

## 📊 SO SÁNH TỔNG QUAN

| Tiêu chí | String (Manual Reference) | Relationship (Appwrite) |
|----------|---------------------------|-------------------------|
| **Thiết lập** | ✅ Đơn giản - chỉ cần tạo attribute String | ⚠️ Phức tạp - cần cấu hình relation type, on delete behavior |
| **Query** | ✅ Dễ - `Query.equal('userId', id)` | ⚠️ Phức tạp hơn - nested queries |
| **Linh hoạt** | ✅ Cao - có thể reference bất kỳ collection nào | ❌ Thấp - bị ràng buộc với collection đã khai báo |
| **Data Integrity** | ⚠️ Thủ công - phải tự handle khi xóa | ✅ Tự động - có Cascade/Set NULL |
| **Performance** | ✅ Tốt - không cần join | ⚠️ Chậm hơn - phải join tables |
| **Migration** | ✅ Dễ - chỉ là string | ❌ Khó - phải migrate relationships |
| **Nhất quán** | ✅ Với project hiện tại | ❌ Khác với các collection khác |

---

## 🎯 QUYẾT ĐỊNH: DÙNG STRING

### Lý do chính:

#### 1. **Nhất quán với project**
Project hiện tại **100% dùng String** cho references:

```typescript
// File: mobile/type.d.ts

interface Order {
  userId: string;           // ← String, không phải Relationship
  restaurantId?: string;    // ← String
  // ...
}

interface OrderItem {
  orderId: string;          // ← String
  menuItemId: string;       // ← String
  // ...
}

interface Drone {
  assignedOrderId?: string; // ← String
  // ...
}

interface Notification {
  userId: string;           // ← String
  orderId?: string;         // ← String
  // ...
}
```

Nếu dùng Relationship cho `reviews` → **KHÔNG NHẤT QUÁN** với toàn bộ codebase.

#### 2. **Linh hoạt khi user bị xóa**

**Scenario**: User đăng ký → đánh giá nhà hàng → xóa account

| Cách xử lý | String | Relationship |
|------------|--------|--------------|
| Cascade Delete | Review vẫn tồn tại, hiển thị "Deleted User" | ❌ Review bị xóa theo → mất data |
| Set NULL | Review vẫn tồn tại, userId = null | ⚠️ Review tồn tại nhưng userId = null → phải handle null |
| Restrict | ✅ Linh hoạt - tự quyết định | ❌ Không thể xóa user nếu có review |

**Với String**: Ta có thể giữ lại review và hiển thị "Anonymous User" → Nhà hàng vẫn giữ được đánh giá.

#### 3. **Query đơn giản hơn**

**String**:
```typescript
// Lấy tất cả reviews của nhà hàng
const reviews = await databases.listDocuments(
  databaseId,
  'reviews',
  [
    Query.equal('restaurantId', restaurantId),
    Query.orderDesc('$createdAt')
  ]
);

// Join với user (manual)
const user = await databases.getDocument(
  databaseId,
  'user',
  review.userId
);
```

**Relationship** (nếu dùng):
```typescript
// Phải dùng nested query hoặc multiple requests
const reviews = await databases.listDocuments(
  databaseId,
  'reviews',
  [
    Query.equal('restaurantId', restaurantId), // Relationship query
  ]
);

// Appwrite tự động load related documents (có thể chậm)
```

#### 4. **Performance**

**String**:
- Query nhanh - chỉ query 1 collection
- Manual join ở application layer - linh hoạt, có thể cache

**Relationship**:
- Appwrite phải join ở database layer → chậm hơn
- Không kiểm soát được cách join

#### 5. **Dễ migrate backend sau này**

Nếu sau này bạn muốn chuyển từ Appwrite sang Firebase/Supabase/PostgreSQL:

**String**: Chỉ cần copy data → Dễ dàng

**Relationship**: Phải migrate cả relationship logic → Phức tạp

---

## 📝 VÍ DỤ CỤ THỂ

### Scenario: Tạo review

#### ✅ DÙNG STRING (Khuyến nghị)

**Appwrite Console**:
```
Attribute: userId
Type: String
Size: 255
Required: Yes
```

**Code**:
```typescript
// Tạo review
await databases.createDocument(
  databaseId,
  'reviews',
  'unique()',
  {
    userId: 'user123',           // ← String ID
    restaurantId: 'rest456',     // ← String ID
    orderId: 'order789',         // ← String ID
    overallRating: 5,
    comment: 'Great food!'
  }
);

// Query reviews
const reviews = await databases.listDocuments(
  databaseId,
  'reviews',
  [Query.equal('restaurantId', 'rest456')]
);

// Join với user (nếu cần)
const reviewWithUser = await Promise.all(
  reviews.documents.map(async (review) => {
    const user = await databases.getDocument(
      databaseId,
      'user',
      review.userId
    );
    
    return { ...review, userName: user.name };
  })
);
```

---

#### ❌ DÙNG RELATIONSHIP (Không khuyến nghị cho project này)

**Appwrite Console**:
```
Attribute: userId
Type: Relationship
Related Collection: user
Relation Type: Many to One
On Delete: Cascade / Set NULL / Restrict
```

**Vấn đề**:
1. **Cascade Delete**: User xóa account → reviews bị xóa → Nhà hàng mất đánh giá
2. **Set NULL**: userId = null → Phải handle null ở mọi nơi
3. **Restrict**: User không thể xóa account nếu có review → UX tệ

**Code**:
```typescript
// Tạo review với Relationship
await databases.createDocument(
  databaseId,
  'reviews',
  'unique()',
  {
    userId: 'user123',  // ← Appwrite tự động tạo relationship
    restaurantId: { $id: 'rest456' }, // ← Phải dùng object
    orderId: { $id: 'order789' },
    overallRating: 5,
    comment: 'Great food!'
  }
);

// Query với Relationship (phức tạp hơn)
const reviews = await databases.listDocuments(
  databaseId,
  'reviews',
  [
    Query.equal('restaurantId.$id', 'rest456') // ← Nested query
  ]
);

// User info tự động load (không kiểm soát được)
console.log(reviews.documents[0].userId.name); // ← Appwrite tự join
```

---

## 🎯 KẾT LUẬN

### ✅ DÙNG STRING cho project này vì:

1. ✅ **Nhất quán** với 100% collections hiện tại (orders, menu, drones, etc.)
2. ✅ **Linh hoạt** khi user xóa account → giữ lại reviews
3. ✅ **Query đơn giản** và dễ hiểu
4. ✅ **Performance tốt hơn**
5. ✅ **Dễ migrate** backend sau này
6. ✅ **Team đã quen** với pattern này

### ❌ KHÔNG DÙNG RELATIONSHIP vì:

1. ❌ Không nhất quán với codebase
2. ❌ Mất data khi user xóa account
3. ❌ Query phức tạp hơn
4. ❌ Performance chậm hơn
5. ❌ Team phải học pattern mới
6. ❌ Khó migrate backend

---

## 📚 TÀI LIỆU THAM KHẢO

**Appwrite Relationships Documentation**:
https://appwrite.io/docs/databases-relationships

**Best Practices**:
- Dùng Relationship khi: Cần data integrity nghiêm ngặt, ít khi xóa, project nhỏ
- Dùng String khi: Linh hoạt cao, có thể xóa, codebase lớn, nhiều references

---

## 🔧 HƯỚNG DẪN THỰC HÀNH

### Tạo attribute `userId` (String)

1. Mở **Appwrite Console**
2. Vào **Databases** → chọn database
3. Vào collection **reviews**
4. Click **Create Attribute**
5. Chọn **String**:
   ```
   Attribute Key: userId
   Size: 255
   Required: Yes
   Array: No
   Default: (leave empty)
   ```
6. Click **Create**

**KHÔNG** chọn **Relationship**! ⚠️

Làm tương tự cho `restaurantId` và `orderId`.

---

## 🎉 HOÀN THÀNH!

Bây giờ bạn hiểu tại sao project này dùng **String thay vì Relationship**! 🚀
