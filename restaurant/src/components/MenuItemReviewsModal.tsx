import { useEffect, useState } from 'react';
import { X, Star, MessageSquare } from 'lucide-react';
import { getMenuItemReviews, getMenuItemAverageRating, type ReviewWithUser } from '@/lib/reviews';

interface MenuItemReviewsModalProps {
  menuItemId: string;
  menuItemName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuItemReviewsModal({
  menuItemId,
  menuItemName,
  isOpen,
  onClose,
}: MenuItemReviewsModalProps) {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [stats, setStats] = useState({ average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && menuItemId) {
      loadReviews();
    }
  }, [isOpen, menuItemId]);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        getMenuItemReviews(menuItemId, 50),
        getMenuItemAverageRating(menuItemId),
      ]);
      setReviews(reviewsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading menu item reviews:', error);
      // Set empty state on error
      setReviews([]);
      setStats({ average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-2xl font-bold">{menuItemName}</h2>
            <p className="text-sm text-white/90">Customer Reviews</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Summary */}
        <div className="px-6 py-4 bg-orange-50 border-b">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600">{stats.average.toFixed(1)}</div>
              <div className="flex items-center justify-center mt-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(stats.average) ? 'fill-current' : 'stroke-current fill-none'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-1">{stats.total} reviews</div>
            </div>

            {/* Distribution */}
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.distribution[star as keyof typeof stats.distribution];
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2 mb-1">
                    <div className="text-sm text-gray-600 w-8">{star}★</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 w-8">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
              <p className="text-gray-500">This item hasn't been reviewed yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.$id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* User & Rating */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-semibold text-sm">
                          {review.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{review.user.name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(review.$createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.overallRating ? 'fill-current' : 'stroke-current fill-none'
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-sm font-semibold text-gray-700">
                        {review.overallRating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Rating Details */}
                  {(review.foodQuality || review.deliverySpeed || review.service) && (
                    <div className="flex gap-4 mb-3 text-xs text-gray-600">
                      {review.foodQuality && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Food:</span>
                          <span>{review.foodQuality}/5</span>
                        </div>
                      )}
                      {review.deliverySpeed && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Delivery:</span>
                          <span>{review.deliverySpeed}/5</span>
                        </div>
                      )}
                      {review.service && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Service:</span>
                          <span>{review.service}/5</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                  )}

                  {/* Restaurant Response */}
                  {review.restaurantResponse && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded mt-3">
                      <div className="text-xs font-semibold text-blue-900 mb-1">
                        Restaurant Response:
                      </div>
                      <p className="text-sm text-blue-800">{review.restaurantResponse}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
