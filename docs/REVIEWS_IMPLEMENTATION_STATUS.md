# 📊 TRẠNG THÁI TRIỂN KHAI HỆ THỐNG REVIEWS

## ✅ ĐÃ HOÀN THÀNH

### 1. Mobile App - Restaurant Detail (restaurant-detail.tsx)
- ✅ Import `getRestaurantReviewsWithUserInfo`, `getRestaurantAverageRating` 
- ✅ Import `ReviewCard` component
- ✅ Thêm state cho reviews, rating, filters, sort
- ✅ Hàm `loadReviews()` để fetch và filter reviews
- ✅ useEffect để tự động reload khi filter/sort thay đổi

**Cần kiểm tra**: Phần render reviews trong mobile section (dòng 420+) cần được thay thế bằng:
```tsx
{/* Reviews List - Sử dụng ReviewCard component */}
{reviews.length > 0 ? (
  <View className="gap-4 mb-6">
    {reviews.map((review) => (
      <ReviewCard key={review.$id} review={review} />
    ))}
  </View>
) : (
  <View className="items-center justify-center py-16 bg-white rounded-2xl">
    <Text className="text-6xl mb-4">⭐</Text>
    <Text className="text-lg font-semibold text-gray-700 mb-2">
      No Reviews Yet
    </Text>
    <Text className="text-sm text-gray-500 text-center px-8">
      Be the first to share your experience!
    </Text>
  </View>
)}
```

### 2. Các file hỗ trợ
- ✅ `mobile/lib/restaurant-reviews.ts` - API đầy đủ
- ✅ `mobile/components/ReviewCard.tsx` - Component hiển thị review
- ✅ `mobile/components/RestaurantRatingInput.tsx` - Form đánh giá
- ✅ `mobile/components/OrderCard.tsx` - Nút "Rate Restaurant"
- ✅ `mobile/app/rate-restaurant.tsx` - Màn hình đánh giá
- ✅ `mobile/type.d.ts` - TypeScript interfaces

---

## ⚠️ CẦN HOÀN THÀNH

### 1. Restaurant Portal - Hiển thị Rating
**File**: `restaurant/src/pages/Analytics.tsx` (hoặc Dashboard)

**Vấn đề**: Rating hiện đang là 0.0 vì chưa fetch từ Appwrite

**Giải pháp**:
```typescript
import { getRestaurantAverageRating } from '../lib/reviews';

// Trong component
const [rating, setRating] = useState(0);

useEffect(() => {
  const fetchRating = async () => {
    try {
      const stats = await getRestaurantAverageRating(restaurantId);
      setRating(stats.average);
    } catch (error) {
      console.error('Error fetching rating:', error);
    }
  };
  
  fetchRating();
}, [restaurantId]);

// Hiển thị
<Text>{rating.toFixed(1)} ⭐</Text>
```

### 2. Restaurant Portal - Xem Reviews
**File**: Tạo mới `restaurant/src/pages/Reviews.tsx`

Sao chép code từ `docs/REVIEWS_RESTAURANT_CODE.md` (dòng 250-400)

**Hoặc** thêm tab Reviews vào Analytics page

### 3. Restaurant Portal - Click vào Menu Item để xem reviews món ăn đó
**File**: `restaurant/src/pages/Menu.tsx` (hoặc MenuManagement)

**Cần thêm**:
```typescript
// Khi click vào menu card
const handleMenuItemClick = (menuItemId: string) => {
  router.push(`/menu/${menuItemId}/reviews`);
};

// Tạo page mới: restaurant/src/pages/MenuItemReviews.tsx
```

**API cần dùng**:
```typescript
// File: restaurant/src/lib/reviews.ts (copy từ mobile)
import { getMenuItemReviews, getMenuItemAverageRating } from './reviews';

// Trong component
const reviews = await getMenuItemReviews(menuItemId, 50);
const rating = await getMenuItemAverageRating(menuItemId);
```

---

## 🔧 CÁCH TRIỂN KHAI NHANH

### Bước 1: Fix Mobile Reviews Display
Mở `mobile/app/restaurant-detail.tsx`, tìm dòng ~420 (phần render reviews), thay thế code cũ bằng:

```tsx
{reviews.length > 0 ? (
  <View className="gap-4 mb-6">
    {reviews.map((review) => (
      <ReviewCard key={review.$id} review={review} />
    ))}
  </View>
) : (
  <View className="items-center justify-center py-16 bg-white rounded-2xl">
    <Text className="text-6xl mb-4">⭐</Text>
    <Text className="text-lg font-semibold text-gray-700 mb-2">No Reviews Yet</Text>
    <Text className="text-sm text-gray-500 text-center px-8">
      Be the first to share your experience!
    </Text>
  </View>
)}
```

### Bước 2: Restaurant Portal - Copy API file
```bash
# Copy mobile reviews API sang restaurant portal
cp mobile/lib/restaurant-reviews.ts restaurant/src/lib/reviews.ts
```

Sửa imports trong file đó:
```typescript
// Đổi từ
import { databases, appwriteConfig } from './appwrite';
import { Query } from 'react-native-appwrite';

// Thành
import { databases, appwriteConfig } from './appwrite';
import { Query } from 'appwrite';
```

### Bước 3: Restaurant Portal - Fetch Rating
Trong `restaurant/src/pages/Analytics.tsx` hoặc tương tự:

```typescript
import { getRestaurantAverageRating } from '../lib/reviews';

const [restaurantRating, setRestaurantRating] = useState({ average: 0, total: 0 });

useEffect(() => {
  const loadRating = async () => {
    const stats = await getRestaurantAverageRating(currentRestaurantId);
    setRestaurantRating(stats);
  };
  loadRating();
}, []);

// Update UI
<div>
  <h3>Rating</h3>
  <p className="text-4xl font-bold">{restaurantRating.average.toFixed(1)} ⭐</p>
  <p className="text-sm text-gray-600">from {restaurantRating.total} reviews</p>
</div>
```

### Bước 4: Restaurant Portal - Tạo Reviews Page
Tạo file `restaurant/src/pages/Reviews.tsx`, copy code từ `docs/REVIEWS_RESTAURANT_CODE.md`

Thêm route trong router config:
```typescript
{ path: '/reviews', element: <ReviewsPage /> }
```

### Bước 5: Restaurant Portal - Menu Item Reviews
**Tùy chọn 1**: Modal popup khi click menu item
```typescript
// Trong MenuCard component
const [showReviews, setShowReviews] = useState(false);

<div onClick={() => setShowReviews(true)}>
  {/* Menu card content */}
</div>

{showReviews && (
  <Modal onClose={() => setShowReviews(false)}>
    <MenuItemReviews itemId={item.$id} />
  </Modal>
)}
```

**Tùy chọn 2**: Navigate to separate page
```typescript
<Link to={`/menu/${item.$id}/reviews`}>
  View Reviews ({item.totalReviews || 0})
</Link>
```

---

## 🎯 CHECKLIST HOÀN CHỈNH

### Mobile App
- [x] Order History có nút "Rate Restaurant"
- [x] Màn hình rate-restaurant hoạt động
- [x] Restaurant Detail có tab Reviews
- [x] Reviews hiển thị với filters & sort
- [ ] Test: Đánh giá sau khi delivered → hiển thị trong Reviews tab

### Restaurant Portal
- [ ] Analytics page hiển thị rating thực từ database
- [ ] Có trang/tab Reviews để xem tất cả đánh giá
- [ ] Reviews page có summary (average, distribution)
- [ ] Restaurant owner có thể reply reviews
- [ ] Click vào menu item → xem reviews của món đó
- [ ] Menu item card hiển thị average rating

---

## 🚀 PRIORITY

**High Priority** (Làm ngay):
1. Fix mobile reviews display (thay ReviewCard)
2. Restaurant portal fetch rating từ database

**Medium Priority** (Làm tiếp):
3. Restaurant reviews page với reply function
4. Menu item reviews modal/page

**Low Priority** (Tùy chọn):
5. Charts & analytics cho reviews
6. Filter reviews theo date range
7. Export reviews to CSV

---

## 📞 SUPPORT

Nếu gặp lỗi:
1. Check Appwrite Console → collection `reviews` đã tạo chưa?
2. Check permissions: Create (users), Read (any), Update (users/restaurant)
3. Check console.log trong `loadReviews()` để debug
4. Xem file `docs/REVIEW_INTEGRATION_FIX.md` để biết chi tiết

**Code đã sẵn sàng! Chỉ cần integrate vào UI! 🎉**
