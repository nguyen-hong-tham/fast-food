# 🔧 FIX ORDERS PERMISSION - URGENT

## ❌ Lỗi hiện tại:
```
AppwriteException: The current user is not authorized to perform the requested action.
```

## 🔍 Nguyên nhân:
Collection **`orders`** chưa có permissions cho phép users tạo đơn hàng.

---

## ✅ GIẢI PHÁP - FIX NGAY (3 phút):

### Bước 1: Mở Appwrite Console
```
https://nyc.cloud.appwrite.io/console/project-68c9791a002b85f096b4
```

### Bước 2: Vào Orders Collection
1. Click **Databases** (sidebar trái)
2. Click database **`database-68da5e73002cb68e70af`**
3. Click collection **`orders`**
4. Click tab **Settings**

### Bước 3: Thêm Permissions
Scroll xuống phần **"Permissions"**, click **"Add role"**

#### ⚙️ Permission 1: Users can CREATE their own orders
```
Role: Any
Permissions: ☑ Create
Click "Add"
```

#### ⚙️ Permission 2: Users can READ their own orders  
```
Role: Users
Permissions: ☑ Read
Click "Add"
```

#### ⚙️ Permission 3: Owner can UPDATE/DELETE (optional)
```
Role: Users
Permissions: ☑ Update ☑ Delete
Click "Add"
```

### Bước 4: Save
Click **"Update"** ở cuối trang.

---

## 🔒 Chi tiết Permissions nên set:

| Role | Create | Read | Update | Delete | Mục đích |
|------|--------|------|--------|--------|----------|
| **Any** | ✅ | ❌ | ❌ | ❌ | Cho phép tạo order (kể cả guest nếu cần) |
| **Users** | ✅ | ✅ | ✅ | ❌ | Users đọc/sửa orders của mình |
| **Admin** (label) | ✅ | ✅ | ✅ | ✅ | Admin quản lý tất cả orders |

**Recommended**: Dùng **Any** cho Create (vì user đã login thông qua session)

---

## 🧪 TEST SAU KHI FIX:

1. **Quay lại app**: http://localhost:8081
2. **Vào Cart** → Bấm "Order Now"
3. **Kết quả mong đợi**:
   - ✅ Không còn lỗi "not authorized"
   - ✅ Order được tạo thành công
   - ✅ Hiện thông báo "Order Placed!"

---

## ⚠️ LƯU Ý:

### Nếu muốn chặt chẽ hơn:
Thay vì **"Any"**, dùng **"Users"** cho Create:
- Chỉ user đã login mới được tạo order
- Cần thêm attribute filter trong code

### Document-level permissions (Nâng cao):
Khi tạo order, có thể set owner:
```typescript
await databases.createDocument(
  databaseId,
  ordersCollectionId,
  ID.unique(),
  orderData,
  [
    Permission.read(Role.user(userId)),
    Permission.update(Role.user(userId)),
  ]
);
```

---

## 📸 Screenshot tham khảo:

**Permissions section sẽ trông như này:**

```
Permissions

Role: any
Permissions: Create
[Remove]

Role: users  
Permissions: Read, Update
[Remove]

Role: label:admin
Permissions: Create, Read, Update, Delete
[Remove]

[Add role]
```

---

**HÃY FIX PERMISSIONS TRƯỚC, RỒI MỚI TEST TIẾP!** 🚀

Sau khi fix xong, báo tôi để tôi implement confirmation modal nhé!
