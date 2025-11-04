# 🍔 FoodFast - Hệ thống Quản lý Đặt Đồ Ăn

Dự án **FoodFast** là một hệ thống quản lý đặt đồ ăn trực tuyến toàn diện, được phát triển cho môn Công nghệ Phần mềm tại Đại học Sài Gòn (SGU). Hệ thống bao gồm ứng dụng di động cho khách hàng, trang web quản lý cho admin và trang web quản lý cho nhà hàng.

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Tính năng chính](#tính-năng-chính)
- [Đóng góp](#đóng-góp)

## 🎯 Giới thiệu

FoodFast là một nền tảng đặt đồ ăn trực tuyến kết nối khách hàng, nhà hàng và quản trị viên. Hệ thống cung cấp trải nghiệm mượt mà cho việc đặt món, quản lý đơn hàng và theo dõi giao hàng.

## 📁 Cấu trúc dự án
sgu_cnpm_foodfast/

│- ✅ Tổng quan hệ thống (đơn hàng, doanh thu, người dùng)

├── mobile/                 # React Native - Ứng dụng khách hàng (Expo)

│   ├── app/               # Expo Router screens- ✅ Quản lý đơn hàng (xem, lọc, cập nhật trạng thái)

│   │   ├── (auth)/        # Sign in, Sign up

│   │   ├── (tabs)/        # Home, Search, Cart, Profile- ✅ Danh sách khách hàng

│   │   ├── menu-detail.tsx

│   │   ├── order-history.tsx---**[📱 Demo](#-demo) • [✨ Features](#-tính-năng-chính) • [🛠 Tech Stack](#-tech-stack) • [📖 Docs](./docs/README.md) • [🚀 Quick Start](#-quick-start)****[📱 Demo](#-demo) • [✨ Features](#-tính-năng-chính) • [🛠 Tech Stack](#-tech-stack) • [📖 Docs](./docs/README.md) • [🚀 Quick Start](#-quick-start)**

│   │   └── edit-profile.tsx

│   ├── components/        # Reusable components**Đang phát triển:**

│   ├── lib/              # Appwrite client & utilities

│   ├── store/            # Zustand stores (auth, cart)- 🚧 Phê duyệt nhà hàng

│   ├── constants/        # App constants

│   └── assets/           # Images, fonts, icons- 🚧 Quản lý đội drone (gán drone, theo dõi)

│

├── restaurant/            # Next.js - Cổng nhà hàng- 🚧 Thống kê và báo cáo chi tiết## Key Features

│   ├── src/

│   │   ├── app/          # Next.js 14 App Router

│   │   ├── components/   # React components

│   │   ├── lib/          # API utilities### 🚁 Hệ Thống Drone (Dự kiến)

│   │   └── store/        # State management

│   └── package.json

│

├── admin/                 # Next.js + Vite - Admin dashboard- Đăng ký và theo dõi trạng thái drone### Customer Mobile App (Expo React Native)------

│   ├── src/

│   │   ├── pages/        # React Router pages- Mô phỏng giao hàng 60 giây

│   │   │   ├── DashboardPage.tsx

│   │   │   ├── OrdersPage.tsx- Cập nhật vị trí real-time- Register, sign in, and manage personal profile

│   │   │   ├── CustomersPage.tsx

│   │   │   └── ProductsPage.tsx- Phân tích hiệu suất đội drone

│   │   ├── components/   # Reusable components

│   │   ├── lib/          # Appwrite & API- Browse restaurants and menu categories

│   │   └── store/        # Zustand stores

│   └── package.json---

│

├── shared/                # Shared code giữa các platforms- Build orders with customizations and vouchers

│   ├── types/            # TypeScript types & interfaces

│   ├── constants/        # Shared constants## 🛠️ Công Nghệ Sử Dụng

│   └── utils/            # Shared utilities
│- Review active and past orders with live status updates (tracking in progress)*Dự án môn Công Nghệ Phần Mềm - Trường Đại học Sài Gòn (SGU)*<img src="./docs/images/banner.png" alt="FoodFast Banner" width="100%" />


```

### 🔑 Các module chính

#### 1. **Admin Portal** (`/admin`)
- Dashboard quản trị tổng quan
- Quản lý nhà hàng, khách hàng
- Quản lý danh mục và sản phẩm
- Báo cáo và thống kê hệ thống

**Tech Stack:**
- React + TypeScript
- Vite
- TailwindCSS
- Firebase

#### 2. **Restaurant Portal** (`/restaurant`)
- Quản lý menu và món ăn
- Xử lý đơn hàng
- Cập nhật trạng thái giao hàng
- Thống kê doanh thu

**Tech Stack:**
- React + TypeScript
- Vite
- TailwindCSS
- Firebase

#### 3. **Mobile App** (`/mobile`)
- Duyệt và tìm kiếm nhà hàng
- Đặt món và thanh toán
- Theo dõi đơn hàng real-time
- Đánh giá và nhận xét

**Tech Stack:**
- React Native
- Expo
- TypeScript
- NativeWind (TailwindCSS for React Native)
- Zustand (State Management)

#### 4. **Cloud Functions** (`/functions`)
- Backend logic và API endpoints
- Xử lý thanh toán
- Gửi thông báo
- Xử lý dữ liệu

## 🛠 Công nghệ sử dụng

### Frontend
- **React** - Thư viện UI cho web
- **React Native** - Framework cho mobile app
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Vite** - Build tool cho web apps

### Backend & Services
- **Firebase** - Backend as a Service
  - Authentication
  - Firestore Database
  - Cloud Functions
  - Cloud Storage
  - Cloud Messaging

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 💻 Yêu cầu hệ thống

- **Node.js**: >= 18.x
- **npm** hoặc **yarn**
- **Expo CLI** (cho mobile app)
- **Firebase CLI**
- **Git**

## 🚀 Cài đặt

### 1. Clone repository

```bash
git clone https://github.com/phatle224/sgu_cnpm_foodfast.git
cd sgu_cnpm_foodfast
```

### 2. Cài đặt Admin Portal

```bash
cd admin
npm install
cp .env.example .env
# Cấu hình Firebase credentials trong .env
npm run dev
```

### 3. Cài đặt Restaurant Portal

```bash
cd restaurant
npm install
npm run dev
```

### 4. Cài đặt Mobile App

```bash
cd mobile
npm install
npx expo start
```

### 5. Cài đặt Cloud Functions

```bash
cd functions
npm install
firebase login
firebase deploy --only functions
```

## 🎮 Chạy ứng dụng

### Admin Portal
```bash
cd admin
npm run dev
# Mở http://localhost:5173
```

### Restaurant Portal
```bash
cd restaurant
npm run dev
# Mở http://localhost:5174
```

### Mobile App
```bash
cd mobile
npx expo start
# Quét QR code bằng Expo Go app
```

## ✨ Tính năng chính

### Khách hàng (Mobile)
- ✅ Đăng ký/Đăng nhập
- ✅ Tìm kiếm nhà hàng và món ăn
- ✅ Xem menu chi tiết
- ✅ Thêm vào giỏ hàng
- ✅ Đặt hàng và thanh toán
- ✅ Theo dõi đơn hàng real-time
- ✅ Đánh giá và nhận xét
- ✅ Lịch sử đơn hàng

### Nhà hàng (Restaurant Portal)
- ✅ Quản lý thông tin nhà hàng
- ✅ Quản lý menu và món ăn
- ✅ Nhận và xử lý đơn hàng
- ✅ Cập nhật trạng thái đơn hàng
- ✅ Thống kê doanh thu
- ✅ Quản lý đánh giá

### Quản trị viên (Admin Portal)
- ✅ Dashboard tổng quan
- ✅ Quản lý nhà hàng
- ✅ Quản lý người dùng
- ✅ Quản lý danh mục
- ✅ Báo cáo và thống kê
- ✅ Cấu hình hệ thống

## 📚 Tài liệu

Tài liệu chi tiết cho từng module:
- [Admin Portal README](./admin/README.md)
- [Restaurant Portal README](./restaurant/README.md)
- [Mobile App README](./mobile/README.md)

Sơ đồ hệ thống và thiết kế có trong thư mục `/docs` và `/drawio`.

## 👥 Đóng góp

Dự án này được phát triển bởi nhóm sinh viên Đại học Sài Gòn cho môn Công nghệ Phần mềm.

### Quy trình đóng góp
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Dự án này được phát triển cho mục đích học tập tại Đại học Sài Gòn.

## 📞 Liên hệ

- **Repository**: [phatle224/sgu_cnpm_foodfast](https://github.com/phatle224/sgu_cnpm_foodfast)
- **Tác giả**: phatle224

---

⭐ Đừng quên để lại Star nếu bạn thấy dự án hữu ích!
