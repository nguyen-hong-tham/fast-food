import { CustomButtonProps } from "@/type";
import cn from "clsx";
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

const CustomButton = ({
    onPress,
    title="Click Me",
    style,
    textStyle,
    leftIcon,
    isLoading = false
}: CustomButtonProps) => {
    return (
        <TouchableOpacity className={cn('custom-btn', style)} onPress={onPress}>
        <View className="flex-row items-center justify-center">
            {leftIcon && <View className="mr-2">{leftIcon}</View>}

            {isLoading ? (
            <ActivityIndicator size="small" color="white" />
            ) : (
            <Text className={cn('paragraph-semibold', textStyle)}>
                {title}
            </Text>
            )}
        </View>
        </TouchableOpacity>

    )
}
export default CustomButton
