import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomButton from '@/components/common/CustomButton';
import CustomHeader from '@/components/common/CustomHeader';
import ProfileField from '@/components/common/ProfileField';
import { icons, images } from '@/constants';
import useAuthStore from '@/store/auth.store';

const Profile = () => {
    const { user, logout, isLoading } = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoggingOut(true);
                        try {
                            await logout();
                            router.replace('/(auth)/sign-in');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout. Please try again.');
                        } finally {
                            setIsLoggingOut(false);
                        }
                    },
                },
            ]
        );
    };

    const handleEditProfile = () => {
        router.push('/edit-profile');
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center">
                    <Text className="paragraph-medium text-gray-500">Loading profile...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!user) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 items-center justify-center px-5">
                    <Image 
                        source={images.emptyState} 
                        className="w-64 h-64 mb-5"
                        resizeMode="contain"
                    />
                    <Text className="h3-bold text-dark-100 mb-2">Not Logged In</Text>
                    <Text className="paragraph-medium text-gray-500 text-center mb-8">
                        Please sign in to view your profile
                    </Text>
                    <CustomButton 
                        title="Sign In" 
                        onPress={() => router.push('/(auth)/sign-in')}
                    />
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
                    <CustomHeader 
                        title="Profile" 
                        showBackButton={false} 
                        showSearchButton={false}
                        centered={true}
                    />

                    {/* Avatar Section */}
                    <View className="items-center mt-10 mb-8">
                        <View className="profile-avatar">
                            <Image
                                source={
                                    user.avatar 
                                        ? { uri: user.avatar } 
                                        : images.avatar
                                }
                                className="size-full rounded-full"
                                resizeMode="cover"
                            />
                            
                            {/* Edit Avatar Button */}
                            <TouchableOpacity 
                                className="profile-edit"
                                onPress={() => Alert.alert('Coming Soon', 'Change avatar feature coming soon!')}
                            >
                                <Image
                                    source={icons.pencil}
                                    className="size-full"
                                    resizeMode="contain"
                                    tintColor="#ffffff"
                                />
                            </TouchableOpacity>
                        </View>
                        
                        {/* User Name - Centered below avatar */}
                        <Text className="text-xl font-bold text-dark-100 mt-4">
                            {user.name}
                        </Text>
                        <Text className="text-sm text-gray-400 mt-1">
                            {user.email}
                        </Text>
                    </View>

                    {/* Profile Information */}
                    <View className="mb-5">
                        <ProfileField
                            label="Full Name"
                            value={user.name}
                            icon={icons.person}
                        />

                        <ProfileField
                            label="Email"
                            value={user.email}
                            icon={icons.envelope}
                        />

                        <ProfileField
                            label="Phone number"
                            value={user.phone || '+1 555 123 4567'}
                            icon={icons.phone}
                        />

                    </View>

                    {/* Action Buttons */}
                    <View className="mt-5 gap-4">
                        <CustomButton
                            title="Order History"
                            onPress={() => router.push('/order-history' as any)}
                            style="bg-transparent border-2 border-primary"
                            textStyle="text-black font-semibold"
                            leftIcon={
                                <Image
                                    source={icons.clock}
                                    className="size-5 mr-2"
                                    resizeMode="contain"
                                    tintColor="#FE8C00"
                                />
                            }
                        />

                        <CustomButton
                            title="Edit Profile"
                            onPress={handleEditProfile}
                            style="bg-transparent border-2 border-primary"
                            textStyle="text-black font-semibold"
                        />

                        <CustomButton
                            title="Logout"
                            onPress={handleLogout}
                            style="bg-error"
                            isLoading={isLoggingOut}
                            leftIcon={
                                <Image
                                    source={icons.logout}
                                    className="size-5 mr-2"
                                    resizeMode="contain"
                                    tintColor="#010101ff"
                                />
                            }
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;
