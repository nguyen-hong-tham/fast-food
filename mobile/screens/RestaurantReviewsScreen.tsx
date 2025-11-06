import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from '@/components/CustomHeader';
import ReviewCard from '@/components/ReviewCard';
import {
  getRestaurantReviews,
  getRestaurantReviewsSummary,
  replyToReview,
} from '@/lib/reviews';
import { Review } from '@/type';

interface RestaurantReviewsScreenProps {
  restaurantId: string;
}

const RestaurantReviewsScreen: React.FC<RestaurantReviewsScreenProps> = ({
  restaurantId,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    average: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const loadData = async () => {
    try {
      const [reviewsData, summaryData] = await Promise.all([
        getRestaurantReviews(restaurantId, 50),
        getRestaurantReviewsSummary(restaurantId),
      ]);

      setReviews(reviewsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      Alert.alert('Error', 'Failed to load reviews');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleReplyPress = (reviewId: string) => {
    setReplyingTo(reviewId);
    setReplyText('');
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !replyingTo) return;

    setSubmittingReply(true);

    try {
      await replyToReview(replyingTo, replyText.trim());

      Alert.alert('Success', 'Reply posted successfully');

      // Reload reviews
      await loadData();
      setReplyingTo(null);
      setReplyText('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to post reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const renderRatingBar = (star: number, count: number) => {
    const percentage = summary.total > 0 ? (count / summary.total) * 100 : 0;

    return (
      <View key={star} className="flex-row items-center mb-2">
        <Text className="text-sm font-quicksand-medium text-gray-600 w-8">
          {star}★
        </Text>
        <View className="flex-1 bg-gray-200 rounded-full h-2 mx-3">
          <View
            className="bg-amber-400 h-full rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </View>
        <Text className="text-sm font-quicksand-medium text-gray-600 w-12 text-right">
          {count}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#F59E0B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <CustomHeader title="Customer Reviews" />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Summary Card */}
        <View className="bg-white rounded-2xl p-5 m-4 shadow-sm">
          <View className="flex-row items-center mb-4">
            <View className="items-center mr-6">
              <Text className="text-5xl font-quicksand-bold text-gray-900">
                {summary.average.toFixed(1)}
              </Text>
              <View className="flex-row mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text
                    key={star}
                    className={`text-lg ${
                      star <= Math.round(summary.average)
                        ? 'text-amber-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </Text>
                ))}
              </View>
              <Text className="text-sm text-gray-500 mt-1">
                {summary.total} reviews
              </Text>
            </View>

            <View className="flex-1">
              {[5, 4, 3, 2, 1].map((star) =>
                renderRatingBar(
                  star,
                  summary.distribution[star as keyof typeof summary.distribution]
                )
              )}
            </View>
          </View>
        </View>

        {/* Reviews List */}
        <View className="px-4 pb-4">
          <Text className="text-lg font-quicksand-bold text-gray-900 mb-3">
            All Reviews ({reviews.length})
          </Text>

          {reviews.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center">
              <Text className="text-4xl mb-3">📝</Text>
              <Text className="text-base font-quicksand-semibold text-gray-900 mb-1">
                No Reviews Yet
              </Text>
              <Text className="text-sm text-gray-500 text-center">
                Your customers haven't left any reviews yet
              </Text>
            </View>
          ) : (
            reviews.map((review) => (
              <View key={review.$id} className="mb-4">
                <ReviewCard
                  review={review}
                  showReplyButton={!review.reply}
                  onReplyPress={() => handleReplyPress(review.$id)}
                />

                {/* Reply Input (when replying to this review) */}
                {replyingTo === review.$id && (
                  <View className="bg-white rounded-2xl p-4 mt-2 border border-blue-200">
                    <Text className="text-sm font-quicksand-bold text-gray-900 mb-2">
                      Reply to this review
                    </Text>
                    <TextInput
                      className="bg-gray-50 rounded-xl p-3 text-sm font-quicksand-medium text-gray-900 mb-3"
                      placeholder="Write your response..."
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      value={replyText}
                      onChangeText={setReplyText}
                      maxLength={500}
                    />
                    <View className="flex-row space-x-2">
                      <TouchableOpacity
                        className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
                        onPress={() => setReplyingTo(null)}
                      >
                        <Text className="text-sm font-quicksand-semibold text-gray-700">
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className={`flex-1 rounded-xl py-3 items-center ${
                          !replyText.trim() || submittingReply
                            ? 'bg-gray-300'
                            : 'bg-blue-500'
                        }`}
                        disabled={!replyText.trim() || submittingReply}
                        onPress={handleSubmitReply}
                      >
                        {submittingReply ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <Text className="text-sm font-quicksand-bold text-white">
                            Post Reply
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RestaurantReviewsScreen;
