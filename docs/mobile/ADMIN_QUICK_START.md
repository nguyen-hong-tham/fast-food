# Admin Dashboard - Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. Add Role to Database (2 min)
```
Appwrite Console → Database → user collection → Attributes
→ Create Attribute → Enum
Key: role
Values: customer, admin, staff
Default: customer
Required: Yes
```

### 2. Create First Admin (1 min)
```
Appwrite Console → Database → user collection → Documents
→ Find your user → Update Document
→ Set role = "admin"
```

### 3. Set Permissions (2 min)
```
Each collection → Settings → Permissions
→ Add role "admin" with full permissions
```

### 4. Test Access
```bash
npm run web
# Navigate to http://localhost:8081/admin
```

---

## 📍 Admin Routes

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard overview |
| `/admin/orders` | All orders with status management |
| `/admin/customers` | All registered users |
| `/admin/products` | Menu items CRUD |

---

## 🔑 Key Files

```
app/admin/
├── _layout.tsx      # Admin layout with sidebar
├── index.tsx        # Dashboard overview
├── orders.tsx       # Orders management
├── customers.tsx    # Customers list
└── products.tsx     # Products CRUD

lib/appwrite.ts      # Added admin functions:
├── getAllOrders()
├── updateOrderStatus()
├── getAllUsers()
├── updateMenuItem()
├── deleteMenuItem()
└── createMenuItem()

type.d.ts            # Added UserRole type
```

---

## 🛠️ Admin API Functions

### Orders
```typescript
// Get all orders
const orders = await getAllOrders(limit);

// Update order status
await updateOrderStatus(orderId, 'preparing');
```

### Users
```typescript
// Get all users
const users = await getAllUsers(limit);
```

### Products
```typescript
// Get all products
const products = await getMenu({});

// Update product
await updateMenuItem(menuId, { price: 12.99 });

// Delete product
await deleteMenuItem(menuId);

// Create product
await createMenuItem({
  name: 'New Burger',
  description: 'Delicious!',
  price: 9.99,
  image_url: 'https://...'
});
```

---

## 🔐 Access Control

### Check if user is admin
```typescript
import useAuthStore from '@/store/auth.store';

const { user } = useAuthStore();

if (user?.role === 'admin') {
  // Show admin features
}
```

### Protect admin routes
```typescript
// In app/admin/_layout.tsx
if (!user || user.role !== 'admin') {
  return <Redirect href="/(tabs)" />;
}
```

---

## 🎨 Add Admin Link to Profile

```typescript
// In app/(tabs)/profile.tsx
import useAuthStore from '@/store/auth.store';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { user } = useAuthStore();
  const router = useRouter();

  return (
    <View>
      {/* Existing content */}
      
      {user?.role === 'admin' && (
        <Pressable
          onPress={() => router.push('/admin')}
          className="bg-purple-500 px-6 py-4 rounded-xl m-4"
        >
          <Text className="text-white text-center font-semibold">
            🔧 Admin Panel
          </Text>
        </Pressable>
      )}
    </View>
  );
}
```

---

## 📊 Update Dashboard Stats

```typescript
// In app/admin/index.tsx
import { getAllOrders, getAllUsers, getMenu } from '@/lib/appwrite';

const loadDashboardStats = async () => {
  const [orders, users, products] = await Promise.all([
    getAllOrders(),
    getAllUsers(),
    getMenu({})
  ]);

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  
  setStats([
    { title: 'Orders', value: orders.length, ... },
    { title: 'Customers', value: users.length, ... },
    { title: 'Products', value: products.length, ... },
    { title: 'Revenue', value: `$${revenue.toFixed(2)}`, ... },
  ]);
};
```

---

## 🔄 Load Real Data in Admin Pages

### Orders
```typescript
// In app/admin/orders.tsx
import { getAllOrders, updateOrderStatus } from '@/lib/appwrite';

const loadOrders = async () => {
  const allOrders = await getAllOrders(200);
  setOrders(allOrders);
};

const handleStatusChange = async (id: string, status: string) => {
  await updateOrderStatus(id, status);
  loadOrders(); // Refresh
};
```

### Customers
```typescript
// In app/admin/customers.tsx
import { getAllUsers } from '@/lib/appwrite';

const loadCustomers = async () => {
  const allUsers = await getAllUsers(200);
  setCustomers(allUsers.filter(u => u.role !== 'admin'));
};
```

### Products
```typescript
// In app/admin/products.tsx
import { getMenu, deleteMenuItem } from '@/lib/appwrite';

const loadProducts = async () => {
  const products = await getMenu({});
  setProducts(products);
};

const handleDelete = async (id: string) => {
  await deleteMenuItem(id);
  loadProducts(); // Refresh
};
```

---

## 🚨 Common Issues

### "Unauthorized" Error
✅ Check user has `role: 'admin'` in database
✅ Verify Appwrite permissions include admin role
✅ Ensure user is signed in

### Orders Don't Load
✅ Check admin role has Read permission on orders collection
✅ Verify API function is called correctly
✅ Check browser console for errors

### Can't Update Status
✅ Check admin role has Update permission on orders collection
✅ Verify status value is valid enum value
✅ Check network tab for 401/403 errors

---

## 📝 Next Steps

1. ✅ **Test Basic Access**: Navigate to `/admin` after signing in as admin
2. ✅ **Load Real Data**: Connect API functions to UI (see code above)
3. ⏳ **Add Product Form**: Create new product creation UI
4. ⏳ **Add Filters**: Date range, status filters
5. ⏳ **Add Charts**: Revenue/order trends
6. ⏳ **Add Export**: CSV/PDF reports
7. ⏳ **Add Realtime**: Live order updates

---

## 🔗 Full Documentation

For detailed setup instructions, see:
- [ADMIN_DASHBOARD_SETUP.md](./ADMIN_DASHBOARD_SETUP.md) - Complete setup guide
- [ADMIN_DASHBOARD_PLAN.md](./ADMIN_DASHBOARD_PLAN.md) - Architecture & planning
- [APPWRITE_PERMISSIONS.md](./APPWRITE_PERMISSIONS.md) - Permissions guide

---

**TIP**: The admin dashboard is web-optimized. For mobile access, consider creating a simplified mobile admin UI or using responsive design patterns.
