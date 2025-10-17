'use client';

import { useEffect, useState } from 'react';
import { databases, storage, Query } from '@/lib/appwrite';
import { config } from '@/config';
import { useAuthStore } from '@/store/authStore';
import { MenuItem } from '@/types';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import MenuItemModal from '@/components/modals/MenuItemModal';
import Image from 'next/image';

export default function MenuPage() {
  const { restaurant } = useAuthStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const categories = ['all', 'appetizers', 'main_course', 'desserts', 'beverages', 'sides'];

  useEffect(() => {
    if (restaurant?.$id) {
      fetchMenuItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant]);

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const response = await databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.menuCollectionId,
        [Query.equal('restaurantId', restaurant!.$id), Query.limit(100)]
      );
      setMenuItems(response.documents as any);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await databases.deleteDocument(
        config.appwrite.databaseId,
        config.appwrite.menuCollectionId,
        itemId
      );
      setMenuItems(menuItems.filter(item => item.$id !== itemId));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleModalClose = (refresh?: boolean) => {
    setIsModalOpen(false);
    setEditingItem(null);
    if (refresh) {
      fetchMenuItems();
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <p className="mt-2 text-gray-600">Manage your restaurant menu items</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Menu Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 text-lg">No menu items found</p>
          <button
            onClick={handleAdd}
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
          >
            Add your first menu item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.$id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative h-48 bg-gray-200">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No image
                  </div>
                )}
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">Unavailable</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{item.category.replace('_', ' ')}</p>
                  </div>
                  <span className="text-lg font-bold text-primary-600">
                    {item.price.toLocaleString('vi-VN')}₫
                  </span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {item.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Prep: {item.preparationTime}min
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.$id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <MenuItemModal
          item={editingItem}
          restaurantId={restaurant!.$id}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
