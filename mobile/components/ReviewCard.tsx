import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ReviewWithUser } from '@/type';
import { icons } from '@/constants';

interface ReviewCardProps {
  review: ReviewWithUser;
  onReplyPress?: () => void;
  showReplyButton?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onReplyPress,
  showReplyButton = false,
}) => {
  const renderStars = (rating: number) => {
    return (
      <View className="flex-row">
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            className={`text-lg ${
              star <= rating ? 'text-amber-400' : 'text-gray-300'
            }`}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      {/* User Info & Rating */}
      <View className="flex-row items-center mb-3">
        {/* Avatar */}
        <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
          {review.user?.avatar ? (
            <Image
              source={{ uri: review.user.avatar }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <Text className="text-lg font-quicksand-bold text-gray-500">
              {review.user?.name?.[0]?.toUpperCase() || 'A'}
            </Text>
          )}
        </View>

        {/* Name & Date */}
        <View className="flex-1">
          <Text className="text-sm font-quicksand-bold text-gray-900">
            {review.user?.name || 'Anonymous'}
          </Text>
          <Text className="text-xs text-gray-500 font-quicksand-medium">
            {formatDate(review.$createdAt)}
          </Text>
        </View>

        {/* Verified Badge */}
        {review.isVerifiedPurchase && (
          <View className="bg-green-100 rounded-full px-2 py-1">
            <Text className="text-xs text-green-700 font-quicksand-semibold">
              ✓ Verified
            </Text>
          </View>
        )}
      </View>

      {/* Rating Stars */}
      <View className="mb-2">{renderStars(review.overallRating)}</View>

      {/* Comment */}
      {review.comment && (
        <Text className="text-sm text-gray-700 font-quicksand-medium leading-5 mb-3">
          {review.comment}
        </Text>
      )}

      {/* Restaurant Reply */}
      {review.reply && (
        <View className="bg-blue-50 rounded-xl p-3 mt-2 border-l-4 border-blue-400">
          <View className="flex-row items-center mb-1">
            <Image source={icons.restaurant} className="w-4 h-4 mr-2" />
            <Text className="text-xs font-quicksand-bold text-blue-900">
              Restaurant's Response
            </Text>
          </View>
          <Text className="text-sm text-gray-700 font-quicksand-medium">
            {review.reply}
          </Text>
          {review.repliedAt && (
            <Text className="text-xs text-gray-500 mt-1">
              {formatDate(review.repliedAt)}
            </Text>
          )}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row items-center mt-3 pt-3 border-t border-gray-100">
        <TouchableOpacity className="flex-row items-center mr-4">
          <Image source={icons.star} className="w-4 h-4 mr-1" />
          <Text className="text-xs text-gray-600 font-quicksand-medium">
            Helpful ({review.helpful || 0})
          </Text>
        </TouchableOpacity>

        {showReplyButton && onReplyPress && (
          <TouchableOpacity
            className="flex-row items-center"
            onPress={onReplyPress}
          >
            <Image source={icons.envelope} className="w-4 h-4 mr-1" />
            <Text className="text-xs text-blue-600 font-quicksand-semibold">
              Reply
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ReviewCard;
