import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuthStore } from '@/store/authStore';
import { databases, Query, ID } from '@/lib/appwrite';
import { config } from '@/config';
import type { MenuItem } from '@/types';
import MenuItemForm from '@/components/MenuItemForm';
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react';

export default function MenuPage() {
  const { restaurant } = useAuthStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    if (restaurant?.$id) {
      fetchMenuItems();
    }
  }, [restaurant]);

  const fetchMenuItems = async () => {
    if (!restaurant?.$id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      // Fetch all menu items first since restaurantId is stored as a relation
      const response = await databases.listDocuments(
        config.appwrite.databaseId,
        config.appwrite.menuCollectionId,
        [Query.limit(100)]
      );
      // Filter client-side by restaurant ID
      const filtered = response.documents.filter((item: any) => {
        const itemRestaurantId = typeof item.restaurantId === 'object' ? item.restaurantId.$id : item.restaurantId;
        return itemRestaurantId === restaurant.$id;
      });
      setMenuItems(filtered as any);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setIsLoading(false);
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
        await databases.createDocument(
          config.appwrite.databaseId,
          config.appwrite.menuCollectionId,
          ID.unique(),
          {
            ...data,
            restaurantId: restaurant.$id,
          }
        );
        await fetchMenuItems();
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('Failed to save menu item');
    }
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!restaurant) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
          <button
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            onClick={handleAddClick}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Menu Item
          </button>
        </div>

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
              <div key={item.$id} className="bg-white rounded-lg shadow overflow-hidden">
                {/* Item Image */}
                <div className="h-48 bg-gray-200 relative">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
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
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl font-bold text-primary-600">
                      {item.price.toLocaleString('vi-VN')}₫
                    </span>
                    {item.rating && (
                      <span className="text-sm text-gray-600">⭐ {item.rating.toFixed(1)}</span>
                    )}
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      onClick={() => handleEditClick(item)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button
                      className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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
      </div>
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
    </DashboardLayout>
  );
}