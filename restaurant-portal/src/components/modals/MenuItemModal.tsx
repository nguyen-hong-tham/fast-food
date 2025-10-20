'use client';

import { useState } from 'react';
import { databases, storage } from '@/lib/appwrite';
import { config } from '@/config';
import { MenuItem } from '@/types';
import { X, Upload, Loader2 } from 'lucide-react';
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
    // ❌ REMOVED: category - database uses categoryId relationship
    preparationTime: item?.preparationTime || 15,
    isAvailable: item?.isAvailable ?? true,
    tags: item?.tags?.join(', ') || '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(item?.image_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // ❌ REMOVED: categories array - database uses categoryId relationship

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | undefined> => {
    if (!imageFile) return item?.image_url;

    try {
      const fileId = ID.unique();
      await storage.createFile(config.appwrite.storageId, fileId, imageFile);
      return storage.getFileView(config.appwrite.storageId, fileId).toString();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate image is provided for new items
      if (!item && !imageFile) {
        setError('Please upload an image for the menu item');
        setIsSubmitting(false);
        return;
      }

      // Upload image if new file selected
      const imageUrl = await uploadImage();

      if (!imageUrl) {
        setError('Image is required');
        setIsSubmitting(false);
        return;
      }

      const data = {
        restaurantId,
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        calories: Number(formData.calories),
        protein: Number(formData.protein),
        // ❌ REMOVED: category field - database uses categoryId relationship
        image_url: imageUrl,
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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image <span className="text-red-500">*</span>
            </label>
            <div className="flex items-start gap-4">
              {imagePreview && (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <label className={`flex-1 flex flex-col items-center px-4 py-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                !item && !imageFile 
                  ? 'border-red-300 hover:border-red-400 bg-red-50' 
                  : 'border-gray-300 hover:border-primary-500'
              }`}>
                <Upload className={`w-8 h-8 mb-2 ${!item && !imageFile ? 'text-red-400' : 'text-gray-400'}`} />
                <span className={`text-sm ${!item && !imageFile ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {!item && !imageFile ? 'Image required - Click to upload' : 'Click to upload image'}
                </span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  required={!item}
                />
              </label>
            </div>
            {!item && !imageFile && (
              <p className="mt-2 text-sm text-red-600">
                ⚠️ You must upload an image before submitting
              </p>
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
                Preparation Time (minutes) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: Number(e.target.value) })}
                className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="10"
              />
            </div>

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

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="spicy, vegetarian, popular"
            />
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
