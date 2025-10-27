# 🚁 Drone Flow - Quick Reference

## 📍 **5-Step Flow**

```
1. PENDING       → User đặt hàng
2. PREPARING     → Restaurant accept, drone bay tới (30%)
3. READY         → Drone đến, chờ món (5s)
4. DELIVERING    → Drone giao cho khách (70%)
5. DELIVERED     → Hoàn tất
```

---

## ⏱️ **Timing**

- **Phase 1 (to restaurant):** 18s (30%)
- **Wait at restaurant:** 5s
- **Phase 2 (to customer):** 42s (70%)
- **Total:** ~60s

---

## 📋 **Valid Fields**

### **Orders Collection**
```typescript
status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered'
preparingAt?: string
readyAt?: string
deliveredAt?: string
assignedAt?: string
estimatedDeliveryTime?: string
```

**DON'T USE:**
- ❌ `pickedUpAt` - Doesn't exist
- ❌ `picked_up` status - Skip it

---

## 🎯 **Valid EventTypes**

```typescript
'takeoff'            // When drone assigned
'delivery_start'     // Pickup from restaurant
'delivery_complete'  // Delivered to customer
'landing'            // Delivery complete
'battery_low'        // Low battery
'maintenance'        // Maintenance
'error'              // Error
```

**DON'T USE:**
- ❌ `position_update` - Doesn't exist

---

## 🔧 **Code Examples**

### **Trigger Simulation**
```typescript
// In order-tracking.tsx
const shouldStartSimulation = 
  order.status === 'preparing' || 
  order.status === 'ready' || 
  order.status === 'delivering';
```

### **Update Order Status**
```typescript
// ✅ CORRECT
await databases.updateDocument(orderId, {
  status: 'delivering',
  estimatedDeliveryTime: new Date(Date.now() + 42000).toISOString(),
});

// ❌ WRONG
await databases.updateDocument(orderId, {
  status: 'picked_up',      // Don't use
  pickedUpAt: timestamp,    // Doesn't exist
});
```

### **Create Event**
```typescript
// ✅ CORRECT
await databases.createDocument(droneEventsCollectionId, {
  droneId: drone.$id,
  orderId,
  eventType: 'delivery_start',
  latitude: restaurantLat,
  longitude: restaurantLng,
});

// ❌ WRONG
await databases.createDocument(droneEventsCollectionId, {
  eventType: 'position_update',  // Doesn't exist
});
```

---

## 🗺️ **Map Animation**

```typescript
// Phase 1: Base → Restaurant
const waypointsToRestaurant = calculateWaypoints(
  droneBase, 
  restaurant, 
  10  // 10 steps
);

// Phase 2: Restaurant → Customer
const waypointsToCustomer = calculateWaypoints(
  restaurant, 
  customer, 
  20  // 20 steps
);
```

---

## 📱 **UI Status Labels**

```typescript
const STATUS_LABELS = {
  pending: 'Order Placed',
  preparing: 'Restaurant Preparing',
  ready: 'Ready for Pickup',
  delivering: 'Drone Delivering',
  delivered: 'Delivered',
};
```

---

## ✅ **Testing Checklist**

- [ ] Create order → pending
- [ ] Restaurant accepts → preparing + drone flies
- [ ] Drone arrives → ready
- [ ] Auto after 5s → delivering + drone flies to customer
- [ ] Simulation ends → delivered
- [ ] Drone available again
- [ ] No console errors
- [ ] Map animates smoothly

---

## 🚨 **Common Mistakes**

1. **Using `picked_up` status**
   - ❌ Don't: `status: 'picked_up'`
   - ✅ Do: Go directly from `ready` → `delivering`

2. **Adding `pickedUpAt` field**
   - ❌ Don't: `pickedUpAt: new Date().toISOString()`
   - ✅ Do: Only use valid timestamp fields

3. **Creating `position_update` events**
   - ❌ Don't: `eventType: 'position_update'`
   - ✅ Do: Use milestone events only

4. **Wrong timing split**
   - ❌ Don't: 50/50 split
   - ✅ Do: 30/70 split (to restaurant / to customer)

---

## 📚 **Full Documentation**

- `DRONE_FLOW_OPTIMIZED.md` - Complete flow explanation
- `DRONE_FIXES_SUMMARY.md` - What was fixed and why
- `MOBILE_IMPROVEMENT_PLAN.md` - Overall improvements

---

**Last Updated:** October 28, 2025  
**Status:** ✅ Production Ready
