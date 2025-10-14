# ✅ ADMIN WEB APP - SETUP CHECKLIST

## 📦 Cài đặt (5 phút)

- [ ] `cd admin-web`
- [ ] `npm install`
- [ ] `cp .env.example .env`
- [ ] Sửa file `.env` với thông tin Appwrite của bạn
- [ ] `npm run dev`
- [ ] Mở http://localhost:3001

---

## 🔐 Appwrite Permissions (10 phút)

### User Collection
- [ ] Settings → Permissions → Add role `admin`
- [ ] ☑ Read
- [ ] ☑ Update
- [ ] ☑ Delete

### Orders Collection
- [ ] Settings → Permissions → Add role `admin`
- [ ] ☑ Read
- [ ] ☑ Update
- [ ] ☑ Delete

### Menu Collection
- [ ] Settings → Permissions → Add role `admin`
- [ ] ☑ Create
- [ ] ☑ Read
- [ ] ☑ Update
- [ ] ☑ Delete

### Categories Collection
- [ ] Settings → Permissions → Add role `admin`
- [ ] ☑ Create, ☑ Read, ☑ Update, ☑ Delete

### Customizations Collection
- [ ] Settings → Permissions → Add role `admin`
- [ ] ☑ Create, ☑ Read, ☑ Update, ☑ Delete

---

## 👤 Admin User (2 phút)

**Database:**
- [ ] Vào collection `user` → Tìm user của bạn
- [ ] Update field `role` = `"admin"`

**Auth:**
- [ ] Vào Auth → Users → Tìm user của bạn
- [ ] Thêm label `admin`

---

## 🧪 Testing (5 phút)

- [ ] Đăng nhập tại http://localhost:3001
- [ ] Dashboard hiển thị stats đúng
- [ ] Orders page shows all orders
- [ ] Có thể update order status
- [ ] Customers page shows all users
- [ ] Products page shows all menu items
- [ ] Có thể delete product

---

## 🌐 Deploy (Option - 15 phút)

### Vercel
- [ ] Push code lên GitHub
- [ ] Import project vào Vercel
- [ ] Set Root Directory = `admin-web`
- [ ] Thêm environment variables (VITE_*)
- [ ] Deploy

### Sau Deploy
- [ ] Appwrite Console → Settings → Platforms
- [ ] Add web platform với production URL
- [ ] Test đăng nhập trên production

---

## 🎯 Tổng kết

**Bạn cần:**
1. ✅ Admin web app running local (http://localhost:3001)
2. ✅ Admin role permissions trong Appwrite
3. ✅ Admin user có role + label
4. ✅ Test tất cả features hoạt động

**URLs:**
- Local: http://localhost:3001
- Production: https://admin-yourapp.vercel.app (sau khi deploy)

**Thời gian:**
- Setup local: ~20 phút
- Deploy production: ~15 phút
- **Tổng: ~35 phút**

---

## 🐛 Quick Fixes

**"Access denied":**
→ Kiểm tra user có `role = 'admin'` + label `admin`

**"Failed to fetch orders":**
→ Thêm admin role permissions (xem phần Permissions ở trên)

**CORS error:**
→ Thêm localhost:3001 vào Appwrite Platforms

---

**Hướng dẫn chi tiết:** Xem file `ADMIN_WEB_APP_SETUP.md`

**Good luck! 🚀**
