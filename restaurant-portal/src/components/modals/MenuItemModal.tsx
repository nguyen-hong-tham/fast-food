'use client';

import { useState } from 'react';
import { databases } from '@/lib/appwrite';
import { config } from '@/config';
import { MenuItem } from '@/types';
import { X, Loader2 } from 'lucide-react';
import { ID } from '@/lib/appwrite';

interface MenuItemModalProps {
  item: MenuItem | null;
  restaurantId: string;
  onClose: (refresh?: boolean) => void;
}

export default function MenuItemModal({ item, restaurantId, onClose }: MenuItemModalProps) {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    description: item?.description || '',
    price: item?.price || 0,
    calories: item?.calories || 100,
    protein: item?.protein || 10,
    image_url: item?.image_url || '', // ✅ URL input instead of file upload
    preparationTime: item?.preparationTime || 15,
    isAvailable: item?.isAvailable ?? true,
    tags: item?.tags?.join(', ') || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ❌ REMOVED: imageFile, imagePreview, categories - simplified to URL input only

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate image URL is provided
      if (!formData.image_url || !formData.image_url.trim()) {
        setError('Please provide an image URL for the menu item');
        setIsSubmitting(false);
        return;
      }

      const data = {
        restaurantId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        image_url: formData.image_url.trim(), // ✅ Use URL from form
        preparationTime: Number(formData.preparationTime),
        isAvailable: formData.isAvailable,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      if (item) {
        // Update existing item
        await databases.updateDocument(
          config.appwrite.databaseId,
          config.appwrite.menuCollectionId,
          item.$id,
          data
        );
      } else {
        // Create new item
        await databases.createDocument(
          config.appwrite.databaseId,
          config.appwrite.menuCollectionId,
          ID.unique(),
          data
        );
      }

      onClose(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save menu item');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>
          <button
            onClick={() => onClose()}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              required
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className={`text-black w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                !formData.image_url ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-xs text-gray-500">
              Paste the direct URL to your menu item image
            </p>
            {formData.image_url && (
              <div className="mt-3 relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={formData.image_url} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EInvalid URL%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Phở Bò"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe your dish..."
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₫) *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="50000"
            />
          </div>

          {/* Calories and Protein */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calories (kcal) *
              </label>
              <input
                type="number"
                required
                min="0"
                max="10000"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="250"
              />
              <p className="mt-1 text-xs text-gray-500">Energy content (0-10000 kcal)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protein (g) *
              </label>
              <input
                type="number"
                required
                min="5"
                max="10000"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: Number(e.target.value) })}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="15"
              />
              <p className="mt-1 text-xs text-gray-500">Protein content (5-10000g)</p>
            </div>
          </div>

          {/* Preparation Time and Availability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <label className="flex items-center mt-3">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Available for order</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => onClose()}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                item ? 'Update Item' : 'Add Item'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
