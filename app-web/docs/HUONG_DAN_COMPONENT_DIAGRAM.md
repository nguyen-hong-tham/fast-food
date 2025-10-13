# Hướng Dẫn Vẽ Component Diagram - SGU Fastfood Deli

## Mục Lục
1. [Giới Thiệu](#giới-thiệu)
2. [Cấu Trúc Component](#cấu-trúc-component)
3. [Các Thành Phần Chính](#các-thành-phần-chính)
4. [Mối Quan Hệ](#mối-quan-hệ)
5. [Cách Vẽ Trên Draw.io](#cách-vẽ-trên-drawio)
6. [Ký Hiệu UML](#ký-hiệu-uml)

---

## Giới Thiệu

Component Diagram của dự án SGU Fastfood Deli mô tả kiến trúc 3 lớp:
- **Presentation Layer** (Lớp giao diện)
- **Business Logic Layer** (Lớp xử lý nghiệp vụ)
- **Data Access Layer** (Lớp truy xuất dữ liệu)

---

## Cấu Trúc Component

### 1️⃣ PRESENTATION LAYER (Lớp Giao Diện)

Chứa các màn hình và trang của ứng dụng:

```
┌─────────────────────────────────────────────────────────────┐
│          <<subsystem>> Presentation Layer                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │   Home   │  │  Search  │  │   Cart   │   │
│  │  Sign-in │  │  Menu    │  │  Filter  │  │  Order   │   │
│  │  Sign-up │  │  Display │  │          │  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐                                               │
│  │ Profile  │                                               │
│  │ Account  │                                               │
│  └──────────┘                                               │
└─────────────────────────────────────────────────────────────┘
```

**Các Component:**
- **Authentication** (`app/(auth)/sign-in.tsx`, `sign-up.tsx`)
  - Đăng nhập/Đăng ký người dùng
  - Validation form
  
- **Home** (`app/(tabs)/index.tsx`)
  - Hiển thị menu món ăn
  - Banner khuyến mãi (Summer Combo, Burger Bash, Pizza Party)
  
- **Search** (`app/(tabs)/search.tsx`)
  - Tìm kiếm món ăn
  - Lọc theo danh mục
  
- **Shopping Cart** (`app/(tabs)/cart.tsx`)
  - Quản lý giỏ hàng
  - Tùy chỉnh món ăn
  - Tính tổng tiền
  
- **User Profile** (`app/(tabs)/profile.tsx`)
  - Thông tin tài khoản
  - Lịch sử đơn hàng
  - Đăng xuất

---

### 2️⃣ BUSINESS LOGIC LAYER (Lớp Xử Lý Nghiệp Vụ)

Chứa các component UI tái sử dụng, state management và điều hướng:

```
┌─────────────────────────────────────────────────────────────┐
│       <<subsystem>> Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │    UI    │  │   Auth   │  │   Cart   │  │Navigation│   │
│  │Components│  │  Store   │  │  Store   │  │  Router  │   │
│  │          │  │ (Zustand)│  │ (Zustand)│  │   Expo   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│  ┌──────────┐                                               │
│  │   Data   │                                               │
│  │ Services │                                               │
│  │          │                                               │
│  └──────────┘                                               │
└─────────────────────────────────────────────────────────────┘
```

**Các Component:**

- **UI Components** (`components/`)
  - `CustomButton.tsx` - Nút bấm tùy chỉnh
  - `CustomInput.tsx` - Ô nhập liệu
  - `MenuCard.tsx` - Card hiển thị món ăn
  - `CartItem.tsx` - Item trong giỏ hàng
  - `CartButton.tsx` - Nút giỏ hàng
  - `SearchBar.tsx` - Thanh tìm kiếm
  - `Filter.tsx` - Bộ lọc
  - `CustomHeader.tsx` - Header tùy chỉnh

- **Auth Store** (`store/auth.store.ts`)
  - Quản lý trạng thái đăng nhập
  - Lưu thông tin user
  - Xác thực người dùng
  - **State:** `isAuthenticated`, `user`, `isLoading`
  - **Actions:** `setUser()`, `fetchAuthenticatedUser()`, `logout()`

- **Cart Store** (`store/cart.store.ts`)
  - Quản lý giỏ hàng
  - Thêm/xóa/cập nhật món
  - Tính tổng tiền
  - Quản lý customizations
  - **State:** `items[]`
  - **Actions:** `addItem()`, `removeItem()`, `increaseQuantity()`, `decreaseQuantity()`, `clearCart()`

- **Navigation** (`app/_layout.tsx`, `app/(tabs)/_layout.tsx`)
  - Expo Router
  - Tab Navigation
  - Stack Navigation

- **Data Services** (`lib/data.ts`)
  - Menu data
  - Categories data
  - Offers data
  - Customizations data

---

### 3️⃣ DATA ACCESS LAYER (Lớp Truy Xuất Dữ Liệu)

Xử lý kết nối với backend:

```
┌─────────────────────────────────────────────────────────────┐
│          <<subsystem>> Data Access Layer                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐       ┌──────────────────────┐    │
│  │   Appwrite SDK      │ ----> │  Appwrite Backend    │    │
│  │   - Account API     │       │  - Database          │    │
│  │   - Database API    │       │  - Authentication    │    │
│  │   - Storage API     │       │  - Storage           │    │
│  └─────────────────────┘       └──────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Các Component:**

- **Appwrite SDK** (`lib/appwrite.ts`)
  - `Account` - Quản lý tài khoản
  - `Databases` - Truy vấn database
  - `Storage` - Lưu trữ file
  - `Avatars` - Tạo avatar
  - **Functions:**
    - `createUser()` - Tạo tài khoản mới
    - `signIn()` - Đăng nhập
    - `signOut()` - Đăng xuất
    - `getCurrentUser()` - Lấy user hiện tại
    - `getMenu()` - Lấy menu
    - `getCategories()` - Lấy danh mục
    - `getCustomizations()` - Lấy tùy chỉnh

- **Appwrite Backend** (External System)
  - Cloud service
  - Database: Collections (users, menu, categories, customizations)
  - Authentication service
  - File storage

---

## Mối Quan Hệ Giữa Các Component

### Ma Trận Dependencies

| Component | Depends On | Type |
|-----------|-----------|------|
| Authentication | Auth Store | uses |
| Authentication | UI Components | uses |
| Home | UI Components | uses |
| Home | Data Services | uses |
| Search | Data Services | uses |
| Search | UI Components | uses |
| Cart | Cart Store | uses |
| Cart | UI Components | uses |
| Profile | Auth Store | uses |
| Profile | UI Components | uses |
| Auth Store | Appwrite SDK | uses |
| Cart Store | - | independent |
| Data Services | Appwrite SDK | uses |
| Appwrite SDK | Appwrite Backend | API calls |

### 🔄 Luồng Dữ Liệu

#### 1. Đăng Nhập:
```
User Input (sign-in.tsx) 
  → Auth Store (auth.store.ts)
  → Appwrite SDK (appwrite.ts)
  → Appwrite Backend
  ← Response
  ← Update State
  ← Redirect to Home
```

#### 2. Xem Menu:
```
Home Screen (index.tsx)
  → Data Services (data.ts)
  → Render MenuCard Components
  → Display to User
```

#### 3. Thêm Vào Giỏ Hàng:
```
Menu Card Click
  → Cart Store.addItem()
  → Update items[]
  → CartButton updates badge
```

#### 4. Checkout:
```
Cart Screen
  → Review items
  → Calculate total
  → Place order
  → Clear cart
```

---

## Cách Vẽ Trên Draw.io

### Bước 1: Mở File
1. Mở **Draw.io** (https://app.diagrams.net/)
2. Chọn **Open Existing Diagram**
3. Mở file: `Fastfood-Deli_Component-Diagram.drawio`

### Bước 2: Hiểu Cấu Trúc

Diagram được chia thành 3 phần chính:
- **Màu xanh dương** (🔵): Presentation Layer
- **Màu xanh lá** (🟢): Business Logic Layer  
- **Màu đỏ** (🔴): Data Access Layer

### Bước 3: Chỉnh Sửa Components

#### Thêm Component Mới:
1. Kéo hình **Rectangle** từ thanh bên trái
2. Double-click để đổi tên
3. Format text:
   ```
   <<component>>
   [Tên Component]
   (Mô tả ngắn)
   ```
4. Đổi màu:
   - Right-click → **Style** → **Fill Color**

#### Các Màu Chuẩn:
- **Presentation Components**: `#FFF2CC` (Vàng nhạt)
- **Business Logic Components**: `#E1D5E7` (Tím nhạt)
- **Data Layer Components**: `#FFE6CC` (Cam nhạt)
- **External Systems**: `#F5F5F5` (Xám)

### Bước 4: Vẽ Mối Quan Hệ

#### Dependency (Uses):
1. Click vào component nguồn
2. Kéo mũi tên đến component đích
3. Right-click mũi tên → **Style**
4. Chọn: **Dashed** (đường đứt nét)
5. **Arrow**: Open arrow (mũi tên mở)
6. Add label: Double-click mũi tên → gõ `<<uses>>`

#### API Communication:
1. Tương tự như trên
2. Nhưng chọn: **Solid line** (đường liền nét)
3. **Arrow**: Block arrow
4. Label: `API calls`

### Bước 5: Nhóm Components Theo Layer

1. Vẽ hình chữ nhật lớn bao quanh các components
2. Style: **Folder shape**
3. Ghi label: `<<subsystem>> [Tên Layer]`
4. Send to back: Right-click → **To Back**

---

## Ký Hiệu UML Component Diagram

### Stereotypes (Nhãn đặc biệt):

| Ký Hiệu | Ý Nghĩa | Ví Dụ |
|---------|---------|-------|
| `<<component>>` | Thành phần phần mềm | UI Components |
| `<<subsystem>>` | Hệ thống con | Business Logic Layer |
| `<<external system>>` | Hệ thống bên ngoài | Appwrite Backend |
| `<<interface>>` | Giao diện | API Interface |
| `<<service>>` | Dịch vụ | Data Services |
| `<<store>>` | State management | Auth Store |

### Mối Quan Hệ:

| Ký Hiệu | Tên | Mô Tả | Cách Vẽ |
|---------|-----|-------|---------|
| `---→` | Dependency (uses) | A phụ thuộc vào B | Đường đứt nét, mũi tên mở |
| `━━→` | Association | A liên kết với B | Đường liền nét |
| `◆━━` | Composition | B là phần của A | Hình thoi đen |
| `◇━━` | Aggregation | B thuộc A nhưng độc lập | Hình thoi trắng |
| `◁━━` | Realization | A implements B | Đường đứt nét, mũi tên tam giác |

### Các Loại Components:

1. **Active Component** (Thành phần chủ động)
   - Có luồng điều khiển riêng
   - Ví dụ: Background services, Timers
   
2. **Passive Component** (Thành phần bị động)
   - Chỉ phản hồi khi được gọi
   - Ví dụ: UI Components, Stores

---

## Các Component Quan Trọng Cần Nhấn Mạnh

### 1. **Auth Store** - Trung tâm xác thực
- Quản lý toàn bộ authentication flow
- Được sử dụng bởi nhiều components
- Kết nối trực tiếp với Appwrite SDK

### 2. **Cart Store** - Trung tâm business logic
- Logic phức tạp: customizations, quantity
- Independent component (không phụ thuộc backend)
- Sử dụng Zustand để persist state

### 3. **Appwrite SDK** - Bridge layer
- Trung gian giữa app và backend
- Cung cấp abstraction cho API calls
- Handle authentication, data fetching

### 4. **UI Components** - Reusable elements
- Tách biệt presentation logic
- Tái sử dụng ở nhiều screens
- Follow atomic design pattern

---

