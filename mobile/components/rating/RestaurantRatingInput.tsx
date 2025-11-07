/**
 * RESTAURANT RATING INPUT COMPONENT
 * Form để khách hàng đánh giá nhà hàng sau khi hoàn tất đơn hàng
 * 
 * Features:
 * - 3 tiêu chí đánh giá: Chất lượng món ăn, Tốc độ giao hàng, Dịch vụ
 * - Điểm tổng thể (Overall Rating)
 * - Nhận xét văn bản
 * - Upload ảnh (optional)
 */

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
import { router } from 'expo-router';
import useAuthStore from '@/store/auth.store';
import { createRestaurantReview } from '@/lib/restaurant-reviews';

interface RestaurantRatingInputProps {
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  onSuccess?: () => void;
}

const RestaurantRatingInput: React.FC<RestaurantRatingInputProps> = ({
  orderId,
  restaurantId,
  restaurantName,
  onSuccess,
}) => {
  const { user } = useAuthStore();

  // Rating states (1-5)
  const [overallRating, setOverallRating] = useState(0);
  const [foodQuality, setFoodQuality] = useState(0);
  const [deliverySpeed, setDeliverySpeed] = useState(0);
  const [service, setService] = useState(0);

  // Comment state
  const [comment, setComment] = useState('');

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Character counter
  const maxCommentLength = 500;

  // Handle submit
  const handleSubmit = async () => {
    // Validation
    if (overallRating === 0) {
      Alert.alert('Missing Rating', 'Please provide an overall rating');
      return;
    }

    if (!user?.$id) {
      Alert.alert('Error', 'You must be logged in to submit a review');
      return;
    }

    try {
      setIsSubmitting(true);

      await createRestaurantReview(user.$id, restaurantId, orderId, {
        overallRating,
        foodQuality: foodQuality > 0 ? foodQuality : undefined,
        deliverySpeed: deliverySpeed > 0 ? deliverySpeed : undefined,
        service: service > 0 ? service : undefined,
        comment: comment.trim(),
      });

      Alert.alert(
        'Thank You!',
        'Your review has been submitted successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.();
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render stars for rating input
  const renderRatingStars = (
    label: string,
    description: string,
    value: number,
    onChange: (rating: number) => void,
    required: boolean = false
  ) => {
    return (
      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Text className="text-base font-quicksand-bold text-gray-900">
            {label}
          </Text>
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </View>
        <Text className="text-sm font-quicksand text-gray-600 mb-3">
          {description}
        </Text>

        <View className="flex-row items-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => onChange(star)}
              className="p-2"
              activeOpacity={0.7}
            >
              <Text
                className={`text-3xl ${
                  star <= value ? 'text-amber-400' : 'text-gray-300'
                }`}
              >
                ★
              </Text>
            </TouchableOpacity>
          ))}
          {value > 0 && (
            <Text className="text-sm font-quicksand-medium text-gray-700 ml-2">
              {value}/5
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-6 border-b border-gray-200">
        <Text className="text-2xl font-quicksand-bold text-gray-900 mb-2">
          Rate Your Experience
        </Text>
        <Text className="text-base font-quicksand text-gray-600">
          at {restaurantName}
        </Text>
      </View>

      {/* Rating Form */}
      <View className="bg-white px-5 py-6 mt-2">
        {/* Overall Rating (Required) */}
        {renderRatingStars(
          'Overall Experience',
          'How was your overall experience with this restaurant?',
          overallRating,
          setOverallRating,
          true
        )}

        {/* Divider */}
        <View className="border-t border-gray-200 my-6" />

        {/* Food Quality (Optional) */}
        {renderRatingStars(
          'Food Quality',
          'How was the taste, freshness, and presentation?',
          foodQuality,
          setFoodQuality
        )}

        {/* Delivery Speed (Optional) */}
        {renderRatingStars(
          'Delivery Speed',
          'Was your order delivered on time?',
          deliverySpeed,
          setDeliverySpeed
        )}

        {/* Service (Optional) */}
        {renderRatingStars(
          'Service',
          'How was the customer service and packaging?',
          service,
          setService
        )}

        {/* Divider */}
        <View className="border-t border-gray-200 my-6" />

        {/* Comment */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-quicksand-bold text-gray-900">
              Your Review
            </Text>
            <Text className="text-sm font-quicksand text-gray-500">
              {comment.length}/{maxCommentLength}
            </Text>
          </View>
          <Text className="text-sm font-quicksand text-gray-600 mb-3">
            Share more about your experience (optional)
          </Text>

          <TextInput
            className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-base font-quicksand text-gray-900 min-h-[120px]"
            placeholder="What did you like or dislike?"
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={(text) => {
              if (text.length <= maxCommentLength) {
                setComment(text);
              }
            }}
            multiline
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Submit Button */}
      <View className="bg-white px-5 py-4 mt-2">
        <TouchableOpacity
          className={`rounded-xl py-4 ${
            overallRating === 0 || isSubmitting
              ? 'bg-gray-300'
              : 'bg-amber-500'
          }`}
          onPress={handleSubmit}
          disabled={overallRating === 0 || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-center text-base font-quicksand-bold text-white">
              Submit Review
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="mt-3 py-4"
          onPress={() => router.back()}
          disabled={isSubmitting}
        >
          <Text className="text-center text-base font-quicksand-semibold text-gray-600">
            Cancel
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom padding */}
      <View className="h-8" />
    </ScrollView>
  );
};

export default RestaurantRatingInput;
