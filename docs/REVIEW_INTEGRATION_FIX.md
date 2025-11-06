# ✅ ĐÃ SỬA: TÍCH HỢP REVIEW VÀO ORDER HISTORY

## 🔍 VẤN ĐỀ

Bạn đã setup xong Appwrite collection `reviews`, nhưng khi đặt hàng xong và nhà hàng giao xong, **KHÔNG có nút review xuất hiện**.

### Nguyên nhân:
- ❌ Component `OrderCard.tsx` CHƯA có logic hiển thị nút "Rate Restaurant"
- ❌ Chưa có màn hình `/rate-restaurant`
- ❌ Chưa có kiểm tra xem order đã được review chưa

---

## ✅ ĐÃ SỬA

### 1. Tạo màn hình Rate Restaurant
**File**: `mobile/app/rate-restaurant.tsx` ✨ **MỚI**

```tsx
import RestaurantRatingInput from '@/components/RestaurantRatingInput';
import CustomHeader from '@/components/CustomHeader';

const RateRestaurantScreen = () => {
  const params = useLocalSearchParams();

  return (
    <View className="flex-1 bg-gray-50">
      <CustomHeader title="Rate Restaurant" showBackButton />
      <RestaurantRatingInput
        orderId={params.orderId}
        restaurantId={params.restaurantId}
        restaurantName={params.restaurantName || 'Restaurant'}
        onSuccess={() => console.log('Review submitted')}
      />
    </View>
  );
};
```

---

### 2. Cập nhật OrderCard Component
**File**: `mobile/components/OrderCard.tsx` 🔧 **CẬP NHẬT**

**Thêm imports**:
```tsx
import { hasUserReviewedOrder } from '@/lib/restaurant-reviews';
import useAuthStore from '@/store/auth.store';
```

**Thêm state để check review**:
```tsx
const { user } = useAuthStore();
const [hasReviewed, setHasReviewed] = useState(false);
const [checkingReview, setCheckingReview] = useState(true);

useEffect(() => {
  const checkReview = async () => {
    if (order.status === 'delivered' && user?.$id) {
      const reviewed = await hasUserReviewedOrder(user.$id, order.$id);
      setHasReviewed(reviewed);
    }
    setCheckingReview(false);
  };
  
  checkReview();
}, [order.$id, order.status, user?.$id]);
```

**Thêm handler để navigate đến review screen**:
```tsx
const handleRateRestaurant = useCallback(async () => {
  if (!user?.$id) {
    Alert.alert('Error', 'You must be logged in to rate');
    return;
  }

  if (hasReviewed) {
    Alert.alert('Already Reviewed', 'You have already reviewed this order');
    return;
  }

  router.push({
    pathname: '/rate-restaurant',
    params: {
      orderId: order.$id,
      restaurantId: order.restaurantId || '',
      restaurantName: 'Restaurant',
    },
  });
}, [order.$id, order.restaurantId, user?.$id, hasReviewed]);
```

**Thêm nút "Rate Restaurant" (chỉ hiển thị với delivered orders)**:
```tsx
{/* Rate Restaurant Button - Only show for delivered orders */}
{order.status === 'delivered' && !checkingReview && (
  <View className="mt-3 pt-3 border-t border-gray-100">
    <TouchableOpacity
      className={`rounded-xl py-3 flex-row items-center justify-center ${
        hasReviewed ? 'bg-gray-200' : 'bg-amber-500'
      }`}
      onPress={handleRateRestaurant}
      disabled={hasReviewed}
      activeOpacity={0.8}
    >
      <Text className="text-lg mr-2">⭐</Text>
      <Text className={`paragraph-semibold ${
        hasReviewed ? 'text-gray-500' : 'text-white'
      }`}>
        {hasReviewed ? 'Already Reviewed' : 'Rate This Restaurant'}
      </Text>
    </TouchableOpacity>
  </View>
)}
```

---

### 3. Sửa import path trong RestaurantRatingInput
**File**: `mobile/components/RestaurantRatingInput.tsx` 🔧 **CẬP NHẬT**

**Trước**:
```tsx
import { useAuthStore } from '@/store/authStore'; // ❌ Sai path
```

**Sau**:
```tsx
import useAuthStore from '@/store/auth.store'; // ✅ Đúng path
```

---

## 🎯 KẾT QUẢ

Bây giờ khi bạn:

1. ✅ **Đặt hàng thành công**
2. ✅ **Nhà hàng confirm và prepare**
3. ✅ **Drone giao hàng**
4. ✅ **Status chuyển sang `delivered`**

Trong **Order History** → Order card sẽ hiển thị:

```
┌─────────────────────────────────────┐
│ Order #ABC123                       │
│ Jan 5, 2025, 10:30 AM               │
│                                     │
│ 🛍️ 3 items • VNPay                 │
│ 📍 123 Nguyen Van Linh              │
│                                     │
│ 150,000₫        View Details →     │
│ ─────────────────────────────────  │
│ ⭐ Rate This Restaurant             │ ← NÚT MỚI
└─────────────────────────────────────┘
```

**Click vào nút** → Mở màn hình đánh giá với:
- Overall Rating (1-5 sao, bắt buộc)
- Food Quality (1-5 sao, tùy chọn)
- Delivery Speed (1-5 sao, tùy chọn)
- Service (1-5 sao, tùy chọn)
- Comment (văn bản, tùy chọn)

**Submit** → Review được lưu vào Appwrite → Nút chuyển thành "Already Reviewed" (xám, disabled)

---

## 🔒 DUPLICATE PREVENTION

- ✅ Khi order card render, tự động check `hasUserReviewedOrder()`
- ✅ Nếu đã review → Nút hiển thị "Already Reviewed" (disabled)
- ✅ Nếu chưa review → Nút hiển thị "Rate This Restaurant" (active)
- ✅ Không thể review cùng 1 order 2 lần

---

## 🧪 CÁCH TEST

### Test Case 1: Order chưa delivered
1. Đặt hàng mới
2. Vào Order History
3. **Expected**: KHÔNG thấy nút "Rate Restaurant"

### Test Case 2: Order đã delivered, chưa review
1. Đợi order status = `delivered`
2. Vào Order History
3. **Expected**: Thấy nút "Rate This Restaurant" (màu vàng)
4. Click vào nút
5. **Expected**: Mở màn hình rating
6. Đánh giá 5 sao, viết comment, submit
7. **Expected**: Alert "Thank You!" → Quay lại Order History
8. **Expected**: Nút chuyển thành "Already Reviewed" (xám, disabled)

### Test Case 3: Order đã reviewed
1. Vào Order History
2. **Expected**: Nút hiển thị "Already Reviewed" (xám)
3. Click vào nút
4. **Expected**: Alert "You have already reviewed this order"

---

## 📁 CÁC FILE ĐÃ THAY ĐỔI

| File | Thay đổi | Status |
|------|----------|--------|
| `mobile/app/rate-restaurant.tsx` | Tạo màn hình rating | ✨ Mới |
| `mobile/components/OrderCard.tsx` | Thêm nút rate + logic check reviewed | 🔧 Cập nhật |
| `mobile/components/RestaurantRatingInput.tsx` | Sửa import path | 🔧 Cập nhật |

---

## ⚠️ LƯU Ý

### Về restaurantName
Order hiện tại **KHÔNG có field `restaurantName`**, chỉ có `restaurantId`.

**Tạm thời**: Dùng placeholder "Restaurant"

**Cải tiến sau**: Fetch restaurant name từ API:
```tsx
// TODO: Fetch restaurant info
const restaurant = await databases.getDocument(
  appwriteConfig.databaseId,
  appwriteConfig.restaurantsCollectionId,
  order.restaurantId
);
```

---

## ✅ CHECKLIST HOÀN THÀNH

- [x] Tạo màn hình `/rate-restaurant`
- [x] Thêm nút "Rate Restaurant" vào OrderCard
- [x] Chỉ hiển thị với delivered orders
- [x] Check duplicate (đã review thì disable)
- [x] Navigate đến rating screen với đúng params
- [x] Sửa import paths
- [x] Test compile - KHÔNG có lỗi

---

## 🎉 HOÀN THÀNH!

Bây giờ hệ thống review đã được tích hợp hoàn chỉnh!

**Hãy test thử**:
1. Đặt 1 order mới
2. Chờ status = `delivered`
3. Vào Order History
4. Click "Rate This Restaurant"
5. Đánh giá và submit

**Nếu có vấn đề, hãy báo ngay! 🚀**
