'use client';

import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { config } from '@/config';
import { useAuthStore } from '@/store/authStore';
import { Restaurant } from '@/types';
import { Save, Loader2 } from 'lucide-react';

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function SettingsPage() {
  const { restaurant, setRestaurant } = useAuthStore();
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    cuisineTypes: [],
    deliveryRadius: 5,
    openingHours: {},
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        description: restaurant.description,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        cuisineTypes: restaurant.cuisineTypes || [],
        deliveryRadius: restaurant.deliveryRadius,
        openingHours: restaurant.openingHours || {},
        isActive: restaurant.isActive,
      });
      setIsLoading(false);
    }
  }, [restaurant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSaving(true);

    try {
      const updated = await databases.updateDocument(
        config.appwrite.databaseId,
        config.appwrite.restaurantsCollectionId,
        restaurant!.$id,
        {
          name: formData.name,
          description: formData.description,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          cuisineTypes: formData.cuisineTypes,
          deliveryRadius: formData.deliveryRadius,
          openingHours: formData.openingHours,
          isActive: formData.isActive,
        }
      );

      setRestaurant(updated as unknown as Restaurant);
      setMessage('Settings saved successfully!');
    } catch (error: any) {
      setMessage(error.message || 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: any) => {
    const currentHours = formData.openingHours?.[day] || { open: '09:00', close: '22:00' };
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: {
          open: field === 'open' ? value : currentHours.open,
          close: field === 'close' ? value : currentHours.close,
          closed: field === 'closed' ? value : currentHours.closed,
        },
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your restaurant settings</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-lg ${
            message.includes('success') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restaurant Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Radius (km) *
            </label>
            <input
              type="number"
              required
              min="1"
              max="50"
              value={formData.deliveryRadius}
              onChange={(e) => setFormData({ ...formData, deliveryRadius: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Restaurant is active (accepting orders)</span>
            </label>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Operating Hours</h2>
          <div className="space-y-4">
            {daysOfWeek.map((day) => {
              const hours = formData.openingHours?.[day] || { open: '09:00', close: '22:00', closed: false };
              return (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-28">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {day}
                    </label>
                  </div>
                  <div className="flex items-center gap-4 flex-1">
                    <input
                      type="time"
                      disabled={hours.closed}
                      value={hours.open || '09:00'}
                      onChange={(e) => handleHoursChange(day, 'open', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="time"
                      disabled={hours.closed}
                      value={hours.close || '22:00'}
                      onChange={(e) => handleHoursChange(day, 'close', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                    />
                    <label className="flex items-center ml-4">
                      <input
                        type="checkbox"
                        checked={hours.closed || false}
                        onChange={(e) => handleHoursChange(day, 'closed', e.target.checked)}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Closed</span>
                    </label>
                  </div>
                </div>
              );
            })}
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
