# 🌟 HƯỚNG DẪN ĐÁNH GIÁ NHÀ HÀNG (RESTAURANT REVIEW)

## 📌 YÊU CẦU

Cho phép khách hàng đánh giá nhà hàng sau khi hoàn tất đơn hàng với:
- ✅ Thang điểm 1-5 sao cho 3 tiêu chí: **Chất lượng món ăn**, **Tốc độ giao hàng**, **Dịch vụ**
- ✅ Nhận xét văn bản (tùy chọn)
- ✅ Upload ảnh (tùy chọn)
- ✅ Mỗi đơn hàng chỉ được đánh giá 1 lần
- ✅ Tự động tính điểm trung bình của nhà hàng

---

## 📂 PHẦN 1: TẠO COLLECTION TRÊN APPWRITE

### Bước 1: Tạo Collection

1. Mở **Appwrite Console**: https://cloud.appwrite.io
2. Chọn **Project** của bạn
3. **Databases** → Chọn database hiện tại
4. Click **"Create Collection"**
   - **Collection ID**: `reviews`
   - **Collection Name**: `Reviews`
   - Click **Create**

---

## 📝 PHẦN 2: TẠO ATTRIBUTES

### ⚠️ QUAN TRỌNG: DÙNG STRING, KHÔNG PHẢI RELATIONSHIP

Trong project này, chúng ta **KHÔNG dùng Appwrite Relationships**. Lý do:
- ✅ Dễ query và filter hơn
- ✅ Không bị ràng buộc bởi cascading delete
- ✅ Linh hoạt với external references
- ✅ Nhất quán với các collection khác trong project (orders, menu, etc.)

Các trường `userId`, `restaurantId`, `orderId` sẽ lưu **String ID** để reference thủ công.

---

### Attribute 1: userId (String, Required)

```
Attribute Key: userId
Type: String
Size: 255
Required: Yes
Array: No
```

**Ý nghĩa**: ID của người dùng đánh giá (reference đến collection `user`)

---

### Attribute 2: restaurantId (String, Required)

```
Attribute Key: restaurantId
Type: String
Size: 255
Required: Yes
Array: No
```

**Ý nghĩa**: ID của nhà hàng được đánh giá (reference đến collection `restaurants`)

---

### Attribute 3: orderId (String, Required)

```
Attribute Key: orderId
Type: String
Size: 255
Required: Yes
Array: No
```

**Ý nghĩa**: ID của đơn hàng đã hoàn thành (reference đến collection `orders`)

---

### Attribute 4: overallRating (Integer, Required)

```
Attribute Key: overallRating
Type: Integer
Required: Yes
Min: 1
Max: 5
```

**Ý nghĩa**: Điểm đánh giá tổng thể (1-5 sao)

---

### Attribute 5: foodQuality (Integer, Optional)

```
Attribute Key: foodQuality
Type: Integer
Required: No
Min: 1
Max: 5
```

**Ý nghĩa**: Điểm đánh giá chất lượng món ăn (1-5 sao)

---

### Attribute 6: deliverySpeed (Integer, Optional)

```
Attribute Key: deliverySpeed
Type: Integer
Required: No
Min: 1
Max: 5
```

**Ý nghĩa**: Điểm đánh giá tốc độ giao hàng (1-5 sao)

---

### Attribute 7: service (Integer, Optional)

```
Attribute Key: service
Type: Integer
Required: No
Min: 1
Max: 5
```

**Ý nghĩa**: Điểm đánh giá dịch vụ (1-5 sao)

---

### Attribute 8: comment (String, Optional)

```
Attribute Key: comment
Type: String
Size: 2000
Required: No
Array: No
```

**Ý nghĩa**: Nhận xét văn bản của khách hàng

---

### Attribute 9: isVisible (Boolean, Optional)

```
Attribute Key: isVisible
Type: Boolean
Required: No
Default: true
```

**Ý nghĩa**: Kiểm soát hiển thị review (admin có thể ẩn review vi phạm)

---

### Attribute 10: restaurantResponse (String, Optional)

```
Attribute Key: restaurantResponse
Type: String
Size: 1000
Required: No
```

**Ý nghĩa**: Phản hồi của chủ nhà hàng

---

## 🔍 PHẦN 3: TẠO INDEXES

Click tab **Indexes** → **Create Index**:

### Index 1: Query reviews by restaurantId

```
Index Key: restaurantId_idx
Type: Key
Attributes: restaurantId
Order: ASC
```

**Mục đích**: Query nhanh tất cả reviews của 1 nhà hàng

---

### Index 2: Query reviews by userId

```
Index Key: userId_idx
Type: Key
Attributes: userId
Order: ASC
```

**Mục đích**: Query reviews của 1 user cụ thể

---

### Index 3: Query reviews by orderId

```
Index Key: orderId_idx
Type: Key
Attributes: orderId
Order: ASC
```

**Mục đích**: Kiểm tra xem order đã được review chưa

---

### Index 4: Sort by rating (DESC)

```
Index Key: rating_idx
Type: Key
Attributes: overallRating
Order: DESC
```

**Mục đích**: Sort reviews từ cao đến thấp

---

### Index 5: Sort by date (DESC)

```
Index Key: createdAt_idx
Type: Key
Attributes: $createdAt
Order: DESC
```

**Mục đích**: Sort reviews từ mới đến cũ

---

## 🔐 PHẦN 4: CẤU HÌNH PERMISSIONS

Click **Settings** → **Permissions**:

### Create Permission
```
Role: users (Any authenticated user)
Permission: Create
```
✅ User đã login mới được tạo review

### Read Permission
```
Role: any (Public)
Permission: Read
```
✅ Mọi người xem được reviews (kể cả chưa login)

### Update Permission
```
Role: users
Permission: Update
Condition: userId == $userId (owner only)
```
✅ User chỉ sửa được review của mình

**Bổ sung cho restaurant response:**
```
Role: restaurant_owners
Permission: Update (restaurantResponse field only)
```

### Delete Permission
```
Role: users (Own reviews)
Role: admin (All reviews)
Permission: Delete
```

---

## 🎯 PHẦN 5: TẠI SAO KHÔNG DÙNG RELATIONSHIP?

### ❌ Nếu dùng Appwrite Relationship:

```
Attribute Key: userId
Type: Relationship
Related Collection: user
Relation Type: Many to One
On Delete: Cascade / Set NULL
```

**Vấn đề:**
1. ❌ Không linh hoạt khi user bị xóa → reviews cũng bị xóa hoặc userId = null
2. ❌ Query phức tạp hơn với nested relationships
3. ❌ Không nhất quán với cách project đang làm
4. ❌ Khó migrate nếu sau này đổi backend

### ✅ Dùng String (Khuyến nghị):

```
Attribute Key: userId
Type: String
Size: 255
```

**Ưu điểm:**
1. ✅ Linh hoạt: User xóa account, review vẫn giữ lại với text "Deleted User"
2. ✅ Query đơn giản: `Query.equal('userId', userId)`
3. ✅ Nhất quán với orders, menu, drones collections
4. ✅ Dễ join data ở application layer

---

## 📱 PHẦN 6: CODE INTEGRATION (ĐÃ CẬP NHẬT)

File code đã được cập nhật:
- ✅ `mobile/lib/reviews.ts` - API helpers
- ✅ `mobile/components/RestaurantRatingInput.tsx` - Component đánh giá nhà hàng
- ✅ `mobile/components/ReviewCard.tsx` - Hiển thị review

Xem file `REVIEWS_RESTAURANT_CODE.md` để biết chi tiết code.

---

## ✅ CHECKLIST HOÀN THÀNH

- [ ] Đã tạo collection `reviews` trên Appwrite Console
- [ ] Đã tạo 10 attributes (userId, restaurantId, orderId, overallRating, foodQuality, deliverySpeed, service, comment, isVisible, restaurantResponse)
- [ ] Đã tạo 5 indexes (restaurantId_idx, userId_idx, orderId_idx, rating_idx, createdAt_idx)
- [ ] Đã cấu hình Permissions (Create: users, Read: any, Update: users/restaurant, Delete: users/admin)
- [ ] Đã thêm `reviewsCollectionId: "reviews"` vào `mobile/lib/appwrite.ts`
- [ ] Đã test tạo review từ mobile app
- [ ] Đã test hiển thị reviews trên trang nhà hàng
- [ ] Đã test duplicate prevention (1 order chỉ review 1 lần)
- [ ] Đã test tính điểm trung bình tự động

---

## 🎉 HOÀN THÀNH!

Bây giờ bạn có hệ thống đánh giá nhà hàng với:
- ✅ 3 tiêu chí đánh giá (Chất lượng, Tốc độ, Dịch vụ)
- ✅ Điểm tổng thể tự động
- ✅ Upload ảnh
- ✅ Restaurant response
- ✅ Prevent duplicate reviews
- ✅ Auto-calculate average rating

**Happy Coding! 🚀**
