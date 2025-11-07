import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '@/components/common/CustomButton';
import CustomHeader from '@/components/common/CustomHeader';
import CustomInput from '@/components/common/CustomInput';
import { icons, images } from '@/constants';
import { updateUser, uploadAvatar } from '@/lib/appwrite';
import useAuthStore from '@/store/auth.store';

const EditProfile = () => {
    const { user, setUser } = useAuthStore();
    
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please grant permission to access your photo library to change your avatar.',
                [{ text: 'OK' }]
            );
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setIsUploadingAvatar(true);
                const imageUri = result.assets[0].uri;
                
                // Convert URI to file object for Appwrite
                const file = {
                    uri: imageUri,
                    name: `avatar-${Date.now()}.jpg`,
                    type: 'image/jpeg',
                };

                // Upload to Appwrite Storage
                const avatarUrl = await uploadAvatar(file);
                setAvatar(avatarUrl.toString());
                
                Alert.alert('Success', 'Avatar uploaded successfully!');
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to upload avatar. Please try again.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;

        // Validation
        if (!name.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        setIsLoading(true);

        try {
            const updatedData = await updateUser({
                userId: user.$id,
                name: name.trim(),
                phone: phone.trim() || undefined,
                avatar: avatar || undefined,
            });

            // Update local state
            setUser(updatedData as any);

            Alert.alert(
                'Success',
                'Profile updated successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        Alert.alert(
            'Discard Changes',
            'Are you sure you want to discard your changes?',
            [
                {
                    text: 'Keep Editing',
                    style: 'cancel',
                },
                {
                    text: 'Discard',
                    style: 'destructive',
                    onPress: () => router.back(),
                },
            ]
        );
    };

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center">
                    <Text className="paragraph-medium text-gray-500">User not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView 
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View className="px-5 pt-5">
                    <CustomHeader title="Edit Profile" />

                    {/* Avatar Section */}
                    <View className="items-center mt-8 mb-10">
                        <View className="profile-avatar">
                            {isUploadingAvatar ? (
                                <View className="size-full rounded-full bg-gray-100 items-center justify-center">
                                    <ActivityIndicator size="large" color="#FE8C00" />
                                </View>
                            ) : (
                                <Image
                                    source={
                                        avatar 
                                            ? { uri: avatar } 
                                            : images.avatar
                                    }
                                    className="size-full rounded-full"
                                    resizeMode="cover"
                                />
                            )}
                            
                            <TouchableOpacity 
                                className="profile-edit"
                                onPress={pickImage}
                                disabled={isUploadingAvatar}
                            >
                                <Image
                                    source={icons.pencil}
                                    className="size-full"
                                    resizeMode="contain"
                                    tintColor="#ffffff"
                                />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity 
                            onPress={pickImage}
                            disabled={isUploadingAvatar}
                            className="mt-3"
                        >
                            <Text className="paragraph-semibold text-primary">
                                {isUploadingAvatar ? 'Uploading...' : 'Change Avatar'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View className="gap-4">
                        <CustomInput
                            label="Full Name *"
                            placeholder="Enter your full name"
                            value={name}
                            onChangeText={setName}
                        />

                        <CustomInput
                            label="Phone Number"
                            placeholder="+1 555 123 4567"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />



                    </View>

                    {/* Action Buttons */}
                    <View className="mt-8 gap-4">
                        <CustomButton
                            title="Save Changes"
                            onPress={handleSave}
                            isLoading={isLoading}
                        />

                        <CustomButton
                            title="Cancel"
                            onPress={handleCancel}
                            style="bg-transparent border-2 border-gray-500"
                            textStyle="text-black font-semibold"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditProfile;
