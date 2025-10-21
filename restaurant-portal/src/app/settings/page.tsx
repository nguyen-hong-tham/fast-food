'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { databases, storage, ID } from '@/lib/appwrite';
import { config } from '@/config';
import { Loader2, Save, Upload, Info } from 'lucide-react';

interface RestaurantSettings {
  // Basic Info (from database)
  name: string;
  description: string;
  phone: string;
  email: string;  // Optional - restaurant contact email (different from owner's login email)
  address: string;
  
  // Business Info (optional fields)
  businessLicense: string;  // ✅ camelCase - matches database
  taxCode: string;
  bankAccount: string;
  bankName: string;
}

export default function SettingsPage() {
  const { restaurant } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    businessLicense: '',
    taxCode: '',
    bankAccount: '',
    bankName: '',
  });

  useEffect(() => {
    if (restaurant) {
      loadRestaurantData();
    }
  }, [restaurant]);

  const loadRestaurantData = () => {
    if (!restaurant) return;

    setSettings({
      name: restaurant.name || '',
      description: restaurant.description || '',
      phone: restaurant.phone || '',
      email: restaurant.email || '',  // Restaurant contact email (optional)
      address: restaurant.address || '',
      businessLicense: restaurant.businessLicense || '',
      taxCode: restaurant.taxCode || '',
      bankAccount: restaurant.bankAccount || '',
      bankName: restaurant.bankName || '',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.$id) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // Update restaurant document - only send fields that exist in database
      // Build data object, only include non-empty optional fields
      const updateData: any = {
        name: settings.name.trim(),
        description: settings.description.trim(),
        phone: settings.phone.trim(),
        address: settings.address.trim(),
      };

      // Only add optional fields if they have values (non-empty strings)
      if (settings.email && settings.email.trim()) {
        updateData.email = settings.email.trim();
      }
      if (settings.businessLicense && settings.businessLicense.trim()) {
        updateData.businessLicense = settings.businessLicense.trim();
      }
      if (settings.taxCode && settings.taxCode.trim()) {
        updateData.taxCode = settings.taxCode.trim();
      }
      if (settings.bankAccount && settings.bankAccount.trim()) {
        updateData.bankAccount = settings.bankAccount.trim();
      }
      if (settings.bankName && settings.bankName.trim()) {
        updateData.bankName = settings.bankName.trim();
      }

      console.log('📤 Sending update data:', updateData);
      console.log('📤 Data types:', Object.entries(updateData).map(([k, v]) => `${k}: ${typeof v}`).join(', '));

      await databases.updateDocument(
        config.appwrite.databaseId,
        config.appwrite.restaurantsCollectionId,
        restaurant.$id,
        updateData
      );

      setMessage({
        type: 'success',
        text: 'Settings saved successfully!',
      });

      // Refresh restaurant data in store
      // You might want to add a method in authStore to reload restaurant data
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setMessage({
        type: 'error',
        text: `Failed to save settings: ${error.message}`,
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

      {/* Status Info */}
      {restaurant.status === 'pending' && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
          <div className="flex">
            <Info className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Contact Email
                </label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  placeholder="Optional - for customer inquiries"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Public contact email for customers (different from your login email)
                </p>
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
