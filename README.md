# 🍔 FoodFast — Hệ thống Quản lý Đặt Đồ Ăn

**FoodFast** là hệ thống đặt đồ ăn trực tuyến toàn diện, được phát triển cho môn *Công nghệ Phần mềm* tại **Đại học Sài Gòn (SGU)**.  
Hệ thống bao gồm:
- Ứng dụng di động cho **khách hàng**
- Trang web quản lý cho **nhà hàng**
- Trang web quản lý cho **admin**

---

## 📋 Mục lục
- [Giới thiệu](#-giới-thiệu)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt](#-cài-đặt)
- [Chạy ứng dụng](#-chạy-ứng-dụng)
- [Tính năng chính](#-tính-năng-chính)
- [Tài liệu](#-tài-liệu)
- [Đóng góp](#-đóng-góp)
- [Liên hệ](#-liên-hệ)

---

## 🎯 Giới thiệu
**FoodFast** là nền tảng đặt món ăn trực tuyến giúp kết nối **khách hàng**, **nhà hàng**, và **quản trị viên**.  
Người dùng có thể duyệt menu, đặt món, thanh toán, và theo dõi giao hàng theo thời gian thực — bao gồm mô phỏng **drone giao hàng** trong tương lai.

---

## 📁 Cấu trúc dự án

```
sgu_cnpm_foodfast/
│
├── mobile/              # Ứng dụng khách hàng (React Native + Expo)
│   ├── app/             # Màn hình: Home, Search, Cart, Profile, Auth
│   ├── components/      # Thành phần tái sử dụng
│   ├── lib/             # Kết nối Appwrite, tiện ích
│   ├── store/           # Zustand stores (auth, cart)
│   ├── constants/       # Hằng số
│   └── assets/          # Ảnh, biểu tượng, font
│
├── restaurant/          # Cổng quản lý cho nhà hàng (Next.js)
│   ├── src/app/         # App Router
│   ├── src/components/  # Thành phần React
│   ├── src/lib/         # API utilities
│   └── src/store/       # State management
│
├── admin/               # Cổng quản trị hệ thống (Next.js + Vite)
│   ├── src/pages/       # Dashboard, Orders, Customers, Products
│   ├── src/components/  # Components chung
│   ├── src/lib/         # Appwrite & API
│   └── src/store/       # Zustand stores
│
├── shared/              # Mã dùng chung giữa các module
│   ├── types/           # TypeScript types & interfaces
│   ├── constants/       # Các hằng số dùng chung
│   └── utils/           # Hàm tiện ích
│
└── docs/                # Tài liệu & sơ đồ hệ thống (.drawio, .md)
```

---

## 🧩 Các Module Chính

### 1. **Admin Portal** (`/admin`)
> Quản lý hệ thống, nhà hàng, khách hàng và báo cáo.

**Tính năng:**
- Dashboard tổng quan  
- Quản lý nhà hàng, khách hàng, danh mục, sản phẩm  
- Báo cáo và thống kê  

**Công nghệ:**
- React + TypeScript  
- Vite, TailwindCSS  
- Firebase (Auth, Firestore, Cloud Functions)

---

### 2. **Restaurant Portal** (`/restaurant`)
> Cổng dành cho nhà hàng quản lý hoạt động kinh doanh.

**Tính năng:**
- Quản lý menu, món ăn  
- Nhận & xử lý đơn hàng  
- Cập nhật trạng thái giao hàng  
- Thống kê doanh thu  

**Công nghệ:**
- React + TypeScript  
- Next.js (App Router)  
- TailwindCSS  

---

### 3. **Mobile App** (`/mobile`)
> Ứng dụng dành cho khách hàng sử dụng **React Native + Expo**.

**Tính năng:**
- Duyệt và tìm kiếm nhà hàng  
- Đặt món, thanh toán  
- Theo dõi đơn hàng real-time  
- Đánh giá và nhận xét  

**Công nghệ:**
- React Native + Expo  
- TypeScript  
- NativeWind (TailwindCSS for RN)  
- Zustand (State Management)

---

### 4. **Cloud Functions** (`/functions`)
> Chứa logic backend và API cho toàn hệ thống.

**Chức năng:**
- Xử lý thanh toán  
- Gửi thông báo  
- Quản lý drone giao hàng *(dự kiến)*  
- Xử lý dữ liệu và logs  

---

## 🛠 Công Nghệ Sử Dụng

| Loại | Công Nghệ |
|------|------------|
| **Frontend** | React, React Native, TypeScript, TailwindCSS, Vite |
| **Backend** | Firebase (Auth, Firestore, Functions, Storage, Messaging) |
| **State Management** | Zustand |
| **Dev Tools** | ESLint, Prettier, Git |

---

## 💻 Yêu Cầu Hệ Thống

- Node.js ≥ 18.x  
- npm hoặc yarn  
- Expo CLI (cho mobile app)  
- Firebase CLI  
- Git

---

## 🚀 Cài Đặt

### 1. Clone repository
```bash
git clone https://github.com/phatle224/sgu_cnpm_foodfast.git
cd sgu_cnpm_foodfast
```

### 2. Cài đặt từng module

#### Admin Portal
```bash
cd admin
npm install
cp .env.example .env   # Cấu hình Firebase
npm run dev
```

#### Restaurant Portal
```bash
cd restaurant
npm install
npm run dev
```

#### Mobile App
```bash
cd mobile
npm install
npx expo start
```

#### Cloud Functions
```bash
cd functions
npm install
firebase login
firebase deploy --only functions
```

---

## 🎮 Chạy Ứng Dụng

| Ứng dụng | Lệnh chạy | Ghi chú |
|-----------|------------|---------|
| **Admin Portal** | `npm run dev` | http://localhost:5173 |
| **Restaurant Portal** | `npm run dev` | http://localhost:5174 |
| **Mobile App** | `npx expo start` | Quét QR bằng Expo Go |

---

## ✨ Tính Năng Chính

### 👤 Khách Hàng (Mobile)
- Đăng ký / Đăng nhập  
- Tìm kiếm & xem menu  
- Giỏ hàng và thanh toán  
- Theo dõi đơn hàng real-time  
- Lịch sử và đánh giá đơn hàng  

### 🍽 Nhà Hàng (Restaurant Portal)
- Quản lý thông tin & menu  
- Nhận & xử lý đơn hàng  
- Cập nhật trạng thái  
- Thống kê doanh thu  

### 🧑‍💼 Quản Trị Viên (Admin Portal)
- Dashboard tổng quan  
- Quản lý nhà hàng, người dùng, danh mục  
- Báo cáo & cấu hình hệ thống  

---

## 📚 Tài Liệu

- [Admin Portal README](./admin/README.md)  
- [Restaurant Portal README](./restaurant/README.md)  
- [Mobile App README](./mobile/README.md)  
- Sơ đồ hệ thống & thiết kế: `/docs`, `/drawio`

---

## 👥 Đóng Góp

**Quy trình:**
1. Fork repository  
2. Tạo branch mới  
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit thay đổi  
   ```bash
   git commit -m "Add AmazingFeature"
   ```
4. Push lên branch  
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Tạo Pull Request  

---

## 📝 License
Dự án được phát triển cho mục đích học tập tại **Đại học Sài Gòn (SGU)**.

---

## 📞 Liên Hệ

- **GitHub Repository:** [phatle224/sgu_cnpm_foodfast](https://github.com/phatle224/sgu_cnpm_foodfast)  
- **Tác giả:** [phatle224](https://github.com/phatle224)

---

⭐ *Hãy để lại một Star nếu bạn thấy dự án hữu ích!*
