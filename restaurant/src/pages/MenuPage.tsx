import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuthStore } from '@/store/authStore';
import { databases, Query, ID } from '@/lib/appwrite';
import { config } from '@/config';
import type { MenuItem } from '@/types';
import MenuItemForm from '@/components/MenuItemForm';
import MenuItemReviewsModal from '@/components/MenuItemReviewsModal';
import { getMenuItemAverageRating } from '@/lib/reviews';
import { getCategoriesWithMenuCount } from '@/lib/categories';
import type { CategoryWithMenuCount } from '@/types';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Star, MessageSquare, Grid, Filter, X } from 'lucide-react';

export default function MenuPage() {
  const { restaurant } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<CategoryWithMenuCount[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categoryFromUrl);
  const [menuItemRatings, setMenuItemRatings] = useState<Record<string, { average: number; total: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showCategorySidebar, setShowCategorySidebar] = useState(true);
  const [reviewsModal, setReviewsModal] = useState<{ isOpen: boolean; itemId: string; itemName: string }>({
    isOpen: false,
    itemId: '',
    itemName: '',
  });

  useEffect(() => {
    if (restaurant?.$id) {
      fetchCategories();
      fetchMenuItems();
    }
  }, [restaurant]);

  // Update selected category when URL changes
  useEffect(() => {
    const categoryId = searchParams.get('category');
    setSelectedCategoryId(categoryId);
  }, [searchParams]);

  const fetchCategories = async () => {
    if (!restaurant?.$id) return;
    try {
      const data = await getCategoriesWithMenuCount(restaurant.$id);
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMenuItems = async () => {
    if (!restaurant?.$id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      
      // Try server-side filtering first
      let filtered: any[];
      try {
        const response = await databases.listDocuments(
          config.appwrite.databaseId,
          config.appwrite.menuCollectionId,
          [
            Query.equal('restaurantId', restaurant.$id),
            Query.limit(100)
          ]
        );
        filtered = response.documents;
      } catch {
        // Fallback to client-side filtering
        const response = await databases.listDocuments(
          config.appwrite.databaseId,
          config.appwrite.menuCollectionId,
          [Query.limit(100)]
        );
        filtered = response.documents.filter((item: any) => {
          const itemRestaurantId = typeof item.restaurantId === 'object' ? item.restaurantId.$id : item.restaurantId;
          return itemRestaurantId === restaurant.$id;
        });
      }
      
      setMenuItems(filtered as any);

      // ✅ OPTIMIZATION: Load ratings lazily in background
      // Don't block UI while fetching ratings
      loadRatingsInBackground(filtered);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load ratings in background without blocking UI
  const loadRatingsInBackground = async (items: any[]) => {
    const ratings: Record<string, { average: number; total: number }> = {};
    
    // Process in batches of 5 to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (item: any) => {
          try {
            const rating = await getMenuItemAverageRating(item.$id);
            ratings[item.$id] = { average: rating.average, total: rating.total };
            // Update state progressively as ratings load
            setMenuItemRatings(prev => ({ ...prev, [item.$id]: rating }));
          } catch (error) {
            console.error(`Error fetching rating for item ${item.$id}:`, error);
            ratings[item.$id] = { average: 0, total: 0 };
          }
        })
      );
    }
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (itemId: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this menu item?');
    if (!confirmed) return;
    try {
      await databases.deleteDocument(
        config.appwrite.databaseId,
        config.appwrite.menuCollectionId,
        itemId
      );
      setMenuItems((prev) => prev.filter((item) => item.$id !== itemId));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const handleSubmitForm = async (data: Partial<MenuItem>) => {
    if (!restaurant?.$id) {
      alert('Restaurant not found');
      return;
    }
    try {
      if (editingItem?.$id) {
        await databases.updateDocument(
          config.appwrite.databaseId,
          config.appwrite.menuCollectionId,
          editingItem.$id,
          data
        );
        await fetchMenuItems();
        setIsFormOpen(false);
        setEditingItem(null);
      } else {
        // If adding from category filter, auto-assign category
        const menuData = selectedCategoryId 
          ? { ...data, categories: selectedCategoryId }
          : data;
          
        await databases.createDocument(
          config.appwrite.databaseId,
          config.appwrite.menuCollectionId,
          ID.unique(),
          {
            ...menuData,
            restaurantId: restaurant.$id,
          }
        );
        await fetchMenuItems();
        await fetchCategories(); // Refresh category counts
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  // Filter items by search and category
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Handle categories field (can be string ID or Category object)
    const itemCategoryId = typeof item.categories === 'string' 
      ? item.categories 
      : (item.categories as any)?.$id;
    const matchesCategory = !selectedCategoryId || itemCategoryId === selectedCategoryId;
    
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    // Update URL params
    if (categoryId) {
      setSearchParams({ category: categoryId });
    } else {
      setSearchParams({});
    }
  };

  const selectedCategory = categories.find(c => c.$id === selectedCategoryId);

  if (!restaurant) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Category Filter Info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          {selectedCategory && (
            <p className="text-gray-600 mt-1">
              Category: <span className="font-semibold text-orange-600">{selectedCategory.name}</span>
              {' '}({selectedCategory.menuCount} items)
            </p>
          )}
        </div>
        <button
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          onClick={handleAddClick}
        >
          <Plus className="w-5 h-5 mr-2" />
          {selectedCategory ? `Add to ${selectedCategory.name}` : 'Add Menu Item'}
        </button>
      </div>

      {/* Category Filter Pills */}
      {categories.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-4 py-2 rounded-full transition-colors ${
                !selectedCategoryId
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({menuItems.length})
            </button>
            {categories.map((category) => (
              <button
                key={category.$id}
                onClick={() => handleCategoryClick(category.$id)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategoryId === category.$id
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.menuCount})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
          />
        </div>
      </div>

        {/* Menu Items */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Menu Items Yet</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No items match your search.' : 'Start by adding your first menu item!'}
            </p>
            {!searchTerm && (
              <button
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                onClick={handleAddClick}
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Item
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.$id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                {/* Item Image */}
                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <span className="text-6xl">🍽️</span>
                    </div>
                  )}
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-semibold">Unavailable</span>
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    {item.isAvailable ? (
                      <Eye className="w-5 h-5 text-green-500" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl font-bold text-primary-600">
                      {item.price.toLocaleString('vi-VN')}₫
                    </span>
                    {/* Auto Rating from Reviews */}
                    {menuItemRatings[item.$id] && menuItemRatings[item.$id].total > 0 ? (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-semibold text-gray-700">
                          {menuItemRatings[item.$id].average.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({menuItemRatings[item.$id].total})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No reviews</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      className="flex items-center justify-center px-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      onClick={() => handleEditClick(item)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      className="flex items-center justify-center px-2 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
                      onClick={() => setReviewsModal({ isOpen: true, itemId: item.$id, itemName: item.name })}
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Reviews
                    </button>
                    <button
                      className="flex items-center justify-center px-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      onClick={() => handleDeleteClick(item.$id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      {isFormOpen && (
        <MenuItemForm
          initialData={editingItem || {}}
          onSubmit={handleSubmitForm}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingItem(null);
          }}
        />
      )}
      
      {/* Reviews Modal */}
      <MenuItemReviewsModal
        menuItemId={reviewsModal.itemId}
        menuItemName={reviewsModal.itemName}
        isOpen={reviewsModal.isOpen}
        onClose={() => setReviewsModal({ isOpen: false, itemId: '', itemName: '' })}
      />
    </div>
  );
}
