# 🎯 ADMIN DASHBOARD IMPLEMENTATION PLAN

## 📋 PHÂN TÍCH PROJECT HIỆN TẠI

### ✅ Collections đã có:
1. **user** - Quản lý người dùng
2. **orders** - Quản lý đơn hàng  
3. **menu** - Quản lý sản phẩm
4. **categories** - Danh mục
5. **customizations** - Tùy chỉnh món ăn
6. **menu_customizations** - Junction table

### ❌ Cần bổ sung:
1. **admins** collection hoặc thêm field `role` vào collection `user`
2. Admin Dashboard UI (Web only)
3. Admin routes (`/admin`)
4. Admin authentication & authorization

---

## 🎨 KIẾN TRÚC ADMIN DASHBOARD

### Option 1: Thêm `role` vào User collection (KHUYẾN NGHỊ)
**Ưu điểm**:
- ✅ Đơn giản, dùng chung authentication
- ✅ Không cần tạo collection mới
- ✅ Dễ mở rộng (admin, staff, customer)

**Implementation**:
```
User Collection:
- accountId: string
- name: string
- email: string
- avatar: string
- phone: string
- role: enum ['customer', 'admin', 'staff'] ← THÊM MỚI
- ...
```

### Option 2: Tạo Admin collection riêng
**Ưu điểm**:
- ✅ Tách biệt hoàn toàn
- ✅ Có thể có permissions riêng

**Nhược điểm**:
- ⚠️ Phức tạp hơn
- ⚠️ Cần 2 authentication flows

---

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Database Setup (10 phút)
1. Thêm field `role` vào User collection
2. Update User interface trong TypeScript
3. Set default role = 'customer' cho users hiện có

### Phase 2: Admin Routes (30 phút)
1. Tạo folder `app/admin/`
2. Tạo layout riêng cho admin
3. Protected routes (chỉ admin mới vào được)

### Phase 3: Admin Dashboard UI (2-3 giờ)
1. Dashboard Overview (stats)
2. Orders Management
3. Customers Management  
4. Products Management
5. Delivery Tracking

### Phase 4: Admin Functions (1-2 giờ)
1. Update order status
2. CRUD products
3. View customer details
4. Reports & Analytics

---

## 📂 CẤU TRÚC THƯ MỤC

```
app/
├── (auth)/          # Existing: Sign in/up
├── (tabs)/          # Existing: Customer app
├── admin/           # NEW: Admin routes
│   ├── _layout.tsx  # Admin layout with sidebar
│   ├── index.tsx    # Dashboard overview
│   ├── orders/      # Orders management
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── customers/   # Customers management
│   │   ├── index.tsx
│   │   └── [id].tsx
│   ├── products/    # Products management
│   │   ├── index.tsx
│   │   ├── create.tsx
│   │   └── [id].tsx
│   └── settings/    # Admin settings
│       └── index.tsx
```

---

## 🔐 AUTHENTICATION FLOW

```
User Login
    ↓
Check user.role
    ↓
if (role === 'admin')
    ↓
    ✅ Allow access to /admin
    ✅ Show admin navigation
    ↓
else (role === 'customer')
    ↓
    ❌ Redirect to customer app
    ❌ Hide admin routes
```

---

## 💻 TECH STACK

- **Frontend**: React Native Web (đã có sẵn)
- **Backend**: Appwrite (đã có sẵn)
- **UI Components**: Reuse existing components + new admin-specific ones
- **Styling**: NativeWind (Tailwind CSS)
- **Data Fetching**: Appwrite SDK
- **State Management**: Zustand (có thể thêm admin store)

---

## 🎯 FEATURES CHECKLIST

### Dashboard Overview:
- [ ] Total Orders (today, week, month)
- [ ] Total Revenue
- [ ] Total Customers
- [ ] Active Orders
- [ ] Charts (orders by status, revenue by day)

### Orders Management:
- [ ] List all orders (filterable)
- [ ] View order details
- [ ] Update order status
- [ ] Search orders by ID/customer
- [ ] Export orders (CSV/PDF)

### Customers Management:
- [ ] List all customers
- [ ] View customer details
- [ ] View customer order history
- [ ] Search customers
- [ ] Customer analytics

### Products Management:
- [ ] List all products
- [ ] Create new product
- [ ] Edit product
- [ ] Delete product
- [ ] Manage categories
- [ ] Manage customizations

### Delivery Tracking:
- [ ] View active deliveries
- [ ] Update delivery status
- [ ] Assign delivery personnel
- [ ] Delivery analytics

---

## 🌐 URL STRUCTURE

- `http://localhost:8081/` - Customer app (mobile view)
- `http://localhost:8081/admin` - Admin Dashboard (web only)
- `http://localhost:8081/admin/orders` - Orders page
- `http://localhost:8081/admin/customers` - Customers page
- `http://localhost:8081/admin/products` - Products page

---

## 📊 DATABASE CHANGES

### 1. Update User Collection
**Add new attribute**:
```
Attribute ID: role
Type: Enum
Values: ['customer', 'admin', 'staff']
Required: Yes
Default: 'customer'
```

### 2. Create Admin-specific Indexes
```
Index: users_by_role
Attributes: role
Type: key
```

### 3. Update Permissions
```
Admin Collection Permissions:
- Read: Admin only
- Create: Admin only
- Update: Admin only
- Delete: Admin only
```

---

## 🚀 DEPLOYMENT

### Local Development:
```bash
# Start Expo with web
npm run web
# OR
npx expo start --web

# Access:
# Customer app: http://localhost:8081/
# Admin: http://localhost:8081/admin
```

### Production:
```bash
# Build for web
npx expo export --platform web

# Deploy to:
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting
```

---

## 📝 NEXT STEPS

1. **Setup Database** (10 min)
   - Add `role` field to User collection
   - Update TypeScript types

2. **Create Admin Routes** (30 min)
   - Create `app/admin/` folder
   - Setup protected routes
   - Create admin layout

3. **Build Dashboard UI** (2-3 hours)
   - Dashboard overview
   - Orders management
   - Customers list
   - Products CRUD

4. **Test & Deploy** (1 hour)
   - Test admin authentication
   - Test CRUD operations
   - Deploy to production

**Total Time**: ~4-5 hours

---

## 🎓 LEARNING RESOURCES

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Appwrite Permissions](https://appwrite.io/docs/permissions)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [NativeWind Docs](https://www.nativewind.dev/)
