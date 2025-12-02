/**
 * RESTAURANT REVIEWS API
 * Hệ thống đánh giá nhà hàng sau khi hoàn tất đơn hàng
 * 
 * Features:
 * - Đánh giá 3 tiêu chí: Chất lượng món ăn, Tốc độ giao hàng, Dịch vụ
 * - Tự động tính điểm trung bình
 * - Prevent duplicate reviews (1 order = 1 review)
 * - Restaurant response
 */

import { databases, appwriteConfig } from './appwrite';
import { Query } from 'react-native-appwrite';
import { Review } from '@/type';

// ===================== CREATE REVIEW =====================

/**
 * Tạo review cho nhà hàng sau khi hoàn tất đơn hàng
 * @param userId - ID của người dùng
 * @param restaurantId - ID của nhà hàng
 * @param orderId - ID của đơn hàng đã hoàn thành
 * @param data - Dữ liệu đánh giá
 */
export async function createRestaurantReview(
  userId: string,
  restaurantId: string,
  orderId: string,
  data: {
    overallRating: number; // 1-5 (bắt buộc)
    foodQuality?: number; // 1-5 (tùy chọn)
    deliverySpeed?: number; // 1-5 (tùy chọn)
    service?: number; // 1-5 (tùy chọn)
    comment?: string;
  }
) {
  try {
    // Validate ratings
    if (data.overallRating < 1 || data.overallRating > 5) {
      throw new Error('Overall rating must be between 1 and 5');
    }

    // Check if already reviewed
    const existing = await hasUserReviewedOrder(userId, orderId);
    if (existing) {
      throw new Error('You have already reviewed this order');
    }

    // Create review
    const review = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      'unique()',
      {
        userId: userId,
        restaurantId: restaurantId,
        orderId: orderId,
        overallRating: data.overallRating,
        foodQuality: data.foodQuality || null,
        deliverySpeed: data.deliverySpeed || null,
        service: data.service || null,
        comment: data.comment || '',
      }
    );

    // Update restaurant's average rating
    await updateRestaurantAverageRating(restaurantId);

    return review;
  } catch (error) {
    console.error('Error creating restaurant review:', error);
    throw error;
  }
}

// ===================== READ REVIEWS =====================

/**
 * Lấy tất cả reviews của 1 nhà hàng
 * @param restaurantId - ID của nhà hàng
 * @param limit - Số lượng reviews tối đa (mặc định: 50)
 * @param offset - Vị trí bắt đầu (mặc định: 0)
 */
export async function getRestaurantReviews(
  restaurantId: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    // TODO: Fix - Collection reviews doesn't exist or has different schema
    console.warn('⚠️ Reviews collection not properly configured in Appwrite');
    return [];
    
    /* DISABLED until reviews collection is properly set up
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      [
        Query.equal('restaurantId', restaurantId),
        Query.equal('isVisible', true),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return response.documents as unknown as Review[];
    */
  } catch (error) {
    console.error('Error fetching restaurant reviews:', error);
    return [];
  }
}

/**
 * Lấy reviews của 1 nhà hàng kèm thông tin user
 * @param restaurantId - ID của nhà hàng
 * @param limit - Số lượng reviews tối đa
 */
export async function getRestaurantReviewsWithUserInfo(
  restaurantId: string,
  limit: number = 20
) {
  try {
    const reviews = await getRestaurantReviews(restaurantId, limit);

    // Fetch user info for each review
    const reviewsWithUser = await Promise.all(
      reviews.map(async (review) => {
        try {
          // Access userId directly from review document
          const userId = (review as any).userId;
          
          const user = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            userId
          );

          return {
            ...review,
            user: {
              name: user.name,
              avatar: user.avatar || null,
            },
          };
        } catch (error) {
          // If user not found, return review with placeholder
          return {
            ...review,
            user: {
              name: 'Deleted User',
              avatar: null,
            },
          };
        }
      })
    );

    return reviewsWithUser;
  } catch (error) {
    console.error('Error fetching reviews with user info:', error);
    throw error;
  }
}

/**
 * Lấy review của 1 user cho 1 order cụ thể
 * @param userId - ID của user
 * @param orderId - ID của order
 */
export async function getUserReviewForOrder(userId: string, orderId: string) {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      [
        Query.equal('userId', userId),
        Query.equal('orderId', orderId),
        Query.limit(1),
      ]
    );

    return response.documents.length > 0 ? (response.documents[0] as unknown as Review) : null;
  } catch (error) {
    console.error('Error fetching user review for order:', error);
    return null;
  }
}

// ===================== DUPLICATE PREVENTION =====================

/**
 * Kiểm tra xem user đã review order này chưa
 * @param userId - ID của user
 * @param orderId - ID của order
 * @returns true nếu đã review, false nếu chưa
 */
export async function hasUserReviewedOrder(
  userId: string,
  orderId: string
): Promise<boolean> {
  try {
    const review = await getUserReviewForOrder(userId, orderId);
    return review !== null;
  } catch (error) {
    console.error('Error checking if user reviewed order:', error);
    return false;
  }
}

// ===================== UPDATE REVIEW =====================

/**
 * Cập nhật review (chỉ user tạo review mới được cập nhật)
 * @param reviewId - ID của review
 * @param data - Dữ liệu cần cập nhật
 */
export async function updateReview(
  reviewId: string,
  data: {
    overallRating?: number;
    foodQuality?: number;
    deliverySpeed?: number;
    service?: number;
    comment?: string;
  }
) {
  try {
    const review = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      reviewId,
      {
        ...(data.overallRating && { overallRating: data.overallRating }),
        ...(data.foodQuality && { foodQuality: data.foodQuality }),
        ...(data.deliverySpeed && { deliverySpeed: data.deliverySpeed }),
        ...(data.service && { service: data.service }),
        ...(data.comment !== undefined && { comment: data.comment }),
      }
    );

    return review;
  } catch (error) {
    console.error('Error updating review:', error);
    throw error;
  }
}

// ===================== DELETE REVIEW =====================

/**
 * Xóa review (chỉ user tạo review hoặc admin mới được xóa)
 * @param reviewId - ID của review
 */
export async function deleteReview(reviewId: string) {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      reviewId
    );
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
}

// ===================== RESTAURANT RESPONSE =====================

/**
 * Chủ nhà hàng trả lời review
 * @param reviewId - ID của review
 * @param response - Nội dung trả lời
 */
export async function replyToReview(reviewId: string, response: string) {
  try {
    const review = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      reviewId,
      {
        restaurantResponse: response,
      }
    );

    return review;
  } catch (error) {
    console.error('Error replying to review:', error);
    throw error;
  }
}

// ===================== STATISTICS =====================

/**
 * Tính điểm trung bình của nhà hàng
 * @param restaurantId - ID của nhà hàng
 */
export async function getRestaurantAverageRating(restaurantId: string) {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      [
        Query.equal('restaurantId', restaurantId),
        Query.equal('isVisible', true),
        Query.limit(1000), // Maximum to calculate average
      ]
    );

    const reviews = response.documents as unknown as Review[];

    if (reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        averageByCategory: {
          foodQuality: 0,
          deliverySpeed: 0,
          service: 0,
        },
      };
    }

    // Calculate overall average
    const totalRating = reviews.reduce((sum, review) => sum + review.overallRating, 0);
    const average = totalRating / reviews.length;

    // Calculate distribution
    const distribution = reviews.reduce(
      (acc, review) => {
        acc[review.overallRating as 1 | 2 | 3 | 4 | 5]++;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    );

    // Calculate average by category
    const foodQualityReviews = reviews.filter((r) => r.foodQuality !== null);
    const deliverySpeedReviews = reviews.filter((r) => r.deliverySpeed !== null);
    const serviceReviews = reviews.filter((r) => r.service !== null);

    const averageByCategory = {
      foodQuality:
        foodQualityReviews.length > 0
          ? foodQualityReviews.reduce((sum, r) => sum + r.foodQuality!, 0) /
            foodQualityReviews.length
          : 0,
      deliverySpeed:
        deliverySpeedReviews.length > 0
          ? deliverySpeedReviews.reduce((sum, r) => sum + r.deliverySpeed!, 0) /
            deliverySpeedReviews.length
          : 0,
      service:
        serviceReviews.length > 0
          ? serviceReviews.reduce((sum, r) => sum + r.service!, 0) / serviceReviews.length
          : 0,
    };

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      total: reviews.length,
      distribution,
      averageByCategory,
    };
  } catch (error) {
    console.error('Error calculating restaurant average rating:', error);
    return {
      average: 0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      averageByCategory: {
        foodQuality: 0,
        deliverySpeed: 0,
        service: 0,
      },
    };
  }
}

/**
 * Cập nhật điểm trung bình của nhà hàng trong collection restaurants
 * @param restaurantId - ID của nhà hàng
 */
export async function updateRestaurantAverageRating(restaurantId: string) {
  try {
    const stats = await getRestaurantAverageRating(restaurantId);

    // Only update if we have a valid rating (>= 1)
    // Rating attribute in restaurants collection requires value between 1-5
    if (stats.average >= 1 && stats.average <= 5) {
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.restaurantsCollectionId,
        restaurantId,
        {
          rating: Math.round(stats.average),
        }
      );
      console.log('✅ Restaurant rating updated to:', stats.average);
    } else {
      console.log('ℹ️ Skipping rating update - no valid reviews yet (average:', stats.average, ')');
    }

    return stats;
  } catch (error) {
    console.error('Error updating restaurant average rating:', error);
    // Don't throw - this is a non-critical update
    return {
      average: 0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      averageByCategory: {
        foodQuality: 0,
        deliverySpeed: 0,
        service: 0,
      },
    };
  }
}

// ===================== FILTER & SORT =====================

/**
 * Lấy reviews với filter và sort
 * @param restaurantId - ID của nhà hàng
 * @param options - Tùy chọn filter và sort
 */
export async function getFilteredRestaurantReviews(
  restaurantId: string,
  options: {
    minRating?: number; // Filter by minimum rating (1-5)
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
    limit?: number;
    offset?: number;
  } = {}
) {
  try {
    // TODO: Fix - Collection reviews doesn't exist or has different schema
    console.warn('⚠️ Reviews collection not properly configured in Appwrite');
    return [];
    
    /* DISABLED until reviews collection is properly set up
    const queries = [
      Query.equal('restaurantId', restaurantId),
      Query.equal('isVisible', true),
    ];

    // Filter by minimum rating
    if (options.minRating) {
      queries.push(Query.greaterThanEqual('overallRating', options.minRating));
    }

    // Sort
    switch (options.sortBy) {
      case 'newest':
        queries.push(Query.orderDesc('$createdAt'));
        break;
      case 'oldest':
        queries.push(Query.orderAsc('$createdAt'));
        break;
      case 'highest':
        queries.push(Query.orderDesc('overallRating'));
        break;
      case 'lowest':
        queries.push(Query.orderAsc('overallRating'));
        break;
      default:
        queries.push(Query.orderDesc('$createdAt'));
    }

    queries.push(Query.limit(options.limit || 50));
    queries.push(Query.offset(options.offset || 0));

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      queries
    );

    const reviews = response.documents as unknown as Review[];

    return reviews;
    */
  } catch (error) {
    console.error('Error fetching filtered reviews:', error);
    return [];
  }
}
