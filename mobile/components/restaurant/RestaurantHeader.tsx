import { View, Text, Image, TouchableOpacity, Platform, Linking } from 'react-native';
import React from 'react';
import { Restaurant } from '@/type';
import { router } from 'expo-router';
import { useResponsive } from '@/lib/responsive';

interface RestaurantHeaderProps {
  restaurant: Restaurant;
  showBackButton?: boolean;
}

const RestaurantHeader = ({ restaurant, showBackButton = true }: RestaurantHeaderProps) => {
  const { isDesktop } = useResponsive();

  const handleCall = () => {
    if (restaurant.phone) {
      Linking.openURL(`tel:${restaurant.phone}`);
    }
  };

  return (
    <View style={{ backgroundColor: 'white' }}>
      {/* Cover Image Banner - Taller */}
      <View style={{ 
        position: 'relative', 
        width: '100%', 
        height: isDesktop ? 320 : 200,
        backgroundColor: '#1f2937',
        overflow: 'hidden'
      }}>
        {/* Cover Image */}
        {Platform.OS === 'web' ? (
          <div style={{ 
            width: '100%', 
            height: '100%',
            backgroundImage: `url(${restaurant.coverImage || restaurant.logo || 'https://via.placeholder.com/1200x400'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }} />
        ) : (
          <Image
            source={{ uri: restaurant.coverImage || restaurant.logo || 'https://via.placeholder.com/1200x400' }}
            style={{ 
              width: '100%', 
              height: '100%',
            }}
            resizeMode="cover"
          />
        )}

        {/* Back Button */}
        {showBackButton && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 54 : Platform.OS === 'android' ? 44 : 20,
              left: isDesktop ? 40 : 16,
              width: 40,
              height: 40,
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              ...(Platform.OS === 'android' && { elevation: 5 })
            }}
            onPress={() => router.back()}
          >
            <Text style={{ fontSize: 20, lineHeight: 20, color: '#111827' }}>←</Text>
          </TouchableOpacity>
        )}

        {/* Logo Overlapping - Larger and positioned better */}
        {restaurant.logo && (
          <View 
            style={{
              position: 'absolute',
              bottom: -40,
              left: isDesktop ? 40 : 20,
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: '#fff',
              overflow: 'hidden',
              borderWidth: 4,
              borderColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              ...(Platform.OS === 'android' && { elevation: 8 })
            }}
          >
            {Platform.OS === 'web' ? (
              <div style={{ 
                width: '100%', 
                height: '100%',
                backgroundImage: `url(${restaurant.logo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }} />
            ) : (
              <Image
                source={{ uri: restaurant.logo }}
                style={{ 
                  width: '100%', 
                  height: '100%',
                }}
                resizeMode="cover"
              />
            )}
          </View>
        )}
      </View>

      {/* Restaurant Info - Clean & Simple Layout */}
      <View style={{
        paddingTop: 52,
        paddingHorizontal: isDesktop ? 40 : 20,
        paddingBottom: 24,
        backgroundColor: 'white'
      }}>
        {/* Restaurant Name */}
        <Text style={{ 
          fontSize: isDesktop ? 32 : 26, 
          fontWeight: '800',
          color: '#111827',
          marginBottom: 12,
          letterSpacing: -0.5
        }}>
          {restaurant.name}
        </Text>
        
        {/* Description */}
        {restaurant.description && (
          <Text style={{
            fontSize: 15,
            color: '#6b7280',
            lineHeight: 22,
            marginBottom: 20
          }} numberOfLines={2}>
            {restaurant.description}
          </Text>
        )}

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#e5e7eb', marginBottom: 20 }} />

        {/* Stats Row - Simple 3 columns */}
        <View style={{ 
          flexDirection: 'row',
          marginBottom: 20,
          gap: 12
        }}>
          {/* Rating */}
          <View style={{ 
            flex: 1,
            alignItems: 'center'
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '800',
              color: '#111827',
              marginBottom: 2
            }}>
              {restaurant.rating?.toFixed(1) || '5.0'}
            </Text>
            <Text style={{ 
              fontSize: 13, 
              color: '#6b7280',
              fontWeight: '600'
            }}>
              Rating
            </Text>
          </View>

          {/* Divider */}
          <View style={{ width: 1, backgroundColor: '#e5e7eb' }} />

          {/* Orders */}
          <View style={{ 
            flex: 1,
            alignItems: 'center'
          }}>
            <Text style={{ 
              fontSize: 20, 
              fontWeight: '800',
              color: '#111827',
              marginBottom: 2
            }}>
              {restaurant.totalOrders || 65}+
            </Text>
            <Text style={{ 
              fontSize: 13, 
              color: '#6b7280',
              fontWeight: '600'
            }}>
              Orders
            </Text>
          </View>

          {/* Divider */}
          <View style={{ width: 1, backgroundColor: '#e5e7eb' }} />

          {/* Call Button */}
          <View style={{ 
            flex: 1,
            alignItems: 'center'
          }}>
            <TouchableOpacity
              onPress={handleCall}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#fef3c7',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 6
              }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 22 }}>📞</Text>
            </TouchableOpacity>
            <Text style={{ 
              fontSize: 13, 
              color: '#6b7280',
              fontWeight: '600'
            }}>
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#e5e7eb', marginBottom: 16 }} />

        {/* Address */}
        {restaurant.address && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 10
          }}>
            <Text style={{
              flex: 1,
              fontSize: 14,
              color: '#374151',
              lineHeight: 20,
              fontWeight: '500'
            }}>
              {restaurant.address}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default RestaurantHeader;