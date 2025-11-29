/**
 * Category API Functions
 * Handle category CRUD operations for restaurants
 */

import { ID, Query } from 'react-native-appwrite';
import { databases, appwriteConfig } from './appwrite';
import { Category, CreateCategoryParams, UpdateCategoryParams } from '@/type';

// ===================== CREATE =====================

/**
 * Create a new category for a restaurant
 */
export const createCategory = async (
  params: CreateCategoryParams
): Promise<Category> => {
  try {
    const category = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      ID.unique(),
      {
        name: params.name,
        description: params.description || '',
        restaurantId: params.restaurantId,
        displayOrder: params.displayOrder || 0,
        isActive: params.isActive !== undefined ? params.isActive : true,
      }
    );

    console.log('✅ Category created:', category.$id);
    return category as Category;
  } catch (error: any) {
    console.error('❌ Error creating category:', error);
    throw new Error(error.message || 'Failed to create category');
  }
};

// ===================== READ =====================

/**
 * Get all categories for a restaurant
 */
export const getRestaurantCategories = async (
  restaurantId: string,
  includeInactive: boolean = false
): Promise<Category[]> => {
  try {
    const queries = [
      Query.equal('restaurantId', restaurantId),
      Query.orderAsc('displayOrder'),
      Query.orderAsc('name'),
    ];

    if (!includeInactive) {
      queries.push(Query.equal('isActive', true));
    }

    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      queries
    );

    return response.documents as Category[];
  } catch (error: any) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
};

/**
 * Get a single category by ID
 */
export const getCategoryById = async (categoryId: string): Promise<Category | null> => {
  try {
    const category = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      categoryId
    );

    return category as Category;
  } catch (error: any) {
    console.error('❌ Error fetching category:', error);
    return null;
  }
};

/**
 * Get categories with menu item count
 */
export const getCategoriesWithMenuCount = async (
  restaurantId: string
): Promise<any[]> => {
  try {
    const categories = await getRestaurantCategories(restaurantId, false);
    
    // Get menu items count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const menuResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.menuCollectionId,
          [
            Query.equal('restaurantId', restaurantId),
            Query.equal('categories', category.$id),
            Query.equal('isAvailable', true),
          ]
        );

        return {
          ...category,
          menuCount: menuResponse.total,
        };
      })
    );

    return categoriesWithCount;
  } catch (error: any) {
    console.error('❌ Error fetching categories with count:', error);
    return [];
  }
};

// ===================== UPDATE =====================

/**
 * Update a category
 */
export const updateCategory = async (
  categoryId: string,
  params: UpdateCategoryParams
): Promise<Category> => {
  try {
    const updateData: any = {};

    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.displayOrder !== undefined) updateData.displayOrder = params.displayOrder;
    if (params.isActive !== undefined) updateData.isActive = params.isActive;

    const category = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      categoryId,
      updateData
    );

    console.log('✅ Category updated:', categoryId);
    return category as Category;
  } catch (error: any) {
    console.error('❌ Error updating category:', error);
    throw new Error(error.message || 'Failed to update category');
  }
};

/**
 * Reorder categories
 */
export const reorderCategories = async (
  categoryOrders: { id: string; order: number }[]
): Promise<void> => {
  try {
    await Promise.all(
      categoryOrders.map((item) =>
        updateCategory(item.id, { displayOrder: item.order })
      )
    );

    console.log('✅ Categories reordered');
  } catch (error: any) {
    console.error('❌ Error reordering categories:', error);
    throw new Error(error.message || 'Failed to reorder categories');
  }
};

// ===================== DELETE =====================

/**
 * Delete a category (soft delete by setting isActive to false)
 */
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    // Check if category has menu items
    const menuResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      [Query.equal('categoryId', categoryId), Query.limit(1)]
    );

    if (menuResponse.total > 0) {
      throw new Error(
        'Cannot delete category with menu items. Please move or delete menu items first.'
      );
    }

    // Soft delete
    await updateCategory(categoryId, { isActive: false });

    console.log('✅ Category deleted:', categoryId);
  } catch (error: any) {
    console.error('❌ Error deleting category:', error);
    throw error;
  }
};

/**
 * Hard delete a category (permanent deletion)
 */
export const hardDeleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      categoryId
    );

    console.log('✅ Category permanently deleted:', categoryId);
  } catch (error: any) {
    console.error('❌ Error hard deleting category:', error);
    throw new Error(error.message || 'Failed to delete category');
  }
};

// ===================== MENU ITEMS BY CATEGORY =====================

/**
 * Get menu items by category
 */
export const getMenuByCategory = async (
  restaurantId: string,
  categoryId: string
): Promise<any[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      [
        Query.equal('restaurantId', restaurantId),
        Query.equal('categories', categoryId),
        Query.equal('isAvailable', true),
        Query.orderAsc('name'),
      ]
    );

    return response.documents;
  } catch (error: any) {
    console.error('❌ Error fetching menu by category:', error);
    return [];
  }
};

/**
 * Get uncategorized menu items (items without a category)
 */
export const getUncategorizedMenu = async (
  restaurantId: string
): Promise<any[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      [
        Query.equal('restaurantId', restaurantId),
        Query.isNull('categories'),
        Query.equal('isAvailable', true),
        Query.orderAsc('name'),
      ]
    );

    return response.documents;
  } catch (error: any) {
    console.error('❌ Error fetching uncategorized menu:', error);
    return [];
  }
};
