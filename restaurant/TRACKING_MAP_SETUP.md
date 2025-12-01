# Restaurant Portal - Delivery Tracking Map Setup

## ✅ Hoàn thành!

Đã xây dựng tracking map với Leaflet cho restaurant portal, tương tự mobile app.

## 📦 Cài đặt Dependencies

Chạy lệnh sau trong thư mục `restaurant/`:

```bash
npm install leaflet react-leaflet @types/leaflet
```

## 🗺️ Tính năng đã thêm:

### 1. **DeliveryTrackingMap Component** (`src/components/DeliveryTrackingMap.tsx`)
- ✅ Sử dụng **Leaflet** thay vì Google Maps (phù hợp web)
- ✅ Hiển thị 3 markers:
  - 🏪 **Restaurant** (đỏ) - Vị trí nhà hàng
  - 🏠 **Customer** (xanh dương) - Địa chỉ giao hàng
  - 🚁 **Drone** (xanh lá) - Vị trí drone real-time
- ✅ **Flight path** - Đường bay của drone (đường nét đứt màu xanh)
- ✅ **Auto-fit bounds** - Tự động zoom phù hợp với tất cả markers
- ✅ **Status overlay** - Hiển thị phase giao hàng và ETA
- ✅ **Custom icons** - Icons SVG đẹp cho restaurant, customer, drone
- ✅ **Popups** - Click vào marker để xem thông tin chi tiết

### 2. **OrdersPage - Real-time Tracking**
- ✅ Subscribe drone position real-time từ Appwrite
- ✅ Hiển thị map trong modal order details
- ✅ Chỉ hiển thị map khi order đang delivering/picked_up
- ✅ Real-time cập nhật vị trí drone
- ✅ Tracking path - Lưu lại đường đi của drone
- ✅ Reset path button - Xóa đường đi cũ

### 3. **Logic Tracking (giống Mobile)**
- ✅ Subscribe to `drone.documents.{droneId}` channel
- ✅ Listen `currentLatitude` & `currentLongitude` changes
- ✅ Update `dronePosition` state real-time
- ✅ Append positions to `deliveryPath` array
- ✅ Display `deliveryPhase`: 
  - 📍 `to_restaurant` - Đang đi lấy hàng
  - 🚀 `to_customer` - Đang giao hàng
- ✅ Show `batteryLevel` trong popup

## 🎨 UI Components:

### Map Features:
- **OpenStreetMap tiles** - Miễn phí, không cần API key
- **Responsive** - Auto-resize theo container
- **Min height 400px** - Đảm bảo map đủ lớn
- **Rounded corners** - Rounded-xl cho đẹp
- **Z-index overlay** - Status box floating trên map

### Status Indicators:
- 📍 **Going to Restaurant** - Chấm vàng
- 🚀 **Delivering to Customer** - Chấm xanh
- ⏸️ **Standby** - Chấm xám

## 📊 Data Flow:

```
Appwrite Realtime → OrdersPage useEffect → setDronePosition → DeliveryTrackingMap
                                         ↓
                                   deliveryPath array (accumulate positions)
```

## 🧪 Testing:

### Bước 1: Khởi chạy
```bash
cd restaurant
npm install
npm run dev
```

### Bước 2: Test Tracking
1. Vào **Orders** page
2. Tìm order có status `delivering` hoặc `picked_up`
3. Click **"View Details"**
4. Modal hiển thị → Cuộn xuống phần **"Live Tracking"**
5. Map sẽ hiển thị:
   - 🏪 Restaurant marker
   - 🏠 Customer marker  
   - 🚁 Drone marker (real-time)
   - Đường bay màu xanh nét đứt

### Bước 3: Test Real-time
1. Mở Admin Dashboard → Drones
2. Start delivery simulation cho order
3. Quay lại Restaurant Portal
4. Xem drone marker di chuyển real-time trên map
5. Path sẽ được vẽ theo quỹ đạo drone

## 🔧 Troubleshooting:

### Map không hiển thị:
- Check console: Có lỗi Leaflet CSS không?
- Đảm bảo đã import `'leaflet/dist/leaflet.css'` trong `main.tsx`
- Kiểm tra markers có data không (console.log)

### Drone không di chuyển:
- Check Appwrite Realtime connection
- Xem console: Có nhận được drone position updates không?
- Verify `droneId` trong order có đúng không
- Check permissions: Restaurant role có Read access cho `drones` collection không

### Path không vẽ:
- Check `deliveryPath` array có data không
- Verify coordinates format: `[{ latitude, longitude }]`
- Console log path updates

## 📚 So sánh với Mobile:

| Feature | Mobile (React Native) | Restaurant (Web) |
|---------|----------------------|------------------|
| Map Library | `react-native-maps` | `react-leaflet` |
| Map Provider | Google Maps | OpenStreetMap |
| Markers | Native markers | Custom SVG icons |
| Real-time | ✅ Appwrite subscription | ✅ Appwrite subscription |
| Path tracking | ✅ Polyline | ✅ Polyline |
| Auto-fit bounds | ✅ fitToCoordinates | ✅ fitBounds |
| Delivery phases | ✅ to_restaurant, to_customer | ✅ to_restaurant, to_customer |
| Battery level | ✅ Display | ✅ Display |

## 🎯 Next Steps (Optional):

1. **ETA Calculation** - Tính toán thời gian giao hàng dự kiến
2. **Heatmap** - Vùng giao hàng thường xuyên
3. **Route optimization** - Tối ưu đường bay
4. **Multiple drones** - Tracking nhiều drone cùng lúc
5. **Playback** - Xem lại lịch sử giao hàng

## 🚀 Production Ready:

- ✅ No API keys needed (OpenStreetMap free)
- ✅ Lightweight (Leaflet ~38KB gzipped)
- ✅ Mobile responsive
- ✅ Error handling
- ✅ Loading states
- ✅ Realtime subscriptions cleanup

---

**Kết quả**: Restaurant owners giờ có thể tracking đơn hàng real-time giống như customers trong mobile app! 🎉
