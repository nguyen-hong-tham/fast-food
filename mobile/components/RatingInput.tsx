import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomHeader from './CustomHeader';
import { createReview } from '@/lib/reviews';
import useAuthStore from '@/store/auth.store';
import { router } from 'expo-router';

interface RatingInputProps {
  orderId: string;
  restaurantId: string;
  menuItemId: string;
  menuItemName: string;
  onSuccess?: () => void;
}

const RatingInput: React.FC<RatingInputProps> = ({
  orderId,
  restaurantId,
  menuItemId,
  menuItemName,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Required', 'Please select a rating');
      return;
    }

    if (!user?.$id) {
      Alert.alert('Error', 'You must be logged in to review');
      return;
    }

    setIsSubmitting(true);

    try {
      await createReview(user.$id, restaurantId, {
        orderId,
        menuItemId,
        rating,
        comment: comment.trim() || undefined,
      });

      Alert.alert('Success', 'Thank you for your review!', [
        {
          text: 'OK',
          onPress: () => {
            onSuccess?.();
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <CustomHeader title="Rate Your Order" />

      <ScrollView className="flex-1 px-5 py-5">
        {/* Menu Item Name */}
        <View className="mb-6">
          <Text className="text-lg font-quicksand-bold text-gray-900 text-center">
            {menuItemName}
          </Text>
          <Text className="text-sm text-gray-500 text-center mt-1 font-quicksand-medium">
            How was your experience?
          </Text>
        </View>

        {/* Star Rating */}
        <View className="items-center mb-6">
          <View className="flex-row space-x-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
              >
                <Text
                  className={`text-5xl ${
                    star <= rating ? 'text-amber-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="text-sm text-gray-600 mt-3 font-quicksand-medium">
            {rating === 0 && 'Tap to rate'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </Text>
        </View>

        {/* Comment Input */}
        <View className="mb-6">
          <Text className="text-sm font-quicksand-semibold text-gray-700 mb-2">
            Share your experience (Optional)
          </Text>
          <TextInput
            className="bg-gray-50 rounded-2xl p-4 text-sm font-quicksand-medium text-gray-900 border border-gray-200"
            placeholder="Tell us what you liked or didn't like..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            maxLength={500}
          />
          <Text className="text-xs text-gray-400 mt-1 text-right">
            {comment.length}/500
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`rounded-2xl py-4 items-center ${
            rating === 0 || isSubmitting ? 'bg-gray-300' : 'bg-amber-500'
          }`}
          disabled={rating === 0 || isSubmitting}
          onPress={handleSubmit}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-base font-quicksand-bold">
              Submit Review
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RatingInput;
