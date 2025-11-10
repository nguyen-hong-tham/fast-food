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
    <View className="bg-white rounded-2xl p-5 mb-4 shadow-md border border-gray-200">
      {/* User Info Header - REDESIGNED */}
      <View className="flex-row items-start mb-3">
        {/* Avatar - Larger & More Prominent */}
        <View className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 items-center justify-center mr-3 shadow-sm">
          {review.user?.avatar ? (
            <Image
              source={{ uri: review.user.avatar }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-xl font-quicksand-bold text-white">
              {review.user?.name?.[0]?.toUpperCase() || 'A'}
            </Text>
          )}
        </View>

        {/* Name, Date & Rating Combined */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-base font-quicksand-bold text-gray-900">
              {review.user?.name || 'Anonymous'}
            </Text>
            {review.isVerifiedPurchase && (
              <View className="bg-green-100 rounded-full px-2 py-0.5">
                <Text className="text-xs text-green-700 font-quicksand-bold">
                  ✓ Verified
                </Text>
              </View>
            )}
          </View>
          
          <Text className="text-xs text-gray-500 font-quicksand-medium mb-2">
            {formatDate(review.$createdAt)}
          </Text>
          
          {/* Rating Stars - Right below name */}
          {renderStars(review.overallRating)}
        </View>
      </View>

      {/* Comment - Clean & Readable */}
      {review.comment && (
        <Text className="text-sm text-gray-800 font-quicksand-medium leading-6">
          {review.comment}
        </Text>
      )}

      {/* Restaurant Reply - Only if exists */}
      {review.reply && (
        <View className="bg-amber-50 rounded-xl p-4 mt-4 border-l-4 border-amber-400">
          <View className="flex-row items-center mb-2">
            <View className="w-5 h-5 bg-amber-500 rounded-full items-center justify-center mr-2">
              <Text className="text-white text-xs font-quicksand-bold">🍽️</Text>
            </View>
            <Text className="text-xs font-quicksand-bold text-amber-900">
              Restaurant's Response
            </Text>
          </View>
          <Text className="text-sm text-gray-700 font-quicksand-medium leading-5">
            {review.reply}
          </Text>
          {review.repliedAt && (
            <Text className="text-xs text-gray-500 mt-2 font-quicksand-medium">
              {formatDate(review.repliedAt)}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default ReviewCard;
