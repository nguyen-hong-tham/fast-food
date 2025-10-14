# Admin Dashboard Setup Checklist

Use this checklist to track your admin dashboard setup progress.

---

## ✅ Phase 1: Database Setup (Required)

### Appwrite Console Tasks

- [ ] **Add role attribute to User collection**
  - [ ] Open Appwrite Console → Databases → Your DB
  - [ ] Navigate to `user` collection → Attributes tab
  - [ ] Create Enum attribute:
    - Key: `role`
    - Values: `customer`, `admin`, `staff`
    - Default: `customer`
    - Required: Yes
  - [ ] Wait for indexing to complete

- [ ] **Create first admin user**
  - [ ] Go to `user` collection → Documents tab
  - [ ] Find your account (search by email)
  - [ ] Click "Update Document"
  - [ ] Set `role` field to `admin`
  - [ ] Save changes

- [ ] **Configure collection permissions**
  
  **Orders Collection:**
  - [ ] Go to Settings → Permissions
  - [ ] Add role `admin` with:
    - [ ] Read permission
    - [ ] Update permission
    - [ ] Delete permission

  **User Collection:**
  - [ ] Go to Settings → Permissions
  - [ ] Add role `admin` with:
    - [ ] Read permission
    - [ ] Update permission
    - [ ] Delete permission

  **Menu Collection:**
  - [ ] Go to Settings → Permissions
  - [ ] Add role `admin` with:
    - [ ] Create permission
    - [ ] Read permission
    - [ ] Update permission
    - [ ] Delete permission

  **Categories Collection:**
  - [ ] Go to Settings → Permissions
  - [ ] Add role `admin` with all CRUD permissions

  **Customizations Collection:**
  - [ ] Go to Settings → Permissions
  - [ ] Add role `admin` with all CRUD permissions

---

## ✅ Phase 2: Basic Testing (Required)

- [ ] **Start development server**
  ```bash
  npm run web
  ```

- [ ] **Sign in as admin**
  - [ ] Navigate to http://localhost:8081
  - [ ] Sign in with your admin account

- [ ] **Test admin access**
  - [ ] Manually navigate to http://localhost:8081/admin
  - [ ] Verify dashboard loads (shows 4 stat cards)
  - [ ] Check that sidebar shows navigation links

- [ ] **Test navigation**
  - [ ] Click "Orders" in sidebar → Verify orders page loads
  - [ ] Click "Customers" in sidebar → Verify customers page loads
  - [ ] Click "Products" in sidebar → Verify products page loads
  - [ ] Click "Dashboard" in sidebar → Return to dashboard

- [ ] **Test authorization**
  - [ ] Sign out
  - [ ] Sign in with a regular (non-admin) account
  - [ ] Try to access `/admin` route
  - [ ] Verify you're redirected to main app (not admin panel)

---

## ✅ Phase 3: Connect Real Data (Optional but Recommended)

### Dashboard Stats

- [ ] **Update `app/admin/index.tsx`**
  - [ ] Import `getAllOrders`, `getAllUsers`, `getMenu` from `@/lib/appwrite`
  - [ ] Implement `loadDashboardStats()` function (see ADMIN_IMPLEMENTATION_SUMMARY.md)
  - [ ] Test that stats show real counts

### Orders Management

- [ ] **Update `app/admin/orders.tsx`**
  - [ ] Import `getAllOrders`, `updateOrderStatus` from `@/lib/appwrite`
  - [ ] Update `loadOrders()` to call `getAllOrders(200)`
  - [ ] Update `updateOrderStatus()` to call API function
  - [ ] Test:
    - [ ] Orders load correctly
    - [ ] Search filters work
    - [ ] Status filters work
    - [ ] Can update order status via dropdown

### Customers Management

- [ ] **Update `app/admin/customers.tsx`**
  - [ ] Import `getAllUsers` from `@/lib/appwrite`
  - [ ] Update `loadCustomers()` to call `getAllUsers(200)`
  - [ ] Test:
    - [ ] All customers load
    - [ ] Search works
    - [ ] Avatar displays correctly
    - [ ] Role badges show correctly

### Products Management

- [ ] **Update `app/admin/products.tsx`**
  - [ ] Import `getMenu`, `deleteMenuItem` from `@/lib/appwrite`
  - [ ] Update `loadProducts()` to call `getMenu({})`
  - [ ] Update `deleteProduct()` to call `deleteMenuItem()`
  - [ ] Test:
    - [ ] Products load in grid
    - [ ] Search works
    - [ ] Delete button works (shows confirmation)
    - [ ] Product is removed after deletion

---

## ✅ Phase 4: UI Enhancements (Optional)

### Add Admin Link to Profile

- [ ] **Update `app/(tabs)/profile.tsx`**
  - [ ] Import `useAuthStore` from `@/store/auth.store`
  - [ ] Add conditional admin panel button
  - [ ] Test button only shows for admin users
  - [ ] Test button navigates to `/admin`

### Improve Order Details

- [ ] Add more order information in orders table
- [ ] Add order items preview
- [ ] Add delivery address display
- [ ] Add order notes if available

### Improve Customer Details

- [ ] Add order count per customer
- [ ] Add last order date
- [ ] Add total spent
- [ ] Add customer status (active/inactive)

### Improve Product Details

- [ ] Add stock quantity field
- [ ] Add category badges
- [ ] Add "Out of Stock" indicator
- [ ] Add product status (active/inactive)

---

## ✅ Phase 5: Advanced Features (Future)

### Product CRUD

- [ ] Create "Add Product" form
- [ ] Create "Edit Product" form
- [ ] Add image upload for products
- [ ] Add category selector
- [ ] Add customizations manager

### Order Analytics

- [ ] Add date range filter
- [ ] Add order status chart
- [ ] Add revenue chart
- [ ] Add top products chart
- [ ] Export orders to CSV
- [ ] Export orders to PDF

### Real-time Updates

- [ ] Implement Appwrite Realtime for orders
- [ ] Show live order count badge
- [ ] Add sound notification for new orders
- [ ] Auto-refresh dashboard stats

### Staff Management

- [ ] Create staff role permissions
- [ ] Add staff accounts page
- [ ] Implement staff-limited views
- [ ] Add activity logs

### Drone Integration

- [ ] Add drone status to orders
- [ ] Add drone control buttons
- [ ] Add map view for drone location
- [ ] Add estimated delivery time

---

## 🐛 Troubleshooting Checklist

If something doesn't work, check these:

### Admin Panel Won't Load

- [ ] Verified `role` field exists in User collection
- [ ] Checked user account has `role = 'admin'`
- [ ] Confirmed user is signed in
- [ ] Checked browser console for errors
- [ ] Verified no TypeScript compilation errors

### Orders Don't Load

- [ ] Checked admin role has Read permission on orders collection
- [ ] Verified `getAllOrders()` function exists in `lib/appwrite.ts`
- [ ] Confirmed function is called in `loadOrders()`
- [ ] Checked network tab for 401/403 errors
- [ ] Verified orders exist in database

### Can't Update Order Status

- [ ] Checked admin role has Update permission on orders collection
- [ ] Verified status value is valid enum (pending, preparing, ready, delivered, cancelled)
- [ ] Confirmed `updateOrderStatus()` function exists
- [ ] Checked network tab for errors
- [ ] Tested with a single order first

### Customers Page Empty

- [ ] Verified users exist in database
- [ ] Checked admin role has Read permission on user collection
- [ ] Confirmed `getAllUsers()` function is implemented
- [ ] Checked if filtering is removing all users
- [ ] Verified function is called in `loadCustomers()`

### Products Page Issues

- [ ] Confirmed menu items exist in database
- [ ] Checked public Read permission on menu collection
- [ ] Verified `getMenu()` function works
- [ ] Checked image URLs are valid
- [ ] Confirmed no TypeScript errors with MenuItem type

---

## 📊 Progress Tracking

**Estimated Times:**
- Phase 1 (Database Setup): 15-20 minutes ⏱️
- Phase 2 (Basic Testing): 5-10 minutes ⏱️
- Phase 3 (Connect Data): 1-2 hours ⏱️
- Phase 4 (UI Enhancements): 2-3 hours ⏱️
- Phase 5 (Advanced Features): 5-10 hours ⏱️

**My Progress:**
- Started: _______________
- Phase 1 Complete: _______________
- Phase 2 Complete: _______________
- Phase 3 Complete: _______________
- Phase 4 Complete: _______________
- Phase 5 Complete: _______________

**Notes:**
```
[Write any issues, solutions, or customizations here]







```

---

## 🎉 Success Criteria

Your admin dashboard is **fully functional** when:

✅ **Basic (Required):**
1. Admin user can access `/admin` route
2. Non-admin users are redirected
3. Dashboard shows 4 stats cards
4. All navigation links work
5. Orders/Customers/Products pages load without errors

✅ **Enhanced (Recommended):**
6. Dashboard shows real data counts
7. Orders page displays all orders
8. Order status can be updated
9. Customers page shows all users
10. Products page shows all menu items
11. Product delete function works

✅ **Complete (Optional):**
12. Admin link in profile screen
13. Search and filters work
14. Create/Edit product forms work
15. Charts display analytics
16. Real-time updates enabled

---

## 📚 Quick Reference Links

- **Setup Guide**: [ADMIN_DASHBOARD_SETUP.md](./ADMIN_DASHBOARD_SETUP.md)
- **Quick Start**: [ADMIN_QUICK_START.md](./ADMIN_QUICK_START.md)
- **Implementation Summary**: [ADMIN_IMPLEMENTATION_SUMMARY.md](./ADMIN_IMPLEMENTATION_SUMMARY.md)
- **Architecture**: [ADMIN_DASHBOARD_PLAN.md](./ADMIN_DASHBOARD_PLAN.md)

---

**Last Updated**: 2024
**Version**: 1.0.0

**Good luck with your admin dashboard setup! 🚀**
