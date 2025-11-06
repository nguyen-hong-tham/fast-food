/**
 * RESTAURANT REVIEWS API (Web Version)
 * Converted from mobile version for restaurant portal
 * 
 * Features:
 * - View restaurant reviews
 * - Reply to reviews
 * - Get rating statistics
 * - Menu item reviews
 */

import { databases, Query } from './appwrite';
import { config } from '@/config';

export interface Review {
  $id: string;
  $createdAt: string;
  userId: string;
  restaurantId: string;
  orderId: string;
  menuItemId?: string; // For menu item reviews
  overallRating: number; // 1-5
  foodQuality?: number | null;
  deliverySpeed?: number | null;
  service?: number | null;
  comment?: string;
  isVisible: boolean;
  restaurantResponse?: string | null;
}

export interface ReviewWithUser extends Review {
  user: {
    name: string;
    avatar: string | null;
  };
}

// ===================== READ REVIEWS =====================

/**
 * Get all reviews for a restaurant
 */
export async function getRestaurantReviews(
  restaurantId: string,
  limit: number = 50,
  offset: number = 0
): Promise<Review[]> {
  try {
    const response = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.reviewsCollectionId,
      [
        Query.equal('restaurantId', restaurantId),
        Query.equal('isVisible', true),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    return response.documents as Review[];
  } catch (error) {
    console.error('Error fetching restaurant reviews:', error);
    throw error;
  }
}

/**
 * Get reviews with user information
 */
export async function getRestaurantReviewsWithUserInfo(
  restaurantId: string,
  limit: number = 20
): Promise<ReviewWithUser[]> {
  try {
    const reviews = await getRestaurantReviews(restaurantId, limit);

    const reviewsWithUser = await Promise.all(
      reviews.map(async (review) => {
        try {
          const user = await databases.getDocument(
            config.appwrite.databaseId,
            config.appwrite.usersCollectionId,
            review.userId
          );

          return {
            ...review,
            user: {
              name: user.name,
              avatar: user.avatar || null,
            },
          };
        } catch (error) {
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

// ===================== MENU ITEM REVIEWS =====================

/**
 * Get all reviews for a specific menu item
 */
export async function getMenuItemReviews(
  menuItemId: string,
  limit: number = 50
): Promise<ReviewWithUser[]> {
  try {
    const response = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.reviewsCollectionId,
      [
        Query.equal('menuItemId', menuItemId),
        Query.equal('isVisible', true),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
      ]
    );

    const reviews = response.documents as Review[];

    // Fetch user info
    const reviewsWithUser = await Promise.all(
      reviews.map(async (review) => {
        try {
          const user = await databases.getDocument(
            config.appwrite.databaseId,
            config.appwrite.usersCollectionId,
            review.userId
          );

          return {
            ...review,
            user: {
              name: user.name,
              avatar: user.avatar || null,
            },
          };
        } catch (error) {
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
    console.error('Error fetching menu item reviews:', error);
    throw error;
  }
}

/**
 * Get average rating for a menu item
 */
export async function getMenuItemAverageRating(menuItemId: string) {
  try {
    const response = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.reviewsCollectionId,
      [
        Query.equal('menuItemId', menuItemId),
        Query.equal('isVisible', true),
        Query.limit(1000),
      ]
    );

    const reviews = response.documents as Review[];

    if (reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.overallRating, 0);
    const average = totalRating / reviews.length;

    const distribution = reviews.reduce(
      (acc, review) => {
        acc[review.overallRating as 1 | 2 | 3 | 4 | 5]++;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    );

    return {
      average: Math.round(average * 10) / 10,
      total: reviews.length,
      distribution,
    };
  } catch (error) {
    console.error('Error calculating menu item average rating:', error);
    return {
      average: 0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }
}

// ===================== RESTAURANT RESPONSE =====================

/**
 * Restaurant owner reply to review
 */
export async function replyToReview(reviewId: string, response: string) {
  try {
    const review = await databases.updateDocument(
      config.appwrite.databaseId,
      config.appwrite.reviewsCollectionId,
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
 * Get restaurant average rating and statistics
 */
export async function getRestaurantAverageRating(restaurantId: string) {
  try {
    const response = await databases.listDocuments(
      config.appwrite.databaseId,
      config.appwrite.reviewsCollectionId,
      [
        Query.equal('restaurantId', restaurantId),
        Query.equal('isVisible', true),
        Query.limit(1000),
      ]
    );

    const reviews = response.documents as Review[];

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

    // Overall average
    const totalRating = reviews.reduce((sum, review) => sum + review.overallRating, 0);
    const average = totalRating / reviews.length;

    // Distribution
    const distribution = reviews.reduce(
      (acc, review) => {
        acc[review.overallRating as 1 | 2 | 3 | 4 | 5]++;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    );

    // Category averages
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
      average: Math.round(average * 10) / 10,
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

// ===================== FILTER & SORT =====================

/**
 * Get filtered and sorted reviews
 */
export async function getFilteredRestaurantReviews(
  restaurantId: string,
  options: {
    minRating?: number;
    sortBy?: 'newest' | 'oldest' | 'highest' | 'lowest';
    limit?: number;
    offset?: number;
  } = {}
): Promise<Review[]> {
  try {
    const queries = [
      Query.equal('restaurantId', restaurantId),
      Query.equal('isVisible', true),
    ];

    if (options.minRating) {
      queries.push(Query.greaterThanEqual('overallRating', options.minRating));
    }

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
      config.appwrite.databaseId,
      config.appwrite.reviewsCollectionId,
      queries
    );

    return response.documents as Review[];
  } catch (error) {
    console.error('Error fetching filtered reviews:', error);
    throw error;
  }
}
