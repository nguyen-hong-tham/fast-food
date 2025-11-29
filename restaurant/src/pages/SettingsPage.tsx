import { useState, useEffect } from 'react';

import { useAuthStore } from '@/store/authStore';
import { databases, account } from '@/lib/appwrite';
import { config } from '@/config';
import { Save, Loader2, Info, CheckCircle, XCircle, X, AlertTriangle, Trash2 } from 'lucide-react';
import { Query } from '@/lib/appwrite';

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  
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

  // Check for pending orders that prevent deletion
  const checkPendingOrders = async () => {
    if (!restaurant?.$id) return;

    try {
      const orders = await databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.ordersCollectionId,
        [
          Query.equal('restaurantId', restaurant.$id),
          Query.isNotNull('status'),
        ]
      );

      // Filter orders with status: pending, preparing, ready, delivering
      const blockedOrders = orders.documents.filter((order: any) => {
        const status = order.status?.toLowerCase();
        return ['pending', 'preparing', 'ready', 'delivering'].includes(status);
      });

      setPendingOrders(blockedOrders);
      return blockedOrders;
    } catch (error) {
      console.error('Error checking pending orders:', error);
      return [];
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!restaurant?.$id) return;

    setIsDeleting(true);
    setMessage(null);

    try {
      // Check for pending orders again (in case they changed)
      const blocked = await checkPendingOrders();
      if (blocked.length > 0) {
        setMessage({
          type: 'error',
          text: `Cannot delete restaurant. You have ${blocked.length} active order(s). Please complete or cancel them first.`,
        });
        setShowDeleteModal(false);
        setIsDeleting(false);
        return;
      }

      // Step 1: Delete all orders related to this restaurant
      try {
        const orders = await databases.listDocuments(
          config.appwrite.databaseId,
          config.appwrite.ordersCollectionId,
          [Query.equal('restaurantId', restaurant.$id)]
        );
        
        for (const order of orders.documents) {
          // Delete order items first
          try {
            const orderItems = await databases.listDocuments(
              config.appwrite.databaseId,
              config.appwrite.orderItemsCollectionId,
              [Query.equal('orderId', order.$id)]
            );
            
            for (const item of orderItems.documents) {
              await databases.deleteDocument(
                config.appwrite.databaseId,
                config.appwrite.orderItemsCollectionId,
                item.$id
              );
            }
          } catch (err) {
            console.warn('Error deleting order items for order', order.$id, err);
          }
          
          // Delete order
          await databases.deleteDocument(
            config.appwrite.databaseId,
            config.appwrite.ordersCollectionId,
            order.$id
          );
        }
      } catch (err) {
        console.warn('Error deleting orders:', err);
      }

      // Step 2: Delete all menu items related to this restaurant
      try {
        const menuItems = await databases.listDocuments(
          config.appwrite.databaseId,
          config.appwrite.menuCollectionId,
          [Query.equal('restaurantId', restaurant.$id)]
        );
        
        for (const item of menuItems.documents) {
          await databases.deleteDocument(
            config.appwrite.databaseId,
            config.appwrite.menuCollectionId,
            item.$id
          );
        }
      } catch (err) {
        console.warn('Error deleting menu items:', err);
      }

      // Step 3: Delete all reviews related to this restaurant
      try {
        const reviews = await databases.listDocuments(
          config.appwrite.databaseId,
          config.appwrite.reviewsCollectionId,
          [Query.equal('restaurantId', restaurant.$id)]
        );
        
        for (const review of reviews.documents) {
          await databases.deleteDocument(
            config.appwrite.databaseId,
            config.appwrite.reviewsCollectionId,
            review.$id
          );
        }
      } catch (err) {
        console.warn('Error deleting reviews:', err);
      }

      // Step 4: Delete the restaurant document
      await databases.deleteDocument(
        config.appwrite.databaseId,
        config.appwrite.restaurantsCollectionId,
        restaurant.$id
      );

      // Step 5: Delete user account
      await account.deleteSession('current');
      
      setMessage({
        type: 'success',
        text: 'Restaurant deleted successfully. You have been logged out.',
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting restaurant:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to delete restaurant. Please try again.',
      });
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
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

        {/* Toast Notification */}
        {message && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
            <div
              className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
                message.type === 'success'
                  ? 'bg-green-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="font-medium">{message.text}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-2 hover:opacity-80 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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

          <div className="flex justify-between items-center">
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

            <button
              type="button"
              onClick={() => {
                checkPendingOrders();
                setShowDeleteModal(true);
              }}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Restaurant
            </button>
          </div>
        </form>

        {/* Delete Restaurant Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Delete Restaurant</h3>
                </div>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {pendingOrders.length > 0 ? (
                  // Show warning if there are pending orders
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-900 mb-2">Cannot Delete Restaurant</h4>
                    <p className="text-sm text-red-700 mb-3">
                      Your restaurant has {pendingOrders.length} active order(s) that need to be completed or cancelled first:
                    </p>
                    <ul className="space-y-2 max-h-48 overflow-y-auto">
                      {pendingOrders.map((order: any) => (
                        <li key={order.$id} className="text-sm text-red-700 bg-red-100 p-2 rounded">
                          Order #{order.$id.slice(-8).toUpperCase()} - Status: <strong>{order.status}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  // Show delete confirmation if no pending orders
                  <>
                    <p className="text-gray-700">
                      This action <strong>cannot be undone</strong>. This will permanently delete your restaurant and your account.
                    </p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-sm text-red-700">
                        Type <strong>"delete my restaurant"</strong> to confirm:
                      </p>
                      <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder="Type here..."
                        className="mt-2 w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteRestaurant}
                  disabled={
                    isDeleting ||
                    pendingOrders.length > 0 ||
                    deleteConfirmText !== 'delete my restaurant'
                  }
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5 mr-2" />
                      Delete Restaurant
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
