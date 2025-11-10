import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants";
import { CustomHeaderProps } from "@/type";

interface ExtendedHeaderProps extends CustomHeaderProps {
    showBackButton?: boolean;
    showSearchButton?: boolean;
    onBackPress?: () => void;
    centered?: boolean;
}





const CustomHeader = ({ 
    title, 
    showBackButton = true, 
    showSearchButton = false, // Changed default to false
    onBackPress,
    centered = false
}: ExtendedHeaderProps) => {
    const router = useRouter();

    const handleBackPress = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            router.back();
        }
    };

    // Simple centered header (for tabs like Cart, Profile)
    if (centered) {
        return (
            <View className="w-full py-4">
                <Text className="text-center text-xl font-semibold text-dark-100">
                    {title}
                </Text>
            </View>
        );
    }

    // Full header with navigation
    return (
        <View className="custom-header">
            {showBackButton ? (
                <TouchableOpacity onPress={handleBackPress}>
                    <Image
                        source={icons.arrowBack}
                        className="size-5"
                        resizeMode="contain"
                    />
                </TouchableOpacity>
            ) : (
                <View className="size-5" />
            )}

            {title && <Text className="base-semibold text-dark-100">{title}</Text>}

            {showSearchButton ? (
                <Image source={icons.search} className="size-5" resizeMode="contain" />
            ) : (
                <View className="size-5" />
            )}
        </View>
    );
};

export default CustomHeader;
