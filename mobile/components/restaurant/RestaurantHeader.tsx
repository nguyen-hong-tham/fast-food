import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
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

  return (
    <View style={{ backgroundColor: 'white' }}>
      {/* Cover Image Banner */}
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
              top: Platform.OS === 'web' ? 20 : 44,
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
      </View>

      {/* Restaurant Info Card - Overlapping Banner */}
      <View style={{
        marginHorizontal: isDesktop ? 40 : 16,
        marginTop: isDesktop ? -80 : -50,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: isDesktop ? 32 : 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        ...(Platform.OS === 'android' && { elevation: 8 }),
        ...(isDesktop && {
          maxWidth: 1200,
          alignSelf: 'center',
          width: '100%',
        })
      }}>
        {/* Logo & Name Section */}
        <View style={{ 
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: isDesktop ? 'center' : 'flex-start',
          marginBottom: 20,
          gap: isDesktop ? 20 : 12
        }}>
          {/* Logo */}
          {restaurant.logo && (
            <View 
              style={{
                width: isDesktop ? 100 : 80,
                height: isDesktop ? 100 : 80,
                borderRadius: 20,
                backgroundColor: '#f9fafb',
                overflow: 'hidden',
                borderWidth: 4,
                borderColor: 'white',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                ...(Platform.OS === 'android' && { elevation: 4 })
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

          {/* Name & Tags */}
          <View style={{ flex: 1 }}>
            <Text style={{ 
              fontSize: isDesktop ? 32 : 24, 
              fontWeight: '800',
              color: '#111827',
              marginBottom: 8,
              letterSpacing: -0.5
            }}>
              {restaurant.name}
            </Text>
            
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              flexWrap: 'wrap',
              gap: 8
            }}>
              {restaurant.cuisine && (
                <View style={{ 
                  backgroundColor: '#fef3c7',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}>
                  <Text style={{ 
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#d97706'
                  }}>
                    🍽️ {restaurant.cuisine}
                  </Text>
                </View>
              )}
              {restaurant.estimatedDeliveryTime && (
                <View style={{ 
                  backgroundColor: '#dbeafe',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}>
                  <Text style={{ 
                    fontSize: 13,
                    fontWeight: '600',
                    color: '#2563eb'
                  }}>
                    ⏱️ {restaurant.estimatedDeliveryTime} min
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Description */}
        {restaurant.description && (
          <Text 
            style={{ 
              fontSize: 15,
              lineHeight: 22,
              color: '#6b7280',
              marginBottom: 20
            }}
            numberOfLines={isDesktop ? 3 : 2}
          >
            {restaurant.description}
          </Text>
        )}

        {/* Stats Grid - Responsive */}
        <View style={{ 
          flexDirection: isDesktop ? 'row' : 'column',
          gap: 16,
          marginBottom: 20
        }}>
          {/* Stats Cards Row */}
          <View style={{ 
            flex: isDesktop ? 1 : undefined,
            flexDirection: 'row',
            gap: 12
          }}>
            {/* Rating */}
            <View style={{ 
              flex: 1,
              backgroundColor: '#fef3c7',
              borderRadius: 16,
              padding: isDesktop ? 16 : 14,
              alignItems: 'center',
              minHeight: isDesktop ? 100 : 85
            }}>
              <Text style={{ fontSize: 20, marginBottom: 4 }}>⭐</Text>
              <Text style={{ 
                fontSize: isDesktop ? 24 : 20, 
                fontWeight: '800',
                color: '#d97706',
                marginBottom: 4
              }}>
                {restaurant.rating.toFixed(1)}
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: '#78716c', 
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Rating
              </Text>
            </View>

            {/* Orders */}
            <View style={{ 
              flex: 1,
              backgroundColor: '#dbeafe',
              borderRadius: 16,
              padding: isDesktop ? 16 : 14,
              alignItems: 'center',
              minHeight: isDesktop ? 100 : 85
            }}>
              <Text style={{ fontSize: 20, marginBottom: 4 }}>📦</Text>
              <Text style={{ 
                fontSize: isDesktop ? 24 : 20, 
                fontWeight: '800',
                color: '#2563eb',
                marginBottom: 4
              }}>
                {restaurant.totalOrders}+
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: '#78716c', 
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Orders
              </Text>
            </View>

            {/* Delivery Fee */}
            <View style={{ 
              flex: 1,
              backgroundColor: '#d1fae5',
              borderRadius: 16,
              padding: isDesktop ? 16 : 14,
              alignItems: 'center',
              minHeight: isDesktop ? 100 : 85
            }}>
              <Text style={{ fontSize: 20, marginBottom: 4 }}>🚚</Text>
              <Text style={{ 
                fontSize: isDesktop ? 24 : 20, 
                fontWeight: '800',
                color: '#059669',
                marginBottom: 4
              }}>
                {restaurant.deliveryFee ? `$${restaurant.deliveryFee}` : 'Free'}
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: '#78716c', 
                fontWeight: '600',
                textAlign: 'center'
              }}>
                Delivery
              </Text>
            </View>
          </View>

          {/* Call Button - Desktop: Part of row, Mobile: Full width */}
          <TouchableOpacity
            style={{
              backgroundColor: '#f97316',
              borderRadius: 16,
              ...(isDesktop ? {
                width: 100,
                height: 100,
              } : {
                width: '100%',
                paddingVertical: 16,
              }),
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#f97316',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              ...(Platform.OS === 'android' && { elevation: 4 })
            }}
          >
            <Text style={{ fontSize: isDesktop ? 32 : 24, marginBottom: isDesktop ? 4 : 0 }}>📞</Text>
            {!isDesktop && (
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '700',
                color: 'white',
                marginTop: 4
              }}>
                Contact Restaurant
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Address */}
        <View style={{ 
          backgroundColor: '#f9fafb',
          borderRadius: 14,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#e5e7eb'
        }}>
          <Text style={{ fontSize: 18, marginRight: 12 }}>📍</Text>
          <Text 
            style={{ 
              flex: 1,
              fontSize: 14,
              lineHeight: 20,
              color: '#4b5563',
              fontWeight: '500'
            }}
            numberOfLines={isDesktop ? 2 : 1}
          >
            {restaurant.address}
          </Text>
        </View>

        {/* Unavailable Warning */}
        {restaurant.isActive === false && (
          <View style={{ 
            marginTop: 16,
            backgroundColor: '#fef2f2',
            borderWidth: 2,
            borderColor: '#fecaca',
            borderRadius: 14,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 24, marginRight: 12 }}>⚠️</Text>
            <Text style={{ 
              flex: 1,
              color: '#dc2626',
              fontSize: 14,
              fontWeight: '700',
            }}>
              Currently unavailable for orders
            </Text>
          </View>
        )}
      </View>

      {/* Spacer */}
      <View style={{ height: 20 }} />
    </View>
  );
};

export default RestaurantHeader;