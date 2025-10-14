# 🔐 FIX: Orders Collection Permissions

## ❌ VẤN ĐỀ

```
AppwriteException: The current user is not authorized to perform the requested action.
```

**Nguyên nhân**: Orders collection chưa có Permissions cho phép user tạo/đọc documents!

---

## ✅ GIẢI PHÁP: Set Permissions

### 🎯 Bước 1: Mở Orders Collection Settings

1. Vào **Appwrite Console**
2. Chọn Database → **orders** collection
3. Click tab **Settings** (không phải "Columns" hay "Rows")

---

### 🎯 Bước 2: Enable Document Security

Trong phần **Permissions**:

1. Tìm mục **"Document-level security"**
2. **BẬT** (Enable) Document-level security
   
   ☑️ **Document-level security enabled**

---

### 🎯 Bước 3: Set Collection-Level Permissions

Vẫn ở tab **Settings**, scroll xuống phần **Permissions**:

1. Click **"+ Add Role"**

2. **Thêm permission đầu tiên: CREATE**
   ```
   Role: Any
   Permissions: ☑️ Create
   ```
   → Click **Add**
   
   **Giải thích**: Cho phép BẤT KỲ user nào (đã login) có thể tạo order

3. **Thêm permission thứ hai: READ**
   ```
   Role: Users
   Permissions: ☑️ Read
   ```
   → Click **Add**
   
   **Giải thích**: Cho phép users đọc orders (kết hợp với Document Security sẽ chỉ đọc được order của mình)

---

### 🎯 Bước 4: Set Document-Level Permissions (Tự động)

Khi tạo order từ code, Appwrite sẽ tự động set permissions cho document:

```typescript
// Code đã có sẵn trong createOrder
await databases.createDocument(
    databaseId,
    ordersCollectionId,
    ID.unique(),
    {
        user: user.$id,  // ← userId của người tạo
        items: '...',
        total: 100,
        // ...
    }
);
```

Appwrite sẽ tự động set:
- User có thể **Read** order của chính họ
- User có thể **Update** order của chính họ (nếu cần)

---

## 📋 TÓM TẮT PERMISSIONS

| Permission Level | Role | Read | Create | Update | Delete |
|-----------------|------|------|--------|--------|--------|
| **Collection** | Any | - | ✅ | - | - |
| **Collection** | Users | ✅ | - | - | - |
| **Document** | Owner (user) | ✅ (auto) | - | ✅ (auto) | - |

---

## 🧪 TEST

### Test 1: Tạo Order
1. Add món vào cart
2. Click "Order Now"
3. **Kết quả**: Order được tạo thành công ✅

### Test 2: Xem Order History
1. Vào Order History
2. **Kết quả**: Chỉ thấy orders của mình ✅

### Test 3: User khác
1. Login với user khác
2. Vào Order History
3. **Kết quả**: Không thấy orders của user trước ✅

---

## 🔒 BẢO MẬT

### Tại sao dùng Document Security?

✅ **Bảo mật**:
- User A không thể đọc orders của User B
- User không thể xóa/sửa orders của người khác
- Admin vẫn có thể quản lý tất cả orders

✅ **Tự động**:
- Không cần code thêm logic check permissions
- Appwrite tự động filter documents dựa trên userId

✅ **Linh hoạt**:
- Có thể thêm permissions sau (ví dụ: admin có thể update status)

---

## ⚙️ ADVANCED: Permissions Chi Tiết (Optional)

Nếu muốn kiểm soát chi tiết hơn:

### Collection-Level Permissions:
```
Role: Any
- Create: ✅ (User đã login có thể tạo order)

Role: Users  
- Read: ✅ (User có thể query orders collection)
- Update: ❌ (Không cho update trực tiếp, chỉ admin)
- Delete: ❌ (Không cho delete, chỉ admin)
```

### Document-Level Permissions (Auto):
Khi tạo document, Appwrite set:
```
user:[USER_ID]
- Read: ✅
- Update: ✅ (nếu cần user update notes/cancel order)
- Delete: ❌
```

### Admin Permissions:
Thêm sau nếu có admin dashboard:
```
Role: team:admins
- Read: ✅
- Update: ✅ (update order status)
- Delete: ✅
```

---

## 🚨 TROUBLESHOOTING

### Lỗi: "User is not authorized"
✅ **Fix**: Enable Document Security + Set Collection Permissions (Any: Create, Users: Read)

### Lỗi: "Document not found"
✅ **Fix**: Check userId trong order document có khớp với user đang login

### Không thấy orders trong history
✅ **Fix**: 
1. Check User role có Read permission không
2. Check Document Security đã enable chưa
3. Check Query.equal('user', userId) đúng field name

---

## ✅ CHECKLIST

Sau khi set xong, check:

- [ ] Document Security: **ENABLED** ✅
- [ ] Collection Permission: **Any → Create** ✅
- [ ] Collection Permission: **Users → Read** ✅
- [ ] Test tạo order: **SUCCESS** ✅
- [ ] Test xem order history: **SUCCESS** ✅
- [ ] Test với user khác: **Không thấy orders của user trước** ✅

---

**🎉 Sau khi làm xong, test lại "Order Now"! Sẽ work ngay!**
