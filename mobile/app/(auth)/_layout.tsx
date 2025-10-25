import {View, Text, KeyboardAvoidingView, Platform, ScrollView, Dimensions, ImageBackground, Image} from 'react-native'
import {Slot} from "expo-router";
import {images} from "@/constants";

export default function AuthLayout() {
    // ✅ Allow unauthenticated users to access auth screens
    // ❌ Removed: Auto-redirect to home when authenticated
    // Users can now browse the app without logging in

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
