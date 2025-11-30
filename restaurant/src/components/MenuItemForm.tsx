import React, { useState, useEffect } from 'react';
import type { MenuItem } from '@/types';
import { getRestaurantCategories } from '@/lib/categories.ts';
import { useAuthStore } from '@/store/authStore';

interface MenuItemFormProps {
  /**
   * Initial data to prefill the form. If `$id` is present, the form acts as an edit form.
   */
  initialData?: Partial<MenuItem>;
  /**
   * Callback fired when the user submits the form. Should handle create or update logic.
   */
  onSubmit: (data: Partial<MenuItem>) => Promise<void>;
  /**
   * Callback fired when the user cancels the form.
   */
  onCancel: () => void;
}

/**
 * A controlled form component for creating or editing menu items. It surfaces fields
 * relevant to the MenuItem schema defined in the restaurant portal: name, description,
 * price, image URL, calories, protein, rating and availability. The parent component
 * handles persistence via the `onSubmit` callback.
 */
export default function MenuItemForm({ initialData = {}, onSubmit, onCancel }: MenuItemFormProps) {
  const { restaurant } = useAuthStore();
  const [name, setName] = useState(initialData.name || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [price, setPrice] = useState<number>(initialData.price ?? 0);
  const [imageUrl, setImageUrl] = useState(initialData.image_url || '');
  const [calories, setCalories] = useState<number>(initialData.calories ?? 50);
  const [protein, setProtein] = useState<number>(initialData.protein ?? 100);
  const [isAvailable, setIsAvailable] = useState<boolean>(initialData.isAvailable ?? true);
  const [categoryId, setCategoryId] = useState<string>(() => {
    if (typeof initialData.categories === 'string') {
      return initialData.categories;
    }
    if (initialData.categories && typeof initialData.categories === 'object') {
      return (initialData.categories as any).$id || '';
    }
    return '';
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories when component mounts
  useEffect(() => {
    if (restaurant?.$id) {
      loadCategories();
    }
  }, [restaurant]);

  const loadCategories = async () => {
    if (!restaurant?.$id) return;
    
    try {
      const data = await getRestaurantCategories(restaurant.$id, false);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // basic validation
    if (!name.trim()) {
      alert('Name is required');
      return;
    }
    if (!description.trim()) {
      alert('Description is required');
      return;
    }
    if (price <= 0) {
      alert('Price must be greater than zero');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        price,
        image_url: imageUrl.trim() || undefined,
        calories: calories || undefined,
        protein: protein || undefined,
        isAvailable,
        categories: categoryId || undefined, // ← Many-to-One relationship: string ID, not array
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">
          {initialData.$id ? 'Edit Menu Item' : 'Add Menu Item'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Name*
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-black bg-white w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
              Description*
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-black bg-white w-full border border-gray-300 rounded-md px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
              Category {categories.length === 0 && <span className="text-xs text-gray-500">(Create categories first)</span>}
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="text-black bg-white w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={categories.length === 0}
            >
              <option value="">No Category (Uncategorized)</option>
              {categories.map((category) => (
                <option key={category.$id} value={category.$id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                💡 Tip: Create categories first to organize your menu better
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="price">
                Price* (₫)
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                className="text-black bg-white w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="imageUrl">
                Image URL*
              </label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="text-black bg-white w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="calories">
                Calories*
              </label>
              <input
                id="calories"
                type="number"
                min="0"
                value={calories}
                onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                className="text-black bg-white w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="protein">
                Protein* (g)
              </label>
              <input
                id="protein"
                type="number"
                min="0"
                value={protein}
                onChange={(e) => setProtein(parseInt(e.target.value) || 0)}
                className="text-black bg-white w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="isAvailable"
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isAvailable" className="text-sm text-gray-700">
              Available
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : initialData.$id ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}