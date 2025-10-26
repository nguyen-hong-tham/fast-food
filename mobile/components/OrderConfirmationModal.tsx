import CustomButton from '@/components/CustomButton';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface OrderConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (data: { name: string; address: string; phone: string; notes: string }) => Promise<void>;
  userName: string;
  userAddress: string;
  userPhone: string;
  totalItems: number;
  totalPrice: number;
  deliveryFee: number;
  discount: number;
  finalTotal: number;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  userName,
  userAddress,
  userPhone,
  totalItems,
  totalPrice,
  deliveryFee,
  discount,
  finalTotal,
}) => {
  const [name, setName] = useState(userName);
  const [address, setAddress] = useState(userAddress);
  const [phone, setPhone] = useState(userPhone);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  React.useEffect(() => {
    if (visible) {
      setName(userName);
      setAddress(userAddress);
      setPhone(userPhone);
      setNotes('');
    }
  }, [visible, userName, userAddress, userPhone]);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter recipient name');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Validation Error', 'Please enter delivery address');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Please enter phone number');
      return false;
    }
    // Basic phone validation
    if (phone.trim().length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid phone number (at least 10 digits)');
      return false;
    }
    return true;
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await onConfirm({
        name: name.trim(),
        address: address.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
      });
    } catch (error) {
      // Error handling in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl max-h-[90%]">
          <ScrollView
            className="px-6 pt-6"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="h3-bold text-dark-100">Confirm Your Order</Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="text-dark-100 text-lg">×</Text>
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View className="bg-gray-50 p-4 rounded-2xl mb-6">
              <Text className="base-bold text-dark-100 mb-3">Order Summary</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="paragraph-regular text-gray-600">Total Items</Text>
                <Text className="paragraph-medium text-dark-100">{totalItems} items</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="paragraph-regular text-gray-600">Subtotal</Text>
                <Text className="paragraph-medium text-dark-100">{(totalPrice * 1000).toLocaleString('vi-VN')}₫</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="paragraph-regular text-gray-600">Delivery Fee</Text>
                <Text className="paragraph-medium text-dark-100">{(deliveryFee * 1000).toLocaleString('vi-VN')}₫</Text>
              </View>
              <View className="flex-row justify-between mb-3">
                <Text className="paragraph-regular text-gray-600">Discount</Text>
                <Text className="paragraph-medium text-success">-{(discount * 1000).toLocaleString('vi-VN')}₫</Text>
              </View>
              <View className="border-t border-gray-300 pt-3">
                <View className="flex-row justify-between">
                  <Text className="base-bold text-dark-100">Total</Text>
                  <Text className="h4-bold text-primary-100">{(finalTotal * 1000).toLocaleString('vi-VN')}₫</Text>
                </View>
              </View>
            </View>

            {/* Delivery Information */}
            <Text className="base-bold text-dark-100 mb-4">Delivery Information</Text>

            {/* Name Input */}
            <View className="mb-4">
              <Text className="paragraph-medium text-dark-100 mb-2">Recipient Name *</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 paragraph-regular text-dark-100"
                placeholder="Enter recipient name"
                value={name}
                onChangeText={setName}
                editable={!isSubmitting}
              />
            </View>

            {/* Address Input */}
            <View className="mb-4">
              <Text className="paragraph-medium text-dark-100 mb-2">Delivery Address *</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 paragraph-regular text-dark-100"
                placeholder="Enter delivery address"
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={2}
                editable={!isSubmitting}
              />
            </View>

            {/* Phone Input */}
            <View className="mb-4">
              <Text className="paragraph-medium text-dark-100 mb-2">Phone Number *</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 paragraph-regular text-dark-100"
                placeholder="Enter phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!isSubmitting}
              />
            </View>

            {/* Notes Input (Optional) */}
            <View className="mb-6">
              <Text className="paragraph-medium text-dark-100 mb-2">Order Notes (Optional)</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3 paragraph-regular text-dark-100"
                placeholder="Any special instructions? (e.g., gate code, floor number)"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                editable={!isSubmitting}
              />
            </View>

            {/* Buttons */}
            <View className="flex-col gap-3 mb-6">
              <CustomButton
                title="Confirm Order"
                onPress={handleConfirm}
                isLoading={isSubmitting}
              />
              <TouchableOpacity
                onPress={onClose}
                disabled={isSubmitting}
                className="border-2 border-primary-100 rounded-full py-3 items-center"
              >
                <Text className="paragraph-semibold text-primary-100">Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default OrderConfirmationModal;
