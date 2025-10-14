# 📊 PHÂN TÍCH VÀ ĐỀ XUẤT DATABASE DESIGN

## 🔍 1. DATABASE HIỆN TẠI (Từ Screenshots)

### ✅ Collections Đã Tạo:

#### 1. **User** Collection
```
Columns:
- $id (auto)
- name (String, 100, required)
- email (String, required)
- accountId (String, 2200, required)
- avatar (String, required)
- phone (String, 15)
- address_home (String, 255)
- address_work (String, 255)
- address_home_label (String, 50) - Default: "Home"
- address_work_label (String, 50) - Default: "Work"
- createdAt (DateTime)
- updatedAt (DateTime)
- $createdAt (auto)
- $updatedAt (auto)
```

**✅ Đánh giá**: Hoàn chỉnh! Đã có đủ thông tin user, phone, addresses.

---

#### 2. **orders** Collection
```
Columns:
- $id (auto)
- orderId (String, 1000, required) ⚠️
- $createdAt (auto)
- $updatedAt (auto)
```

**❌ Vấn đề**: 
- Thiếu hầu hết các attributes quan trọng!
- Có `orderId` String nhưng nên xóa (vì đã có $id)
- Thiếu: userId, items, total, status, deliveryAddress, phone, notes, createdAt, updatedAt

**🔧 Cần sửa**: Xem phần "2. CẦN BỔ SUNG" bên dưới

---

#### 3. **menu** Collection
```
Columns:
- $id (auto)
- name (String, 200, required)
- description (String, 2200, required)
- image_url (String, required)
- rating (Float, required)
- calories (Float, Min: 5, Max: 10000, required)
- protein (Float, Min: 5, Max: 10000, required)
- price (Float, Min: 5, Max: 10000, required)
- categories (Relationship → categories, Many to one) ✅
- menuCustomizations (Relationship → menu_customizations, Many to one) ✅
- $createdAt (auto)
- $updatedAt (auto)
```

**✅ Đánh giá**: Hoàn chỉnh! Có relationships đúng.

---

#### 4. **categories** Collection
```
Columns:
- $id (auto)
- name (String, 100, required)
- description (String, 100, required)
- menu (Relationship → menu, Many to one) ✅
- $createdAt (auto)
- $updatedAt (auto)
```

**✅ Đánh giá**: Hoàn chỉnh!

---

#### 5. **customizations** Collection
```
Columns:
- $id (auto)
- name (String, 100, required)
- price (Float, Min: 5, Max: 10000, required)
- type (Enum, required)
- menuCustomizations (Relationship → menu_customizations, Many to one) ✅
- $createdAt (auto)
- $updatedAt (auto)
```

**✅ Đánh giá**: Hoàn chỉnh!

---

#### 6. **menu_customizations** Collection (Junction Table)
```
Columns:
- $id (auto)
- menu (Relationship → menu, Many to one) ✅
- customizations (Relationship → customizations, Many to one) ✅
- $createdAt (auto)
- $updatedAt (auto)
```

**✅ Đánh giá**: Hoàn chỉnh! Junction table đúng chuẩn Many-to-Many.

---

## ❌ 2. CẦN BỔ SUNG - ORDERS COLLECTION

### 🔴 QUAN TRỌNG: Hoàn thiện Orders Collection

**Bước 1: Xóa attribute `orderId` (String)**
- Vì đã có `$id` tự động

**Bước 2: Thêm các attributes sau:**

#### A. user (RELATIONSHIP) ⭐
```
Type: Relationship
Related Collection: User
Relationship Type: Many to One
Two Way: NO
On Delete: Set Null
```

#### B. items (String, 10000, Required)
```
Type: String
Size: 10000
Required: Yes
```
→ Lưu JSON array các món ăn

#### C. total (Float, Required)
```
Type: Float
Required: Yes
Min: 0
```

#### D. status (Enum, Required)
```
Type: Enum
Required: Yes
Default: pending
Elements:
  - pending
  - preparing
  - ready
  - delivering
  - completed
  - cancelled
```

#### E. deliveryAddress (String, 500, Required)
```
Type: String
Size: 500
Required: Yes
```

#### F. deliveryAddressLabel (String, 100, Optional)
```
Type: String
Size: 100
Required: No
```

#### G. phone (String, 20, Required)
```
Type: String
Size: 20
Required: Yes
```

#### H. notes (String, 1000, Optional)
```
Type: String
Size: 1000
Required: No
```

#### I. createdAt (DateTime, Required)
```
Type: DateTime
Required: Yes
Default: now()
```

#### J. updatedAt (DateTime, Required)
```
Type: DateTime
Required: Yes
Default: now()
```

---

## ✅ 3. COLLECTIONS BỔ SUNG (OPTIONAL - NÂNG CAO)

Nếu muốn mở rộng tính năng sau này:

### A. **reviews** Collection (Đánh giá sản phẩm)
```
Columns:
- $id
- userId (Relationship → User)
- menuId (Relationship → menu)
- rating (Float, 1-5)
- comment (String, 500)
- createdAt (DateTime)
- updatedAt (DateTime)
```

**Use case**: User có thể đánh giá món ăn sau khi order

---

### B. **favorites** Collection (Món ăn yêu thích)
```
Columns:
- $id
- userId (Relationship → User)
- menuId (Relationship → menu)
- createdAt (DateTime)
```

**Use case**: User lưu món yêu thích để order nhanh

---

### C. **coupons** Collection (Mã giảm giá)
```
Columns:
- $id
- code (String, 50, unique)
- discount (Float) // phần trăm hoặc số tiền
- discountType (Enum: percentage, fixed)
- minOrder (Float) // đơn hàng tối thiểu
- maxDiscount (Float) // giảm tối đa
- expiryDate (DateTime)
- isActive (Boolean)
- usageLimit (Integer) // số lần sử dụng tối đa
- usedCount (Integer) // đã dùng bao nhiêu lần
```

**Use case**: Khuyến mãi, giảm giá

---

### D. **order_tracking** Collection (Theo dõi đơn hàng)
```
Columns:
- $id
- orderId (Relationship → orders)
- status (Enum)
- location (String)
- note (String)
- timestamp (DateTime)
```

**Use case**: Lịch sử thay đổi trạng thái đơn hàng

---

### E. **notifications** Collection (Thông báo)
```
Columns:
- $id
- userId (Relationship → User)
- title (String, 200)
- message (String, 500)
- type (Enum: order, promotion, system)
- isRead (Boolean)
- relatedOrderId (Relationship → orders, optional)
- createdAt (DateTime)
```

**Use case**: Thông báo đơn hàng, khuyến mãi

---

### F. **addresses** Collection (Nhiều địa chỉ)
```
Columns:
- $id
- userId (Relationship → User)
- label (String, 100) // Home, Office, etc.
- address (String, 500)
- isDefault (Boolean)
- phone (String, 20)
- recipientName (String, 100)
- createdAt (DateTime)
```

**Use case**: User có nhiều hơn 2 địa chỉ giao hàng

---

### G. **payment_methods** Collection (Phương thức thanh toán)
```
Columns:
- $id
- userId (Relationship → User)
- type (Enum: card, cash, wallet)
- cardNumber (String, encrypted)
- cardHolderName (String)
- expiryDate (String)
- isDefault (Boolean)
```

**Use case**: Thanh toán online

---

## 📊 4. DATABASE SCHEMA DIAGRAM (ERD)

### Mối Quan Hệ Hiện Tại:

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ 1
       │
       │ n
┌──────┴──────┐
│   orders    │◄── CẦN HOÀN THIỆN!
└─────────────┘


┌──────────────┐        ┌────────────────────────┐        ┌─────────────────┐
│  categories  │──────► │ menu                   │◄────── │ customizations  │
│              │ 1    n │                        │ n    1 │                 │
└──────────────┘        └───────┬────────────────┘        └─────────────────┘
                                │                                   ▲
                                │ n                                 │
                                │                                   │
                                │                                   │ n
                                │ 1                                 │
                          ┌─────▼────────────────────┐             │
                          │ menu_customizations      │─────────────┘
                          │ (Junction Table)         │ 1
                          └──────────────────────────┘
```

### Mối Quan Hệ Sau Khi Hoàn Thiện Orders:

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1
       │
       │ n
┌──────┴──────────────┐
│   orders            │
│ - userId (FK)       │
│ - items (JSON)      │
│ - total             │
│ - status            │
│ - deliveryAddress   │
│ - phone             │
│ - notes             │
│ - createdAt         │
│ - updatedAt         │
└─────────────────────┘
```

---

## 🎯 5. PRIORITIZATION (Ưu tiên làm gì)

### 🔴 PRIORITY 1 - BẮT BUỘC (Làm ngay):
1. ✅ **Hoàn thiện Orders Collection** 
   - Xóa orderId (String)
   - Thêm 10 attributes như hướng dẫn ở mục 2

### 🟡 PRIORITY 2 - NÊN CÓ (Sau khi xong P1):
2. ⚠️ **reviews** Collection - Cho user đánh giá món
3. ⚠️ **favorites** Collection - Lưu món yêu thích

### 🟢 PRIORITY 3 - TỐT NẾU CÓ (Tương lai):
4. 💡 **coupons** Collection - Mã giảm giá
5. 💡 **notifications** Collection - Thông báo
6. 💡 **addresses** Collection - Nhiều địa chỉ
7. 💡 **order_tracking** Collection - Tracking chi tiết
8. 💡 **payment_methods** Collection - Thanh toán online

---

## 📝 6. CHECKLIST HOÀN THIỆN DATABASE

### Hiện Tại (Đã xong):
- [x] User collection - Hoàn chỉnh
- [x] menu collection - Hoàn chỉnh
- [x] categories collection - Hoàn chỉnh
- [x] customizations collection - Hoàn chỉnh
- [x] menu_customizations collection - Hoàn chỉnh

### Cần Làm (Quan trọng):
- [ ] **orders collection** - CẦN HOÀN THIỆN NGAY!
  - [ ] Xóa orderId (String)
  - [x] Thêm user (Relationship) ✅
  - [ ] Thêm items (String, 10000)
  - [ ] Thêm total (Float)
  - [ ] Thêm status (Enum)
  - [ ] Thêm deliveryAddress (String, 500)
  - [ ] Thêm deliveryAddressLabel (String, 100)
  - [ ] Thêm phone (String, 20)
  - [ ] Thêm notes (String, 1000)
  - [ ] Thêm createdAt (DateTime)
  - [ ] Thêm updatedAt (DateTime)
  - [ ] Set Permissions (Document Security)

### Optional (Sau này):
- [ ] reviews collection
- [ ] favorites collection
- [ ] coupons collection
- [ ] notifications collection
- [ ] addresses collection
- [ ] order_tracking collection
- [ ] payment_methods collection

---

## 🚀 7. HÀNH ĐỘNG TIẾP THEO

### Bước 1: Hoàn thiện Orders Collection (20 phút)
👉 Làm theo file: **`HUONG_DAN_TAO_ORDERS_CO_HINH.md`**

### Bước 2: Test Orders Collection (10 phút)
- Tạo 1 order mẫu
- Test đặt hàng từ app
- Xem Order History

### Bước 3: Quyết định có làm Reviews/Favorites không
- Nếu có thời gian → Làm reviews & favorites
- Nếu không → Bỏ qua, focus vào core features

---

## 📊 8. DATABASE METRICS

### Size Estimates (Ước tính):

| Collection | Records/User | Size/Record | Total Size (1000 users) |
|------------|--------------|-------------|-------------------------|
| users | 1 | 1 KB | 1 MB |
| menu | - | 2 KB | 100 KB (50 items) |
| categories | - | 0.5 KB | 3 KB (6 categories) |
| customizations | - | 0.5 KB | 10 KB (20 items) |
| menu_customizations | - | 0.2 KB | 10 KB (50 relations) |
| **orders** | 5/month | 5 KB | **25 MB** |
| reviews (optional) | 2/month | 1 KB | 2 MB |
| favorites (optional) | 10 | 0.2 KB | 2 MB |

**Total: ~30 MB for 1000 users** (rất nhỏ!)

---

## 🔐 9. SECURITY & PERMISSIONS

### User Collection:
```
Read: Users (own documents)
Create: Public (registration)
Update: Users (own documents)
Delete: Admin only
```

### Orders Collection:
```
Read: Users (own orders)
Create: Users
Update: Admin (change status)
Delete: Admin only
```

### Menu, Categories, Customizations:
```
Read: Public
Create: Admin only
Update: Admin only
Delete: Admin only
```

---

## 💡 10. RECOMMENDATIONS

### A. Hiện tại (Core Features):
✅ **Tập trung vào**:
1. Hoàn thiện Orders collection
2. Test đặt hàng end-to-end
3. Order History UI
4. Order Detail UI

### B. Tương lai (Nice to Have):
💡 **Nếu có thêm thời gian**:
1. Reviews system (user feedback)
2. Favorites (save món yêu thích)
3. Coupons (marketing)
4. Push notifications

### C. Không cần thiết (Hiện tại):
❌ **Có thể bỏ qua**:
1. Payment gateway integration (dùng COD)
2. Real-time order tracking (GPS)
3. Admin dashboard (dùng Appwrite Console)
4. Chat support

---

## 📚 11. TÀI LIỆU THAM KHẢO

Xem chi tiết trong các files:
- `HUONG_DAN_TAO_ORDERS_CO_HINH.md` - Hướng dẫn từng bước tạo Orders
- `RELATIONSHIP_EXPLAINED.md` - Giải thích Relationship
- `ORDERS_QUICK_REFERENCE.md` - Quick reference
- `APPWRITE_ORDERS_SETUP_VIETNAMESE.md` - Setup tổng quan

---

## 🎉 KẾT LUẬN

### Tình trạng database hiện tại:
- ✅ **5/6 collections hoàn chỉnh** (83%)
- ❌ **1 collection cần hoàn thiện**: orders

### Action plan:
1. 🔴 **Ưu tiên cao**: Hoàn thiện orders collection (20 phút)
2. 🟡 **Ưu tiên trung bình**: Test + Fix bugs (30 phút)
3. 🟢 **Tùy chọn**: Thêm reviews/favorites (60 phút)

### Timeline:
- **Minimum**: 50 phút (orders + test)
- **Recommended**: 2 giờ (orders + test + 1 optional feature)
- **Full**: 3-4 giờ (tất cả)

**Khuyến nghị**: Làm minimum version trước, test kỹ, sau đó mới thêm features!

---

**Bạn muốn tôi hướng dẫn tạo collection nào trước?** 🚀
