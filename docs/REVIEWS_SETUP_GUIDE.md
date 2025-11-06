# 🌟 HƯỚNG DẪN CÀI ĐẶT HỆ THỐNG ĐÁNH GIÁ (RATING SYSTEM)

## 📚 MỤC LỤC
1. [Tạo Collection trên Appwrite](#1-tạo-collection-trên-appwrite)
2. [Cấu hình Permissions](#2-cấu-hình-permissions)
3. [Integration vào Mobile App](#3-integration-vào-mobile-app)
4. [Integration vào Restaurant Portal](#4-integration-vào-restaurant-portal)
5. [Testing](#5-testing)

---

## 1. TẠO COLLECTION TRÊN APPWRITE

### Bước 1.1: Tạo Collection

1. Mở **Appwrite Console**: https://cloud.appwrite.io
2. Chọn **Project** của bạn
3. **Databases** → Chọn database hiện tại
4. Click **"Create Collection"**
   - **Collection ID**: `reviews`
   - **Collection Name**: `Reviews`
   - Click **Create**

### Bước 1.2: Tạo Attributes

Click vào collection `reviews` → Tab **Attributes** → Tạo các attributes sau:

#### 1. userId (String, Required)
```
- Attribute Key: userId
- Type: String
- Size: 255
- Required: Yes
- Array: No
```

#### 2. orderId (String, Required)
```
- Attribute Key: orderId
- Type: String
- Size: 255
- Required: Yes
- Array: No
```

#### 3. restaurantId (String, Required)
```
- Attribute Key: restaurantId
- Type: String
- Size: 255
- Required: Yes
- Array: No
```

#### 4. menuItemId (String, Required)
```
- Attribute Key: menuItemId
- Type: String
- Size: 255
- Required: Yes
- Array: No
```

#### 5. rating (Integer, Required)
```
- Attribute Key: rating
- Type: Integer
- Required: Yes
- Min: 1
- Max: 5
```

#### 6. comment (String, Optional)
```
- Attribute Key: comment
- Type: String
- Size: 2000
- Required: No
- Array: No
```

#### 7. images (String Array, Optional)
```
- Attribute Key: images
- Type: String
- Size: 5000
- Required: No
- Array: Yes
```

#### 8. helpful (Integer, Optional)
```
- Attribute Key: helpful
- Type: Integer
- Required: No
- Default: 0
```

#### 9. reply (String, Optional)
```
- Attribute Key: reply
- Type: String
- Size: 1000
- Required: No
```

#### 10. repliedAt (DateTime, Optional)
```
- Attribute Key: repliedAt
- Type: DateTime
- Required: No
```

#### 11. isVerifiedPurchase (Boolean, Optional)
```
- Attribute Key: isVerifiedPurchase
- Type: Boolean
- Required: No
- Default: true
```

#### 12. status (String, Optional)
```
- Attribute Key: status
- Type: String (enum)
- Size: 50
- Required: No
- Default: "active"
- Allowed Values: active, hidden, reported
```

### Bước 1.3: Tạo Indexes

Click tab **Indexes** → **Create Index**:

#### Index 1: menuItemId
```
- Index Key: menuItemId_idx
- Type: Key
- Attributes: menuItemId
- Order: ASC
```

#### Index 2: restaurantId
```
- Index Key: restaurantId_idx
- Type: Key
- Attributes: restaurantId
- Order: ASC
```

#### Index 3: userId
```
- Index Key: userId_idx
- Type: Key
- Attributes: userId
- Order: ASC
```

#### Index 4: rating
```
- Index Key: rating_idx
- Type: Key
- Attributes: rating
- Order: DESC
```

#### Index 5: createdAt
```
- Index Key: createdAt_idx
- Type: Key
- Attributes: $createdAt
- Order: DESC
```

---

## 2. CẤU HÌNH PERMISSIONS

Click **Settings** → **Permissions**:

### Create Permission
```
- Role: users (Any authenticated user)
- Permission: Create
```
✅ Cho phép user đã login tạo review

### Read Permission
```
- Role: any (Public)
- Permission: Read
```
✅ Mọi người đều xem được reviews

### Update Permission
```
- Role: users (With conditions)
- Permission: Update
- Condition: userId === current user ID
```
✅ User chỉ sửa được review của mình

**Alternative for restaurant reply:**
```
- Role: restaurant owners
- Permission: Update (reply field only)
```

### Delete Permission
```
- Role: users (Own reviews only)
- Role: admin (All reviews)
- Permission: Delete
```

---

## 3. INTEGRATION VÀO MOBILE APP

### Bước 3.1: Thêm Review vào Order History

File: `mobile/app/order-history.tsx`

```tsx
import { hasUserReviewedItem } from '@/lib/reviews';
import { router } from 'expo-router';

// Trong component OrderHistoryScreen
const handleRateItem = async (order: Order, item: OrderItem) => {
  // Check if already reviewed
  const hasReviewed = await hasUserReviewedItem(
    user.$id,
    order.$id,
    item.menuItemId
  );

  if (hasReviewed) {
    Alert.alert('Already Reviewed', 'You have already reviewed this item');
    return;
  }

  // Navigate to rating screen
  router.push({
    pathname: '/rate-item',
    params: {
      orderId: order.$id,
      restaurantId: order.restaurantId,
      menuItemId: item.menuItemId,
      menuItemName: item.name,
    },
  });
};

// Add "Rate" button in order items
<TouchableOpacity
  className="bg-amber-500 rounded-xl px-4 py-2"
  onPress={() => handleRateItem(order, item)}
>
  <Text className="text-sm font-quicksand-bold text-white">
    Rate Item
  </Text>
</TouchableOpacity>
```

### Bước 3.2: Tạo màn hình Rating

File: `mobile/app/rate-item.tsx`

```tsx
import { useLocalSearchParams } from 'expo-router';
import RatingInput from '@/components/RatingInput';

const RateItemScreen = () => {
  const params = useLocalSearchParams();

  return (
    <RatingInput
      orderId={params.orderId as string}
      restaurantId={params.restaurantId as string}
      menuItemId={params.menuItemId as string}
      menuItemName={params.menuItemName as string}
      onSuccess={() => {
        console.log('Review submitted successfully');
      }}
    />
  );
};

export default RateItemScreen;
```

### Bước 3.3: Hiển thị Reviews trong Menu Detail

File: `mobile/app/menu-detail.tsx`

```tsx
import { getReviewsWithUserInfo, getMenuItemAverageRating } from '@/lib/reviews';
import ReviewCard from '@/components/ReviewCard';

const MenuDetailScreen = () => {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [rating, setRating] = useState({ average: 0, total: 0 });

  useEffect(() => {
    const loadReviews = async () => {
      const [reviewsData, ratingData] = await Promise.all([
        getReviewsWithUserInfo(menuItemId, 10),
        getMenuItemAverageRating(menuItemId),
      ]);

      setReviews(reviewsData);
      setRating(ratingData);
    };

    loadReviews();
  }, [menuItemId]);

  return (
    <ScrollView>
      {/* Existing menu detail content */}

      {/* Rating Summary */}
      <View className="px-5 py-4">
        <View className="flex-row items-center mb-4">
          <Text className="text-3xl font-quicksand-bold text-gray-900 mr-2">
            {rating.average.toFixed(1)}
          </Text>
          <View>
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  className={`text-lg ${
                    star <= Math.round(rating.average)
                      ? 'text-amber-400'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </Text>
              ))}
            </View>
            <Text className="text-sm text-gray-500">
              {rating.total} reviews
            </Text>
          </View>
        </View>

        {/* Reviews List */}
        <Text className="text-lg font-quicksand-bold text-gray-900 mb-3">
          Customer Reviews
        </Text>
        {reviews.map((review) => (
          <ReviewCard key={review.$id} review={review} />
        ))}

        {reviews.length === 0 && (
          <Text className="text-sm text-gray-500 text-center py-8">
            No reviews yet. Be the first to review!
          </Text>
        )}
      </View>
    </ScrollView>
  );
};
```

---

## 4. INTEGRATION VÀO RESTAURANT PORTAL

### Bước 4.1: Thêm Reviews Tab vào Restaurant Dashboard

File: `restaurant/src/pages/Dashboard.tsx` hoặc tương đương

```tsx
import { Link } from 'react-router-dom';

<Link
  to="/reviews"
  className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition"
>
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">
        Customer Reviews
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        View and respond to customer feedback
      </p>
    </div>
    <div className="text-3xl">⭐</div>
  </div>
</Link>
```

### Bước 4.2: Tạo Reviews Page

File: `restaurant/src/pages/Reviews.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import {
  getRestaurantReviews,
  getRestaurantReviewsSummary,
  replyToReview,
} from '../lib/reviews'; // Copy from mobile/lib/reviews.ts

const ReviewsPage = () => {
  const restaurantId = 'YOUR_RESTAURANT_ID'; // Get from auth context
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reviewsData, summaryData] = await Promise.all([
        getRestaurantReviews(restaurantId),
        getRestaurantReviewsSummary(restaurantId),
      ]);

      setReviews(reviewsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId, replyText) => {
    try {
      await replyToReview(reviewId, replyText);
      alert('Reply posted successfully!');
      loadData(); // Reload
    } catch (error) {
      alert('Failed to post reply');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Reviews</h1>

      {/* Summary Card */}
      <div className="bg-white rounded-lg p-6 shadow mb-6">
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900">
              {summary?.average?.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {summary?.total} reviews
            </div>
          </div>

          <div className="flex-1">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center mb-2">
                <span className="text-sm w-8">{star}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{
                      width: `${
                        summary?.total > 0
                          ? (summary.distribution[star] / summary.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <span className="text-sm w-12 text-right">
                  {summary?.distribution?.[star] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.$id} className="bg-white rounded-lg p-6 shadow">
            {/* Review content */}
            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="font-semibold">{review.user?.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(review.$createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= review.rating
                          ? 'text-amber-400'
                          : 'text-gray-300'
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>

                <p className="text-gray-700 mb-4">{review.comment}</p>

                {/* Reply section */}
                {review.reply ? (
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                    <div className="font-semibold text-sm mb-1">
                      Your Response
                    </div>
                    <p className="text-gray-700">{review.reply}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const reply = prompt('Enter your reply:');
                      if (reply) handleReply(review.$id, reply);
                    }}
                    className="text-blue-600 text-sm font-semibold hover:underline"
                  >
                    Reply to this review
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;
```

---

## 5. TESTING

### 5.1: Test Flow cho Khách hàng (Mobile App)

1. **Đăng nhập** với tài khoản customer
2. **Đặt hàng** và chờ order status = `delivered`
3. Vào **Order History** → chọn order đã delivered
4. Click **"Rate Item"** button trên món ăn
5. **Chọn số sao** (1-5)
6. **Viết comment** (optional)
7. Click **"Submit Review"**
8. Verify review xuất hiện trong **Menu Detail** screen

### 5.2: Test Flow cho Nhà hàng (Restaurant Portal)

1. **Đăng nhập** với tài khoản restaurant owner
2. Vào trang **"Reviews"**
3. Xem **rating summary** (average, distribution)
4. Xem **list reviews** từ khách hàng
5. Click **"Reply"** button trên 1 review
6. **Viết reply** và submit
7. Verify reply xuất hiện dưới review

### 5.3: Test Cases

- ✅ User không thể review món chưa mua
- ✅ User không thể review cùng món 2 lần trong 1 order
- ✅ Rating phải từ 1-5
- ✅ Average rating được tính đúng
- ✅ Distribution chart hiển thị đúng
- ✅ Restaurant chỉ reply được reviews của mình
- ✅ Reply hiển thị với timestamp

---

## 6. OPTIONAL ENHANCEMENTS

### 6.1: Upload ảnh trong review
- Sử dụng Appwrite Storage để upload
- Lưu URL vào `images` array

### 6.2: Mark review as helpful
- Implement counter cho "helpful"
- Sort reviews theo helpful count

### 6.3: Report review
- Thêm button "Report"
- Update status = "reported"
- Admin review reported items

### 6.4: Filter & Sort reviews
- Filter by rating (5★, 4★, etc.)
- Sort by: Most Recent, Most Helpful, Highest Rating

---

## 🎉 HOÀN THÀNH!

Bây giờ bạn đã có:
- ✅ Collection `reviews` trên Appwrite
- ✅ API helpers đầy đủ
- ✅ UI components cho mobile
- ✅ Restaurant portal để xem và reply reviews
- ✅ Verified purchase badge
- ✅ Rating summary & statistics

**Happy Coding! 🚀**
