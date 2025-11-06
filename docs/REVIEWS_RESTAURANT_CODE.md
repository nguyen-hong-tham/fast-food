# 🎯 HỆ THỐNG ĐÁNH GIÁ NHÀ HÀNG - CODE INTEGRATION

## 📋 TÓM TẮT

Hệ thống đánh giá nhà hàng đã được cập nhật để thỏa mãn yêu cầu:
- ✅ Đánh giá 3 tiêu chí: **Chất lượng món ăn**, **Tốc độ giao hàng**, **Dịch vụ**
- ✅ Điểm tổng thể (Overall Rating)
- ✅ Mỗi đơn hàng chỉ được đánh giá 1 lần
- ✅ Tự động tính và cập nhật điểm trung bình của nhà hàng
- ✅ Hiển thị reviews trên trang chi tiết nhà hàng
- ✅ Nhà hàng có thể phản hồi reviews

---

## 📂 CÁC FILE ĐÃ TẠO

### 1. API Layer
**File**: `mobile/lib/restaurant-reviews.ts`

Chứa tất cả các hàm API:
- `createRestaurantReview()` - Tạo review mới
- `getRestaurantReviews()` - Lấy reviews của nhà hàng
- `getRestaurantReviewsWithUserInfo()` - Lấy reviews kèm thông tin user
- `hasUserReviewedOrder()` - Kiểm tra đã review chưa
- `getRestaurantAverageRating()` - Tính điểm trung bình
- `updateRestaurantAverageRating()` - Cập nhật điểm vào collection restaurants
- `replyToReview()` - Nhà hàng trả lời review
- `getFilteredRestaurantReviews()` - Filter và sort reviews

### 2. UI Component
**File**: `mobile/components/RestaurantRatingInput.tsx`

Component form để đánh giá nhà hàng với:
- 4 mục đánh giá (Overall, Food Quality, Delivery Speed, Service)
- Nhập nhận xét (tối đa 500 ký tự)
- Upload ảnh (coming soon)
- Validation và loading states

### 3. Documentation
**File**: `docs/REVIEWS_RESTAURANT_SETUP.md`

Hướng dẫn chi tiết:
- Tạo collection trên Appwrite Console
- Giải thích tại sao dùng String thay vì Relationship
- Cấu hình permissions
- Checklist hoàn thành

---

## 🚀 HƯỚNG DẪN SỬ DỤNG

### Bước 1: Setup Appwrite Collection

Làm theo hướng dẫn trong `docs/REVIEWS_RESTAURANT_SETUP.md`:

1. Tạo collection `reviews`
2. Tạo 11 attributes (userId, restaurantId, orderId, overallRating, foodQuality, deliverySpeed, service, comment, images, isVisible, restaurantResponse)
3. Tạo 5 indexes
4. Cấu hình permissions

---

### Bước 2: Thêm vào Order History

**File**: `mobile/app/order-history.tsx`

```tsx
import { hasUserReviewedOrder } from '@/lib/restaurant-reviews';
import { router } from 'expo-router';

// Trong component OrderHistoryScreen
const handleRateRestaurant = async (order: Order) => {
  // Check if already reviewed
  const hasReviewed = await hasUserReviewedOrder(user.$id, order.$id);

  if (hasReviewed) {
    Alert.alert('Already Reviewed', 'You have already reviewed this order');
    return;
  }

  // Navigate to rating screen
  router.push({
    pathname: '/rate-restaurant',
    params: {
      orderId: order.$id,
      restaurantId: order.restaurantId,
      restaurantName: order.restaurantName, // Nếu có
    },
  });
};

// Trong render của order item (chỉ hiển thị nếu status = 'delivered')
{order.status === 'delivered' && (
  <TouchableOpacity
    className="bg-amber-500 rounded-xl px-6 py-3 mt-4"
    onPress={() => handleRateRestaurant(order)}
  >
    <Text className="text-base font-quicksand-bold text-white text-center">
      ⭐ Rate This Restaurant
    </Text>
  </TouchableOpacity>
)}
```

---

### Bước 3: Tạo màn hình Rating

**File**: `mobile/app/rate-restaurant.tsx`

```tsx
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import RestaurantRatingInput from '@/components/RestaurantRatingInput';
import CustomHeader from '@/components/CustomHeader';

const RateRestaurantScreen = () => {
  const params = useLocalSearchParams();

  return (
    <View className="flex-1 bg-gray-50">
      <CustomHeader title="Rate Restaurant" showBackButton />

      <RestaurantRatingInput
        orderId={params.orderId as string}
        restaurantId={params.restaurantId as string}
        restaurantName={params.restaurantName as string}
        onSuccess={() => {
          console.log('Review submitted successfully');
          // Optionally show a success toast
        }}
      />
    </View>
  );
};

export default RateRestaurantScreen;
```

---

### Bước 4: Hiển thị Reviews trong Restaurant Detail

**File**: `mobile/app/restaurant-detail.tsx`

```tsx
import {
  getRestaurantReviewsWithUserInfo,
  getRestaurantAverageRating,
} from '@/lib/restaurant-reviews';
import ReviewCard from '@/components/ReviewCard'; // Reuse existing component

const RestaurantDetailScreen = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    averageByCategory: {
      foodQuality: 0,
      deliverySpeed: 0,
      service: 0,
    },
  });

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const [reviewsData, ratingData] = await Promise.all([
          getRestaurantReviewsWithUserInfo(restaurantId, 10),
          getRestaurantAverageRating(restaurantId),
        ]);

        setReviews(reviewsData);
        setRating(ratingData);
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };

    loadReviews();
  }, [restaurantId]);

  return (
    <ScrollView>
      {/* Existing restaurant info */}

      {/* Rating Summary Card */}
      <View className="bg-white px-5 py-6 mt-2">
        <Text className="text-xl font-quicksand-bold text-gray-900 mb-4">
          Customer Reviews
        </Text>

        <View className="flex-row items-center mb-6">
          {/* Overall Rating */}
          <View className="items-center mr-8">
            <Text className="text-5xl font-quicksand-bold text-gray-900">
              {rating.average.toFixed(1)}
            </Text>
            <View className="flex-row mt-2">
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
            <Text className="text-sm font-quicksand text-gray-600 mt-1">
              {rating.total} reviews
            </Text>
          </View>

          {/* Category Ratings */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-quicksand text-gray-700">
                Food Quality
              </Text>
              <Text className="text-sm font-quicksand-bold text-gray-900">
                {rating.averageByCategory.foodQuality.toFixed(1)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-quicksand text-gray-700">
                Delivery Speed
              </Text>
              <Text className="text-sm font-quicksand-bold text-gray-900">
                {rating.averageByCategory.deliverySpeed.toFixed(1)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-quicksand text-gray-700">
                Service
              </Text>
              <Text className="text-sm font-quicksand-bold text-gray-900">
                {rating.averageByCategory.service.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Distribution Chart */}
        <View className="mb-6">
          {[5, 4, 3, 2, 1].map((star) => (
            <View key={star} className="flex-row items-center mb-2">
              <Text className="text-sm font-quicksand text-gray-700 w-8">
                {star}★
              </Text>
              <View className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                <View
                  className="bg-amber-400 h-full rounded-full"
                  style={{
                    width: `${
                      rating.total > 0
                        ? (rating.distribution[star as 1 | 2 | 3 | 4 | 5] /
                            rating.total) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </View>
              <Text className="text-sm font-quicksand text-gray-600 w-10 text-right">
                {rating.distribution[star as 1 | 2 | 3 | 4 | 5]}
              </Text>
            </View>
          ))}
        </View>

        {/* Reviews List */}
        <View>
          {reviews.map((review) => (
            <ReviewCard key={review.$id} review={review} />
          ))}
        </View>

        {reviews.length === 0 && (
          <Text className="text-sm font-quicksand text-gray-500 text-center py-8">
            No reviews yet. Be the first to review!
          </Text>
        )}
      </View>
    </ScrollView>
  );
};
```

---

### Bước 5: Restaurant Portal (Xem & Trả lời Reviews)

**File**: `restaurant/src/pages/Reviews.tsx` (Web - React)

```tsx
import React, { useEffect, useState } from 'react';
import {
  getRestaurantReviews,
  getRestaurantAverageRating,
  replyToReview,
} from '../lib/restaurant-reviews'; // Copy API từ mobile

const ReviewsPage = () => {
  const restaurantId = 'YOUR_RESTAURANT_ID'; // Get from auth context
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(null);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reviewsData, ratingData] = await Promise.all([
        getRestaurantReviews(restaurantId),
        getRestaurantAverageRating(restaurantId),
      ]);

      setReviews(reviewsData);
      setRating(ratingData);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleReply = async (reviewId) => {
    try {
      await replyToReview(reviewId, replyText[reviewId]);
      alert('Reply posted successfully!');
      setReplyText({ ...replyText, [reviewId]: '' });
      loadData();
    } catch (error) {
      alert('Failed to post reply');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Customer Reviews</h1>

      {/* Rating Summary */}
      {rating && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-start space-x-8">
            {/* Overall Score */}
            <div className="text-center">
              <div className="text-6xl font-bold text-gray-900">
                {rating.average.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {rating.total} reviews
              </div>
            </div>

            {/* Category Scores */}
            <div className="flex-1">
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Food Quality</span>
                  <span className="text-sm font-bold">
                    {rating.averageByCategory.foodQuality.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{
                      width: `${(rating.averageByCategory.foodQuality / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Delivery Speed</span>
                  <span className="text-sm font-bold">
                    {rating.averageByCategory.deliverySpeed.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{
                      width: `${(rating.averageByCategory.deliverySpeed / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Service</span>
                  <span className="text-sm font-bold">
                    {rating.averageByCategory.service.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{
                      width: `${(rating.averageByCategory.service / 5) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Distribution */}
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center mb-2">
                  <span className="text-sm w-8">{star}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{
                        width: `${
                          rating.total > 0
                            ? (rating.distribution[star] / rating.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm w-12 text-right">
                    {rating.distribution[star]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.$id} className="bg-white rounded-lg shadow p-6">
            {/* Review Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-lg">
                  {review.user?.name || 'Anonymous'}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.$createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-500">
                  {review.overallRating}/5
                </div>
              </div>
            </div>

            {/* Category Ratings */}
            <div className="flex space-x-6 mb-4 text-sm">
              {review.foodQuality && (
                <div>
                  <span className="text-gray-600">Food:</span>{' '}
                  <span className="font-semibold">{review.foodQuality}/5</span>
                </div>
              )}
              {review.deliverySpeed && (
                <div>
                  <span className="text-gray-600">Delivery:</span>{' '}
                  <span className="font-semibold">{review.deliverySpeed}/5</span>
                </div>
              )}
              {review.service && (
                <div>
                  <span className="text-gray-600">Service:</span>{' '}
                  <span className="font-semibold">{review.service}/5</span>
                </div>
              )}
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-gray-700 mb-4">{review.comment}</p>
            )}

            {/* Restaurant Response */}
            {review.restaurantResponse ? (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <div className="font-semibold text-sm text-blue-900 mb-1">
                  Your Response:
                </div>
                <p className="text-gray-800">{review.restaurantResponse}</p>
              </div>
            ) : (
              <div className="border-t pt-4 mt-4">
                <textarea
                  className="w-full border rounded-lg p-3 text-sm mb-2"
                  rows={3}
                  placeholder="Write a response to this review..."
                  value={replyText[review.$id] || ''}
                  onChange={(e) =>
                    setReplyText({ ...replyText, [review.$id]: e.target.value })
                  }
                />
                <button
                  onClick={() => handleReply(review.$id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
                  disabled={!replyText[review.$id]?.trim()}
                >
                  Post Reply
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;
```

---

## ✅ CHECKLIST INTEGRATION

- [ ] Đã tạo collection `reviews` trên Appwrite (theo `REVIEWS_RESTAURANT_SETUP.md`)
- [ ] Đã thêm nút "Rate Restaurant" trong Order History (chỉ hiển thị với delivered orders)
- [ ] Đã tạo route `/rate-restaurant` với component `RestaurantRatingInput`
- [ ] Đã hiển thị reviews trong Restaurant Detail screen
- [ ] Đã tạo Reviews page cho Restaurant Portal
- [ ] Đã test tạo review thành công
- [ ] Đã test duplicate prevention (không thể review 2 lần)
- [ ] Đã test tính điểm trung bình tự động
- [ ] Đã test restaurant response

---

## 🎉 HOÀN THÀNH!

Hệ thống đánh giá nhà hàng đã sẵn sàng với đầy đủ các tính năng:
- ✅ 3 tiêu chí đánh giá (Food, Delivery, Service)
- ✅ Điểm tổng thể tự động
- ✅ Prevent duplicate reviews
- ✅ Auto-update restaurant rating
- ✅ Restaurant can reply to reviews
- ✅ Statistics dashboard

**Nếu cần hỗ trợ thêm, hãy hỏi! 🚀**
