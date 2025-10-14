# 🔍 DEBUG: KIỂM TRA VẤN ĐỀ LOGIN

## ❌ Nguyên nhân có thể:

### 1. **User record thiếu `accountId`**

Khi tạo user manually trong Database, bạn PHẢI:

✅ **Bước 1**: Tạo Auth user
- Email: admin@gmail.com
- Password: admin123
- **Copy `$id` của Auth user** (ví dụ: `68eced9a001927b2771e`)

✅ **Bước 2**: Tạo User document trong collection "user"
- `$id`: Tự động generate hoặc custom
- `name`: admin
- `email`: admin@gmail.com
- **`accountId`**: `68eced9a001927b2771e` ← **QUAN TRỌNG!**
- `role`: admin
- `avatar`, `phone`, etc.: Optional

✅ **Bước 3**: Thêm label "admin" vào Auth user
- Auth → Users → Click vào admin@gmail.com
- Scroll xuống "Labels"
- Add label: "admin"

---

## 🔍 KIỂM TRA NGAY:

### Check 1: Auth user có `$id` gì?

1. Vào **Auth → Users**
2. Click vào `admin@gmail.com`
3. Xem `$id` ở đầu trang (ví dụ: `68eced9a001927b2771e`)
4. **Copy ID này**

### Check 2: User document có `accountId` đúng không?

1. Vào **Databases → user collection**
2. Click vào row của admin (row 3 trong hình)
3. Kiểm tra field `accountId` có = Auth user `$id` không?

**Nếu `accountId` NULL hoặc khác:**
- ❌ Đây là nguyên nhân!
- ✅ Sửa: Update `accountId` = Auth user `$id`

---

## 🛠️ FIX NHANH:

### Cách 1: Sửa User document
1. Database → user → Click row admin
2. Tìm field `accountId`
3. Nhập: `68eced9a001927b2771e` (Auth user $id)
4. Click Update

### Cách 2: Xóa và tạo lại bằng code
1. Xóa user document hiện tại
2. Dùng script tự động tạo

---

## 📋 CHECKLIST:

- [ ] Auth user `admin@gmail.com` tồn tại
- [ ] Auth user có label "admin"
- [ ] User document tồn tại trong collection
- [ ] User document field `accountId` = Auth user `$id`
- [ ] User document field `role` = "admin"
- [ ] User document field `email` = "admin@gmail.com"

---

## 🧪 TEST:

Sau khi sửa `accountId`, thử login lại:

**URL**: http://localhost:3001

**Credentials**:
- Email: admin@gmail.com
- Password: admin123

**Expected**:
- ✅ Login thành công
- ✅ Redirect to Dashboard
- ✅ Không còn lỗi "Access denied"

---

## 🚨 NẾU VẪN LỖI:

Chụp màn hình cho tôi:
1. Auth user detail page (với $id)
2. User document detail (tất cả fields)
3. Lỗi trong Console (F12)

Tôi sẽ debug chi tiết hơn!
