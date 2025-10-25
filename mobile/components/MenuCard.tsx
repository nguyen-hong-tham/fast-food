import { MenuItem } from "@/type";
import { router } from "expo-router";
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';

interface MenuCardProps {
    item: MenuItem;
    restaurantId?: string;
}

const MenuCard = ({ item: { $id, image_url, name, price }, restaurantId }: MenuCardProps) => {
    const handlePress = () => {
        router.push(`/menu-detail?menuId=${$id}&restaurantId=${restaurantId}`);
    };

    return (
        <TouchableOpacity 
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100" 
            style={Platform.OS === 'android' ? { elevation: 3 }: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
            onPress={handlePress}
            activeOpacity={0.8}
        >
            <Image 
                source={{ uri: image_url }} 
                className="w-full h-24 mb-3 rounded-xl" 
                resizeMode="cover"
            />
            <Text className="text-sm font-semibold text-gray-900 mb-1" numberOfLines={2}>{name}</Text>
            <Text className="text-xs text-gray-500 mb-3">{price.toLocaleString('vi-VN')}₫</Text>
            <TouchableOpacity 
                className="bg-amber-50 py-2 px-3 rounded-lg"
                onPress={handlePress}
            >
                <Text className="text-xs font-medium text-amber-600 text-center">View Details</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    )
}
export default MenuCard
