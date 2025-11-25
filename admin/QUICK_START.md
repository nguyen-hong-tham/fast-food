# 🚁 Hướng Dẫn Sử Dụng Drone Simulation

## Đã Hoàn Thành ✅

Tôi đã tạo xong hệ thống mô phỏng drone real-time cho admin portal với đầy đủ tính năng:

### 1. **Drone Simulator Service** (`admin/src/lib/drone-simulator.ts`)
- ✅ Logic di chuyển drone từ Hub → Restaurant → Customer
- ✅ Tính toán waypoints với easing cho animation mượt mà
- ✅ Tính khoảng cách Haversine
- ✅ Cập nhật vị trí drone real-time vào database
- ✅ Tạo drone events log
- ✅ Thời gian: Hub→Restaurant 10s, Restaurant→Customer 20s

### 2. **Realtime Tracking Hook** (`admin/src/hooks/useRealtimeDroneTracking.ts`)
- ✅ Auto-refresh drones và orders mỗi 3 giây
- ✅ Tự động trigger simulation khi order chuyển sang "ready"
- ✅ Theo dõi active deliveries
- ✅ Manual trigger simulation
- ✅ Error handling

### 3. **DroneMap Component** (Đã có sẵn, tương thích)
- ✅ Hiển thị drones với icon động theo status
- ✅ Hiển thị hub, restaurant, customer markers
- ✅ Route lines (Hub→Restaurant màu xanh dashed, Restaurant→Customer màu xanh lá solid)
- ✅ Popup với thông tin chi tiết
- ✅ Battery indicator
- ✅ Distance tracking

### 4. **Demo Page** (`admin/src/pages/DroneSimulationDemo.tsx`)
- ✅ UI đẹp để test simulation
- ✅ Progress bar real-time
- ✅ Simulation logs
- ✅ Stats dashboard
- ✅ One-click demo

---

## Cách Sử Dụng 🎮

### **Bước 1: Tạo Hub và Drone**

Trước tiên bạn cần:
1. Vào trang **Drones** trong admin
2. Chuyển sang tab **Hub Management**
3. Tạo một Hub mới (ví dụ: Main Hub tại TP.HCM)
4. Quay lại tab **Drone List** và tạo drone mới
5. Assign drone vào hub vừa tạo

### **Bước 2: Truy Cập Demo Page**

Có 2 cách:

**Cách 1: Qua Sidebar**
- Click vào **"Drone Demo"** trong sidebar (icon ▶️)

**Cách 2: URL trực tiếp**
- Truy cập: `http://localhost:3002/drone-demo`

### **Bước 3: Chạy Demo Simulation**

1. Trong trang Demo, click nút **"Start Demo Simulation"**
2. Hệ thống sẽ tự động:
   - Chọn drone available đầu tiên
   - Tạo demo order với tọa độ giả lập
   - Bắt đầu simulation

3. Quan sát:
   - 🗺️ **Map:** Drone di chuyển real-time trên bản đồ
   - 📊 **Progress Bar:** Hiển thị % hoàn thành
   - 📝 **Simulation Log:** Log chi tiết từng bước
   - 📈 **Stats:** Thống kê drones và deliveries

### **Bước 4: Xem Real-time Movement**

Trong quá trình simulation:
- Icon drone 🚁 sẽ di chuyển từ hub
- Đường bay màu xanh dashed xuất hiện (Hub → Restaurant)
- Drone dừng 2s tại restaurant 🍽️
- Đường bay màu xanh lá xuất hiện (Restaurant → Customer)
- Drone đến vị trí khách hàng 📍
- Hoàn tất và quay về hub

---

## Tích Hợp Với Orders (Production Use)

Để tích hợp với orders thật:

### **File cần chỉnh sửa:** `admin/src/pages/OrdersPage.tsx`

Thêm hook vào OrdersPage:

```tsx
import { useRealtimeDroneTracking } from '@/hooks/useRealtimeDroneTracking';

export default function OrdersPage() {
  const { triggerSimulation } = useRealtimeDroneTracking({
    autoRefreshInterval: 3000,
    enableSimulation: true, // Tự động trigger khi order = "ready"
  });

  // ... existing code
}
```

### **Khi Restaurant đánh dấu order "ready":**

Hệ thống sẽ:
1. Tự động phát hiện order có status = "ready"
2. Kiểm tra order có drone assigned chưa
3. Bắt đầu simulation tự động
4. Drone bay từ hub → restaurant → customer
5. Cập nhật status thành "delivered" khi hoàn tất

---

## Customization

### **Thay đổi thời gian bay:**

Trong file `drone-simulator.ts`, function `simulateDroneDelivery`:

```typescript
toRestaurantDuration: 10000, // 10s (có thể thay đổi)
toCustomerDuration: 20000,   // 20s (có thể thay đổi)
```

### **Thay đổi số waypoints (độ mượt animation):**

```typescript
const phase1Waypoints = calculateWaypoints(hubCoords, restaurantCoords, 20);
// Tăng số 20 lên 40 để mượt hơn (nhưng nặng hơn)
```

### **Thay đổi auto-refresh interval:**

```typescript
const { drones } = useRealtimeDroneTracking({
  autoRefreshInterval: 2000, // 2 giây thay vì 3 giây
});
```

---

## Troubleshooting 🔧

### ❌ **"No drones available"**
**Giải pháp:** Tạo drone mới trong trang Drones

### ❌ **"No hub available"**
**Giải pháp:** Tạo hub trước trong Drones → Hub Management

### ❌ **Drone không di chuyển**
**Kiểm tra:**
1. Database có cập nhật `currentLatitude`, `currentLongitude`?
2. Console log có errors?
3. Appwrite connection OK?

### ❌ **Map không hiển thị**
**Giải pháp:** 
1. Kiểm tra Leaflet CSS đã import
2. Clear browser cache
3. Kiểm tra coordinates hợp lệ

---

## Demo Video Flow 📹

Khi chạy demo, bạn sẽ thấy:

1. **0-10s:** Drone bay từ hub đến restaurant
   - Đường bay xanh dashed
   - Progress 0% → 50%
   - Log: "Flying to restaurant..."

2. **10-12s:** Drone dừng tại restaurant
   - Progress 50%
   - Log: "Picking up order..."

3. **12-32s:** Drone bay đến customer
   - Đường bay xanh lá solid
   - Progress 50% → 100%
   - Log: "Flying to customer..."
   - Hiển thị distance remaining

4. **32s+:** Hoàn tất
   - Progress 100%
   - Log: "Delivery completed!"
   - Drone về hub

---

## Next Steps 🚀

Để mở rộng thêm:

1. ✅ **Đã xong:** Basic simulation
2. 🔄 **Có thể thêm:** Battery consumption theo distance
3. 🔄 **Có thể thêm:** Weather effects (mưa = bay chậm hơn)
4. 🔄 **Có thể thêm:** Multiple drones cùng lúc
5. 🔄 **Có thể thêm:** Notification khi delivery hoàn tất
6. 🔄 **Có thể thêm:** Sound effects

---

## Files Đã Tạo 📁

1. `admin/src/lib/drone-simulator.ts` - Service chính
2. `admin/src/hooks/useRealtimeDroneTracking.ts` - React hook
3. `admin/src/pages/DroneSimulationDemo.tsx` - Demo UI
4. `admin/DRONE_SIMULATION_GUIDE.md` - Documentation chi tiết
5. `admin/QUICK_START.md` - File này

---

## Environment Variables

Đảm bảo file `.env` có:

```env
VITE_APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68c9791a002b85f096b4
VITE_APPWRITE_DATABASE_ID=68da5e73002cb68e70af
VITE_APPWRITE_DRONES_COLLECTION_ID=drones
VITE_APPWRITE_DRONE_EVENTS_COLLECTION_ID=drone_events
VITE_APPWRITE_ORDERS_COLLECTION_ID=orders
```

---

## Questions?

Nếu có vấn đề:
1. Check console logs
2. Check `DRONE_SIMULATION_GUIDE.md` cho troubleshooting chi tiết
3. Verify database collections tồn tại
4. Test với demo page trước

---

**🎉 Chúc bạn test thành công!**
