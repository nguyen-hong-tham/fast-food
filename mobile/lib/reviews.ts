import { ID, Query } from 'react-native-appwrite';
import { databases, appwriteConfig } from './appwrite';
import { Review, CreateReviewParams, ReviewWithUser } from '@/type';

/**
 * Create a new review for a menu item
 */
export const createReview = async (
  userId: string,
  restaurantId: string,
  params: CreateReviewParams
): Promise<Review> => {
  try {
    // Validation
    if (params.rating < 1 || params.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const review = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      ID.unique(),
      {
        userId,
        orderId: params.orderId,
        restaurantId,
        menuItemId: params.menuItemId,
        rating: params.rating,
        comment: params.comment || '',
        images: params.images || [],
        helpful: 0,
        isVerifiedPurchase: true,
        status: 'active',
      }
    );

    console.log('✅ Review created:', review.$id);
    return review as Review;
  } catch (error: any) {
    console.error('❌ Error creating review:', error);
    throw new Error(error.message || 'Failed to create review');
  }
};

/**
 * Get reviews for a specific menu item
 */
export const getMenuItemReviews = async (
  menuItemId: string,
  limit: number = 20,
  offset: number = 0
): Promise<Review[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      [
        Query.equal('menuItemId', menuItemId),
        Query.equal('status', 'active'),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return response.documents as Review[];
  } catch (error: any) {
    console.error('❌ Error fetching menu item reviews:', error);
    return [];
  }
};

/**
 * Get reviews for a restaurant (all menu items)
 */
export const getRestaurantReviews = async (
  restaurantId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Review[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      [
        Query.equal('restaurantId', restaurantId),
        Query.equal('status', 'active'),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return response.documents as Review[];
  } catch (error: any) {
    console.error('❌ Error fetching restaurant reviews:', error);
    return [];
  }
};

/**
 * Get reviews with user information
 */
export const getReviewsWithUserInfo = async (
  menuItemId: string,
  limit: number = 20
): Promise<ReviewWithUser[]> => {
  try {
    const reviews = await getMenuItemReviews(menuItemId, limit);
    
    // Fetch user info for each review
    const reviewsWithUser = await Promise.all(
      reviews.map(async (review) => {
        try {
          const user = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            review.userId
          );

          return {
            ...review,
            user: {
              name: user.name,
              avatar: user.avatar,
            },
          };
        } catch (error) {
          console.warn('Could not fetch user for review:', review.$id);
          return {
            ...review,
            user: {
              name: 'Anonymous',
              avatar: undefined,
            },
          };
        }
      })
    );

    return reviewsWithUser;
  } catch (error: any) {
    console.error('❌ Error fetching reviews with user info:', error);
    return [];
  }
};

/**
 * Calculate average rating for a menu item
 */
export const getMenuItemAverageRating = async (
  menuItemId: string
): Promise<{ average: number; total: number }> => {
  try {
    const reviews = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      [
        Query.equal('menuItemId', menuItemId),
        Query.equal('status', 'active'),
        Query.limit(1000), // Get all reviews for accurate average
      ]
    );

    const total = reviews.documents.length;
    
    if (total === 0) {
      return { average: 0, total: 0 };
    }

    const sum = reviews.documents.reduce(
      (acc: number, review: any) => acc + review.rating,
      0
    );

    const average = sum / total;

    return {
      average: Math.round(average * 10) / 10, // Round to 1 decimal
      total,
    };
  } catch (error: any) {
    console.error('❌ Error calculating average rating:', error);
    return { average: 0, total: 0 };
  }
};

/**
 * Check if user has 
 *  reviewed this item in this order
 */
export const hasUserReviewedItem = async (
  userId: string,
  orderId: string,
  menuItemId: string
): Promise<boolean> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      [
        Query.equal('userId', userId),
        Query.equal('orderId', orderId),
        Query.equal('menuItemId', menuItemId),
        Query.limit(1),
      ]
    );

    return response.documents.length > 0;
  } catch (error: any) {
    console.error('❌ Error checking review status:', error);
    return false;
  }
};

/**
 * Update review (user can edit their own review)
 */
export const updateReview = async (
  reviewId: string,
  data: { rating?: number; comment?: string; images?: string[] }
): Promise<Review> => {
  try {
    const updateData: any = {};

    if (data.rating !== undefined) {
      if (data.rating < 1 || data.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      updateData.rating = data.rating;
    }

    if (data.comment !== undefined) {
      updateData.comment = data.comment;
    }

    if (data.images !== undefined) {
      updateData.images = data.images;
    }

    const review = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      reviewId,
      updateData
    );

    console.log('✅ Review updated:', reviewId);
    return review as Review;
  } catch (error: any) {
    console.error('❌ Error updating review:', error);
    throw new Error(error.message || 'Failed to update review');
  }
};

/**
 * Delete review (user can delete their own review)
 */
export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      reviewId
    );

    console.log('✅ Review deleted:', reviewId);
  } catch (error: any) {
    console.error('❌ Error deleting review:', error);
    throw new Error(error.message || 'Failed to delete review');
  }
};

/**
 * Restaurant owner replies to a review
 */
export const replyToReview = async (
  reviewId: string,
  reply: string
): Promise<Review> => {
  try {
    const review = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      reviewId,
      {
        reply,
        repliedAt: new Date().toISOString(),
      }
    );

    console.log('✅ Reply added to review:', reviewId);
    return review as Review;
  } catch (error: any) {
    console.error('❌ Error replying to review:', error);
    throw new Error(error.message || 'Failed to reply to review');
  }
};

/**
 * Mark review as helpful
 */
export const markReviewHelpful = async (reviewId: string): Promise<Review> => {
  try {
    // Get current review
    const currentReview = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      reviewId
    );

    const currentHelpful = currentReview.helpful || 0;

    const review = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      reviewId,
      {
        helpful: currentHelpful + 1,
      }
    );

    return review as Review;
  } catch (error: any) {
    console.error('❌ Error marking review as helpful:', error);
    throw new Error(error.message || 'Failed to mark review as helpful');
  }
};

/**
 * Get reviews summary for restaurant (for analytics)
 */
export const getRestaurantReviewsSummary = async (restaurantId: string) => {
  try {
    const reviews = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.reviewsCollectionId,
      [
        Query.equal('restaurantId', restaurantId),
        Query.equal('status', 'active'),
        Query.limit(5000),
      ]
    );

    const total = reviews.documents.length;

    if (total === 0) {
      return {
        total: 0,
        average: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    // Calculate distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;

    reviews.documents.forEach((review: any) => {
      const rating = review.rating;
      distribution[rating as keyof typeof distribution]++;
      sum += rating;
    });

    const average = Math.round((sum / total) * 10) / 10;

    return {
      total,
      average,
      distribution,
    };
  } catch (error: any) {
    console.error('❌ Error getting restaurant reviews summary:', error);
    return {
      total: 0,
      average: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }
};
