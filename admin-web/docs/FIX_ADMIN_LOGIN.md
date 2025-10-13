# 🔧 FIX ADMIN LOGIN - QUICK GUIDE

## ❌ Vấn đề:
Login admin bị lỗi "Access denied" hoặc "Login failed"

## 🔍 Nguyên nhân:
User document trong Database **thiếu field `accountId`** hoặc `accountId` không khớp với Auth user `$id`.

---

## ✅ GIẢI PHÁP 1: SỬA MANUAL (NHANH - 2 phút)

### Bước 1: Lấy Auth user ID

1. Mở Appwrite Console: https://nyc.cloud.appwrite.io/console
2. Vào **Auth → Users**
3. Click vào user `admin@gmail.com`
4. **Copy `$id`** ở đầu trang (ví dụ: `68eced9a001927b2771e`)

### Bước 2: Cập nhật User document

1. Vào **Databases → database-68da5e73002cb68e70af → user**
2. Tìm row với `email = admin@gmail.com` (row 3)
3. Click vào row đó
4. Tìm field **`accountId`**
5. Nhập Auth user `$id` vừa copy (ví dụ: `68eced9a001927b2771e`)
6. **Kiểm tra field `role` = "admin"**
7. Click **Update**

### Bước 3: Verify Auth label

1. Quay lại **Auth → Users → admin@gmail.com**
2. Scroll xuống **"Labels"**
3. Đảm bảo có label **"admin"** (đã có trong hình 2)
4. Nếu chưa có, click "Add" và nhập "admin"

### Bước 4: Test login

1. Mở: http://localhost:3001
2. Login:
   - Email: admin@gmail.com
   - Password: admin123
3. **Xong!** ✅

---

## ✅ GIẢI PHÁP 2: TẠO LẠI BẰNG SCRIPT (TỰ ĐỘNG - 3 phút)

### Bước 1: Xóa user cũ (nếu cần)

**Trong Appwrite Console:**
1. Database → user → Xóa row admin cũ (giữ Auth user)

### Bước 2: Chạy script

**Trong terminal:**
```powershell
cd admin-web
node scripts/create-admin.js
```

**Follow prompts:**
- Email: admin@gmail.com (hoặc enter để dùng default)
- Password: admin123 (hoặc enter để dùng default)
- Name: Admin (hoặc enter để dùng default)

**Script sẽ:**
✅ Tạo hoặc tìm Auth user
✅ Tạo User document với `accountId` đúng
✅ Hướng dẫn add label "admin"

### Bước 3: Add label (manual)

Script sẽ in ra hướng dẫn:
1. Auth → Users → admin@gmail.com
2. Add label: "admin"
3. Update

### Bước 4: Test login

http://localhost:3001

---

## 📋 CHECKLIST ĐỂ LOGIN THÀNH CÔNG:

- [ ] Auth user exists: `admin@gmail.com`
- [ ] Auth user password: `admin123` (hoặc password bạn set)
- [ ] Auth user label: `admin` ✅
- [ ] User document exists in "user" collection
- [ ] User document `accountId` = Auth user `$id` ← **QUAN TRỌNG NHẤT**
- [ ] User document `role` = `admin`
- [ ] User document `email` = `admin@gmail.com`

---

## 🧪 VERIFY:

### Test 1: Check trong Console
```
Auth user $id: 68eced9a001927b2771e
User doc accountId: 68eced9a001927b2771e
→ PHẢI GIỐNG NHAU! ✅
```

### Test 2: Login
```
URL: http://localhost:3001
Email: admin@gmail.com
Password: admin123
Result: Dashboard page ✅
```

---

## 🚨 NẾU VẪN LỖI:

### Lỗi 1: "Access denied"
→ `role` không phải "admin" hoặc `accountId` sai

### Lỗi 2: "Invalid credentials"
→ Email/password sai hoặc Auth user không tồn tại

### Lỗi 3: "User not found"
→ User document không có hoặc `accountId` không khớp

### Debug:
Mở DevTools (F12) → Console → Xem lỗi chi tiết
Chụp màn hình và gửi cho tôi để debug!

---

**KHUYÊN DÙNG: Giải pháp 1 (Manual) - Nhanh và dễ nhất!**
