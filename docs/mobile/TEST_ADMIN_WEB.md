# 🧪 TEST ADMIN WEB - QUICK GUIDE

## ✅ Admin-web đã chạy thành công!

**URL**: http://localhost:3001

---

## 🔥 TEST NGAY (5 phút)

### 1. Test Login (2 phút)

**Mở trình duyệt:**
```
http://localhost:3001
```

**Nhập thông tin:**
- Email: [email admin của bạn]
- Password: [password admin]

**Click "Sign In"**

**Kết quả mong đợi:**
- ✅ Redirect đến Dashboard
- ✅ Thấy sidebar bên trái
- ✅ Thấy header với tên admin
- ✅ Thấy 4 stat cards

**Nếu lỗi:**
- "Access denied" → User không phải admin
- "Login failed" → Sai email/password
- Network error → Kiểm tra Appwrite config

---

### 2. Test Navigation (1 phút)

**Click từng menu:**
- Dashboard ← Trang chính
- Orders ← Quản lý đơn hàng
- Customers ← Danh sách khách hàng
- Products ← Quản lý sản phẩm

**Check:**
- [ ] Sidebar highlight đúng page
- [ ] Header hiển thị tên admin
- [ ] Có thể Sign Out

---

### 3. Test Orders (2 phút)

**Click "Orders"**

**Nếu thấy đơn hàng:**
- ✅ Permissions đã OK
- Test search
- Test filter by status
- Thử đổi order status

**Nếu lỗi "Failed to fetch":**
- ⚠️ Cần thêm admin permissions
- Xem hướng dẫn bên dưới

---

## ⚠️ NẾU CHƯA THÊM PERMISSIONS

### Quick Fix (10 phút):

1. **Mở Appwrite Console**
   ```
   https://nyc.cloud.appwrite.io/console
   ```

2. **Vào Database → Collection**
   
3. **Với mỗi collection (user, orders, menu, categories, customizations):**
   ```
   Settings → Permissions → Add role
   
   Role name: admin
   
   Permissions:
   ☑ Read
   ☑ Create (cho menu, categories, customizations)
   ☑ Update
   ☑ Delete
   
   Click "Add"
   ```

4. **Reload admin-web**
   ```
   Ctrl + R (hoặc F5)
   ```

5. **Test lại Orders/Customers/Products**

---

## 📋 CHECKLIST

### Cài đặt & Chạy
- [x] npm install ✅
- [x] .env configured ✅
- [x] npm run dev ✅
- [x] http://localhost:3001 mở được ✅

### Appwrite Setup
- [ ] Admin user có role = "admin"
- [ ] Admin user có label "admin"
- [ ] Admin role permissions đã thêm vào các collections

### Testing
- [ ] Login thành công
- [ ] Dashboard hiển thị
- [ ] Orders page works
- [ ] Customers page works
- [ ] Products page works
- [ ] Sign out works

---

## 🎯 MỤC TIÊU

**Bước 1**: Login thành công ← TEST NGAY
**Bước 2**: Thêm permissions ← Sau khi login
**Bước 3**: Test tất cả features ← Xác nhận hoạt động

---

## 📞 BÁO KẾT QUẢ

Sau khi test, cho tôi biết:

1. **Login có thành công không?**
   - Thành công → Tiếp tục test features
   - Thất bại → Báo lỗi gì để tôi fix

2. **Dashboard có hiển thị không?**
   - Có → OK
   - Không → Screenshot lỗi

3. **Orders/Customers/Products có load data không?**
   - Có → Permissions đã OK
   - Không → Cần thêm permissions

---

**Hãy test ngay và báo kết quả nhé! 🚀**

**URL để test**: http://localhost:3001
