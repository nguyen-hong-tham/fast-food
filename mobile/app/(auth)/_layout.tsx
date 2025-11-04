import {View, Text, KeyboardAvoidingView, Platform, ScrollView, Dimensions, ImageBackground, Image} from 'react-native'
import {Slot} from "expo-router";
import {images} from "@/constants";
import { useResponsive } from '@/lib/responsive';

export default function AuthLayout() {
    const { isDesktop } = useResponsive();
    
    // Desktop layout - centered card with side-by-side design
    if (isDesktop) {
        return (
            <View className="flex-1 bg-gray-50">
                <ScrollView 
                    contentContainerStyle={{ 
                        minHeight: Dimensions.get('window').height,
                        justifyContent: 'center',
                        alignItems: 'center',
                        paddingVertical: 40
                    }}
                >
                    <View className="w-full max-w-5xl mx-auto px-8">
                        <View className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                            <View className="flex-row">
                                {/* Left Side - Branding */}
                                <View className="w-1/2 bg-gradient-to-br from-primary to-orange-600 p-12 flex justify-center items-center">
                                    <View className="items-center">
                                        <View className="mb-6">
                                            <Text className="text-6xl">🍔</Text>
                                        </View>
                                        <Text className="text-4xl font-bold text-white mb-4">FoodFast</Text>
                                        <Text className="text-xl text-white/90 text-center mb-8">
                                            Order amazing food{'\n'}delivered by drone
                                        </Text>
                                        <View className="bg-white/20 rounded-2xl p-6 backdrop-blur">
                                            <Text className="text-white text-center text-base">
                                                Fast delivery with drones{'\n'}
                                                100+ restaurants{'\n'}
                                                Special offers daily
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                
                                {/* Right Side - Form */}
                                <View className="w-1/2 p-12">
                                    <Slot />
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        );
    }

    // Mobile layout - original design
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView className="bg-white h-full" keyboardShouldPersistTaps="handled">
                <View 
                    className="w-full relative" 
                    style={{ height: Dimensions.get('screen').height / 2.25, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' }}>
                    <ImageBackground source={images.loginbg} className="size-full rounded-b-lg " resizeMode="stretch" />
                    <Image source={images.logo} className="self-center w-36 h-36 absolute bottom-10 z-10" />
                </View>
                <Slot />
            </ScrollView>
        </KeyboardAvoidingView>
    )
}
