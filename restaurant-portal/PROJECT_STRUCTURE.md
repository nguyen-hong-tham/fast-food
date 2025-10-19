# Restaurant Portal - Project Structure

## 📁 Cấu Trúc Thư Mục

```
restaurant-portal/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── dashboard/               # Dashboard pages (protected)
│   │   │   ├── analytics/          # Analytics page
│   │   │   ├── menu/               # Menu management
│   │   │   ├── orders/             # Order management
│   │   │   ├── layout.tsx          # Dashboard layout wrapper
│   │   │   └── page.tsx            # Dashboard home
│   │   │
│   │   ├── login/                  # Login page
│   │   ├── register/               # Registration page (account only)
│   │   ├── setup/                  # Restaurant setup (after login)
│   │   ├── settings/               # Restaurant settings
│   │   ├── layout.tsx              # Root layout
│   │   ├── globals.css             # Global styles
│   │   └── page.tsx                # Homepage (redirects)
│   │
│   ├── components/
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx # Main dashboard layout
│   │   ├── modals/
│   │   │   └── MenuItemModal.tsx   # Menu item create/edit modal
│   │   └── providers/              # Context providers
│   │
│   ├── config/
│   │   └── index.ts                # Appwrite configuration
│   │
│   ├── lib/
│   │   └── appwrite.ts             # Appwrite client setup
│   │
│   ├── store/
│   │   └── authStore.ts            # Zustand auth state management
│   │
│   └── types/
│       └── index.ts                # TypeScript type definitions
│
├── scripts/
│   └── create-admin.js             # Admin user creation script
│
├── .env.local                      # Environment variables (not in git)
├── next.config.js                  # Next.js configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies
├── README.md                       # Main documentation
├── NEW_REGISTRATION_FLOW.md        # Registration flow documentation
└── QUICK_START_NEW_FLOW.md         # Quick start guide

```

## 🚀 Registration Flow

### Phase 1: Account Creation (`/register`)
- Tạo User document trong Appwrite
- Chỉ thu thập thông tin cơ bản: name, email, password, phone
- Role = 'restaurant'
- Redirect đến `/login` sau khi thành công

### Phase 2: Restaurant Setup (`/setup`)
- Chỉ truy cập được sau khi đã login
- Wizard 2 bước:
  1. Basic Info: name, description, address, phone, latitude, longitude
  2. Review & Submit
- Tạo Restaurant document với status = 'pending' (hoặc dùng default value)
- Redirect đến `/dashboard` sau khi hoàn thành

### Phase 3: Dashboard Access (`/dashboard`)
- Kiểm tra nếu user chưa có restaurant → auto redirect đến `/setup`
- Hiển thị banner dựa trên status:
  - `pending`: Đang chờ admin duyệt
  - `approved`: Đã được duyệt, có thể active
  - `rejected`: Bị từ chối, liên hệ support
  - `active`: Hoạt động bình thường

## 📊 Database Collections

### Users Collection
- Lưu thông tin account
- Fields: name, email, phone, role ('customer' | 'restaurant' | 'admin')

### Restaurants Collection  
- Lưu thông tin nhà hàng
- Required fields: name, description, address, phone, email, latitude, longitude, ownerId, status
- Status enum: 'pending' | 'approved' | 'rejected' | 'active' | 'inactive'
- Optional fields: logo, coverImage, operatingHours, businessLicense, taxCode, bankAccount, etc.

### Other Collections
- categories: Danh mục món ăn
- menu: Menu items
- orders: Đơn hàng
- order_items: Chi tiết đơn hàng
- payments: Thanh toán
- drones: Drone delivery
- drone_events: Lịch sử drone
- notifications: Thông báo

## 🔑 Key Features

### Authentication (Zustand Store)
- Login/Logout
- Session persistence
- Auto-fetch restaurant data
- Protected routes

### Dashboard
- Stats overview (revenue, orders, etc.)
- Status banners based on approval state
- Auto-redirect to setup if no restaurant

### Menu Management
- CRUD operations for menu items
- Image upload to Appwrite Storage
- Category filtering
- Search functionality

### Orders
- View all orders
- Filter by status
- Real-time updates

### Settings
- Update restaurant info
- Business details
- Operating hours
- Bank account info

## 🛠️ Removed/Cleaned Up

### ❌ Deleted Files
- `/app/dashboard/settings/` - duplicate, merged into `/app/settings/`
- `COMPLETE_REGISTRATION_FIX.md` - obsolete
- `FIELD_CHECKLIST.md` - obsolete
- `FINAL_REGISTRATION_FIX.md` - obsolete
- `QUICK_START_TEST.md` - obsolete
- `REGISTRATION_TESTING_GUIDE.md` - obsolete

### ✂️ Removed Fields
- `cuisineType` (string) - không tồn tại trong database
- `cuisineTypes` (array) - không cần thiết cho MVP
- `status` field trong User creation - gây conflict

### 🔧 Fixed Issues
- Sidebar navigation link: `/dashboard/settings` → `/settings`
- Dashboard auto-redirect khi chưa có restaurant
- Status enum validation (bỏ field status khỏi createDocument)
- File structure cleanup

## 📝 Notes

- Tất cả các trang trong `/dashboard/*` đều require authentication
- Restaurant status được set bởi default value trong Appwrite (không gửi từ code)
- Sidebar navigation giờ consistent với actual routes
- Documentation giảm từ 8 file xuống còn 3 file chính

## 🚦 Next Steps

1. Test complete registration flow
2. Admin panel để approve/reject restaurants
3. Payment integration
4. Drone tracking
5. Real-time order updates
