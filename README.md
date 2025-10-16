# 🍔 SGU Fastfood Deli - Food Ordering System

> Hệ thống đặt đồ ăn nhanh trực tuyến được xây dựng bằng React Native (Mobile App) và React Web (Admin Dashboard) với Appwrite Backend.

[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0-000020.svg)](https://expo.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-Backend-F02E65.svg)](https://appwrite.io/)

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng](#-tính-năng)
- [Công Nghệ](#-công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Cài Đặt](#-cài-đặt)
- [Chạy Ứng Dụng](#-chạy-ứng-dụng)
- [Tác Giả](#-tác-giả)


---

## 🎯 Giới Thiệu

**SGU Fastfood Deli** là một hệ thống đặt đồ ăn nhanh hoàn chỉnh, bao gồm:

- 📱 **Mobile App** (iOS/Android) - Dành cho khách hàng đặt món
- 💻 **Admin Web Dashboard** - Quản lý đơn hàng, sản phẩm, khách hàng
- 🔧 **Appwrite Backend** - Backend as a Service (BaaS) với Authentication, Database, Storage

Dự án được phát triển cho môn **Công Nghệ Phần Mềm** tại **Đại học Sài Gòn (SGU)**.

---

## ✨ Tính Năng

### 📱 Customer Mobile App

#### 🔐 Authentication
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập với email/password
- ✅ Quản lý session tự động
- ✅ Xác thực người dùng

#### 🍕 Menu & Ordering
- ✅ Xem danh sách món ăn theo danh mục
- ✅ Tìm kiếm món ăn
- ✅ Xem chi tiết món ăn (hình ảnh, giá, mô tả)
- ✅ Tùy chỉnh món ăn (toppings, sides, sauces)
- ✅ Thêm vào giỏ hàng
- ✅ Quản lý giỏ hàng (thêm/bớt/xóa)
- ✅ Xem tổng tiền tự động
- ✅ Đặt hàng và xác nhận

#### 📦 Order Management
- ✅ Lịch sử đơn hàng
- ✅ Chi tiết đơn hàng
- ✅ Trạng thái đơn hàng (Pending, Processing, Delivered)
- ✅ Thông tin giao hàng

#### 👤 Profile Management
- ✅ Xem và chỉnh sửa thông tin cá nhân
- ✅ Upload/Update avatar
- ✅ Cập nhật địa chỉ giao hàng
- ✅ Quản lý số điện thoại
- ✅ Đăng xuất

### 💻 Admin Web Dashboard

#### 📊 Dashboard
- ✅ Tổng quan thống kê (Orders, Revenue, Customers, Products)
- ✅ Biểu đồ doanh thu
- ✅ Số liệu thời gian thực

#### 🛍️ Order Management
- ✅ Xem tất cả đơn hàng
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Xem chi tiết đơn hàng
- ✅ Lọc đơn hàng theo trạng thái
- ✅ Tìm kiếm đơn hàng

#### 👥 Customer Management
- ✅ Xem danh sách khách hàng
- ✅ Thông tin chi tiết khách hàng
- ✅ Lịch sử đặt hàng của khách hàng

#### 🍔 Product Management
- ✅ Xem danh sách sản phẩm
- ✅ Thêm sản phẩm mới
- ✅ Chỉnh sửa sản phẩm
- ✅ Xóa sản phẩm
- ✅ Upload hình ảnh sản phẩm
- ✅ Quản lý danh mục

#### 🔒 Admin Authentication
- ✅ Đăng nhập admin riêng biệt
- ✅ Phân quyền theo role (admin/customer)
- ✅ Bảo mật session

---

## 🛠 Công Nghệ Sử Dụng

### Frontend

#### 📱 Mobile App
```json
{
  "Framework": "React Native 0.81.4",
  "Runtime": "Expo SDK ~54.0",
  "Language": "TypeScript 5.7",
  "Styling": "NativeWind 4.2.1 (Tailwind CSS)",
  "State Management": "Zustand 5.0.8",
  "Navigation": "Expo Router 6.0.8",
  "Image": "Expo Image 3.0.8",
  "Camera": "Expo Image Picker 17.0.8"
}
```

#### 💻 Admin Web
```json
{
  "Framework": "React 18.3.1",
  "Bundler": "Vite 6.0",
  "Language": "TypeScript 5.7",
  "Styling": "Tailwind CSS 3.4.15",
  "State Management": "Zustand 5.0.8",
  "Routing": "React Router DOM 6.28",
  "Charts": "Recharts 2.15",
  "Icons": "Lucide React 0.468"
}
```

### Backend
```json
{
  "Service": "Appwrite Cloud",
  "SDK": "React Native Appwrite 0.14.0 / Appwrite Web 16.0.2",
  "Authentication": "Email/Password, Session Management",
  "Database": "NoSQL Document-based",
  "Storage": "File Upload & Management",
  "Realtime": "WebSocket Support"
}
```

### Development Tools
- **Version Control**: Git & GitHub
- **Package Manager**: npm
- **Code Editor**: VS Code
- **API Testing**: Appwrite Console
- **Deployment**: Expo EAS (Mobile), Vercel/Netlify (Web)

---

## 📁 Cấu Trúc Dự Án

```
sgu_cnpm_foodfast/
│
├── app-web/                          # 📱 Customer Mobile App (React Native + Expo)
│   ├── app/                          # Expo Router pages
│   │   ├── (auth)/                   # Authentication screens
│   │   │   ├── sign-in.tsx          # Login screen
│   │   │   ├── sign-up.tsx          # Register screen
│   │   │   └── _layout.tsx          # Auth layout
│   │   ├── (tabs)/                   # Tab navigation screens
│   │   │   ├── index.tsx            # Home/Menu screen
│   │   │   ├── search.tsx           # Search screen
│   │   │   ├── cart.tsx             # Cart screen
│   │   │   ├── profile.tsx          # Profile screen
│   │   │   └── _layout.tsx          # Tab layout
│   │   ├── menu-detail.tsx          # Menu item detail
│   │   ├── order-history.tsx        # Order history
│   │   ├── order-detail.tsx         # Order detail
│   │   ├── edit-profile.tsx         # Edit profile
│   │   └── _layout.tsx              # Root layout
│   │
│   ├── components/                   # Reusable components
│   │   ├── CartButton.tsx           # Cart button with badge
│   │   ├── CartItem.tsx             # Cart item component
│   │   ├── CustomButton.tsx         # Custom button
│   │   ├── CustomHeader.tsx         # Custom header
│   │   ├── CustomInput.tsx          # Custom input field
│   │   ├── Filter.tsx               # Category filter
│   │   ├── MenuCard.tsx             # Menu item card
│   │   ├── OrderCard.tsx            # Order card
│   │   ├── OrderConfirmationModal.tsx # Order confirmation modal
│   │   ├── ProfileField.tsx         # Profile field component
│   │   └── SearchBar.tsx            # Search bar
│   │
│   ├── lib/                          # Utilities & API
│   │   ├── appwrite.ts              # Appwrite config & API functions
│   │   ├── data.ts                  # Static data
│   │   ├── useAppwrite.ts           # Custom Appwrite hook
│   │   ├── seed.ts                  # Database seeding script
│   │   └── seed-simple.ts           # Simple seeding script
│   │
│   ├── store/                        # State management (Zustand)
│   │   ├── auth.store.ts            # Auth state
│   │   └── cart.store.ts            # Cart state
│   │
│   ├── constants/                    # Constants & config
│   │   └── index.ts                 # App constants
│   │
│   ├── assets/                       # Static assets
│   │   ├── fonts/                   # Custom fonts
│   │   ├── icons/                   # Icon images
│   │   └── images/                  # App images
│   │
│   ├── docs/                         # Documentation
│   │   ├── APPWRITE_DATABASE_SETUP.md
│   │   ├── ERD_DATABASE_SCHEMA.md
│   │   ├── PROJECT_EVALUATION.md
│   │   └── ...
│   │
│   ├── package.json                 # Dependencies
│   ├── app.json                     # Expo config
│   ├── tsconfig.json                # TypeScript config
│   └── tailwind.config.js           # Tailwind config
│
├── admin/                            # 💻 Admin Web Dashboard (React + Vite)
│   ├── src/
│   │   ├── components/              # React components
│   │   │   ├── Layout.tsx          # Main layout
│   │   │   ├── Sidebar.tsx         # Sidebar navigation
│   │   │   ├── Header.tsx          # Top header
│   │   │   └── StatCard.tsx        # Statistics card
│   │   │
│   │   ├── pages/                   # Page components
│   │   │   ├── LoginPage.tsx       # Admin login
│   │   │   ├── DashboardPage.tsx   # Dashboard overview
│   │   │   ├── OrdersPage.tsx      # Orders management
│   │   │   ├── CustomersPage.tsx   # Customers list
│   │   │   └── ProductsPage.tsx    # Products CRUD
│   │   │
│   │   ├── lib/                     # Utilities & API
│   │   │   ├── appwrite.ts         # Appwrite client config
│   │   │   └── api.ts              # API functions
│   │   │
│   │   ├── store/                   # State management
│   │   │   └── authStore.ts        # Auth state (Zustand)
│   │   │
│   │   ├── types/                   # TypeScript types
│   │   │   └── index.ts            # Type definitions
│   │   │
│   │   ├── App.tsx                 # Main app component
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   │
│   ├── scripts/                     # Utility scripts
│   │   └── create-admin.js         # Create admin user script
│   │
│   ├── docs/                        # Documentation
│   │   ├── FIX_ADMIN_LOGIN.md
│   │   ├── QUICK_SETUP_ORDER_CONFIRMATION.md
│   │   └── ...
│   │
│   ├── package.json                # Dependencies
│   ├── vite.config.ts              # Vite config
│   ├── tsconfig.json               # TypeScript config
│   ├── tailwind.config.js          # Tailwind config
│   └── index.html                  # HTML entry point
│
├── .gitignore                       # Git ignore file
└── README.md                        # This file
```

---

## 🚀 Cài Đặt

### Yêu Cầu Hệ Thống

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: Latest version
- **Expo CLI**: Installed globally (optional)
- **Android Studio** / **Xcode**: For mobile development

### 1. Clone Repository

```bash
git clone https://github.com/phatle224/sgu_cnpm_foodfast.git
cd sgu_cnpm_foodfast
```

### 2. Cài Đặt Dependencies

#### 📱 Mobile App

```bash
cd app-web
npm install
```

#### 💻 Admin Web

```bash
cd admin
npm install
```

### 3. Cấu Hình Environment Variables

#### 📱 Mobile App

Tạo file `.env` trong thư mục `app-web/`:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
```

#### 💻 Admin Web

Tạo file `.env` trong thư mục `admin/`:

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

### 4. Setup Appwrite Backend

1. Tạo tài khoản tại [Appwrite Cloud](https://cloud.appwrite.io/)
2. Tạo project mới
3. Tạo các collections theo schema trong `app-web/docs/ERD_DATABASE_SCHEMA.md`
4. Tạo storage bucket cho hình ảnh
5. Cấu hình permissions cho collections và bucket
6. Copy Project ID vào file `.env`

**Chi tiết setup**: Xem file `app-web/docs/APPWRITE_DATABASE_SETUP.md`

---

## 🏃 Chạy Ứng Dụng

### 📱 Mobile App

```bash
cd app-web

# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web (experimental)
npm run web
```

**Lưu ý**: Quét QR code bằng Expo Go app (iOS/Android) để test trên thiết bị thật.

### 💻 Admin Web

```bash
cd admin

# Start development server
npm run dev
```

Mở trình duyệt tại: **http://localhost:3001**

### 🔨 Build Production

#### Mobile App

```bash
cd app-web

# Build for Android (APK)
npx expo build:android

# Build for iOS (IPA)
npx expo build:ios

# Or use EAS Build (recommended)
npm install -g eas-cli
eas build --platform android
eas build --platform ios
```

#### Admin Web

```bash
cd admin

# Build for production
npm run build

# Preview production build
npm run preview
```


## 👥 Tác Giả

- **Lê Hồng Phát** - [@phatle224](https://github.com/phatle224)
- **Nguyễn Hồng Thắm** - [@nguyen-hong-tham](https://github.com/nguyen-hong-tham)


**Môn học**: Công Nghệ Phần Mềm  
**Giảng viên hướng dẫn**: [TS.Nguyễn Quốc Huy]  
**Học kỳ**: [Học kỳ 1/Năm học 2025-2026]

---


## 🙏 Acknowledgments

- [React Native](https://reactnative.dev/) - Mobile framework
- [Expo](https://expo.dev/) - Development platform
- [Appwrite](https://appwrite.io/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Lucide Icons](https://lucide.dev/) - Icon library

---

## 📞 Liên Hệ & Hỗ Trợ

- **Email**: [hongphatle224@gmail.com]
- **GitHub Issues**: [https://github.com/phatle224/sgu_cnpm_foodfast/issues](https://github.com/phatle224/sgu_cnpm_foodfast/issues)
- **Documentation**: [Wiki](https://github.com/phatle224/sgu_cnpm_foodfast/wiki)

---

## 🔄 Changelog

### Version 1.0.0 (Current)
- ✅ Initial release
- ✅ Customer mobile app (iOS/Android)
- ✅ Admin web dashboard
- ✅ Full authentication system
- ✅ Menu browsing & ordering
- ✅ Order management
- ✅ Profile management
- ✅ Real-time updates

**Xem chi tiết**: [CHANGELOG.md](CHANGELOG.md)

---

## 🎯 Roadmap

### Phase 2 (Planned)
- [ ] Payment integration (VNPay, MoMo)
- [ ] Real-time order tracking
- [ ] Push notifications
- [ ] Drone delivery 
- [ ] Chat box AI

---

<div align="center">

[⬆ Back to top](#-sgu-fastfood-deli---food-ordering-system)

</div>
