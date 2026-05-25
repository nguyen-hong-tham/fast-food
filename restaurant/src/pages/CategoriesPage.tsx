/**
 * Categories Page - Restaurant Portal
 * Manage menu categories: Add, Edit, Delete, Reorder
 * Click on category to view/add menu items
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import {
  getCategoriesWithMenuCount,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../lib/categories.ts';
import { Category, CategoryWithMenuCount } from '../types/index';
import CategoryModal from '../components/CategoryModal.tsx';

const CategoriesPage: React.FC = () => {
  const { restaurant } = useAuthStore();
  const [categories, setCategories] = useState<CategoryWithMenuCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  useEffect(() => {
    if (restaurant?.$id) {
      loadCategories();
    }
  }, [restaurant]);

  const loadCategories = async () => {
    if (!restaurant?.$id) return;

    setLoading(true);
    try {
      const data = await getCategoriesWithMenuCount(restaurant.$id);
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      await loadCategories();
      alert('Category deleted successfully');
    } catch (error: any) {
      alert(error.message || 'Failed to delete category');
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await updateCategory(category.$id, { isActive: !category.isActive });
      await loadCategories();
    } catch (error: any) {
      alert(error.message || 'Failed to update category');
    }
  };

  const handleSave = async () => {
    setShowModal(false);
    setEditingCategory(null); // Reset editing state
    await loadCategories();
  };

  // Drag and drop for reordering
  const handleDragStart = (e: React.DragEvent, categoryId: string) => {
    setDraggingId(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();

    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      return;
    }

    const dragIndex = categories.findIndex((c) => c.$id === draggingId);
    const targetIndex = categories.findIndex((c) => c.$id === targetId);

    if (dragIndex === -1 || targetIndex === -1) return;

    // Reorder locally
    const newCategories = [...categories];
    const [removed] = newCategories.splice(dragIndex, 1);
    newCategories.splice(targetIndex, 0, removed);

    // Update display order
    const updates = newCategories.map((cat, index) => ({
      id: cat.$id,
      order: index,
    }));

    setCategories(newCategories);
    setDraggingId(null);

    try {
      await reorderCategories(updates);
    } catch (error) {
      console.error('Error reordering categories:', error);
      await loadCategories(); // Reload on error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Categories</h1>
          <p className="text-gray-600 mt-1">
            Organize your menu items into categories
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Categories Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create categories to organize your menu items
          </p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus size={20} />
            Create First Category
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            {categories.map((category) => (
              <div
                key={category.$id}
                draggable
                onDragStart={(e) => handleDragStart(e, category.$id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category.$id)}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  draggingId === category.$id ? 'opacity-50' : ''
                } ${!category.isActive ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  {/* Drag Handle */}
                  <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                    <GripVertical size={20} />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      {!category.isActive && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                          Inactive
                        </span>
                      )}
                      {/* Menu count badge */}
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                        {category.menuCount} món
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    
                    <button
                      onClick={() => handleToggleActive(category)}
                      className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      title={category.isActive ? 'Hide category' : 'Show category'}
                    >
                      {category.isActive ? (
                        <Eye size={18} />
                      ) : (
                        <EyeOff size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-gray-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.$id)}
                      className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={category.menuCount > 0}
                      title={
                        category.menuCount > 0
                          ? 'Cannot delete category with menu items'
                          : 'Delete category'
                      }
                    >
                      <Trash2
                        size={18}
                        className={category.menuCount > 0 ? 'opacity-30' : ''}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <CategoryModal
          key={editingCategory?.$id || 'new'} 
          category={editingCategory}
          restaurantId={restaurant!.$id}
          onClose={() => {
            setShowModal(false);
            setEditingCategory(null); // Reset when closing
          }}
          onSave={handleSave}
        />
      )}

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Kéo thả categories để sắp xếp lại thứ tự hiển thị</li>
          <li>• Ẩn categories không hoạt động thay vì xóa chúng</li>
          <li>• Sắp xếp menu của bạn để khách hàng dễ dàng tìm kiếm món ăn</li>
        </ul>
      </div>
    </div>
  );
};

export default CategoriesPage;
