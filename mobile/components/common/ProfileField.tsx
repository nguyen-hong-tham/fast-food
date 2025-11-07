import React from 'react';
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native';

interface ProfileFieldProps {
    label: string;
    value: string;
    icon: ImageSourcePropType;
    onPress?: () => void;
}

const ProfileField = ({ label, value, icon, onPress }: ProfileFieldProps) => {
    const Component = onPress ? TouchableOpacity : View;
    
    return (
        <Component 
            className="profile-field" 
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View className="profile-field__icon">
                <Image 
                    source={icon} 
                    className="size-6" 
                    resizeMode="contain"
                    tintColor="#FE8C00"
                />
            </View>

            <View className="flex-1">
                <Text className="body-medium text-gray-500 mb-1">{label}</Text>
                <Text className="paragraph-semibold text-dark-100">{value || 'Not set'}</Text>
            </View>
        </Component>
    );
};

export default ProfileField;
