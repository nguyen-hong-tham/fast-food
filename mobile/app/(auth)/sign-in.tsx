import CustomButton from "@/components/common/CustomButton";
import CustomInput from "@/components/common/CustomInput";
import { signIn } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import * as Sentry from '@sentry/react-native';
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, View, Platform } from 'react-native';
import { useResponsive } from '@/lib/responsive';

const SignIn = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const { fetchAuthenticatedUser } = useAuthStore();
    const { isDesktop } = useResponsive();

    const submit = async () => {
        const { email, password } = form;

        if(!email || !password) return Alert.alert('Error', 'Please fill in all fields.');

        setIsSubmitting(true)

        try {
            await signIn({ email, password });
            
            // Cập nhật lại auth state sau khi đăng nhập thành công
            await fetchAuthenticatedUser();

            // Kiểm tra role của user - chỉ cho phép customer đăng nhập vào mobile app
            const currentUser = useAuthStore.getState().user;
            
            if (!currentUser) {
                throw new Error('Unable to fetch user information');
            }

            // Kiểm tra role - chỉ cho phép customer
            if (currentUser.role !== 'customer') {
                // Đăng xuất ngay lập tức
                await useAuthStore.getState().logout();
                
                let errorMessage = 'Access Denied';
                let errorDescription = 'This app is for customers only.';
                
                if (currentUser.role === 'restaurant') {
                    errorDescription = 'Restaurant accounts cannot access this app. Please use the Restaurant Portal.';
                } else if (currentUser.role === 'admin') {
                    errorDescription = 'Admin accounts cannot access this app. Please use the Admin Portal.';
                }
                
                Alert.alert(errorMessage, errorDescription);
                return;
            }

            // Navigate back to home nếu là customer
            router.replace('/');
            
        } catch(error: any) {
            console.error('Login failed:', error);
            
            // Handle rate limit error
            if (error.code === 429 || error.message?.includes('Rate limit')) {
                Alert.alert(
                    'Too Many Requests', 
                    'Please wait a moment and try again. The server is limiting requests to prevent abuse.'
                );
            } else {
                Alert.alert(
                    'Login Failed', 
                    error.message || 'Invalid email or password. Please try again.'
                );
            }
            
            Sentry.captureException(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className={isDesktop ? "gap-6 py-4" : "gap-10 bg-white rounded-lg p-5 mt-5"}>
            {isDesktop && (
                <View className="mb-4">
                    <Text className="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</Text>
                    <Text className="text-base text-gray-600">Sign in to continue to FoodFast</Text>
                </View>
            )}
            
            <CustomInput
                placeholder="Enter your email"
                value={form.email}
                onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
                label="Email"
                keyboardType="email-address"
            />
            <CustomInput
                placeholder="Enter your password"
                value={form.password}
                onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                label="Password"
                secureTextEntry={true}
            />

            <CustomButton
                title="Sign In"
                isLoading={isSubmitting}
                onPress={submit}
            />

            <View className={isDesktop ? "flex justify-center mt-4 flex-row gap-2" : "flex justify-center mt-5 flex-row gap-2"}>
                <Text className={isDesktop ? "text-base text-gray-600" : "base-regular text-gray-100"}>
                    Don't have an account?
                </Text>
                <Link href="/sign-up" className={isDesktop ? "text-base font-semibold text-primary" : "base-bold text-primary"}>
                    Sign Up
                </Link>
            </View>
        </View>
    )
}

export default SignIn
