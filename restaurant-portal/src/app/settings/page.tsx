'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { databases, storage, ID } from '@/lib/appwrite';
import { config } from '@/config';
import { Loader2, Save, Info } from 'lucide-react';

interface RestaurantSettings {
  // Basic Info (from database)
  name: string;
  description: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  
  // Business Info (optional fields)
  businessLicense: string;  // camelCase - matches database
  taxCode: string;
  bankAccount: string;
  bankName: string;
  
  // Images
  logo: string;
  coverImage: string;
}

export default function SettingsPage() {
  const { restaurant, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: '',
    description: '',
    phone: '',
    address: '',
    latitude: 10.762622,
    longitude: 106.660172,
    businessLicense: '',
    taxCode: '',
    bankAccount: '',
    bankName: '',
    logo: '',
    coverImage: '',
  });

  useEffect(() => {
    if (restaurant) {
      loadRestaurantData();
    }
  }, [restaurant]);

  // Helper function to safely convert values to strings
  const safeString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    // If it's object/array (relationship), ignore it
    if (typeof value === 'object') {
      console.warn('⚠️ Field is object/array, converting to empty:', value);
      return '';
    }
    return String(value);
  };

  const loadRestaurantData = () => {
    if (!restaurant) return;

    console.log('🔍 Loading restaurant data:', restaurant);
    
    // Log each field type individually to find the culprit
    console.log('🔍 businessLicense type:', typeof restaurant.businessLicense, 'value:', restaurant.businessLicense);
    console.log('🔍 taxCode type:', typeof restaurant.taxCode, 'value:', restaurant.taxCode);
    console.log('🔍 bankAccount type:', typeof restaurant.bankAccount, 'value:', restaurant.bankAccount);
    console.log('🔍 bankName type:', typeof restaurant.bankName, 'value:', restaurant.bankName);
    
    // Check for relationship fields that shouldn't be here
    if ('menuItems' in restaurant) {
      console.warn('⚠️ menuItems found in restaurant:', (restaurant as any).menuItems);
    }
    if ('orders' in restaurant) {
      console.warn('⚠️ orders found in restaurant:', (restaurant as any).orders);
    }

    setSettings({
      name: restaurant.name || '',
      description: restaurant.description || '',
      phone: restaurant.phone || '',
      address: restaurant.address || '',
      latitude: restaurant.latitude || 10.762622,
      longitude: restaurant.longitude || 106.660172,
      // Skip email - might be relationship in Appwrite
      // email: safeString(restaurant.email),
      businessLicense: safeString(restaurant.businessLicense),
      taxCode: safeString(restaurant.taxCode),
      bankAccount: safeString(restaurant.bankAccount),
      bankName: safeString(restaurant.bankName),
      logo: safeString(restaurant.logo),
      coverImage: safeString(restaurant.coverImage),
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.$id) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // ⚠️ CRITICAL: ONLY send plain string/number fields
      // DO NOT send relationship fields (menuItems, orders, ownerId)
      // DO NOT send computed fields (rating, totalRevenue, etc)
      
      const updateData: Record<string, string | number> = {
        name: settings.name.trim(),
        description: settings.description.trim(),
        phone: settings.phone.trim(),
        address: settings.address.trim(),
        latitude: settings.latitude,
        longitude: settings.longitude,
      };

      // ⚠️ DO NOT send ownerId if it's an array or object!
      // Only send if it's a valid string (document ID)
      let ownerIdToSend: string | null = null;
      
      if (restaurant.ownerId) {
        const ownerIdType = typeof restaurant.ownerId;
        const isArray = Array.isArray(restaurant.ownerId);
        
        console.log('🔍 ownerId type:', ownerIdType);
        console.log('🔍 ownerId is array:', isArray);
        console.log('🔍 ownerId value:', restaurant.ownerId);
        
        if (ownerIdType === 'string' && restaurant.ownerId.length > 0) {
          ownerIdToSend = restaurant.ownerId;
          console.log('✅ Using ownerId from restaurant as string');
        } else if (ownerIdType === 'object' && !isArray && (restaurant.ownerId as any).$id) {
          ownerIdToSend = (restaurant.ownerId as any).$id;
          console.log('✅ Extracted ownerId from object');
        } else if (isArray || restaurant.ownerId === null) {
          // ownerId is array or null, use user's accountId instead
          if (user?.accountId) {
            ownerIdToSend = user.accountId;
            console.log('✅ Using user.accountId as fallback:', user.accountId);
          } else {
            console.warn('⚠️ ownerId is array/null and no user.accountId available!');
          }
        }
      } else if (user?.accountId) {
        // No ownerId at all, use user's accountId
        ownerIdToSend = user.accountId;
        console.log('✅ No ownerId, using user.accountId:', user.accountId);
      }
      
      // Add ownerId to update data if we have a valid value
      if (ownerIdToSend) {
        updateData.ownerId = ownerIdToSend;
      }

      console.log('📤 Sending update data:', updateData);
      console.log('📤 Field count:', Object.keys(updateData).length);
      
      // Add optional business fields
      if (settings.businessLicense?.trim()) {
        updateData.businessLicense = settings.businessLicense.trim();
      }
      if (settings.taxCode?.trim()) {
        updateData.taxCode = settings.taxCode.trim();
      }
      if (settings.bankAccount?.trim()) {
        updateData.bankAccount = settings.bankAccount.trim();
      }
      if (settings.bankName?.trim()) {
        updateData.bankName = settings.bankName.trim();
      }
      
      // Add image URLs
      if (settings.logo?.trim()) {
        updateData.logo = settings.logo.trim();
      }
      if (settings.coverImage?.trim()) {
        updateData.coverImage = settings.coverImage.trim();
      }
      
      console.log('📤 Final update data with optional fields:', updateData);

      // Log each field individually to verify types
      for (const [key, value] of Object.entries(updateData)) {
        console.log(`📤 Field "${key}":`, typeof value, JSON.stringify(value));
      }

      console.log('📤 Final data JSON:', JSON.stringify(updateData, null, 2));

      await databases.updateDocument(
        config.appwrite.databaseId,
        config.appwrite.restaurantsCollectionId,
        restaurant.$id,
        updateData
      );

      console.log('✅ Settings updated in database');

      // ✅ Refresh restaurant data in authStore to get latest data
      const { refreshRestaurant } = useAuthStore.getState();
      await refreshRestaurant();
      
      console.log('✅ Restaurant data refreshed in store');

      setMessage({
        type: 'success',
        text: 'Settings saved successfully!',
      });
    } catch (error: any) {
      console.error('❌ Error saving settings:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        type: error.type,
        response: error.response
      });
      
      let errorMessage = 'Failed to save settings: ';
      if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error';
      }
      
      setMessage({
        type: 'error',
        text: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Restaurant Found</h2>
          <p className="text-gray-600">
            Your account is not associated with any restaurant yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white-900">Restaurant Settings</h1>
        <p className="mt-2 text-white-600">
          Update your restaurant information and complete your profile.
        </p>
      </div>

      {/* Status Info */}
      {restaurant.status === 'pending' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <Info className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-white-800">
                Complete Your Profile
              </h3>
              <p className="mt-2 text-sm text-yellow-700">
                While your restaurant is pending approval, you can complete your profile by filling in the optional fields below. This will help speed up the approval process.
              </p>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name *
              </label>
              <input
                type="text"
                required
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                placeholder="Tell customers about your restaurant..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                />
              </div>

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                required
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Location
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Update your coordinates for accurate distance calculations on the mobile app.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={settings.latitude}
                    onChange={(e) => setSettings({ ...settings, latitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="e.g., 10.762622"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={settings.longitude}
                    onChange={(e) => setSettings({ ...settings, longitude: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="e.g., 106.660172"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Get coordinates from Google Maps: right-click on your location → copy coordinates
              </p>
            </div>

          </div>
        </div>

        {/* Restaurant Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Restaurant Images</h2>
          <p className="text-sm text-gray-600 mb-6">
            Add image URLs to make your restaurant more appealing to customers on the mobile app.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Logo / Avatar URL
              </label>
              <div className="space-y-3">
                {settings.logo && (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={settings.logo}
                      alt="Restaurant logo"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=No+Image';
                      }}
                    />
                  </div>
                )}
                <input
                  type="url"
                  value={settings.logo}
                  onChange={(e) => setSettings({ ...settings, logo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  placeholder="https://example.com/logo.jpg"
                />
                <p className="text-xs text-gray-500">
                  Recommended: Square image URL (e.g., from Imgur, Cloudinary)
                </p>
              </div>
            </div>

            {/* Cover Image URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image URL
              </label>
              <div className="space-y-3">
                {settings.coverImage && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={settings.coverImage}
                      alt="Restaurant cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x225?text=No+Image';
                      }}
                    />
                  </div>
                )}
                <input
                  type="url"
                  value={settings.coverImage}
                  onChange={(e) => setSettings({ ...settings, coverImage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  placeholder="https://example.com/cover.jpg"
                />
                <p className="text-xs text-gray-500">
                  Recommended: 16:9 aspect ratio URL (e.g., 1280x720)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Business Information</h2>
          <p className="text-sm text-gray-600 mb-4">
            Fill in these details to complete your profile and speed up the approval process.
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business License Number
                </label>
                <input
                  type="text"
                  value={settings.businessLicense}
                  onChange={(e) => setSettings({ ...settings, businessLicense: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  placeholder="e.g., 0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Code
                </label>
                <input
                  type="text"
                  value={settings.taxCode}
                  onChange={(e) => setSettings({ ...settings, taxCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  placeholder="e.g., 0123456789-001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  value={settings.bankAccount}
                  onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  placeholder="e.g., 0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  placeholder="e.g., Vietcombank, BIDV, Techcombank"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
