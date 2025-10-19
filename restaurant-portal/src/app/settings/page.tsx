'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { databases, storage, ID } from '@/lib/appwrite';
import { config } from '@/config';
import { Loader2, Save, Upload, Info } from 'lucide-react';

interface RestaurantSettings {
  // Basic Info
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  
  // Business Info (to be filled after registration)
  businessLicense: string;
  taxCode: string;
  bankAccount: string;
  bankName: string;
  
  // Operating Hours (to be filled after registration)
  operatingHours: {
    monday: { open: string; close: string; closed?: boolean };
    tuesday: { open: string; close: string; closed?: boolean };
    wednesday: { open: string; close: string; closed?: boolean };
    thursday: { open: string; close: string; closed?: boolean };
    friday: { open: string; close: string; closed?: boolean };
    saturday: { open: string; close: string; closed?: boolean };
    sunday: { open: string; close: string; closed?: boolean };
  };
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
    operatingHours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '22:00' },
    },
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
      email: restaurant.email || '',
      address: restaurant.address || '',
      businessLicense: restaurant.businessLicense || '',
      taxCode: restaurant.taxCode || '',
      bankAccount: restaurant.bankAccount || '',
      bankName: restaurant.bankName || '',
      operatingHours: restaurant.operatingHours
        ? typeof restaurant.operatingHours === 'string'
          ? JSON.parse(restaurant.operatingHours)
          : restaurant.operatingHours
        : {
            monday: { open: '09:00', close: '22:00' },
            tuesday: { open: '09:00', close: '22:00' },
            wednesday: { open: '09:00', close: '22:00' },
            thursday: { open: '09:00', close: '22:00' },
            friday: { open: '09:00', close: '22:00' },
            saturday: { open: '09:00', close: '22:00' },
            sunday: { open: '09:00', close: '22:00' },
          },
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.$id) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // Update restaurant document
      await databases.updateDocument(
        config.appwrite.databaseId,
        config.appwrite.restaurantsCollectionId,
        restaurant.$id,
        {
          name: settings.name,
          description: settings.description,
          phone: settings.phone,
          address: settings.address,
          businessLicense: settings.businessLicense,
          taxCode: settings.taxCode,
          bankAccount: settings.bankAccount,
          bankName: settings.bankName,
          operatingHours: JSON.stringify(settings.operatingHours),
        }
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
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
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

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Operating Hours</h2>
          <p className="text-sm text-gray-600 mb-4">
            Set your restaurant&apos;s operating hours for each day of the week.
          </p>
          <div className="space-y-4">
            {Object.entries(settings.operatingHours).map(([day, hours]) => (
              <div key={day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div className="capitalize font-medium text-gray-700">{day}</div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Open</label>
                  <input
                    type="time"
                    value={hours.open}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        operatingHours: {
                          ...settings.operatingHours,
                          [day]: { ...hours, open: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Close</label>
                  <input
                    type="time"
                    value={hours.close}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        operatingHours: {
                          ...settings.operatingHours,
                          [day]: { ...hours, close: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hours.closed || false}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        operatingHours: {
                          ...settings.operatingHours,
                          [day]: { ...hours, closed: e.target.checked },
                        },
                      })
                    }
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-600">Closed</label>
                </div>
              </div>
            ))}
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
