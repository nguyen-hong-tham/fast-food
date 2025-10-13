# 🎯 HƯỚNG DẪN SETUP ADMIN WEB APP RIÊNG BIỆT

## 📋 Tổng quan

Bạn đã có:
- ✅ App chính (React Native Expo) - dành cho khách hàng
- ✅ Admin routes trong app chính (`/admin`) - đã tạo trước đó

Giờ tôi đã tạo thêm:
- ✅ **Admin Web App riêng biệt** - một ứng dụng web độc lập

---

## 📁 Cấu trúc dự án hiện tại

```
sgu_cnpm_fastfood_deli/
│
├── app/                      # App chính (React Native Expo)
│   ├── (auth)/                   # Auth screens
│   ├── (tabs)/                   # Main app (Home, Search, Cart, Profile)
│   ├── admin/                    # Admin routes (cũ - dùng chung domain)
│   └── ...
│
├── admin-web/                # 🆕 ADMIN WEB APP RIÊNG (MỚI)
│   ├── src/
│   │   ├── components/           # React components
│   │   ├── pages/                # Pages (Login, Dashboard, Orders, Customers, Products)
│   │   ├── lib/                  # Appwrite API
│   │   ├── store/                # Zustand state management
│   │   └── types/                # TypeScript types
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── lib/                      # Shared API functions (app chính)
├── docs/                     # Documentation
└── ...
```

---

## 🚀 BƯỚC 1: Cài đặt Admin Web App

### 1.1. Cài dependencies

```bash
cd admin-web
npm install
```

### 1.2. Tạo file .env

```bash
cp .env.example .env
```

### 1.3. Sửa file `.env` với thông tin Appwrite

**Lấy từ file `.env` của app chính hoặc Appwrite Console**:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68c9791a002b85f096b4
VITE_APPWRITE_DATABASE_ID=68da5e73002cb68e70af
VITE_APPWRITE_BUCKET_ID=68dacda1003d6943981e

# Collection IDs
VITE_APPWRITE_USER_COLLECTION_ID=user
VITE_APPWRITE_ORDERS_COLLECTION_ID=orders
VITE_APPWRITE_MENU_COLLECTION_ID=menu
VITE_APPWRITE_CATEGORIES_COLLECTION_ID=categories
VITE_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID=customizations
VITE_APPWRITE_MENU_CUSTOMIZATIONS_COLLECTION_ID=menu_customizations
```

### 1.4. Chạy development server

```bash
npm run dev
```

Admin web app sẽ chạy tại: **http://localhost:3001**

---

## 🔐 BƯỚC 2: Kiểm tra Permissions trong Appwrite

Từ ảnh screenshots bạn gửi, tôi thấy:

### ✅ ĐÃ CÓ:
1. ✅ Role field trong User collection (admin, customer)
2. ✅ Admin user đã tạo (role = "admin")
3. ✅ User collection có permissions: Any (Read) + User-specific (CRUD)

### ⚠️ CẦN THÊM:

Bạn cần thêm **admin role permissions** cho các collections:

#### 2.1. User Collection
```
Settings → Permissions → Add role
Role: admin
Permissions: ☑ Read, ☑ Update, ☑ Delete
```

#### 2.2. Orders Collection
```
Settings → Permissions → Add role
Role: admin
Permissions: ☑ Read, ☑ Update, ☑ Delete
```

#### 2.3. Menu Collection
```
Settings → Permissions → Add role
Role: admin
Permissions: ☑ Create, ☑ Read, ☑ Update, ☑ Delete
```

#### 2.4. Categories Collection
```
Settings → Permissions → Add role
Role: admin
Permissions: ☑ Create, ☑ Read, ☑ Update, ☑ Delete
```

#### 2.5. Customizations Collection
```
Settings → Permissions → Add role
Role: admin
Permissions: ☑ Create, ☑ Read, ☑ Update, ☑ Delete
```

---

## 🔑 BƯỚC 3: Thêm Admin Label trong Appwrite Auth

Từ ảnh thứ 3 của bạn, tôi thấy bạn đã thêm label `admin` cho user trong Auth. Điều này **RẤT TỐT**!

Nhưng cần đảm bảo:

1. **Trong Database (collection `user`)**: 
   - Field `role` = `"admin"`

2. **Trong Auth (Users section)**:
   - User có label `admin`

**Cả hai đều cần thiết!**

### Kiểm tra & thêm label:

1. Vào **Appwrite Console → Auth → Users**
2. Tìm admin user → Click vào
3. Scroll xuống phần "Labels"
4. Thêm label `admin` nếu chưa có

---

## 🧪 BƯỚC 4: Test Admin Web App

### 4.1. Đăng nhập

1. Mở **http://localhost:3001**
2. Đăng nhập bằng email/password của admin user
3. Nếu thành công → Redirect đến Dashboard

### 4.2. Test Dashboard

- ✅ Kiểm tra hiển thị stats (Orders, Revenue, Customers, Products)
- ✅ Click vào các Quick Actions

### 4.3. Test Orders Management

1. Click "Orders" trong sidebar
2. Xem danh sách tất cả đơn hàng
3. Thử đổi trạng thái đơn hàng bằng dropdown

### 4.4. Test Customers Management

1. Click "Customers" trong sidebar
2. Xem danh sách khách hàng
3. Test search

### 4.5. Test Products Management

1. Click "Products" trong sidebar
2. Xem danh sách sản phẩm
3. Thử xóa 1 sản phẩm (sẽ có confirm)

---

## 🌐 BƯỚC 5: Deploy Admin Web App

### Option 1: Deploy lên Vercel (Khuyến nghị)

```bash
# 1. Push code lên GitHub
git add .
git commit -m "Add admin web app"
git push

# 2. Vào vercel.com
# 3. Import repository
# 4. Cấu hình:
#    - Root Directory: admin-web
#    - Framework Preset: Vite
#    - Build Command: npm run build
#    - Output Directory: dist

# 5. Thêm Environment Variables (VITE_*)
# 6. Deploy
```

Sau khi deploy, bạn sẽ có URL dạng:
- `https://fastfood-deli-admin.vercel.app`

### Option 2: Deploy lên Netlify

```bash
cd admin-web
npm run build

# Upload folder dist lên Netlify
# Hoặc kết nối GitHub để auto-deploy
```

---

## 🔗 BƯỚC 6: Cấu hình CORS & Platform

Sau khi deploy, cần thêm domain vào Appwrite:

1. **Appwrite Console → Settings → Platforms**
2. **Add Web Platform**:
   - Name: Admin Web App
   - Hostname: `https://your-admin-domain.vercel.app`
   - Or: `http://localhost:3001` (cho dev)

---

## 📊 SO SÁNH 2 ADMIN SYSTEMS

### Admin Routes trong App chính (`/admin`)
**Ưu điểm:**
- Dùng chung authentication với app chính
- Không cần deploy riêng
- Dùng React Native Web

**Nhược điểm:**
- Chạy chung domain với customer app
- Không tối ưu cho web (React Native overhead)
- Khó scale riêng

**Khi nào dùng:**
- Development/Testing nhanh
- Admin không cần UI phức tạp
- Muốn dùng chung codebase

---

### Admin Web App riêng (`admin-web/`)
**Ưu điểm:**
- ✅ Codebase độc lập, deploy riêng
- ✅ Tối ưu cho web (React + Vite)
- ✅ Có thể deploy lên subdomain riêng
- ✅ UI/UX tốt hơn cho desktop
- ✅ Dễ mở rộng, thêm features

**Nhược điểm:**
- Cần setup & deploy riêng
- Duplicate một số code (types, API)

**Khi nào dùng:**
- Production-ready admin panel
- Cần UI/UX chuyên nghiệp
- Admin và Customer app hoàn toàn tách biệt
- Muốn subdomain riêng (admin.example.com)

---

## 🎯 KHUYẾN NGHỊ

### Cho Development:
- Dùng cả 2 để test
- Admin routes trong app chính: Test nhanh
- Admin web app riêng: Test deployment & production features

### Cho Production:
- **Admin Web App riêng** (`admin-web/`)
- Deploy lên subdomain: `admin.yourapp.com`
- Tối ưu hơn, chuyên nghiệp hơn

---

## 🐛 Troubleshooting

### Lỗi: "Access denied. Admin privileges required"

**Nguyên nhân:**
- User không có `role = 'admin'` trong database
- Hoặc không có label `admin` trong Auth

**Giải pháp:**
1. Kiểm tra Database → `user` collection → Document của admin
2. Đảm bảo field `role` = `"admin"`
3. Kiểm tra Auth → Users → Admin user → Labels
4. Đảm bảo có label `admin`

---

### Lỗi: "Failed to fetch orders/users/products"

**Nguyên nhân:**
- Admin role chưa có permissions trong Appwrite

**Giải pháp:**
- Làm theo BƯỚC 2 ở trên
- Thêm admin role permissions cho tất cả collections

---

### Lỗi CORS khi deploy

**Nguyên nhân:**
- Chưa thêm domain vào Appwrite Platforms

**Giải pháp:**
- Appwrite Console → Settings → Platforms
- Add web platform với production URL

---

## 📝 Next Steps

1. ✅ Setup admin web app (BƯỚC 1)
2. ✅ Cấu hình permissions (BƯỚC 2)
3. ✅ Test local (BƯỚC 4)
4. ⏳ Deploy production (BƯỚC 5)
5. ⏳ Thêm features:
   - Form tạo/sửa sản phẩm
   - Upload ảnh
   - Charts & analytics
   - Export data

---

## 🎉 Kết luận

Bạn giờ đã có:

1. **Customer App** (React Native Expo)
   - URL: `https://customer.yourapp.com`
   - Dành cho khách hàng đặt món

2. **Admin Panel** (2 options)
   - **Option A**: `/admin` routes trong app chính
   - **Option B**: Admin Web App riêng tại `http://localhost:3001`
     - Deploy: `https://admin.yourapp.com`

3. **Shared Backend** (Appwrite)
   - Cùng database
   - Cùng authentication
   - Role-based access control

---

**Permissions bạn đã có từ screenshots:**

✅ User collection: Any (Read) + user-specific (CRUD)
✅ Admin user với role = "admin"
✅ Admin user với label "admin" trong Auth

**Còn thiếu:**

⚠️ Admin role permissions cho các collections (làm theo BƯỚC 2)

---

Sau khi hoàn thành các bước trên, admin web app sẽ hoạt động hoàn hảo! 🚀

Có câu hỏi gì cứ hỏi nhé! 😊
