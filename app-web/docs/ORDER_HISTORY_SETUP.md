# Order History Feature Setup Guide

## 📋 Overview

The Order History feature allows users to view their past orders, filter them by status, and see detailed information about each order. This guide covers all components and setup steps.

---

## ✅ Prerequisites

Before using the Order History feature, ensure you have:

1. ✅ **Appwrite Orders Collection Created** (Follow `ORDERS_COLLECTION_SETUP.md`)
2. ✅ **User Authentication Working** (Users must be logged in)
3. ✅ **expo-image-picker Installed** (Already done in Edit Profile setup)

---

## 📁 Files Structure

```
app/
  order-history.tsx          # Order history list screen
  order-detail.tsx           # Single order detail screen
  (tabs)/
    profile.tsx              # Updated with Order History button
components/
  OrderCard.tsx              # Order item card component
lib/
  appwrite.ts                # Order CRUD functions (already added)
type.d.ts                    # Order types (already defined)
docs/
  ORDERS_COLLECTION_SETUP.md # Database setup guide
  ORDER_HISTORY_SETUP.md     # This file
```

---

## 🎨 Components Created

### 1. OrderCard.tsx

**Purpose:** Display a single order in the list view

**Features:**
- Order ID badge (last 6 characters)
- Status badge with color-coded background
- Item count with bag icon
- Delivery address with label
- Total price
- Date/time of order
- Tap to navigate to order details

**Props:**
```typescript
interface OrderCardProps {
    order: Order;
}
```

**Usage:**
```tsx
<OrderCard order={orderData} />
```

---

## 📱 Screens Created

### 1. order-history.tsx

**Purpose:** Display list of all user orders with filtering

**Features:**
- Filter orders by status (All, Pending, Preparing, Delivering, Completed, Cancelled)
- Pull-to-refresh functionality
- Empty state for no orders
- Loading indicator
- Automatic refresh when screen is focused
- Smooth animations

**Key Functions:**
- `fetchOrders()` - Fetches all orders for current user
- `filterOrders()` - Filters orders by selected status
- `onRefresh()` - Pull-to-refresh handler
- `handleFilterChange()` - Updates filter selection

**State:**
```typescript
const [orders, setOrders] = useState<Order[]>([]);
const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [selectedFilter, setSelectedFilter] = useState('all');
```

---

### 2. order-detail.tsx

**Purpose:** Display detailed information about a single order

**Features:**
- Order ID and status badge
- Full order date/time
- All order items with images, quantities, prices, and customizations
- Delivery address with label
- Phone number with tap-to-call
- Order notes (if any)
- Order summary with subtotal and total
- Contact support button (for active orders)
- Loading and error states

**Route Parameters:**
```typescript
const { orderId } = useLocalSearchParams();
```

**Navigation:**
```tsx
router.push({
    pathname: '/order-detail',
    params: { orderId: order.$id }
});
```

---

## 🎯 Status System

### Order Status Flow

```
pending → preparing → ready → delivering → completed
                                         ↘ cancelled
```

### Status Colors

| Status      | Color Code | Background       | Use Case              |
|-------------|-----------|------------------|-----------------------|
| pending     | #FE8C00   | Orange          | Order placed          |
| preparing   | #FE8C00   | Orange          | Kitchen is preparing  |
| ready       | #2F9B65   | Green           | Ready for pickup      |
| delivering  | #1E90FF   | Blue            | Out for delivery      |
| completed   | #2F9B65   | Green           | Delivered/Finished    |
| cancelled   | #F14141   | Red             | Cancelled by user/admin|

---

## 🔗 Navigation Flow

```
Profile Screen
    ↓
[Order History Button]
    ↓
Order History Screen (order-history.tsx)
    ├── Filter by status
    ├── Pull to refresh
    └── Tap order card
        ↓
    Order Detail Screen (order-detail.tsx)
        ├── View all items
        ├── See delivery info
        ├── Tap phone to call
        └── Contact support
```

---

## 🚀 Usage Instructions

### 1. Create Orders Collection in Appwrite

First, follow the guide in `ORDERS_COLLECTION_SETUP.md` to set up your database.

### 2. Test with Sample Data

After creating the collection, add some test orders using the test data provided in the setup guide.

### 3. Access Order History

1. Open the app
2. Go to **Profile** tab
3. Tap **"Order History"** button
4. View your orders filtered by status
5. Tap any order to see full details

---

## 🔧 API Functions

All API functions are already implemented in `lib/appwrite.ts`:

### getUserOrders(userId: string)

Fetches all orders for a specific user, sorted by creation date (newest first).

```typescript
const orders = await getUserOrders(user.$id);
```

**Returns:** Array of Order documents

### getOrderById(orderId: string)

Fetches a single order by ID.

```typescript
const order = await getOrderById('order-id-here');
```

**Returns:** Single Order document

### createOrder(orderData)

Creates a new order (used during checkout).

```typescript
const order = await createOrder({
    userId: user.$id,
    items: JSON.stringify(cartItems),
    total: totalPrice,
    status: 'pending',
    deliveryAddress: address,
    deliveryAddressLabel: 'Home',
    phone: user.phone,
    notes: 'Ring the doorbell'
});
```

**Returns:** Created Order document

---

## 🎨 Customization

### Change Status Colors

Edit the `STATUS_COLORS` object in both `OrderCard.tsx` and `order-detail.tsx`:

```typescript
const STATUS_COLORS = {
    pending: '#FE8C00',    // Orange
    preparing: '#FE8C00',  // Orange
    ready: '#2F9B65',      // Green
    delivering: '#1E90FF', // Blue
    completed: '#2F9B65',  // Green
    cancelled: '#F14141',  // Red
};
```

### Change Status Labels

Edit the `STATUS_LABELS` object:

```typescript
const STATUS_LABELS = {
    pending: 'Đang chờ',
    preparing: 'Đang chuẩn bị',
    ready: 'Sẵn sàng',
    delivering: 'Đang giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
};
```

### Add More Filters

Edit the `ORDER_FILTERS` array in `order-history.tsx`:

```typescript
const ORDER_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },  // Add custom filter
    { label: 'Pending', value: 'pending' },
    // ... more filters
];
```

---

## 🐛 Troubleshooting

### Issue: "No orders" shown but I have orders

**Solution:**
1. Check if Orders collection exists in Appwrite
2. Verify `ordersCollectionId` in `lib/appwrite.ts`
3. Check if `userId` matches the logged-in user
4. Verify collection permissions (user can read their own orders)

### Issue: TypeScript errors for navigation

**Solution:**
Use type assertion for dynamic routes:
```typescript
router.push('/order-history' as any);
```

### Issue: Images not loading in order details

**Solution:**
1. Check if `image_url` is valid in order items
2. Verify Appwrite Storage bucket permissions
3. Ensure images were uploaded correctly during order creation

### Issue: Pull-to-refresh not working

**Solution:**
1. Ensure `useFocusEffect` is imported from `@react-navigation/native`
2. Check if `getUserOrders()` function is working
3. Verify user is logged in

---

## ✨ Features Summary

### Order History Screen
- ✅ Filter by status (6 filters)
- ✅ Pull-to-refresh
- ✅ Auto-refresh on focus
- ✅ Loading states
- ✅ Empty states
- ✅ Smooth animations
- ✅ Order cards with all info

### Order Detail Screen
- ✅ Complete order information
- ✅ All items with images
- ✅ Customizations display
- ✅ Delivery information
- ✅ Tap-to-call phone
- ✅ Order summary
- ✅ Contact support (for active orders)
- ✅ Status-based UI changes

### OrderCard Component
- ✅ Order ID badge
- ✅ Status badge with colors
- ✅ Item count
- ✅ Delivery address
- ✅ Total price
- ✅ Date/time
- ✅ Tap to navigate

---

## 📝 Next Steps

1. **Create Orders Collection** in Appwrite (follow `ORDERS_COLLECTION_SETUP.md`)
2. **Add Test Data** to see sample orders
3. **Test Navigation** from Profile to Order History to Order Detail
4. **Customize Colors** and labels to match your brand
5. **Add Real Orders** by implementing checkout flow
6. **Test Edge Cases** (no orders, cancelled orders, etc.)

---

## 🎉 Conclusion

The Order History feature is now fully implemented! Users can:
- View all their past orders
- Filter by order status
- See detailed information for each order
- Contact support for help
- Call the delivery phone number

Make sure to create the Orders collection in Appwrite before testing, and add some sample data to see how it looks! 🚀
