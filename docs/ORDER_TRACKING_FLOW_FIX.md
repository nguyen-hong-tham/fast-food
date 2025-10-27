# 🔧 Sửa Flow Hiển thị Order Tracking

## 📋 Vấn đề

### 1. **Timeline hiển thị sai**
- Hiển thị step "Confirmed" không cần thiết
- Flow quá dài và không match với thực tế

**TRƯỚC**:
```
1. Pending ✅
2. Confirmed ✅  ← Không cần!
3. Preparing ✅
4. Ready for Pickup 🔄
5. Picked Up ⏳
6. On the Way ⏳
7. Delivered ⏳
```

### 2. **Countdown Timer hiển thị 00:00**
- Timer không sync với simulation progress
- Dùng duration cố định thay vì ETA thực tế

### 3. **Không hiển thị drone trên map**
- Simulation có thể fail
- Không có fallback khi lỗi

---

## ✅ Giải pháp

### 1. **Sửa Timeline Flow**

**File**: `mobile/components/tracking/StatusTimeline.tsx`

**SAU**:
```typescript
const STATUS_SEQUENCE: Order['status'][] = [
  'pending',      // 1. Đặt hàng
  'preparing',    // 2. Restaurant Accept & chuẩn bị
  'ready',        // 3. Sẵn sàng - drone bay đến
  'picked_up',    // 4. Drone đã nhặt hàng
  'delivering',   // 5. Đang giao
  'delivered',    // 6. Hoàn thành
];
```

**Kết quả**:
```
1. Pending ✅
2. Preparing ✅
3. Ready for Pickup 🔄 ← Current
4. Picked Up ⏳
5. On the Way ⏳
6. Delivered ⏳
```

### 2. **Sửa Countdown Timer**

**File**: `mobile/app/order-tracking.tsx`

**TRƯỚC**:
```tsx
// Dùng duration cố định
<CountdownTimer 
  duration={SIMULATION_DURATION} // 60000ms - không thay đổi
  isActive={countdownActive} 
/>
```

**SAU**:
```tsx
// Hiển thị trực tiếp từ etaMinutes (sync với simulation)
{etaMinutes !== undefined && etaMinutes > 0 && (
  <View className="bg-dark-100/90 rounded-2xl px-4 py-3">
    <Text className="text-xs text-white/70">Drone Arrival Countdown</Text>
    <Text className="text-2xl text-white mt-1">
      {Math.floor(etaMinutes).toString().padStart(2, '0')}:
      {Math.floor((etaMinutes % 1) * 60).toString().padStart(2, '0')}
    </Text>
  </View>
)}
```

**Lợi ích**:
- ✅ Sync realtime với simulation progress
- ✅ Update smooth mỗi lần `etaMinutes` thay đổi
- ✅ Tự động ẩn khi ETA = 0
- ✅ Không bị reset như component riêng

### 3. **Cải thiện Simulation Logic**

**File**: `mobile/app/order-tracking.tsx`

**Cải thiện**:

```typescript
useEffect(() => {
  // ... checks ...
  
  setSimulationState('running');
  setCountdownActive(true);
  
  // ✅ Set initial drone position
  setDronePath([restaurantCoords]);
  setDroneCoords(restaurantCoords);
  
  // ✅ Set initial ETA
  const initialETA = SIMULATION_DURATION / 60000;
  setEtaMinutes(initialETA);

  simulateDroneFlight({
    orderId: order.$id,
    restaurantCoords,
    customerCoords,
    droneId: order.droneId,
    duration: SIMULATION_DURATION,
    onProgress: ({ coordinate, progress, phase }) => {
      setDroneCoords(coordinate);
      setDronePath((prev) => [...prev, coordinate]);
      
      // ✅ Update ETA based on progress
      const remainingTime = Math.max(0, (1 - progress) * (SIMULATION_DURATION / 60000));
      setEtaMinutes(remainingTime);
    },
  })
    .then(() => {
      setSimulationState('completed');
      setCountdownActive(false);
      setEtaMinutes(0);
    })
    .catch((err) => {
      console.error('❌ Drone simulation failed', err);
      setSimulationState('idle');
      setCountdownActive(false);
      
      // ✅ Fallback: Use estimatedDeliveryTime if available
      if (order.estimatedDeliveryTime) {
        const etaMs = new Date(order.estimatedDeliveryTime).getTime() - Date.now();
        setEtaMinutes(Math.max(0, etaMs / 60000));
      } else {
        setEtaMinutes(undefined);
      }
    });
}, [order, restaurantCoords, customerCoords, simulationState, hasRealtimeProgress]);
```

**Cải thiện**:
1. ✅ Set initial position ngay khi bắt đầu
2. ✅ Set initial ETA trước khi simulation chạy
3. ✅ Update ETA smooth theo progress
4. ✅ Fallback khi simulation fail

---

## 📊 So sánh TRƯỚC/SAU

### Timeline Steps

| TRƯỚC | SAU |
|-------|-----|
| 1. Pending | 1. Pending |
| 2. **Confirmed** ❌ | ~~Removed~~ |
| 3. Preparing | 2. Preparing |
| 4. Ready | 3. Ready |
| 5. Picked Up | 4. Picked Up |
| 6. Delivering | 5. Delivering |
| 7. Delivered | 6. Delivered |

### Countdown Display

| TRƯỚC | SAU |
|-------|-----|
| ❌ Fixed 60s | ✅ Dynamic from simulation |
| ❌ Reset on update | ✅ Smooth update |
| ❌ Component overhead | ✅ Direct render |
| ❌ Shows 00:00 bug | ✅ Hides when ETA = 0 |

### Error Handling

| TRƯỚC | SAU |
|-------|-----|
| ❌ No fallback | ✅ Use estimatedDeliveryTime |
| ❌ Blank screen | ✅ Show estimate |
| ❌ Crash on error | ✅ Graceful degradation |

---

## 🎯 Kết quả

### ✅ Timeline Flow rõ ràng hơn
- Loại bỏ step "Confirmed" không cần thiết
- 6 steps thay vì 7
- Dễ hiểu hơn cho user

### ✅ Countdown chính xác
- Sync với simulation progress
- Update mỗi lần progress thay đổi
- Format: MM:SS (ví dụ: 01:23)

### ✅ Drone hiển thị đúng
- Initial position tại restaurant
- Move smooth theo simulation
- Fallback khi có lỗi

### ✅ Error handling tốt hơn
- Không crash khi simulation fail
- Hiển thị ETA từ order nếu có
- Log error để debug

---

## 🧪 Test Flow

### 1. Test Timeline hiển thị

**Status: pending**
```
1. Pending 🔄 In progress...
2. Preparing (gray)
3. Ready (gray)
4. Picked Up (gray)
5. Delivering (gray)
6. Delivered (gray)
```

**Status: ready**
```
1. Pending ✅
2. Preparing ✅
3. Ready for Pickup 🔄 In progress...
4. Picked Up (gray)
5. Delivering (gray)
6. Delivered (gray)
```

### 2. Test Countdown

1. Restaurant Mark Ready
2. Countdown bắt đầu từ 01:00
3. Update smooth: 00:59, 00:58, 00:57...
4. Khi simulation progress, countdown giảm theo
5. Khi delivered, countdown = 00:00 và ẩn

### 3. Test Drone visualization

1. Restaurant Mark Ready
2. ✅ Drone marker xuất hiện tại restaurant
3. ✅ Drone bay tới restaurant (30% time)
4. ✅ Status → picked_up
5. ✅ Drone bay tới customer (70% time)
6. ✅ Status → delivering
7. ✅ Drone arrive → delivered

---

## 📱 User Experience

### Trước (Confusing):
```
Order #C5BF74

[Countdown: 00:00] ❌ Sai!

Map: [No drone visible] ❌

Progress:
✅ Pending
✅ Confirmed      ← Không cần
✅ Preparing
✅ Ready
🔄 In progress... ← Không rõ step nào
⏳ Picked Up
⏳ On the Way
⏳ Delivered
```

### Sau (Clear):
```
Order #C5BF74

[Countdown: 00:45] ✅ Chính xác!

Map: [🚁 Drone đang bay] ✅

Progress:
✅ Pending
✅ Preparing
🔄 Ready for Pickup
   In progress...    ← Rõ ràng!
⏳ Picked Up
⏳ On the Way
⏳ Delivered
```

---

## 🚀 Next Steps (Optional)

### Cải thiện thêm:

1. **Real-time status updates**
   ```typescript
   // Subscribe to order status changes
   subscribeToOrder(orderId, (updatedOrder) => {
     setOrder(updatedOrder);
   });
   ```

2. **Better error messages**
   ```tsx
   {simulationError && (
     <View className="bg-yellow-50 p-4 rounded-lg">
       <Text className="text-yellow-800">
         ⚠️ Live tracking unavailable. Estimated delivery time shown.
       </Text>
     </View>
   )}
   ```

3. **Animations**
   - Smooth timeline transitions
   - Pulse effect on current step
   - Animated countdown

4. **Sound notifications**
   - Chime when status changes
   - Alert when delivery near

---

## 📝 Files Changed

1. ✅ `mobile/components/tracking/StatusTimeline.tsx`
   - Removed "confirmed" from STATUS_SEQUENCE
   - 6 steps instead of 7

2. ✅ `mobile/app/order-tracking.tsx`
   - Improved simulation logic
   - Direct countdown rendering (no component)
   - Better error handling
   - Removed CountdownTimer import

3. ✅ `mobile/components/tracking/CountdownTimer.tsx`
   - Kept for backwards compatibility
   - Improved update logic

---

**Updated**: October 27, 2025  
**Status**: ✅ Complete & Tested  
**Impact**: Better UX, clearer flow, accurate countdown
