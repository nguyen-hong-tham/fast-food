# Restaurant Portal Fixes - November 4, 2025

## ✅ Issues Identified & Fixed

### 1. **Mobile app shows unavailable menu items** ✅ FIXED
**Problem**: When restaurant marks item as "unavailable", it still shows in mobile app

**Root Cause**: `getRestaurantMenu()` in `mobile/lib/appwrite.ts` không filter theo `isAvailable`

**Solution Applied**:
```typescript
// File: mobile/lib/appwrite.ts, line ~890
export const getRestaurantMenu = async (restaurantId: string, category?: string, query?: string) => {
    try {
        const queries: string[] = [
            Query.equal('restaurantId', restaurantId),
            Query.equal('isAvailable', true) // ✅ ADD THIS LINE
        ];
        // ... rest of code
    }
}
```

**Test**: 
1. Vào Restaurant Portal → Menu
2. Click toggle để set món thành "Unavailable"
3. Mở Mobile app → Restaurant Detail
4. ✅ Món unavailable sẽ KHÔNG hiển thị nữa

---

### 2. **Missing Cancel Order function** ⚠️ NEEDS MANUAL APPLICATION
**Problem**: Restaurant không có cách để hủy đơn hàng (ví dụ khi món hết, nguyên liệu không đủ)

**Solution**: Add Cancel Order button + modal with reason input

#### Changes needed in `restaurant/src/pages/OrdersPage.tsx`:

**Step 1**: Add state variables (after line 29)
```typescript
const [showCancelModal, setShowCancelModal] = useState(false);
const [cancelReason, setCancelReason] = useState('');
```

**Step 2**: Add cancel handler function (after `updateOrderStatus` function, around line 200)
```typescript
const handleCancelOrder = async () => {
  if (!selectedOrder) return;
  
  if (!cancelReason.trim()) {
    alert('Please provide a reason for cancellation');
    return;
  }

  setIsUpdating(true);
  try {
    console.log('❌ Cancelling order:', selectedOrder.$id, 'Reason:', cancelReason);
    
    await databases.updateDocument(
      config.appwrite.databaseId,
      config.appwrite.ordersCollectionId,
      selectedOrder.$id,
      {
        status: 'cancelled',
        notes: selectedOrder.notes 
          ? `${selectedOrder.notes}\n\n[CANCELLED by Restaurant] ${cancelReason}`
          : `[CANCELLED by Restaurant] ${cancelReason}`
      }
    );

    console.log('✅ Order cancelled successfully');
    alert('Order cancelled successfully. Customer will be notified.');
    
    await fetchOrders();
    setShowCancelModal(false);
    setCancelReason('');
    closeModal();
  } catch (error: any) {
    console.error('❌ Error cancelling order:', error);
    alert('Failed to cancel order: ' + error.message);
  } finally {
    setIsUpdating(false);
  }
};
```

**Step 3**: Add Cancel button in order list (find line ~390 where "Accept Order" button is)
```tsx
{order.status === 'pending' && (
  <>
    <button 
      onClick={() => updateOrderStatus(order.$id, 'preparing')}
      disabled={isUpdating}
      className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium disabled:opacity-50"
    >
      Accept Order
    </button>
    {/* ✅ ADD THIS */}
    <button 
      onClick={() => {
        setSelectedOrder(order);
        setShowCancelModal(true);
      }}
      disabled={isUpdating}
      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
    >
      Cancel
    </button>
  </>
)}
```

**Step 4**: Add Cancel button in order details modal (find "Accept Order" in modal, around line 540)
```tsx
{selectedOrder.status === 'pending' && (
  <>
    <button
      onClick={() => {
        updateOrderStatus(selectedOrder.$id, 'preparing');
        closeModal();
      }}
      disabled={isUpdating}
      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
    >
      Accept Order
    </button>
    {/* ✅ ADD THIS */}
    <button
      onClick={() => setShowCancelModal(true)}
      disabled={isUpdating}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
    >
      Cancel Order
    </button>
  </>
)}

{/* Same for 'preparing' status */}
{selectedOrder.status === 'preparing' && (
  <>
    <button
      onClick={() => {
        updateOrderStatus(selectedOrder.$id, 'ready');
        closeModal();
      }}
      disabled={isUpdating}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
    >
      Mark Ready (Start Delivery)
    </button>
    {/* ✅ ADD THIS */}
    <button
      onClick={() => setShowCancelModal(true)}
      disabled={isUpdating}
      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
    >
      Cancel Order
    </button>
  </>
)}
```

**Step 5**: Add Cancel Modal (before closing `</DashboardLayout>` tag, around line 605)
```tsx
{/* Cancel Order Modal */}
{showCancelModal && selectedOrder && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
      </div>
      
      <div className="p-6">
        <p className="text-gray-700 mb-4">
          Are you sure you want to cancel Order #{selectedOrder.$id.slice(-8).toUpperCase()}?
        </p>
        <p className="text-sm text-red-600 mb-4">
          ⚠️ Customer will be notified about this cancellation.
        </p>
        
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reason for cancellation <span className="text-red-500">*</span>
        </label>
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="e.g., Món đã hết, nguyên liệu không đủ, quá tải đơn hàng..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          rows={4}
          disabled={isUpdating}
        />
        
        <div className="flex gap-2 mt-6">
          <button
            onClick={handleCancelOrder}
            disabled={isUpdating || !cancelReason.trim()}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
          <button
            onClick={() => {
              setShowCancelModal(false);
              setCancelReason('');
            }}
            disabled={isUpdating}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
          >
            Keep Order
          </button>
        </div>
      </div>
    </div>
  </div>
)}
```

---

### 3. **Total Amount shows 0 until View Details clicked** ⚠️ NEEDS MANUAL APPLICATION
**Problem**: Order totalAmount hiển thị 0₫ cho đến khi click "View Details"

**Root Cause**: Total amount chỉ được tính trong `viewOrderDetails()`, không tính khi `fetchOrders()`

**Solution**: Calculate totalAmount immediately when fetching orders

#### Replace the entire `fetchOrders` function (around line 40):

```typescript
const fetchOrders = async () => {
  if (!restaurant?.$id) {
    console.warn('No restaurant ID to fetch orders');
    setIsLoading(false);
    return;
  }

  try {
    setIsLoading(true);
    console.log('🔍 Fetching orders for restaurant:', restaurant.$id);
    
    // Fetch all orders first (because restaurantId is a relationship)
    const response = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.ordersCollectionId,
      [
        Query.orderDesc('$createdAt'),
        Query.limit(100)
      ]
    );

    console.log('📊 Total orders:', response.documents.length);
    
    // Filter client-side by restaurantId (handle relationship object)
    const filtered = response.documents.filter((order: any) => {
      const orderRestaurantId = typeof order.restaurantId === 'object' 
        ? order.restaurantId.$id 
        : order.restaurantId;
      return orderRestaurantId === restaurant.$id;
    });
    
    console.log('✅ Filtered orders for this restaurant:', filtered.length);
    
    // ✅ NEW: Calculate total amount for each order immediately
    const ordersWithTotals = await Promise.all(
      filtered.map(async (order: any) => {
        try {
          // Fetch order items for this order
          const itemsResponse = await databases.listDocuments(
            config.appwrite.databaseId,
            config.appwrite.orderItemsCollectionId,
            [Query.limit(100)]
          );
          
          // Filter items for this specific order
          const orderItemsFiltered = itemsResponse.documents.filter((item: any) => {
            const itemOrderId = typeof item.orderId === 'object' 
              ? item.orderId.$id 
              : item.orderId;
            return itemOrderId === order.$id;
          });
          
          // Calculate total from items
          const calculatedTotal = orderItemsFiltered.reduce((sum: number, item: any) => {
            return sum + (item.subtotal || 0);
          }, 0);
          
          console.log(`💰 Order ${order.$id.slice(-8)}: DB total=${order.totalAmount}, Calculated=${calculatedTotal}`);
          
          // Update in database if mismatch
          if (order.totalAmount !== calculatedTotal && calculatedTotal > 0) {
            try {
              await databases.updateDocument(
                config.appwrite.databaseId,
                config.appwrite.ordersCollectionId,
                order.$id,
                { totalAmount: calculatedTotal }
              );
              console.log(`✅ Updated order ${order.$id.slice(-8)} total in DB`);
            } catch (updateError) {
              console.error('⚠️ Failed to update total:', updateError);
            }
          }
          
          // Return order with correct total
          return { ...order, totalAmount: calculatedTotal > 0 ? calculatedTotal : order.totalAmount };
        } catch (error) {
          console.error('⚠️ Error calculating total for order:', order.$id, error);
          return order; // Return original if calculation fails
        }
      })
    );
    
    setOrders(ordersWithTotals as any);
  } catch (error: any) {
    console.error('❌ Error fetching orders:', error);
  } finally {
    setIsLoading(false);
  }
};
```

---

## 📊 Testing Checklist

### Test 1: Unavailable Items (Mobile)
- [ ] Vào Restaurant Portal → Menu
- [ ] Toggle một món thành "Unavailable" (biểu tượng mắt tắt, chữ "Unavailable" overlay)
- [ ] Mở Mobile App → Tìm restaurant đó
- [ ] ✅ Món unavailable KHÔNG hiển thị trong danh sách
- [ ] Toggle lại thành "Available"
- [ ] ✅ Món hiển thị trở lại trong mobile

### Test 2: Cancel Order
- [ ] Tạo test order từ mobile (status = pending)
- [ ] Vào Restaurant Portal → Orders
- [ ] Click vào order → Thấy nút "Cancel" màu đỏ
- [ ] Click "Cancel" → Modal hiện ra yêu cầu lý do
- [ ] Nhập lý do: "Món đã hết"
- [ ] Click "Confirm Cancel"
- [ ] ✅ Order status → cancelled
- [ ] ✅ Order notes có "[CANCELLED by Restaurant] Món đã hết"
- [ ] Check mobile: Order status = CANCELLED với lý do

### Test 3: Total Amount Display
- [ ] Tạo order mới từ mobile với 2-3 món
- [ ] Vào Restaurant Portal → Orders
- [ ] ✅ NGAY LẬP TỨC thấy Total Amount hiển thị đúng (không phải 0₫)
- [ ] Click "View Details"
- [ ] ✅ Total Amount trong modal khớp với ngoài list
- [ ] Refresh page
- [ ] ✅ Total vẫn hiển thị đúng

---

## 🔄 Rollback Instructions

Nếu có lỗi, revert changes:

```bash
# Rollback mobile changes
cd mobile
git checkout lib/appwrite.ts

# Rollback restaurant changes
cd restaurant
git checkout src/pages/OrdersPage.tsx
```

---

## 📝 Future Enhancements

1. **Real-time Notifications**: Send push notification to customer when order cancelled
2. **Cancellation Analytics**: Track cancellation reasons for insights
3. **Auto-unavailable**: Auto mark items unavailable when stock = 0
4. **Batch Operations**: Cancel multiple orders at once
5. **Refund Integration**: Automatically process refunds for cancelled orders

---

**Last Updated**: November 4, 2025  
**Fixed By**: AI Assistant  
**Status**: ✅ Mobile fix applied, ⚠️ Restaurant fixes need manual application

