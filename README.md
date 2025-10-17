# 🍔 FoodFast - Drone Delivery Food Ordering Platform

> Nền tảng giao đồ ăn thông minh với drone delivery, kết nối khách hàng, nhà hàng và hệ thống vận hành trung tâm.

[![React Native](https://img.shields.io/badge/React%20Native-Expo%2054-blue.svg)](https://reactnative.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg)](https://www.typescriptlang.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-Backend-F02E65.svg)](https://appwrite.io/)
[![Progress](https://img.shields.io/badge/Progress-0%2F40%20issues-red.svg)](./docs/PROJECT_TRACKER.md)

---

## 🚀 Quick Start

**🆕 Developer mới?** → **[Đọc Documentation Hub](./docs/README.md)** (5 phút)

**⚡ Bắt đầu ngay**:
```bash
# 1. Setup Database (Tuần 1 - CRITICAL)
Read: docs/database/APPWRITE_SETUP_GUIDE.md
Create: 16 Appwrite collections

# 2. Pick an issue (Tuần 2+)
Read: docs/GITHUB_ISSUES.md
Choose: Issue #1, #7, #15, or #23

# 3. Start coding
git checkout -b feature/[issue-number]-description
```

**📊 Track Progress**: [PROJECT_TRACKER.md](./docs/PROJECT_TRACKER.md)

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng](#-tính-năng)
- [Tech Stack](#-tech-stack)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Development Roadmap](#-development-roadmap)
- [Cài Đặt](#-cài-đặt)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [Team](#-team)

---

## 🎯 Giới Thiệu

**FoodFast** là nền tảng giao đồ ăn đa bên (multi-sided platform) với công nghệ drone delivery:

- 📱 **Customer Mobile App** - Browse restaurants, Order food, Track drone real-time
- 🏪 **Restaurant Portal** - Menu management, Order processing, Analytics
- 🎛️ **Admin Dashboard** - Restaurant approval, Drone fleet management, System analytics
- � **Drone Delivery System** - 60-second simulation, Real-time tracking, Telemetry

**Mục tiêu**: Xây dựng hệ sinh thái giao đồ ăn hoàn chỉnh với trải nghiệm tốt nhất cho 3 bên: Khách hàng, Nhà hàng, và Admin vận hành.

**Dự án**: Môn Công Nghệ Phần Mềm - Đại học Sài Gòn (SGU)

---

## ✨ Tính Năng

### 📱 Customer Mobile App (70% Complete)

**✅ Đã có** (Current Features):
- 🔐 Authentication: Đăng ký, Đăng nhập, Profile management
- 🍕 Menu browsing: Xem món ăn theo categories
- 🛒 Cart: Add/remove items, Calculate total
- 📦 Order history: Xem đơn hàng đã đặt
- 👤 Profile: Edit thông tin, Upload avatar

**🔨 Đang phát triển** (Phase 2 - Issues #15-22):
- 🏪 Restaurant selection & filtering
- 💳 VNPay payment integration
- 📍 Real-time order tracking với map
- 🚁 Drone delivery visualization (60s countdown)
- � Push notifications (FCM)
- ⭐ Review & rating system
- 🎟️ Voucher/promotion codes

---

### 🏪 Restaurant Portal (0% - Week 2-3)

**🎯 Planned Features** (Phase 1 - Issues #7-14):
- 🔐 Restaurant authentication & role management
- 📝 Onboarding flow với map picker
- 🍔 Menu management (CRUD + categories + image upload)
- 📊 Order dashboard với real-time updates
- 🔔 Sound notification cho đơn mới
- ⚡ Quick actions: Accept/Reject/Preparing/Ready
- 📈 Analytics: Revenue, best sellers, completion rate
- ⚙️ Settings: Profile, operating hours, availability

---

### 🎛️ Admin Dashboard (40% Complete)

**✅ Đã có** (Current Features):
- 🔐 Admin authentication riêng biệt
- 📊 Dashboard: Orders, Revenue, Customers stats
- 🛍️ Order management: View all, filter, update status
- 👥 Customer list với thông tin chi tiết
- 🍔 Product management: CRUD operations

**🔨 Đang phát triển** (Phase 3 - Issues #23-30):
- ✅ Restaurant approval workflow
- � Drone fleet management
- 🎮 Drone simulation engine (control panel)
- 🌍 System-wide order monitoring
- 📈 Advanced analytics (GMV, KPIs, trends)
- 👤 User management (ban, reset password)
- 📋 Audit logs viewer
- 📢 Notification broadcast system

---

### 🚁 Drone Delivery System (0% - Week 4-5)

**🎯 Planned Features** (Phase 3-4 - Issues #4, #17-18, #25):
- 🚁 Drone fleet registration & status tracking
- � Telemetry events (position, battery, altitude)
- 🗺️ Real-time map visualization
- ⏱️ 60-second delivery simulation
- 🎯 Auto-assignment algorithm
- 📊 Drone utilization analytics
- 🔧 Maintenance scheduling

---

## 🛠 Tech Stack

### Frontend
- **Mobile**: React Native (Expo 54) + TypeScript + NativeWind (TailwindCSS)
- **Web**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **State**: Zustand (mobile), Context API (web)
- **Navigation**: Expo Router (mobile), Next.js App Router (web)

### Backend
- **BaaS**: Appwrite (Auth, Database, Storage, Functions, Realtime)
- **Database**: 16 collections (6 existing + 10 new)
- **Auth**: Email/Password, Role-based access (customer/restaurant/admin)

### Integration
- **Payment**: VNPay (planned)
- **Maps**: Google Maps / Mapbox (planned)
- **Notifications**: Firebase Cloud Messaging (planned)

### Dev Tools
- **Language**: TypeScript 5.7
- **Package Manager**: npm
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions (planned)

**Chi tiết**: [docs/PROJECT_REQUIREMENTS_vi.md](./docs/PROJECT_REQUIREMENTS_vi.md) Section 6

---

## � Cấu Trúc Dự Án

```
sgu_cnpm_foodfast/
├── �📱 mobile/                    # React Native Mobile App (Expo)
│   ├── app/                      # Expo Router screens
│   │   ├── (auth)/              # Auth screens (sign-in, sign-up)
│   │   ├── (tabs)/              # Tab screens (home, cart, profile, search)
│   │   ├── menu-detail.tsx      # Menu item detail
│   │   ├── order-history.tsx    # Order history
│   │   └── edit-profile.tsx     # Profile editing
│   ├── components/              # Reusable components
│   ├── lib/                     # Appwrite client, hooks, utilities
│   ├── store/                   # Zustand stores (auth, cart)
│   ├── constants/               # Constants, dummy data
│   └── package.json
│
├── 💻 admin/                     # Next.js Admin Dashboard
│   ├── src/
│   │   ├── pages/               # Dashboard pages
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── OrdersPage.tsx
│   │   │   ├── CustomersPage.tsx
│   │   │   └── ProductsPage.tsx
│   │   ├── components/          # Reusable components
│   │   ├── lib/                 # Appwrite client, API
│   │   └── store/               # Auth store
│   └── package.json
│
├── 🏪 restaurant-portal/         # [TODO] Next.js Restaurant Portal
│   └── (Will be created in Phase 1 - Issue #7)
│
├── 📚 docs/                      # 🔥 DOCUMENTATION HUB
│   ├── README.md                # Documentation overview
│   ├── PROJECT_REQUIREMENTS_vi.md  # Full requirements (Vietnamese)
│   ├── DEVELOPMENT_ROADMAP.md   # 6-week roadmap, 4 phases
│   ├── GITHUB_ISSUES.md         # 40 GitHub issues template
│   ├── PROJECT_TRACKER.md       # Progress tracking
│   ├── database/                # Database documentation
│   │   ├── DATABASE_SCHEMA.md   # 16 collections schema
│   │   ├── APPWRITE_SETUP_GUIDE.md  # Step-by-step setup
│   │   ├── QUICK_REFERENCE.md   # Cheat sheet
│   │   └── foodfast-database-erd-simple.drawio  # ERD diagram
│   └── diagrams/                # System diagrams
│
├── 🎨 drawio/                    # Draw.io diagram sources
└── README.md                    # This file
```

**Chi tiết cấu trúc**: [docs/README.md](./docs/README.md)

---

## 🗺️ Development Roadmap

### Current Status (October 17, 2025)

| Component | Progress | Status |
|-----------|----------|--------|
| Mobile App | 70% | ✅ Auth, Menu, Cart, History |
| Admin Dashboard | 40% | ✅ Basic CRUD, Dashboard |
| Restaurant Portal | 0% | 🔴 Not started |
| Database | 37% | 🟡 6/16 collections |
| Payment | 0% | 🔴 VNPay pending |
| Drone System | 0% | 🔴 Not started |

### 6-Week Plan

**📊 Phase 0 - Database Foundation** (Week 1) - **START HERE**
- Issues: #1-6
- Goal: Setup tất cả 16 Appwrite collections
- Time: 12-16 hours
- **🔴 CRITICAL**: Blocks all development

**🏗️ Phase 1 - Restaurant Portal MVP** (Week 2-3)
- Issues: #7-14
- Goal: Xây dựng web portal cho nhà hàng
- Time: 60-80 hours
- Features: Auth, Menu management, Order dashboard

**📱 Phase 2 - Mobile App Enhancement** (Week 3-4)
- Issues: #15-22
- Goal: Nâng cấp mobile lên 100%
- Time: 40-50 hours
- Features: Payment, Tracking, Notifications, Reviews

**🎛️ Phase 3 - Admin Enhancement** (Week 4-5)
- Issues: #23-30
- Goal: Hoàn thiện admin dashboard
- Time: 50-60 hours
- Features: Restaurant approval, Drone management, Analytics

**🔗 Phase 4 - Integration & Polish** (Week 5-6)
- Issues: #31-40
- Goal: Tích hợp và testing
- Time: 30-40 hours
- Features: Webhooks, Automation, Testing, Docs

**Chi tiết đầy đủ**: [docs/DEVELOPMENT_ROADMAP.md](./docs/DEVELOPMENT_ROADMAP.md)

---

## 🗄️ Database Architecture

### 16 Collections (Appwrite)

**✅ Existing (6)**:
1. User - User accounts
2. categories - Food categories
3. menu - Menu items
4. customizations - Toppings/add-ons
5. menu_customizations - Menu-customization mapping
6. orders - Customer orders

**🆕 New (10)** - Need to create:
7. **restaurants** 🔴 Critical - Restaurant partners
8. **order_items** 🔴 Critical - Order line items
9. **payments** 🔴 Critical - Payment transactions
10. **reviews** - Restaurant/food reviews
11. **notifications** - Push notifications
12. **drones** - Drone fleet
13. **drone_events** - Drone telemetry
14. **promotions** - Promo codes
15. **user_vouchers** - User's vouchers
16. **audit_logs** - System audit trail

**📊 ERD Diagram**: [docs/database/foodfast-database-erd-simple.drawio](./docs/database/foodfast-database-erd-simple.drawio)

**📖 Full Schema**: [docs/database/DATABASE_SCHEMA.md](./docs/database/DATABASE_SCHEMA.md)

**🛠️ Setup Guide**: [docs/database/APPWRITE_SETUP_GUIDE.md](./docs/database/APPWRITE_SETUP_GUIDE.md)
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
