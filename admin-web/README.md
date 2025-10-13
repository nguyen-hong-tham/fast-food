# Fastfood Deli - Admin Web App

Web admin riêng biệt để quản lý hệ thống Fastfood Deli. Ứng dụng này được xây dựng bằng React + Vite + TypeScript và kết nối trực tiếp với Appwrite backend.

## 🎯 Tính năng

- ✅ **Dashboard**: Tổng quan thống kê (đơn hàng, doanh thu, khách hàng, sản phẩm)
- ✅ **Quản lý đơn hàng**: Xem tất cả đơn hàng, cập nhật trạng thái giao hàng
- ✅ **Quản lý khách hàng**: Xem danh sách người dùng, thông tin chi tiết
- ✅ **Quản lý sản phẩm**: CRUD menu items (Xem, Thêm, Sửa, Xóa)
- ✅ **Xác thực admin**: Chỉ admin có role `admin` mới đăng nhập được

---

## 🚀 Cài đặt & Chạy

### Bước 1: Cài đặt dependencies

```bash
cd admin-web
npm install
```

### Bước 2: Cấu hình environment variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Sửa file `.env` với thông tin Appwrite của bạn:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id_here
VITE_APPWRITE_DATABASE_ID=68da5e73002cb68e70af
VITE_APPWRITE_BUCKET_ID=68dacda1003d6943981e

VITE_APPWRITE_USER_COLLECTION_ID=user
VITE_APPWRITE_ORDERS_COLLECTION_ID=orders
VITE_APPWRITE_MENU_COLLECTION_ID=menu
VITE_APPWRITE_CATEGORIES_COLLECTION_ID=categories
VITE_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID=customizations
VITE_APPWRITE_MENU_CUSTOMIZATIONS_COLLECTION_ID=menu_customizations
```

### Bước 3: Chạy development server

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3001**

---

## 🔑 Đăng nhập Admin

Để đăng nhập vào admin panel, bạn cần:

1. **Có tài khoản với role `admin`** trong Appwrite
2. **Đăng nhập bằng email/password** đã đăng ký

### Tạo admin user đầu tiên:

1. Đăng ký tài khoản trong app chính (customer app)
2. Vào Appwrite Console → Database → `user` collection
3. Tìm user vừa tạo → Click "Update Document"
4. Thay đổi field `role` thành `admin`
5. Save

---

## 📁 Cấu trúc thư mục

```
admin-web/
├── src/
│   ├── components/      # React components
│   │   ├── Layout.tsx       # Main layout (sidebar + header)
│   │   ├── Sidebar.tsx      # Sidebar navigation
│   │   ├── Header.tsx       # Top header with user info
│   │   └── StatCard.tsx     # Stats card component
│   ├── pages/           # Page components
│   │   ├── LoginPage.tsx        # Login screen
│   │   ├── DashboardPage.tsx    # Dashboard overview
│   │   ├── OrdersPage.tsx       # Orders management
│   │   ├── CustomersPage.tsx    # Customers list
│   │   └── ProductsPage.tsx     # Products CRUD
│   ├── lib/             # Utilities & API
│   │   ├── appwrite.ts      # Appwrite client config
│   │   └── api.ts           # API functions
│   ├── store/           # State management
│   │   └── authStore.ts     # Auth state (Zustand)
│   ├── types/           # TypeScript types
│   │   └── index.ts         # Type definitions
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # Entry point
│   └── index.css        # Global styles
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript config
├── tailwind.config.js   # Tailwind CSS config
└── README.md            # This file
```

---

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **Appwrite** - Backend as a Service
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

---

## 🔐 Permissions trong Appwrite

Để admin web app hoạt động đúng, cần cấu hình permissions trong Appwrite Console:

### User Collection
- **Read**: Any (public) + Admin role
- **Update**: Users (own docs) + Admin role
- **Delete**: Admin role only

### Orders Collection
- **Read**: Users (own docs) + Admin role
- **Update**: Admin role only
- **Delete**: Admin role only

### Menu Collection
- **Read**: Any (public)
- **Create**: Admin role only
- **Update**: Admin role only
- **Delete**: Admin role only

### Categories & Customizations Collections
- **Read**: Any (public)
- **Create/Update/Delete**: Admin role only

### Cách thêm Admin role permissions:

1. Vào collection → Settings → Permissions
2. Click "Add Role"
3. Chọn "Label" → Nhập `admin`
4. Chọn các permissions cần thiết (Read, Create, Update, Delete)
5. Click "Add"

**LƯU Ý**: Đảm bảo user có label `admin` trong Appwrite Auth (xem ảnh screenshot của bạn)

---

## 🚢 Deployment

### Deploy lên Vercel

1. Push code lên GitHub
2. Import project vào Vercel
3. Chọn thư mục `admin-web` là root directory
4. Thêm environment variables (VITE_*)
5. Deploy

### Deploy lên Netlify

1. Build project:
   ```bash
   npm run build
   ```
2. Upload folder `dist` lên Netlify
3. Hoặc kết nối với GitHub và auto-deploy

### Cấu hình redirect rules (Netlify)

Tạo file `_redirects` trong `public/`:

```
/* /index.html 200
```

Hoặc `netlify.toml`:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📊 API Functions

### Authentication
- `signIn(email, password)` - Đăng nhập admin
- `signOut()` - Đăng xuất
- `getCurrentUser()` - Lấy thông tin user hiện tại

### Users
- `getAllUsers(limit)` - Lấy tất cả users
- `updateUserRole(userId, role)` - Cập nhật role user

### Orders
- `getAllOrders(limit)` - Lấy tất cả đơn hàng
- `updateOrderStatus(orderId, status)` - Cập nhật trạng thái đơn
- `getOrderById(orderId)` - Lấy chi tiết đơn hàng

### Menu
- `getAllMenuItems(limit)` - Lấy tất cả menu items
- `createMenuItem(data)` - Tạo menu item mới
- `updateMenuItem(menuId, data)` - Cập nhật menu item
- `deleteMenuItem(menuId)` - Xóa menu item

### Stats
- `getDashboardStats()` - Lấy thống kê dashboard

---

## 🎨 Customization

### Đổi màu primary

Sửa file `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#ff6b35',  // Màu chính
      secondary: '#f7931e', // Màu phụ
    },
  },
}
```

### Thêm route mới

1. Tạo page component trong `src/pages/`
2. Import vào `src/App.tsx`
3. Thêm route trong `<Routes>`
4. Thêm nav item trong `src/components/Sidebar.tsx`

---

## 🐛 Troubleshooting

### Lỗi "Access denied. Admin privileges required"

**Giải pháp**: 
- Kiểm tra user có `role = 'admin'` trong database không
- Kiểm tra user có label `admin` trong Appwrite Auth không

### Lỗi "Failed to fetch orders/users"

**Giải pháp**:
- Kiểm tra Appwrite permissions cho admin role
- Kiểm tra collection IDs trong `.env` có đúng không

### Lỗi CORS

**Giải pháp**:
- Vào Appwrite Console → Settings → Platforms
- Thêm web platform với hostname: `http://localhost:3001`
- Thêm production hostname khi deploy

---

## 📝 TODO

- [ ] Thêm form tạo/sửa sản phẩm
- [ ] Thêm upload ảnh sản phẩm
- [ ] Thêm biểu đồ doanh thu (Recharts)
- [ ] Thêm filter theo ngày cho đơn hàng
- [ ] Thêm export CSV/PDF
- [ ] Thêm real-time updates (Appwrite Realtime)
- [ ] Thêm dark mode
- [ ] Thêm pagination cho danh sách
- [ ] Thêm sort cho bảng

---

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:

1. **ADMIN_DASHBOARD_SETUP.md** - Hướng dẫn chi tiết
2. **ADMIN_QUICK_START.md** - Quick reference
3. Appwrite permissions đã cấu hình đúng chưa
4. Environment variables đã đúng chưa

---

## 📄 License

MIT License - Fastfood Deli Project

---

**Chúc bạn quản lý thành công! 🎉**
