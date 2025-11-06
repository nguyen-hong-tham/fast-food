# 🌟 RATING SYSTEM - QUICK START

## 📋 TÓM TẮT

Hệ thống đánh giá (rating) cho phép:
- ✅ **Khách hàng**: Đánh giá món ăn sau khi nhận hàng (1-5 sao + comment + ảnh)
- ✅ **Nhà hàng**: Xem reviews và trả lời khách hàng
- ✅ **Verified Purchase**: Badge xác nhận đã mua hàng
- ✅ **Statistics**: Tổng hợp rating trung bình, phân bố sao

---

## 🚀 QUICK SETUP (5 PHÚT)

### 1️⃣ TẠO COLLECTION TRÊN APPWRITE

```
Collection ID: reviews
```

**Attributes cần tạo:**
| Field | Type | Required |
|-------|------|----------|
| userId | string | ✅ |
| orderId | string | ✅ |
| restaurantId | string | ✅ |
| menuItemId | string | ✅ |
| rating | integer (1-5) | ✅ |
| comment | string | ❌ |
| images | string[] | ❌ |
| reply | string | ❌ |
| status | string | ❌ |

**Indexes cần tạo:**
- `menuItemId_idx` (ASC)
- `restaurantId_idx` (ASC)  
- `userId_idx` (ASC)
- `rating_idx` (DESC)

**Permissions:**
- Create: `users` (authenticated)
- Read: `any` (public)
- Update: `users` (own reviews only)
- Delete: `users`, `admin`

### 2️⃣ FILES ĐÃ TẠO SẴN

```
mobile/
├── lib/
│   └── reviews.ts                    # ✅ API helpers
├── components/
│   ├── ReviewCard.tsx                # ✅ Review display component
│   └── RatingInput.tsx               # ✅ Rating form
├── screens/
│   └── RestaurantReviewsScreen.tsx   # ✅ Restaurant portal
└── type.d.ts                         # ✅ TypeScript interfaces
```

### 3️⃣ SỬ DỤNG TRONG CODE

#### Mobile App - Khách hàng đánh giá:

```tsx
import { createReview } from '@/lib/reviews';

// Trong Order History screen
const handleRateItem = async () => {
  await createReview(userId, restaurantId, {
    orderId: 'order123',
    menuItemId: 'menu456',
    rating: 5,
    comment: 'Delicious!',
  });
};
```

#### Restaurant Portal - Xem reviews:

```tsx
import RestaurantReviewsScreen from '@/screens/RestaurantReviewsScreen';

// Trong Restaurant Dashboard
<RestaurantReviewsScreen restaurantId="restaurant123" />
```

---

## 📊 FEATURES

### Cho Khách hàng (Mobile):
- ⭐ Đánh giá món ăn (1-5 sao)
- 💬 Viết nhận xét
- 📸 Upload ảnh (optional)
- ✅ Verified Purchase badge
- 👍 Mark review as helpful

### Cho Nhà hàng (Portal):
- 📈 Xem rating trung bình
- 📊 Biểu đồ phân bố sao
- 📝 Đọc tất cả reviews
- 💬 Trả lời khách hàng
- 🔔 Notifications cho reviews mới

---

## 📖 CHI TIẾT

Xem file đầy đủ: [`docs/REVIEWS_SETUP_GUIDE.md`](./REVIEWS_SETUP_GUIDE.md)

---

## 🎯 TESTING CHECKLIST

- [ ] Tạo collection `reviews` trên Appwrite
- [ ] Config permissions đúng
- [ ] Test create review (mobile)
- [ ] Test view reviews (mobile menu detail)
- [ ] Test restaurant portal xem reviews
- [ ] Test restaurant reply
- [ ] Test average rating calculation
- [ ] Test verified purchase badge

---

## 🐛 TROUBLESHOOTING

**Lỗi "Permission denied":**
- Check collection permissions → Add `users` role với Create permission

**Review không hiển thị:**
- Check `status` field = "active"
- Check index `menuItemId_idx` đã tạo chưa

**Average rating không đúng:**
- Check query limit (mặc định 25), tăng lên 1000 để accurate

---

## 📞 SUPPORT

Nếu cần giúp đỡ, mở issue hoặc liên hệ team dev! 🚀
