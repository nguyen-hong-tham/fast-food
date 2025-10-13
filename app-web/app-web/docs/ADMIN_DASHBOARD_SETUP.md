# Admin Dashboard Setup Guide

## 🎯 Overview

This guide will help you set up the admin dashboard for the Fastfood Deli project. The admin dashboard allows authorized users to manage:

- **Orders**: View all orders, update delivery status
- **Customers**: View customer accounts and activity
- **Products**: CRUD operations on menu items
- **Dashboard**: Overview stats and quick actions

---

## 📋 Prerequisites

Before setting up the admin dashboard, ensure you have:

1. ✅ Appwrite Cloud account with database configured
2. ✅ All 6 collections created (user, orders, menu, categories, customizations, menu_customizations)
3. ✅ Basic app functionality working (authentication, menu browsing, orders)

---

## 🗄️ Step 1: Add Role Field to User Collection

### Via Appwrite Console (Recommended)

1. **Open Appwrite Console**:
   - Go to https://cloud.appwrite.io/console
   - Navigate to your project

2. **Select Database**:
   - Click on "Databases" in the sidebar
   - Click on your database (ID: `68da5e73002cb68e70af`)

3. **Open User Collection**:
   - Click on the `user` collection
   - Go to "Attributes" tab

4. **Add Role Attribute**:
   - Click "Create Attribute"
   - Select "Enum"
   - Configure as follows:
     ```
     Key: role
     Elements: customer, admin, staff
     Required: Yes
     Default: customer
     Array: No
     ```
   - Click "Create"

5. **Wait for Index**:
   - Appwrite will rebuild the collection
   - This may take a few minutes

### Update Existing Users

After adding the role field, you need to promote at least one user to admin:

1. **Via Appwrite Console**:
   - Go to `user` collection → "Documents" tab
   - Find your user account
   - Click "Update Document"
   - Set `role` to `admin`
   - Click "Update"

2. **Via Code** (after first admin is created):
   ```typescript
   // In lib/appwrite.ts, add this function:
   export const updateUserRole = async (userId: string, role: 'customer' | 'admin' | 'staff') => {
     try {
       const updatedUser = await databases.updateDocument(
         appwriteConfig.databaseId,
         appwriteConfig.userCollectionId,
         userId,
         { role }
       );
       return updatedUser;
     } catch (e) {
       throw new Error(e as string);
     }
   }
   ```

---

## 🔐 Step 2: Configure Permissions

### Collection Permissions

Ensure proper permissions are set for admin operations:

#### User Collection
- **Read**: Users (to read own profile) + Admin role
- **Update**: Users (own documents) + Admin role
- **Delete**: Admin role only

#### Orders Collection
- **Read**: Users (own documents) + Admin role
- **Update**: Admin role only (for status changes)
- **Delete**: Admin role only

#### Menu Collection
- **Read**: Any (public)
- **Create**: Admin role only
- **Update**: Admin role only
- **Delete**: Admin role only

#### Categories & Customizations
- **Read**: Any (public)
- **Create/Update/Delete**: Admin role only

### Setting Permissions in Appwrite Console

1. Go to each collection
2. Click "Settings" tab
3. Scroll to "Permissions"
4. Add roles:
   - Click "Add Role"
   - Select "Label" → Enter `admin`
   - Check appropriate permissions (Read, Create, Update, Delete)
   - Click "Add"

---

## 🚀 Step 3: Test Admin Access

### Method 1: Via Web Browser

1. **Start the development server**:
   ```bash
   npm run web
   ```

2. **Sign in with your admin account**:
   - Go to http://localhost:8081
   - Sign in with the account you promoted to admin

3. **Navigate to admin panel**:
   - Manually go to: http://localhost:8081/admin
   - You should see the admin dashboard

### Method 2: Add Admin Link to Profile

Add a link to the profile screen for easy access:

```typescript
// In app/(tabs)/profile.tsx
import { useRouter } from 'expo-router';
import useAuthStore from '@/store/auth.store';

export default function Profile() {
  const router = useRouter();
  const { user } = useAuthStore();

  return (
    <View>
      {/* Existing profile content */}
      
      {/* Admin Panel Link */}
      {user?.role === 'admin' && (
        <Pressable
          onPress={() => router.push('/admin')}
          className="bg-purple-500 px-6 py-4 rounded-xl mx-4 mt-4"
        >
          <Text className="text-white text-center font-semibold text-lg">
            🔧 Admin Panel
          </Text>
        </Pressable>
      )}
    </View>
  );
}
```

---

## 🧪 Step 4: Verify Admin Functions

### Test Orders Management

1. **Create Test Orders**:
   - Use the regular app to create 2-3 test orders
   - Sign in as a regular customer
   - Add items to cart and checkout

2. **Access Admin Orders**:
   - Sign in as admin
   - Go to `/admin/orders`
   - Verify you can see all orders (not just your own)

3. **Update Order Status**:
   - Try changing an order status from "pending" to "preparing"
   - Check if the status updates successfully

### Test Customers Management

1. Go to `/admin/customers`
2. Verify you can see all registered users
3. Check user details (name, email, phone, role)

### Test Products Management

1. Go to `/admin/products`
2. Verify you can see all menu items
3. Test Edit/Delete buttons (note: full CRUD UI needs implementation)

---

## 🎨 Step 5: Customize Admin Dashboard

### Update Stats with Real Data

Modify `app/admin/index.tsx` to fetch real statistics:

```typescript
useEffect(() => {
  loadDashboardStats();
}, []);

const loadDashboardStats = async () => {
  try {
    const [orders, customers, products] = await Promise.all([
      getAllOrders(),
      getAllUsers(),
      getMenu({})
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const activeCustomers = customers.filter(c => c.role !== 'admin').length;

    setStats([
      {
        title: 'Total Orders',
        value: orders.length,
        icon: '📦',
        color: 'bg-blue-500',
        route: '/admin/orders',
      },
      {
        title: 'Total Customers',
        value: activeCustomers,
        icon: '👥',
        color: 'bg-green-500',
        route: '/admin/customers',
      },
      {
        title: 'Total Products',
        value: products.length,
        icon: '🍔',
        color: 'bg-orange-500',
        route: '/admin/products',
      },
      {
        title: 'Revenue',
        value: `$${totalRevenue.toFixed(2)}`,
        icon: '💰',
        color: 'bg-purple-500',
      },
    ]);
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};
```

### Connect Orders to Admin API

Update `app/admin/orders.tsx`:

```typescript
import { getAllOrders, updateOrderStatus } from '@/lib/appwrite';

const loadOrders = async () => {
  try {
    setLoading(true);
    const allOrders = await getAllOrders(200); // Get up to 200 orders
    setOrders(allOrders as Order[]);
  } catch (error) {
    console.error('Error loading orders:', error);
  } finally {
    setLoading(false);
  }
};

const updateStatus = async (orderId: string, newStatus: string) => {
  try {
    await updateOrderStatus(orderId, newStatus);
    
    setOrders(orders.map(order => 
      order.$id === orderId 
        ? { ...order, status: newStatus as any }
        : order
    ));
  } catch (error) {
    console.error('Error updating order status:', error);
    alert('Failed to update order status');
  }
};
```

### Connect Customers to Admin API

Update `app/admin/customers.tsx`:

```typescript
import { getAllUsers } from '@/lib/appwrite';

const loadCustomers = async () => {
  try {
    setLoading(true);
    const allUsers = await getAllUsers(200);
    // Filter out admins if you want
    const customers = allUsers.filter((u: any) => u.role !== 'admin');
    setCustomers(customers as User[]);
  } catch (error) {
    console.error('Error loading customers:', error);
  } finally {
    setLoading(false);
  }
};
```

### Connect Products to Admin API

Update `app/admin/products.tsx`:

```typescript
import { getMenu, deleteMenuItem } from '@/lib/appwrite';

const loadProducts = async () => {
  try {
    setLoading(true);
    const allProducts = await getMenu({});
    setProducts(allProducts as MenuItem[]);
  } catch (error) {
    console.error('Error loading products:', error);
  } finally {
    setLoading(false);
  }
};

const handleDelete = async (productId: string) => {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  try {
    await deleteMenuItem(productId);
    setProducts(products.filter(p => p.$id !== productId));
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Failed to delete product');
  }
};
```

---

## 🛡️ Step 6: Security Best Practices

### 1. Always Verify Admin Role

Before allowing any admin action:

```typescript
const { user } = useAuthStore();

if (user?.role !== 'admin') {
  throw new Error('Unauthorized: Admin access required');
}
```

### 2. Server-Side Validation

While client-side checks are good UX, always enforce permissions on the server:

- Use Appwrite's role-based permissions
- Never trust client-side role checks alone

### 3. Audit Logging (Optional)

For production, consider adding audit logs:

```typescript
// Create an admin_logs collection
export const logAdminAction = async (
  adminId: string,
  action: string,
  targetId: string,
  details: any
) => {
  await databases.createDocument(
    appwriteConfig.databaseId,
    'admin_logs',
    ID.unique(),
    {
      adminId,
      action,
      targetId,
      details: JSON.stringify(details),
      timestamp: new Date().toISOString()
    }
  );
};

// Use it when updating orders
await updateOrderStatus(orderId, newStatus);
await logAdminAction(user.$id, 'UPDATE_ORDER_STATUS', orderId, { 
  oldStatus, 
  newStatus 
});
```

---

## 📱 Step 7: Mobile Admin Access (Optional)

The current admin dashboard is optimized for web. For mobile admin access:

### Option 1: Responsive Layout

Add mobile-friendly styles:

```typescript
// In app/admin/_layout.tsx
<View className={`flex-1 ${Platform.OS === 'web' ? 'flex-row' : 'flex-col'}`}>
  {/* Sidebar - hide on mobile, show as drawer */}
  {Platform.OS === 'web' && (
    <View className="w-64 bg-white border-r border-gray-200">
      {/* Sidebar content */}
    </View>
  )}
  
  {/* Mobile drawer button */}
  {Platform.OS !== 'web' && (
    <Pressable onPress={() => setDrawerOpen(true)}>
      <Text>☰ Menu</Text>
    </Pressable>
  )}
</View>
```

### Option 2: Separate Mobile Admin Route

Create a simplified mobile admin view at `/admin/mobile`.

---

## 🚢 Step 8: Deployment

### For Web (Netlify/Vercel)

1. **Build for production**:
   ```bash
   npx expo export --platform web
   ```

2. **Configure routes**:
   - Ensure `/admin/*` routes are handled by your router
   - Add redirect rules in `netlify.toml` or `vercel.json`:
   
   ```toml
   # netlify.toml
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Set environment variables**:
   - Add all EXPO_PUBLIC_* variables
   - Ensure Appwrite endpoint is accessible

### Security Headers

Add security headers to protect admin routes:

```toml
# netlify.toml
[[headers]]
  for = "/admin/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "no-referrer"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
```

---

## 🐛 Troubleshooting

### Issue: "Unauthorized" error when accessing admin panel

**Solution**: 
1. Verify your user account has `role: 'admin'` in the database
2. Check Appwrite permissions for the `user` collection
3. Ensure you're signed in before accessing `/admin`

### Issue: Orders/Customers don't load

**Solution**:
1. Check Appwrite permissions for `orders` and `user` collections
2. Ensure admin role has Read access to these collections
3. Check browser console for error messages
4. Verify your admin user has the correct permissions in Appwrite

### Issue: Can't update order status

**Solution**:
1. Check that admin role has Update permission on `orders` collection
2. Verify the status value is valid (pending, preparing, ready, delivered, cancelled)
3. Check network tab for API errors

### Issue: Admin panel shows on mobile but looks broken

**Solution**:
The current admin panel is web-optimized. Either:
1. Disable admin access on mobile (recommended for now)
2. Create a mobile-specific admin UI
3. Use responsive design patterns (as shown in Step 7)

---

## 📚 Next Steps

Now that your admin dashboard is set up, consider:

1. **Add Product CRUD**: Complete create/edit forms for menu items
2. **Add Filtering**: Date ranges, status filters, search improvements
3. **Add Charts**: Revenue trends, order statistics using react-native-chart-kit
4. **Real-time Updates**: Use Appwrite Realtime for live order updates
5. **Export Data**: Add CSV/PDF export for reports
6. **Staff Management**: Implement staff role with limited permissions
7. **Drone Control**: Add drone delivery simulation controls

---

## 🔗 Related Documentation

- [PROJECT_EVALUATION.md](./PROJECT_EVALUATION.md) - Overall project assessment
- [ADMIN_DASHBOARD_PLAN.md](./ADMIN_DASHBOARD_PLAN.md) - Admin architecture decisions
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database structure
- [APPWRITE_PERMISSIONS.md](./APPWRITE_PERMISSIONS.md) - Permissions guide

---

## ✅ Admin Dashboard Checklist

- [ ] Role field added to User collection in Appwrite
- [ ] At least one admin user created
- [ ] Appwrite permissions configured for admin role
- [ ] Admin routes accessible at `/admin`
- [ ] Dashboard loads with placeholder stats
- [ ] Orders management shows all orders
- [ ] Can update order status
- [ ] Customers management shows all users
- [ ] Products management shows all menu items
- [ ] Admin API functions working (getAllOrders, getAllUsers, etc.)
- [ ] Admin panel link added to profile (optional)
- [ ] Real stats loading on dashboard (optional)
- [ ] Mobile admin access configured (optional)
- [ ] Deployed to production (optional)

---

**Last Updated**: 2024
**Version**: 1.0.0
**Author**: Fastfood Deli Development Team
