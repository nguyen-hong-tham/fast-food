import CustomButton from "@/components/common/CustomButton";
import CustomInput from "@/components/common/CustomInput";
import { createUser } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, View } from 'react-native';
import { useResponsive } from '@/lib/responsive';

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const { fetchAuthenticatedUser } = useAuthStore();
    const { isDesktop } = useResponsive();

    const submit = async () => {
        const { name, email, password } = form;

        if(!name || !email || !password) return Alert.alert('Error', 'Please fill in all fields.');

        setIsSubmitting(true)

        try {
            await createUser({ email,  password,  name });
            
            // Cập nhật lại auth state sau khi tạo tài khoản thành công
            await fetchAuthenticatedUser();

            // Show success message
            Alert.alert(
                'Welcome', 
                `Registration successful! Welcome to FoodFast, ${name}!`,
                [{ text: 'Get Started', onPress: () => router.replace('/') }]
            );
            
        } catch(error: any) {
            console.error('Registration failed:', error.message);
            Alert.alert('Registration Failed', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className={isDesktop ? "gap-6 py-4" : "gap-10 bg-white rounded-lg p-5 mt-5"}>
            {isDesktop && (
                <View className="mb-4">
                    <Text className="text-3xl font-bold text-gray-800 mb-2">Create Account</Text>
                    <Text className="text-base text-gray-600">Join FoodFast today</Text>
                </View>
            )}
            
            <CustomInput
                placeholder="Enter your full name"
                value={form.name}
                onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
                label="Full name"
            />
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
                title="Sign Up"
                isLoading={isSubmitting}
                onPress={submit}
            />

            <View className={isDesktop ? "flex justify-center mt-4 flex-row gap-2" : "flex justify-center mt-5 flex-row gap-2"}>
                <Text className={isDesktop ? "text-base text-gray-600" : "base-regular text-gray-100"}>
                    Already have an account?
                </Text>
                <Link href="/sign-in" className={isDesktop ? "text-base font-semibold text-primary" : "base-bold text-primary"}>
                    Sign In
                </Link>
            </View>
        </View>
    )
}

export default SignUp
