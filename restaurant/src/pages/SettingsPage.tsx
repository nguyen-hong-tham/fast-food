import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { databases } from '@/lib/appwrite';
import { config } from '@/config';
import { Save, Loader2, Info } from 'lucide-react';

interface RestaurantSettings {
  name: string;
  description: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  logo: string;
  coverImage: string;
}

export default function SettingsPage() {
  const { restaurant, user, refreshRestaurant } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: '',
    description: '',
    phone: '',
    address: '',
    latitude: 10.762622,
    longitude: 106.660172,
    logo: '',
    coverImage: '',
  });

  useEffect(() => {
    if (restaurant) {
      loadRestaurantData();
    }
  }, [restaurant]);

  const safeString = (value: any): string => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return '';
    return String(value);
  };

  const loadRestaurantData = () => {
    if (!restaurant) return;

    setSettings({
      name: restaurant.name || '',
      description: restaurant.description || '',
      phone: restaurant.phone || '',
      address: restaurant.address || '',
      latitude: restaurant.latitude || 10.762622,
      longitude: restaurant.longitude || 106.660172,
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
      const updateData: Record<string, string | number> = {
        name: settings.name.trim(),
        description: settings.description.trim(),
        phone: settings.phone.trim(),
        address: settings.address.trim(),
        latitude: settings.latitude,
        longitude: settings.longitude,
      };

      let ownerIdToSend: string | null = null;
      
      if (restaurant.ownerId) {
        const ownerIdType = typeof restaurant.ownerId;
        const isArray = Array.isArray(restaurant.ownerId);
        
        if (ownerIdType === 'string' && restaurant.ownerId.length > 0) {
          ownerIdToSend = restaurant.ownerId;
        } else if (ownerIdType === 'object' && !isArray && (restaurant.ownerId as any).$id) {
          ownerIdToSend = (restaurant.ownerId as any).$id;
        } else if ((isArray || restaurant.ownerId === null) && user?.accountId) {
          ownerIdToSend = user.accountId;
        }
      } else if (user?.accountId) {
        ownerIdToSend = user.accountId;
      }
      
      if (ownerIdToSend) {
        updateData.ownerId = ownerIdToSend;
      }
      
      if (settings.logo?.trim()) {
        updateData.logo = settings.logo.trim();
      }
      if (settings.coverImage?.trim()) {
        updateData.coverImage = settings.coverImage.trim();
      }

      await databases.updateDocument(
        config.appwrite.databaseId,
        config.appwrite.restaurantsCollectionId,
        restaurant.$id,
        updateData
      );

      await refreshRestaurant();

      setMessage({
        type: 'success',
        text: 'Settings saved successfully!',
      });

      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Restaurant Found</h2>
            <p className="text-gray-600">
              Your account is not associated with any restaurant yet.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Settings</h1>
          <p className="mt-2 text-gray-600">
            Update your restaurant information and complete your profile.
          </p>
        </div>

        {restaurant.status === 'pending' && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex">
              <Info className="h-5 w-5 text-yellow-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Complete Your Profile
                </h3>
                <p className="mt-2 text-sm text-yellow-700">
                  While your restaurant is pending approval, you can complete your profile by filling in the optional fields below.
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
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Basic Information</h2>
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
                  className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
                  className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
                    className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
                  className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
                      className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
                      className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                      placeholder="e.g., 106.660172"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Get coordinates from Google Maps: right-click on your location and copy coordinates
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">Restaurant Images</h2>
            <p className="text-sm text-gray-600 mb-6">
              Add image URLs to make your restaurant more appealing to customers on the mobile app.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Logo URL
                </label>
                <div className="space-y-3">
                  {settings.logo && (
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={settings.logo}
                        alt="Restaurant logo"
                        className=" w-full h-full object-cover"
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
                    className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="https://example.com/logo.jpg"
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: Square image URL
                  </p>
                </div>
              </div>

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
                    className="bg-white w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="https://example.com/cover.jpg"
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: 16:9 aspect ratio URL
                  </p>
                </div>
              </div>
            </div>
          </div>

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
    </DashboardLayout>
  );
}
