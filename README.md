<div align="center"><div align="center">



# 🚁 FoodFast - Drone Delivery Food Ordering System# 🚁 FoodFast - Drone Delivery Food Ordering System



### *Nền tảng giao đồ ăn thông minh với công nghệ Drone Delivery*### *Nền tảng giao đồ ăn thông minh với công nghệ Drone Delivery*



[![React Native](https://img.shields.io/badge/React%20Native-Expo%2054-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)[![React Native](https://img.shields.io/badge/React%20Native-Expo%2054-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[![Appwrite](https://img.shields.io/badge/Appwrite-Backend-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io/)[![Appwrite](https://img.shields.io/badge/Appwrite-Backend-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io/)



[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[![GitHub Stars](https://img.shields.io/github/stars/phatle224/sgu_cnpm_foodfast?style=flat-square)](https://github.com/phatle224/sgu_cnpm_foodfast/stargazers)[![GitHub Stars](https://img.shields.io/github/stars/phatle224/sgu_cnpm_foodfast?style=flat-square)](https://github.com/phatle224/sgu_cnpm_foodfast/stargazers)

[![GitHub Issues](https://img.shields.io/github/issues/phatle224/sgu_cnpm_foodfast?style=flat-square)](https://github.com/phatle224/sgu_cnpm_foodfast/issues)[![GitHub Issues](https://img.shields.io/github/issues/phatle224/sgu_cnpm_foodfast?style=flat-square)](https://github.com/phatle224/sgu_cnpm_foodfast/issues)



**[📱 Demo](#-demo) • [✨ Features](#-tính-năng-chính) • [🛠 Tech Stack](#-tech-stack) • [📖 Docs](./docs/README.md) • [🚀 Quick Start](#-quick-start)****[📱 Demo](#-demo) • [✨ Features](#-tính-năng-chính) • [🛠 Tech Stack](#-tech-stack) • [📖 Docs](./docs/README.md) • [🚀 Quick Start](#-quick-start)**



------



*Dự án môn Công Nghệ Phần Mềm - Trường Đại học Sài Gòn (SGU)*<img src="./docs/images/banner.png" alt="FoodFast Banner" width="100%" />



</div>*Dự án môn Công Nghệ Phần Mềm - Trường Đại học Sài Gòn (SGU)*



---</div>



## 📋 Mục Lục---



- [Giới Thiệu](#-giới-thiệu)## 🚀 Quick Start

- [Demo](#-demo)

- [Tính Năng Chính](#-tính-năng-chính)**🆕 Developer mới?** → **[Đọc Documentation Hub](./docs/README.md)** (5 phút)

- [Tech Stack](#-tech-stack)

- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)**⚡ Bắt đầu ngay**:

- [Cấu Trúc Project](#-cấu-trúc-project)```bash

- [Quick Start](#-quick-start)# 1. Setup Database (Tuần 1 - CRITICAL)

- [Database Schema](#-database-schema)Read: docs/database/APPWRITE_SETUP_GUIDE.md

- [Development Roadmap](#-development-roadmap)Create: 16 Appwrite collections

- [Documentation](#-documentation)

- [Contributing](#-contributing)# 2. Pick an issue (Tuần 2+)

- [Team](#-team)Read: docs/GITHUB_ISSUES.md

- [License](#-license)Choose: Issue #1, #7, #15, or #23



---# 3. Start coding

git checkout -b feature/[issue-number]-description

## 🎯 Giới Thiệu```



**FoodFast** là một nền tảng giao đồ ăn toàn diện với công nghệ **Drone Delivery**, tích hợp 3 ứng dụng độc lập phục vụ các đối tượng người dùng khác nhau.**📊 Track Progress**: [PROJECT_TRACKER.md](./docs/PROJECT_TRACKER.md)



### 🎨 Hệ Sinh Thái 3 Nền Tảng---



<div align="center">## 📋 Mục Lục



```- [Giới Thiệu](#-giới-thiệu)

┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐- [Tính Năng](#-tính-năng)

│   📱 Mobile     │         │   🏪 Restaurant │         │   🎛️  Admin     │- [Tech Stack](#-tech-stack)

│   Customer App  │◄────────┤   Web Portal    │────────►│   Dashboard     │- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)

│                 │         │                 │         │                 │- [Development Roadmap](#-development-roadmap)

│  • Đặt đồ ăn    │         │  • Nhận đơn     │         │  • Duyệt NHàng  │- [Cài Đặt](#-cài-đặt)

│  • Thanh toán   │         │  • Quản lý menu │         │  • Gán drone    │- [Documentation](#-documentation)

│  • Theo dõi     │         │  • Thống kê     │         │  • Giám sát     │- [Contributing](#-contributing)

└─────────────────┘         └─────────────────┘         └─────────────────┘- [Team](#-team)

         │                           │                           │

         └───────────────────────────┼───────────────────────────┘---

                                     │

                         ┌───────────▼───────────┐## 🎯 Giới Thiệu

                         │   ☁️  Appwrite Cloud   │

                         │   Backend Services    │**FoodFast** là nền tảng giao đồ ăn đa bên (multi-sided platform) với công nghệ drone delivery:

                         │                       │

                         │  • Authentication     │- 📱 **Customer Mobile App** - Browse restaurants, Order food, Track drone real-time

                         │  • Database (16 coll) │- 🏪 **Restaurant Portal** - Menu management, Order processing, Analytics

                         │  • Storage            │- 🎛️ **Admin Dashboard** - Restaurant approval, Drone fleet management, System analytics

                         │  • Realtime           │- � **Drone Delivery System** - 60-second simulation, Real-time tracking, Telemetry

                         └───────────┬───────────┘

                                     │**Mục tiêu**: Xây dựng hệ sinh thái giao đồ ăn hoàn chỉnh với trải nghiệm tốt nhất cho 3 bên: Khách hàng, Nhà hàng, và Admin vận hành.

                         ┌───────────▼───────────┐

                         │   🚁 Drone System     │**Dự án**: Môn Công Nghệ Phần Mềm - Đại học Sài Gòn (SGU)

                         │   Delivery Engine     │

                         │                       │---

                         │  • Auto Assignment    │

                         │  • Route Planning     │## ✨ Tính Năng

                         │  • Real-time Tracking │

                         └───────────────────────┘### 📱 Customer Mobile App (70% Complete)

```

**✅ Đã có** (Current Features):

</div>- 🔐 Authentication: Đăng ký, Đăng nhập, Profile management

- 🍕 Menu browsing: Xem món ăn theo categories

| Nền tảng | Người dùng | Công nghệ | Trạng thái | Mô tả |- 🛒 Cart: Add/remove items, Calculate total

|----------|------------|-----------|------------|-------|- 📦 Order history: Xem đơn hàng đã đặt

| 📱 **Mobile App** | Khách hàng | React Native (Expo 54) | ✅ 70% | Đặt món, thanh toán, tracking |- 👤 Profile: Edit thông tin, Upload avatar

| 🏪 **Restaurant Portal** | Nhà hàng | Next.js 14 | 🚧 15% | Quản lý đơn, menu, doanh thu |

| 🎛️ **Admin Dashboard** | Quản trị viên | Next.js 14 | ✅ 40% | Duyệt nhà hàng, gán drone, analytics |**🔨 Đang phát triển** (Phase 2 - Issues #15-22):

- 🏪 Restaurant selection & filtering

### 🎯 Mục Tiêu Dự Án- 💳 VNPay payment integration

- 📍 Real-time order tracking với map

- ✅ Xây dựng hệ thống đặt đồ ăn hoàn chỉnh với 3 giao diện riêng biệt- 🚁 Drone delivery visualization (60s countdown)

- ✅ Tích hợp công nghệ Drone Delivery với mô phỏng thời gian thực- � Push notifications (FCM)

- ✅ Áp dụng kiến trúc Microservices và Real-time communication- ⭐ Review & rating system

- ✅ Quản lý đơn hàng, thanh toán, theo dõi giao hàng end-to-end- 🎟️ Voucher/promotion codes

- ✅ Tạo trải nghiệm người dùng mượt mà trên cả Mobile và Web

---

### 🏆 Điểm Nổi Bật

### 🏪 Restaurant Portal (0% - Week 2-3)

- 🚁 **Drone Delivery Simulation**: Mô phỏng giao hàng bằng drone với tracking real-time (60s/đơn)

- 🔄 **Real-time Updates**: WebSocket cho cập nhật trạng thái đơn hàng tức thì**🎯 Planned Features** (Phase 1 - Issues #7-14):

- 📱 **Cross-platform**: Mobile (iOS/Android) + Web (Desktop/Tablet)- 🔐 Restaurant authentication & role management

- 🎨 **Modern UI/UX**: Thiết kế hiện đại với Tailwind CSS + NativeWind- 📝 Onboarding flow với map picker

- 🔐 **Secure Authentication**: Phân quyền theo vai trò (RBAC) - Customer/Restaurant/Admin- 🍔 Menu management (CRUD + categories + image upload)

- 📊 **Analytics Dashboard**: Thống kê doanh thu, đơn hàng, hiệu suất chi tiết- 📊 Order dashboard với real-time updates

- 💳 **Payment Integration**: Hỗ trợ VNPay, COD- 🔔 Sound notification cho đơn mới

- 🗺️ **Map Integration**: Google Maps cho tracking và định vị- ⚡ Quick actions: Accept/Reject/Preparing/Ready

- 📈 Analytics: Revenue, best sellers, completion rate

---- ⚙️ Settings: Profile, operating hours, availability



## 📱 Demo---



> **🎥 Video Demo**: [Xem demo đầy đủ trên YouTube](#)### 🎛️ Admin Dashboard (40% Complete)



### Mobile App (Customer)**✅ Đã có** (Current Features):

- 🔐 Admin authentication riêng biệt

<div align="center">- 📊 Dashboard: Orders, Revenue, Customers stats

- 🛍️ Order management: View all, filter, update status

**Trải nghiệm đặt đồ ăn mượt mà trên iOS/Android**- 👥 Customer list với thông tin chi tiết

- 🍔 Product management: CRUD operations

| Đăng nhập | Trang chủ | Chi tiết món | Giỏ hàng |

|-----------|-----------|--------------|----------|**🔨 Đang phát triển** (Phase 3 - Issues #23-30):

| Login & Register | Danh sách nhà hàng | Xem món & Toppings | Thanh toán |- ✅ Restaurant approval workflow

- � Drone fleet management

</div>- 🎮 Drone simulation engine (control panel)

- 🌍 System-wide order monitoring

### Restaurant Portal (Web)- 📈 Advanced analytics (GMV, KPIs, trends)

- 👤 User management (ban, reset password)

<div align="center">- 📋 Audit logs viewer

- 📢 Notification broadcast system

**Quản lý nhà hàng toàn diện**

---

| Dashboard Đơn hàng | Quản lý Menu | Thống kê |

|-------------------|--------------|----------|### 🚁 Drone Delivery System (0% - Week 4-5)

| Xem & xử lý đơn real-time | CRUD món ăn + categories | Doanh thu & Best sellers |

**🎯 Planned Features** (Phase 3-4 - Issues #4, #17-18, #25):

</div>- 🚁 Drone fleet registration & status tracking

- � Telemetry events (position, battery, altitude)

### Admin Dashboard (Web)- 🗺️ Real-time map visualization

- ⏱️ 60-second delivery simulation

<div align="center">- 🎯 Auto-assignment algorithm

- 📊 Drone utilization analytics

**Giám sát và vận hành hệ thống**- 🔧 Maintenance scheduling



| Tổng quan | Quản lý Đơn hàng | Fleet Drone | Analytics |---

|-----------|------------------|-------------|-----------|

| KPIs & Stats | Theo dõi tất cả đơn | Gán & giám sát drone | Báo cáo chi tiết |## 🛠 Tech Stack



</div>### Frontend

- **Mobile**: React Native (Expo 54) + TypeScript + NativeWind (TailwindCSS)

---- **Web**: Next.js 14 (App Router) + TypeScript + TailwindCSS

- **State**: Zustand (mobile), Context API (web)

## ✨ Tính Năng Chính- **Navigation**: Expo Router (mobile), Next.js App Router (web)



### 📱 Customer Mobile App### Backend

- **BaaS**: Appwrite (Auth, Database, Storage, Functions, Realtime)

<table>- **Database**: 16 collections (6 existing + 10 new)

<tr>- **Auth**: Email/Password, Role-based access (customer/restaurant/admin)

<td width="50%">

### Integration

#### ✅ Đã Hoàn Thành (v1.0)- **Payment**: VNPay (planned)

- **Maps**: Google Maps / Mapbox (planned)

- 🔐 **Authentication**- **Notifications**: Firebase Cloud Messaging (planned)

  - Đăng ký/Đăng nhập

  - Quản lý profile### Dev Tools

  - Upload avatar- **Language**: TypeScript 5.7

  - **Package Manager**: npm

- 🏪 **Restaurant & Menu**- **Version Control**: Git + GitHub

  - Browse danh sách nhà hàng- **CI/CD**: GitHub Actions (planned)

  - Xem menu theo categories

  - Chi tiết món ăn + hình ảnh**Chi tiết**: [docs/PROJECT_REQUIREMENTS_vi.md](./docs/PROJECT_REQUIREMENTS_vi.md) Section 6

  - Tùy chỉnh món (toppings)

  ---

- 🛒 **Shopping Cart**

  - Add/Remove items## � Cấu Trúc Dự Án

  - Cập nhật số lượng

  - Tính tổng tự động```

  - Voucher/Discountsgu_cnpm_foodfast/

  ├── �📱 mobile/                    # React Native Mobile App (Expo)

- 📦 **Order Management**│   ├── app/                      # Expo Router screens

  - Đặt hàng│   │   ├── (auth)/              # Auth screens (sign-in, sign-up)

  - Lịch sử đơn hàng│   │   ├── (tabs)/              # Tab screens (home, cart, profile, search)

  - Chi tiết đơn hàng│   │   ├── menu-detail.tsx      # Menu item detail

  - Trạng thái real-time│   │   ├── order-history.tsx    # Order history

│   │   └── edit-profile.tsx     # Profile editing

</td>│   ├── components/              # Reusable components

<td width="50%">│   ├── lib/                     # Appwrite client, hooks, utilities

│   ├── store/                   # Zustand stores (auth, cart)

#### 🚧 Đang Phát Triển (v2.0)│   ├── constants/               # Constants, dummy data

│   └── package.json

- 💳 **Payment Integration**│

  - VNPay gateway├── 💻 admin/                     # Next.js Admin Dashboard

  - Momo wallet│   ├── src/

  - COD (Cash on Delivery)│   │   ├── pages/               # Dashboard pages

  │   │   │   ├── DashboardPage.tsx

- 📍 **Order Tracking**│   │   │   ├── OrdersPage.tsx

  - Real-time map tracking│   │   │   ├── CustomersPage.tsx

  - Drone position updates│   │   │   └── ProductsPage.tsx

  - ETA countdown│   │   ├── components/          # Reusable components

  - Delivery notifications│   │   ├── lib/                 # Appwrite client, API

  │   │   └── store/               # Auth store

- 🔔 **Notifications**│   └── package.json

  - Push notifications (FCM)│

  - Order status updates├── 🏪 restaurant-portal/         # [TODO] Next.js Restaurant Portal

  - Promotions alerts│   └── (Will be created in Phase 1 - Issue #7)

  │

- ⭐ **Reviews & Ratings**├── 📚 docs/                      # 🔥 DOCUMENTATION HUB

  - Đánh giá nhà hàng│   ├── README.md                # Documentation overview

  - Review món ăn│   ├── PROJECT_REQUIREMENTS_vi.md  # Full requirements (Vietnamese)

  - Upload photos│   ├── DEVELOPMENT_ROADMAP.md   # 6-week roadmap, 4 phases

  │   ├── GITHUB_ISSUES.md         # 40 GitHub issues template

- 🎟️ **Promotions**│   ├── PROJECT_TRACKER.md       # Progress tracking

  - Mã giảm giá│   ├── database/                # Database documentation

  - Loyalty points│   │   ├── DATABASE_SCHEMA.md   # 16 collections schema

  - Referral program│   │   ├── APPWRITE_SETUP_GUIDE.md  # Step-by-step setup

│   │   ├── QUICK_REFERENCE.md   # Cheat sheet

</td>│   │   └── foodfast-database-erd-simple.drawio  # ERD diagram

</tr>│   └── diagrams/                # System diagrams

</table>│

├── 🎨 drawio/                    # Draw.io diagram sources

---└── README.md                    # This file

```

### 🏪 Restaurant Portal

**Chi tiết cấu trúc**: [docs/README.md](./docs/README.md)

<table>

<tr>---

<td width="50%">

## 🗺️ Development Roadmap

#### ✅ Core Features (v1.0)

### Current Status (October 17, 2025)

- 🔐 **Authentication & Onboarding**

  - Đăng ký nhà hàng| Component | Progress | Status |

  - Chờ admin duyệt|-----------|----------|--------|

  - Setup profile + location map| Mobile App | 70% | ✅ Auth, Menu, Cart, History |

  | Admin Dashboard | 40% | ✅ Basic CRUD, Dashboard |

- 📋 **Order Dashboard**| Restaurant Portal | 0% | 🔴 Not started |

  - Nhận đơn real-time| Database | 37% | 🟡 6/16 collections |

  - Sound notification| Payment | 0% | 🔴 VNPay pending |

  - Accept/Reject orders| Drone System | 0% | 🔴 Not started |

  - Update status (Preparing → Ready)

  ### 6-Week Plan

- 🍔 **Menu Management**

  - CRUD món ăn**📊 Phase 0 - Database Foundation** (Week 1) - **START HERE**

  - Categories management- Issues: #1-6

  - Image upload- Goal: Setup tất cả 16 Appwrite collections

  - Price & description- Time: 12-16 hours

  - Availability toggle- **🔴 CRITICAL**: Blocks all development



</td>**🏗️ Phase 1 - Restaurant Portal MVP** (Week 2-3)

<td width="50%">- Issues: #7-14

- Goal: Xây dựng web portal cho nhà hàng

#### 🚧 Advanced Features (v2.0)- Time: 60-80 hours

- Features: Auth, Menu management, Order dashboard

- 📊 **Analytics & Reports**

  - Doanh thu theo ngày/tuần/tháng**📱 Phase 2 - Mobile App Enhancement** (Week 3-4)

  - Best selling items- Issues: #15-22

  - Order completion rate- Goal: Nâng cấp mobile lên 100%

  - Peak hours analysis- Time: 40-50 hours

  - Features: Payment, Tracking, Notifications, Reviews

- ⚙️ **Restaurant Settings**

  - Operating hours**🎛️ Phase 3 - Admin Enhancement** (Week 4-5)

  - Delivery radius- Issues: #23-30

  - Minimum order value- Goal: Hoàn thiện admin dashboard

  - Preparation time- Time: 50-60 hours

  - Features: Restaurant approval, Drone management, Analytics

- 💬 **Communication**

  - Chat với khách hàng**🔗 Phase 4 - Integration & Polish** (Week 5-6)

  - Admin support- Issues: #31-40

  - Goal: Tích hợp và testing

- 🎨 **Storefront Customization**- Time: 30-40 hours

  - Banner images- Features: Webhooks, Automation, Testing, Docs

  - Restaurant description

  - Featured items**Chi tiết đầy đủ**: [docs/DEVELOPMENT_ROADMAP.md](./docs/DEVELOPMENT_ROADMAP.md)



</td>---

</tr>

</table>## 🗄️ Database Architecture



---### 16 Collections (Appwrite)



### 🎛️ Admin Dashboard**✅ Existing (6)**:

1. User - User accounts

<table>2. categories - Food categories

<tr>3. menu - Menu items

<td width="50%">4. customizations - Toppings/add-ons

5. menu_customizations - Menu-customization mapping

#### ✅ Current Features6. orders - Customer orders



- 📊 **Dashboard Overview****🆕 New (10)** - Need to create:

  - Total orders, revenue, users7. **restaurants** 🔴 Critical - Restaurant partners

  - Charts & graphs8. **order_items** 🔴 Critical - Order line items

  - Recent activities9. **payments** 🔴 Critical - Payment transactions

  10. **reviews** - Restaurant/food reviews

- 👥 **User Management**11. **notifications** - Push notifications

  - View all customers12. **drones** - Drone fleet

  - User details13. **drone_events** - Drone telemetry

  - Order history per user14. **promotions** - Promo codes

  15. **user_vouchers** - User's vouchers

- 🛍️ **Order Management**16. **audit_logs** - System audit trail

  - View all orders

  - Filter by status**📊 ERD Diagram**: [docs/database/foodfast-database-erd-simple.drawio](./docs/database/foodfast-database-erd-simple.drawio)

  - Update order status

  **📖 Full Schema**: [docs/database/DATABASE_SCHEMA.md](./docs/database/DATABASE_SCHEMA.md)

- 🍔 **Product Management**

  - CRUD operations**🛠️ Setup Guide**: [docs/database/APPWRITE_SETUP_GUIDE.md](./docs/database/APPWRITE_SETUP_GUIDE.md)

  - Categories{

  - Stock management  "Framework": "React 18.3.1",

  "Bundler": "Vite 6.0",

</td>  "Language": "TypeScript 5.7",

<td width="50%">  "Styling": "Tailwind CSS 3.4.15",

  "State Management": "Zustand 5.0.8",

#### 🚧 In Development  "Routing": "React Router DOM 6.28",

  "Charts": "Recharts 2.15",

- 🏪 **Restaurant Management**  "Icons": "Lucide React 0.468"

  - Approval workflow}

  - Restaurant list & details```

  - Suspend/Activate accounts

  ### Backend

- 🚁 **Drone Fleet Management**```json

  - Drone registration{

  - Status monitoring  "Service": "Appwrite Cloud",

  - Auto-assignment algorithm  "SDK": "React Native Appwrite 0.14.0 / Appwrite Web 16.0.2",

  - Maintenance scheduling  "Authentication": "Email/Password, Session Management",

    "Database": "NoSQL Document-based",

- 📈 **Advanced Analytics**  "Storage": "File Upload & Management",

  - GMV tracking  "Realtime": "WebSocket Support"

  - Drone utilization}

  - Restaurant performance```

  - User retention

  ### Development Tools

- 🔧 **System Settings**- **Version Control**: Git & GitHub

  - Platform configurations- **Package Manager**: npm

  - Notification templates- **Code Editor**: VS Code

  - Audit logs viewer- **API Testing**: Appwrite Console

- **Deployment**: Expo EAS (Mobile), Vercel/Netlify (Web)

</td>

</tr>---

</table>

## 📁 Cấu Trúc Dự Án

---

```

### 🚁 Drone Delivery Systemsgu_cnpm_foodfast/

│

#### 🎯 Planned Features (Phase 4)├── app-web/                          # 📱 Customer Mobile App (React Native + Expo)

│   ├── app/                          # Expo Router pages

- **Fleet Management**│   │   ├── (auth)/                   # Authentication screens

  - Drone registration & profiles│   │   │   ├── sign-in.tsx          # Login screen

  - Battery & maintenance tracking│   │   │   ├── sign-up.tsx          # Register screen

  - Status: Available / In-flight / Charging / Maintenance│   │   │   └── _layout.tsx          # Auth layout

  │   │   ├── (tabs)/                   # Tab navigation screens

- **Delivery Simulation**│   │   │   ├── index.tsx            # Home/Menu screen

  - 60-second delivery cycle│   │   │   ├── search.tsx           # Search screen

  - Route planning & optimization│   │   │   ├── cart.tsx             # Cart screen

  - Real-time position updates│   │   │   ├── profile.tsx          # Profile screen

  - ETA calculation│   │   │   └── _layout.tsx          # Tab layout

  │   │   ├── menu-detail.tsx          # Menu item detail

- **Telemetry & Monitoring**│   │   ├── order-history.tsx        # Order history

  - GPS coordinates streaming│   │   ├── order-detail.tsx         # Order detail

  - Battery level monitoring│   │   ├── edit-profile.tsx         # Edit profile

  - Altitude & speed tracking│   │   └── _layout.tsx              # Root layout

  - Event logging│   │

  │   ├── components/                   # Reusable components

- **Analytics**│   │   ├── CartButton.tsx           # Cart button with badge

  - Delivery success rate│   │   ├── CartItem.tsx             # Cart item component

  - Average delivery time│   │   ├── CustomButton.tsx         # Custom button

  - Drone utilization│   │   ├── CustomHeader.tsx         # Custom header

  - Performance metrics│   │   ├── CustomInput.tsx          # Custom input field

│   │   ├── Filter.tsx               # Category filter

---│   │   ├── MenuCard.tsx             # Menu item card

│   │   ├── OrderCard.tsx            # Order card

## 🛠 Tech Stack│   │   ├── OrderConfirmationModal.tsx # Order confirmation modal

│   │   ├── ProfileField.tsx         # Profile field component

### Frontend│   │   └── SearchBar.tsx            # Search bar

│   │

<table>│   ├── lib/                          # Utilities & API

<tr>│   │   ├── appwrite.ts              # Appwrite config & API functions

<td width="33%" align="center">│   │   ├── data.ts                  # Static data

│   │   ├── useAppwrite.ts           # Custom Appwrite hook

#### 📱 Mobile│   │   ├── seed.ts                  # Database seeding script

│   │   └── seed-simple.ts           # Simple seeding script

![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)│   │

│   ├── store/                        # State management (Zustand)

**Framework**: Expo 54  │   │   ├── auth.store.ts            # Auth state

**Language**: TypeScript 5.7  │   │   └── cart.store.ts            # Cart state

**Styling**: NativeWind (Tailwind)  │   │

**State**: Zustand  │   ├── constants/                    # Constants & config

**Navigation**: Expo Router  │   │   └── index.ts                 # App constants

**Icons**: Expo Vector Icons│   │

│   ├── assets/                       # Static assets

</td>│   │   ├── fonts/                   # Custom fonts

<td width="33%" align="center">│   │   ├── icons/                   # Icon images

│   │   └── images/                  # App images

#### 🏪 Restaurant│   │

│   ├── docs/                         # Documentation

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)│   │   ├── APPWRITE_DATABASE_SETUP.md

│   │   ├── ERD_DATABASE_SCHEMA.md

**Framework**: Next.js 14  │   │   ├── PROJECT_EVALUATION.md

**Language**: TypeScript 5.7  │   │   └── ...

**Styling**: Tailwind CSS  │   │

**State**: Context API  │   ├── package.json                 # Dependencies

**Charts**: Recharts  │   ├── app.json                     # Expo config

**Icons**: Lucide React│   ├── tsconfig.json                # TypeScript config

│   └── tailwind.config.js           # Tailwind config

</td>│

<td width="33%" align="center">├── admin/                            # 💻 Admin Web Dashboard (React + Vite)

│   ├── src/

#### 🎛️ Admin│   │   ├── components/              # React components

│   │   │   ├── Layout.tsx          # Main layout

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)│   │   │   ├── Sidebar.tsx         # Sidebar navigation

│   │   │   ├── Header.tsx          # Top header

**Framework**: Next.js 14  │   │   │   └── StatCard.tsx        # Statistics card

**Bundler**: Vite 6.0  │   │   │

**Language**: TypeScript 5.7  │   │   ├── pages/                   # Page components

**Styling**: Tailwind CSS  │   │   │   ├── LoginPage.tsx       # Admin login

**State**: Zustand  │   │   │   ├── DashboardPage.tsx   # Dashboard overview

**Routing**: React Router v6│   │   │   ├── OrdersPage.tsx      # Orders management

│   │   │   ├── CustomersPage.tsx   # Customers list

</td>│   │   │   └── ProductsPage.tsx    # Products CRUD

</tr>│   │   │

</table>│   │   ├── lib/                     # Utilities & API

│   │   │   ├── appwrite.ts         # Appwrite client config

### Backend & Services│   │   │   └── api.ts              # API functions

│   │   │

<div align="center">│   │   ├── store/                   # State management

│   │   │   └── authStore.ts        # Auth state (Zustand)

| Service | Technology | Purpose |│   │   │

|---------|-----------|---------|│   │   ├── types/                   # TypeScript types

| **Backend as a Service** | ![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=flat-square&logo=appwrite&logoColor=white) | Auth, Database, Storage, Realtime |│   │   │   └── index.ts            # Type definitions

| **Database** | NoSQL (Document-based) | 16 collections với relationships |│   │   │

| **Authentication** | Appwrite Auth | Email/Password, Sessions, RBAC |│   │   ├── App.tsx                 # Main app component

| **File Storage** | Appwrite Storage | Images upload (avatars, menus, restaurants) |│   │   ├── main.tsx                # Entry point

| **Real-time** | Appwrite Realtime | WebSocket cho order updates |│   │   └── index.css               # Global styles

| **Payment** | VNPay API | Online payment gateway |│   │

| **Maps** | Google Maps API | Location & tracking |│   ├── scripts/                     # Utility scripts

| **Push Notifications** | Firebase Cloud Messaging | Mobile push notifications |│   │   └── create-admin.js         # Create admin user script

│   │

</div>│   ├── docs/                        # Documentation

│   │   ├── FIX_ADMIN_LOGIN.md

### Development Tools│   │   ├── QUICK_SETUP_ORDER_CONFIRMATION.md

│   │   └── ...

```json│   │

{│   ├── package.json                # Dependencies

  "Version Control": "Git + GitHub",│   ├── vite.config.ts              # Vite config

  "Package Manager": "npm",│   ├── tsconfig.json               # TypeScript config

  "Code Editor": "Visual Studio Code",│   ├── tailwind.config.js          # Tailwind config

  "API Testing": "Postman / Appwrite Console",│   └── index.html                  # HTML entry point

  "Design Tools": "Figma / Draw.io",│

  "CI/CD": "GitHub Actions (planned)",├── .gitignore                       # Git ignore file

  "Deployment": {└── README.md                        # This file

    "Mobile": "Expo EAS Build",```

    "Web": "Vercel / Netlify"

  }---

}

```## 🚀 Cài Đặt



---### Yêu Cầu Hệ Thống



## 🏗 Kiến Trúc Hệ Thống- **Node.js**: >= 18.0.0

- **npm**: >= 9.0.0

### High-Level Architecture- **Git**: Latest version

- **Expo CLI**: Installed globally (optional)

```- **Android Studio** / **Xcode**: For mobile development

┌─────────────────────────────────────────────────────────────────────┐

│                         CLIENT LAYER                                │### 1. Clone Repository

├─────────────────────────────────────────────────────────────────────┤

│                                                                     │```bash

│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │git clone https://github.com/phatle224/sgu_cnpm_foodfast.git

│  │   Mobile    │    │ Restaurant  │    │    Admin    │            │cd sgu_cnpm_foodfast

│  │     App     │    │   Portal    │    │  Dashboard  │            │```

│  │  (Expo RN)  │    │  (Next.js)  │    │  (Next.js)  │            │

│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘            │### 2. Cài Đặt Dependencies

│         │                  │                   │                    │

└─────────┼──────────────────┼───────────────────┼────────────────────┘#### 📱 Mobile App

          │                  │                   │

          │         HTTPS / WebSocket            │```bash

          │                  │                   │cd app-web

┌─────────┼──────────────────┼───────────────────┼────────────────────┐npm install

│         │         API GATEWAY LAYER            │                    │```

├─────────┴──────────────────┴───────────────────┴────────────────────┤

│                                                                     │#### 💻 Admin Web

│                    ┌─────────────────────┐                         │

│                    │  Appwrite Cloud     │                         │```bash

│                    │  Backend Services   │                         │cd admin

│                    └──────────┬──────────┘                         │npm install

│                               │                                     │```

│       ┌───────────────────────┼───────────────────────┐            │

│       │                       │                       │            │### 3. Cấu Hình Environment Variables

│  ┌────▼────┐          ┌──────▼──────┐         ┌─────▼─────┐       │

│  │  Auth   │          │  Database   │         │  Storage  │       │#### 📱 Mobile App

│  │ Service │          │   Service   │         │  Service  │       │

│  └─────────┘          └─────────────┘         └───────────┘       │Tạo file `.env` trong thư mục `app-web/`:

│                                                                     │

└─────────────────────────────────────────────────────────────────────┘```env

          │                  │                   │EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1

┌─────────┼──────────────────┼───────────────────┼────────────────────┐EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here

│         │        BUSINESS LOGIC LAYER          │                    │```

├─────────┴──────────────────┴───────────────────┴────────────────────┤

│                                                                     │#### 💻 Admin Web

│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐           │

│  │   Order      │   │   Payment    │   │    Drone     │           │Tạo file `.env` trong thư mục `admin/`:

│  │  Management  │   │  Processing  │   │  Management  │           │

│  └──────────────┘   └──────────────┘   └──────────────┘           │```env

│                                                                     │VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1

└─────────────────────────────────────────────────────────────────────┘VITE_APPWRITE_PROJECT_ID=your_project_id_here

          │                  │                   │VITE_APPWRITE_DATABASE_ID=68da5e73002cb68e70af

┌─────────┼──────────────────┼───────────────────┼────────────────────┐VITE_APPWRITE_BUCKET_ID=68dacda1003d6943981e

│         │       EXTERNAL SERVICES              │                    │

├─────────┴──────────────────┴───────────────────┴────────────────────┤VITE_APPWRITE_USER_COLLECTION_ID=user

│                                                                     │VITE_APPWRITE_ORDERS_COLLECTION_ID=orders

│  ┌──────────┐     ┌──────────┐     ┌──────────┐    ┌──────────┐   │VITE_APPWRITE_MENU_COLLECTION_ID=menu

│  │  VNPay   │     │  Google  │     │ Firebase │    │  Email   │   │VITE_APPWRITE_CATEGORIES_COLLECTION_ID=categories

│  │    API   │     │   Maps   │     │   FCM    │    │ Service  │   │VITE_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID=customizations

│  └──────────┘     └──────────┘     └──────────┘    └──────────┘   │VITE_APPWRITE_MENU_CUSTOMIZATIONS_COLLECTION_ID=menu_customizations

│                                                                     │```

└─────────────────────────────────────────────────────────────────────┘

```### 4. Setup Appwrite Backend



---1. Tạo tài khoản tại [Appwrite Cloud](https://cloud.appwrite.io/)

2. Tạo project mới

## 📁 Cấu Trúc Project3. Tạo các collections theo schema trong `app-web/docs/ERD_DATABASE_SCHEMA.md`

4. Tạo storage bucket cho hình ảnh

```5. Cấu hình permissions cho collections và bucket

sgu_cnpm_foodfast/6. Copy Project ID vào file `.env`

│

├── 📱 mobile/                        # React Native Mobile App (Expo)**Chi tiết setup**: Xem file `app-web/docs/APPWRITE_DATABASE_SETUP.md`

│   ├── app/                          # Expo Router screens

│   │   ├── (auth)/                   # Auth flow---

│   │   │   ├── sign-in.tsx

│   │   │   ├── sign-up.tsx## 🏃 Chạy Ứng Dụng

│   │   │   └── _layout.tsx

│   │   ├── (tabs)/                   # Main tabs### 📱 Mobile App

│   │   │   ├── index.tsx            # Home/Restaurants

│   │   │   ├── search.tsx           # Search```bash

│   │   │   ├── cart.tsx             # Shopping cartcd app-web

│   │   │   ├── profile.tsx          # User profile

│   │   │   └── _layout.tsx# Start Expo development server

│   │   ├── menu-detail.tsx          # Menu item detailnpm start

│   │   ├── order-history.tsx        # Order history

│   │   ├── order-tracking.tsx       # Real-time tracking# Run on Android

│   │   └── edit-profile.tsx         # Edit profilenpm run android

│   │

│   ├── components/                   # Reusable components# Run on iOS

│   ├── lib/                          # Utilities & APInpm run ios

│   ├── store/                        # Zustand state management

│   ├── constants/                    # Constants & config# Run on Web (experimental)

│   └── assets/                       # Images, icons, fontsnpm run web

│```

├── 🏪 restaurant/                    # Next.js Restaurant Portal

│   ├── src/**Lưu ý**: Quét QR code bằng Expo Go app (iOS/Android) để test trên thiết bị thật.

│   │   ├── app/                     # Next.js 14 App Router

│   │   ├── components/              # React components### 💻 Admin Web

│   │   ├── lib/                     # API & utilities

│   │   └── store/                   # State management```bash

│   └── package.jsoncd admin

│

├── 🎛️ admin/                         # Next.js Admin Dashboard# Start development server

│   ├── src/npm run dev

│   │   ├── pages/                   # React Router pages```

│   │   ├── components/              # Reusable components

│   │   ├── lib/                     # API & utilitiesMở trình duyệt tại: **http://localhost:3001**

│   │   └── store/                   # Zustand stores

│   └── package.json### 🔨 Build Production

│

├── 📚 docs/                          # 🔥 Documentation Hub#### Mobile App

│   ├── README.md                    # Doc overview

│   ├── UC1_DAT_DO_AN.md             # Use Case: Đặt đồ ăn```bash

│   ├── PROJECT_REQUIREMENTS_vi.md   # Full requirementscd app-web

│   ├── DEVELOPMENT_ROADMAP.md       # 6-week roadmap

│   └── database/                    # Database docs# Build for Android (APK)

│npx expo build:android

├── 🎨 drawio/                        # Draw.io diagram sources

│   ├── UC1-activity-diagram.drawio  # Activity diagram# Build for iOS (IPA)

│   ├── UC1-sequence-diagram.drawio  # Sequence diagramnpx expo build:ios

│   └── ...

│# Or use EAS Build (recommended)

├── ⚙️ functions/                     # Appwrite Cloud Functionsnpm install -g eas-cli

├── 🔧 shared/                        # Shared utilities & typeseas build --platform android

│eas build --platform ios

├── .gitignore```

├── README.md                        # This file

└── package.json                     # Root package.json#### Admin Web

```

```bash

---cd admin



## 🚀 Quick Start# Build for production

npm run build

### Yêu Cầu Hệ Thống

# Preview production build

- **Node.js**: >= 18.0.0npm run preview

- **npm**: >= 9.0.0```

- **Git**: Latest version

- **Expo CLI**: (Optional) `npm install -g expo-cli`

- **Android Studio** / **Xcode**: Cho mobile development## 👥 Tác Giả



### ⚡ Setup Nhanh (5 phút)- **Lê Hồng Phát** - [@phatle224](https://github.com/phatle224)

- **Nguyễn Hồng Thắm** - [@nguyen-hong-tham](https://github.com/nguyen-hong-tham)

#### 1️⃣ Clone Repository



```bash**Môn học**: Công Nghệ Phần Mềm  

git clone https://github.com/phatle224/sgu_cnpm_foodfast.git**Giảng viên hướng dẫn**: [TS.Nguyễn Quốc Huy]  

cd sgu_cnpm_foodfast**Học kỳ**: [Học kỳ 1/Năm học 2025-2026]

```

---

#### 2️⃣ Setup Backend (Appwrite)



1. Tạo account tại [Appwrite Cloud](https://cloud.appwrite.io/)## 🙏 Acknowledgments

2. Tạo project mới

3. Tạo 16 collections theo schema: [DATABASE_SCHEMA.md](./docs/database/DATABASE_SCHEMA.md)- [React Native](https://reactnative.dev/) - Mobile framework

4. Setup authentication: Enable Email/Password- [Expo](https://expo.dev/) - Development platform

5. Create storage bucket: `foodfast-images`- [Appwrite](https://appwrite.io/) - Backend as a Service

6. Copy Project ID- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

- [Zustand](https://zustand-demo.pmnd.rs/) - State management

**📖 Chi tiết**: [APPWRITE_SETUP_GUIDE.md](./docs/database/APPWRITE_SETUP_GUIDE.md)- [Lucide Icons](https://lucide.dev/) - Icon library



#### 3️⃣ Setup Mobile App---



```bash## 📞 Liên Hệ & Hỗ Trợ

cd mobile

- **Email**: [hongphatle224@gmail.com]

# Install dependencies- **GitHub Issues**: [https://github.com/phatle224/sgu_cnpm_foodfast/issues](https://github.com/phatle224/sgu_cnpm_foodfast/issues)

npm install- **Documentation**: [Wiki](https://github.com/phatle224/sgu_cnpm_foodfast/wiki)



# Create .env file---

cat > .env << EOF

EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1## 🔄 Changelog

EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here

EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id### Version 1.0.0 (Current)

EXPO_PUBLIC_APPWRITE_BUCKET_ID=your_bucket_id- ✅ Initial release

EOF- ✅ Customer mobile app (iOS/Android)

- ✅ Admin web dashboard

# Start development server- ✅ Full authentication system

npm start- ✅ Menu browsing & ordering

```- ✅ Order management

- ✅ Profile management

Scan QR code bằng **Expo Go** app (iOS/Android)- ✅ Real-time updates



#### 4️⃣ Setup Admin Dashboard**Xem chi tiết**: [CHANGELOG.md](CHANGELOG.md)



```bash---

cd admin

## 🎯 Roadmap

# Install dependencies

npm install### Phase 2 (Planned)

- [ ] Payment integration (VNPay, MoMo)

# Create .env file- [ ] Real-time order tracking

cat > .env << EOF- [ ] Push notifications

VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1- [ ] Drone delivery 

VITE_APPWRITE_PROJECT_ID=your_project_id_here- [ ] Chat box AI

VITE_APPWRITE_DATABASE_ID=your_database_id

VITE_APPWRITE_BUCKET_ID=your_bucket_id---

EOF

<div align="center">

# Start development server

npm run dev[⬆ Back to top](#-sgu-fastfood-deli---food-ordering-system)

```

</div>

Mở trình duyệt: **http://localhost:3001**

#### 5️⃣ Setup Restaurant Portal

```bash
cd restaurant

# Install dependencies
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_BUCKET_ID=your_bucket_id
EOF

# Start development server
npm run dev
```

Mở trình duyệt: **http://localhost:3000**

### 🎯 Next Steps

1. **Seed Database**: Chạy script seed data mẫu
2. **Create Accounts**: Tạo user/admin accounts test
3. **Pick an Issue**: Chọn issue từ [GITHUB_ISSUES.md](./docs/GITHUB_ISSUES.md)
4. **Start Coding**: Checkout branch và bắt đầu code

---

## 🗄️ Database Schema

### 16 Collections (Appwrite)

<table>
<tr>
<th>Collection</th>
<th>Purpose</th>
<th>Status</th>
<th>Key Attributes</th>
</tr>

<!-- Existing Collections -->
<tr>
<td>✅ <code>users</code></td>
<td>User accounts</td>
<td>🟢 Done</td>
<td>email, name, role, avatar</td>
</tr>

<tr>
<td>✅ <code>categories</code></td>
<td>Food categories</td>
<td>🟢 Done</td>
<td>name, description, image</td>
</tr>

<tr>
<td>✅ <code>menu</code></td>
<td>Menu items</td>
<td>🟢 Done</td>
<td>name, price, image, categoryId</td>
</tr>

<tr>
<td>✅ <code>customizations</code></td>
<td>Toppings/add-ons</td>
<td>🟢 Done</td>
<td>name, price, type</td>
</tr>

<tr>
<td>✅ <code>menu_customizations</code></td>
<td>Menu-customization link</td>
<td>🟢 Done</td>
<td>menuId, customizationId</td>
</tr>

<tr>
<td>✅ <code>orders</code></td>
<td>Customer orders</td>
<td>🟢 Done</td>
<td>userId, restaurantId, total, status</td>
</tr>

<!-- New Collections -->
<tr>
<td>🆕 <code>restaurants</code></td>
<td>Restaurant partners</td>
<td>🔴 TODO</td>
<td>name, address, lat/lng, ownerId</td>
</tr>

<tr>
<td>🆕 <code>order_items</code></td>
<td>Order line items</td>
<td>🔴 TODO</td>
<td>orderId, menuId, quantity, price</td>
</tr>

<tr>
<td>🆕 <code>payments</code></td>
<td>Payment transactions</td>
<td>🔴 TODO</td>
<td>orderId, amount, method, status</td>
</tr>

<tr>
<td>🆕 <code>reviews</code></td>
<td>Restaurant/food reviews</td>
<td>🔴 TODO</td>
<td>userId, targetId, rating, comment</td>
</tr>

<tr>
<td>🆕 <code>notifications</code></td>
<td>Push notifications</td>
<td>🔴 TODO</td>
<td>userId, title, body, read</td>
</tr>

<tr>
<td>🆕 <code>drones</code></td>
<td>Drone fleet</td>
<td>🔴 TODO</td>
<td>name, status, battery, location</td>
</tr>

<tr>
<td>🆕 <code>drone_events</code></td>
<td>Drone telemetry</td>
<td>🔴 TODO</td>
<td>droneId, event, lat/lng, timestamp</td>
</tr>

<tr>
<td>🆕 <code>promotions</code></td>
<td>Promo codes</td>
<td>🔴 TODO</td>
<td>code, discount, validFrom, validTo</td>
</tr>

<tr>
<td>🆕 <code>user_vouchers</code></td>
<td>User's vouchers</td>
<td>🔴 TODO</td>
<td>userId, promotionId, used</td>
</tr>

<tr>
<td>🆕 <code>audit_logs</code></td>
<td>System audit trail</td>
<td>🔴 TODO</td>
<td>userId, action, details, timestamp</td>
</tr>

</table>

**📖 Full Schema Documentation**: [DATABASE_SCHEMA.md](./docs/database/DATABASE_SCHEMA.md)

**🛠️ Setup Guide**: [APPWRITE_SETUP_GUIDE.md](./docs/database/APPWRITE_SETUP_GUIDE.md)

---

## 🗺️ Development Roadmap

### Current Status (November 2025)

<div align="center">

| Component | Progress | Status | Priority |
|-----------|----------|--------|----------|
| 📱 Mobile App | 70% | ✅ Auth, Menu, Cart, Orders | HIGH |
| 🏪 Restaurant Portal | 15% | 🚧 In Progress | HIGH |
| 🎛️ Admin Dashboard | 40% | ✅ Basic CRUD, Stats | MEDIUM |
| 🗄️ Database | 37% | 🟡 6/16 collections | CRITICAL |
| 💳 Payment Integration | 0% | 🔴 Not Started | HIGH |
| 🚁 Drone System | 0% | 🔴 Not Started | MEDIUM |
| 📱 Push Notifications | 0% | 🔴 Not Started | MEDIUM |
| 🗺️ Map Integration | 0% | 🔴 Not Started | HIGH |

</div>

### 6-Week Development Plan

#### 📊 Phase 0: Database Foundation (Week 1)

**🔴 CRITICAL - Must Complete First**

- [ ] **Issue #1-6**: Setup 10 new Appwrite collections
- [ ] Create all relationships & indexes
- [ ] Setup permissions & roles
- [ ] Seed initial data
- **Time**: 12-16 hours
- **Blocks**: All other development

---

#### 🏗️ Phase 1: Restaurant Portal MVP (Week 2-3)

**Target**: Full-featured restaurant web portal

**Issues #7-14**:
- [ ] #7: Restaurant authentication & role management
- [ ] #8: Onboarding flow với map picker (Google Maps)
- [ ] #9: Menu management (CRUD + categories + image upload)
- [ ] #10: Order dashboard với real-time updates
- [ ] #11: Sound notification cho đơn mới
- [ ] #12: Quick actions (Accept/Reject/Preparing/Ready)
- [ ] #13: Analytics dashboard (revenue, best sellers)
- [ ] #14: Settings page (profile, hours, availability)

**Time**: 60-80 hours

---

#### 📱 Phase 2: Mobile App Enhancement (Week 3-4)

**Target**: Nâng cấp mobile app lên 100%

**Issues #15-22**:
- [ ] #15: Restaurant selection & filtering UI
- [ ] #16: VNPay payment integration
- [ ] #17: Real-time order tracking với map
- [ ] #18: Drone delivery visualization (60s countdown)
- [ ] #19: Push notifications (Firebase FCM)
- [ ] #20: Review & rating system
- [ ] #21: Voucher/promotion codes
- [ ] #22: Profile enhancement (addresses, payment methods)

**Time**: 40-50 hours

---

#### 🎛️ Phase 3: Admin Enhancement (Week 4-5)

**Target**: Hoàn thiện admin dashboard

**Issues #23-30**:
- [ ] #23: Restaurant approval workflow
- [ ] #24: Drone fleet management page
- [ ] #25: Drone simulation engine (control panel)
- [ ] #26: System-wide order monitoring
- [ ] #27: Advanced analytics (GMV, KPIs, trends)
- [ ] #28: User management (ban, reset password)
- [ ] #29: Audit logs viewer
- [ ] #30: Notification broadcast system

**Time**: 50-60 hours

---

#### 🔗 Phase 4: Integration & Polish (Week 5-6)

**Target**: Tích hợp & testing toàn diện

**Issues #31-40**:
- [ ] #31: Appwrite webhooks setup
- [ ] #32: Email notifications (Order confirmations)
- [ ] #33: SMS notifications (OTP, Delivery alerts)
- [ ] #34: End-to-end testing suite
- [ ] #35: Performance optimization
- [ ] #36: Security audit & fixes
- [ ] #37: Documentation completion
- [ ] #38: Deployment setup (EAS Build, Vercel)
- [ ] #39: Demo data generation script
- [ ] #40: Presentation preparation

**Time**: 30-40 hours

---

**📖 Chi tiết roadmap**: [DEVELOPMENT_ROADMAP.md](./docs/DEVELOPMENT_ROADMAP.md)

**📊 Track Progress**: [PROJECT_TRACKER.md](./docs/PROJECT_TRACKER.md)

---

## 📖 Documentation

### 📚 Documentation Hub

Tất cả documentation được tổ chức trong thư mục [`docs/`](./docs/)

| Document | Description | Link |
|----------|-------------|------|
| 📘 **Documentation Overview** | Tổng quan tất cả docs | [README.md](./docs/README.md) |
| 📋 **Use Case: Đặt đồ ăn** | Use case chi tiết UC1 | [UC1_DAT_DO_AN.md](./docs/UC1_DAT_DO_AN.md) |
| 📄 **Project Requirements** | Yêu cầu dự án đầy đủ (VI) | [PROJECT_REQUIREMENTS_vi.md](./docs/PROJECT_REQUIREMENTS_vi.md) |
| 🗺️ **Development Roadmap** | 6-week plan, 4 phases | [DEVELOPMENT_ROADMAP.md](./docs/DEVELOPMENT_ROADMAP.md) |
| 🐛 **GitHub Issues** | 40 issue templates | [GITHUB_ISSUES.md](./docs/GITHUB_ISSUES.md) |
| 📊 **Project Tracker** | Progress tracking sheet | [PROJECT_TRACKER.md](./docs/PROJECT_TRACKER.md) |
| 🗄️ **Database Schema** | 16 collections chi tiết | [database/DATABASE_SCHEMA.md](./docs/database/DATABASE_SCHEMA.md) |
| 🛠️ **Appwrite Setup Guide** | Step-by-step backend setup | [database/APPWRITE_SETUP_GUIDE.md](./docs/database/APPWRITE_SETUP_GUIDE.md) |

### 🎨 Diagrams (Draw.io)

| Diagram | Type | File |
|---------|------|------|
| 🔄 **Activity Diagram - UC1** | Activity | [UC1-activity-diagram.drawio](./drawio/UC1-activity-diagram.drawio) |
| 📊 **Sequence Diagram - UC1** | Sequence | [UC1-sequence-diagram.drawio](./drawio/UC1-sequence-diagram.drawio) |
| 🗄️ **Complete ERD v2** | Database | [foodfast-complete-erd-v2.drawio](./drawio/foodfast-complete-erd-v2.drawio) |
| 🏗️ **Component Diagram** | Architecture | [foodfast-component-diagram-layered.drawio](./drawio/foodfast-component-diagram-layered.drawio) |
| 🌐 **Deployment Diagram** | Infrastructure | [foodfast-deployment-diagram-sgu.drawio](./drawio/foodfast-deployment-diagram-sgu.drawio) |

---

## 🤝 Contributing

Chúng tôi rất hoan nghênh các contributions! 

### 📋 Contribution Guidelines

1. **Fork** repository này
2. **Clone** fork của bạn về local
3. **Create branch** theo convention: `feature/issue-number-description`
4. **Code** và test kỹ
5. **Commit** với message rõ ràng
6. **Push** lên fork của bạn
7. **Create Pull Request** với mô tả chi tiết

### 🎯 Picking an Issue

1. Xem danh sách issues tại: [GITHUB_ISSUES.md](./docs/GITHUB_ISSUES.md)
2. Chọn issue chưa có người làm (check labels)
3. Comment vào issue để claim
4. Start coding!

### ✅ Code Standards

- **TypeScript**: Sử dụng strict mode
- **Naming**: camelCase cho variables, PascalCase cho components
- **Comments**: Viết comments cho logic phức tạp
- **Formatting**: Prettier + ESLint
- **Testing**: Viết tests cho features mới

### 📝 Commit Message Convention

```
feat: Add restaurant approval workflow
fix: Fix order status update bug
docs: Update database schema documentation
style: Format code with Prettier
refactor: Refactor order service
test: Add tests for payment flow
chore: Update dependencies
```

---

## 👥 Team

### 🎓 Development Team

<table>
<tr>
<td align="center">
<a href="https://github.com/phatle224">
<img src="https://github.com/phatle224.png" width="100px;" alt="Lê Hồng Phát"/><br/>
<sub><b>Lê Hồng Phát</b></sub>
</a><br/>
<sub>Team Lead • Full-stack Developer</sub><br/>
📱 Mobile • 🎛️ Admin • 📚 Docs
</td>
<td align="center">
<a href="https://github.com/nguyen-hong-tham">
<img src="https://github.com/nguyen-hong-tham.png" width="100px;" alt="Nguyễn Hồng Thắm"/><br/>
<sub><b>Nguyễn Hồng Thắm</b></sub>
</a><br/>
<sub>Frontend Developer</sub><br/>
🏪 Restaurant Portal • 🎨 UI/UX
</td>
</tr>
</table>

### 👨‍🏫 Academic Supervision

- **Giảng viên hướng dẫn**: TS. Nguyễn Quốc Huy
- **Môn học**: Công Nghệ Phần Mềm
- **Học kỳ**: Học kỳ 1 / Năm học 2025-2026
- **Trường**: Đại học Sài Gòn (SGU)

---

## 📞 Contact & Support

### 📧 Get in Touch

- **Email**: [hongphatle224@gmail.com](mailto:hongphatle224@gmail.com)
- **GitHub**: [@phatle224](https://github.com/phatle224)
- **Issues**: [GitHub Issues](https://github.com/phatle224/sgu_cnpm_foodfast/issues)

### 🐛 Report a Bug

Found a bug? [Create an issue](https://github.com/phatle224/sgu_cnpm_foodfast/issues/new) với:

1. **Title**: Mô tả ngắn gọn bug
2. **Description**: Mô tả chi tiết
3. **Steps to Reproduce**: Các bước tái hiện bug
4. **Expected**: Kết quả mong đợi
5. **Actual**: Kết quả thực tế
6. **Screenshots**: Ảnh chụp màn hình (nếu có)

### 💡 Request a Feature

Có ý tưởng feature mới? [Create a feature request](https://github.com/phatle224/sgu_cnpm_foodfast/issues/new)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Chúng tôi xin cảm ơn các công nghệ và công cụ đã hỗ trợ dự án này:

<div align="center">

[![React Native](https://img.shields.io/badge/React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Appwrite](https://img.shields.io/badge/Appwrite-F02E65?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)

</div>

- **[Expo](https://expo.dev/)** - Mobile development platform
- **[Appwrite](https://appwrite.io/)** - Backend as a Service
- **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework
- **[Zustand](https://zustand-demo.pmnd.rs/)** - State management
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icon library
- **[Recharts](https://recharts.org/)** - Charting library

---

## 🔄 Changelog

### Version 1.0.0 (November 2025) - Current

#### ✅ Completed Features

**Mobile App**:
- ✅ Authentication (Sign up, Sign in, Profile)
- ✅ Restaurant browsing với categories
- ✅ Menu detail với customizations
- ✅ Shopping cart với persistent storage
- ✅ Order placement & history
- ✅ Profile management với avatar upload

**Admin Dashboard**:
- ✅ Admin authentication
- ✅ Dashboard overview với stats
- ✅ Order management (view, filter, update)
- ✅ Customer list
- ✅ Product CRUD operations

**Backend**:
- ✅ Appwrite setup với 6 collections
- ✅ Authentication & role-based access
- ✅ Image storage
- ✅ Real-time subscriptions

#### 🚧 In Progress

- 🚧 Restaurant Portal (Phase 1)
- 🚧 Database expansion (10 new collections)
- 🚧 Payment integration (VNPay)

#### 🎯 Upcoming

- 🔜 Drone delivery system
- 🔜 Real-time order tracking
- 🔜 Push notifications
- 🔜 Reviews & ratings

---

## 🎯 Roadmap v2.0

### Planned Features

- [ ] **Multi-language Support**: English, Vietnamese
- [ ] **Dark Mode**: Theme switcher
- [ ] **Voice Ordering**: AI voice assistant
- [ ] **Loyalty Program**: Points & rewards
- [ ] **Social Sharing**: Share orders, invite friends
- [ ] **Chat Support**: Customer service chat
- [ ] **Advanced Analytics**: ML-powered insights
- [ ] **Driver App**: For manual delivery backup
- [ ] **QR Code Ordering**: Dine-in ordering
- [ ] **Kitchen Display System**: Restaurant kitchen screen

---

<div align="center">

### 🚀 Made with ❤️ by FoodFast Team

**Star ⭐ this repo if you find it helpful!**

[![GitHub Stars](https://img.shields.io/github/stars/phatle224/sgu_cnpm_foodfast?style=social)](https://github.com/phatle224/sgu_cnpm_foodfast/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/phatle224/sgu_cnpm_foodfast?style=social)](https://github.com/phatle224/sgu_cnpm_foodfast/network/members)

[⬆ Back to Top](#-foodfast---drone-delivery-food-ordering-system)

---

*© 2025 FoodFast Team - Sai Gon University. All Rights Reserved.*

</div>
