import { useCartStore } from "@/store/cart.store";
import { MenuItem } from "@/type";
import { router } from "expo-router";
import { Image, Platform, Text, TouchableOpacity } from 'react-native';

interface MenuCardProps {
    item: MenuItem;
    restaurantId?: string;
}

const MenuCard = ({ item: { $id, image_url, name, price }, restaurantId }: MenuCardProps) => {
    const { addItem } = useCartStore();

    const handlePress = () => {
        router.push(`/menu-detail?menuId=${$id}&restaurantId=${restaurantId}`);
    };

    const handleQuickAdd = (e: any) => {
        e.stopPropagation();
        if (restaurantId) {
            addItem({ id: $id, name, price, image_url, customizations: [] }, restaurantId);
        } else {
            alert('Restaurant ID not available');
        }
    };

    return (
        <TouchableOpacity 
            className="menu-card" 
            style={Platform.OS === 'android' ? { elevation: 10, shadowColor: '#878787'}: {}}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            <Image 
                source={{ uri: image_url }} 
                className="size-32 absolute -top-10" 
                resizeMode="contain"
            />
            <Text className="text-center base-bold text-dark-100 mb-2" numberOfLines={1}>{name}</Text>
            <Text className="body-regular text-gray-200 mb-4">From ${price}</Text>
            <TouchableOpacity onPress={handleQuickAdd}>
                <Text className="paragraph-bold text-primary">Add to Cart +</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    )
}
export default MenuCard
