/**
 * Category API Functions - Restaurant Portal
 * Handle category CRUD operations for restaurants
 */

import { ID, Query } from 'appwrite';
import { databases } from './appwrite';
import { config } from '../config';
import {
  Category,
  CreateCategoryParams,
  UpdateCategoryParams,
  CategoryWithMenuCount,
} from '../types';

const appwriteConfig = config.appwrite;

// ===================== CREATE =====================

export const createCategory = async (
  params: CreateCategoryParams
): Promise<Category> => {
  try {
    console.log('🔍 Creating category with params:', params);
    console.log('🔍 Database ID:', appwriteConfig.databaseId);
    console.log('🔍 Collection ID:', appwriteConfig.categoriesCollectionId);
    
    const category = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      ID.unique(),
      {
        name: params.name,
        description: params.description || '',
        restaurantId: params.restaurantId, // ← String field for querying
        restaurant: [params.restaurantId], // ← Relationship field (array format)
        displayOrder: params.displayOrder || 0,
        isActive: params.isActive !== undefined ? params.isActive : true,
      }
    );

    console.log('✅ Category created:', category.$id);
    return category as unknown as Category;
  } catch (error: any) {
    console.error('❌ Error creating category:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    throw new Error(error.message || 'Failed to create category');
  }
};

// ===================== READ =====================

export const getRestaurantCategories = async (
  restaurantId: string,
  includeInactive: boolean = false
): Promise<Category[]> => {
  try {
    // Query by restaurantId string field (much faster than filtering client-side)
    const queries = [
      Query.equal('restaurantId', restaurantId), // ← Query by string field
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

    return response.documents as unknown as Category[];
  } catch (error: any) {
    console.error('❌ Error fetching categories:', error);
    return [];
  }
};

export const getCategoryById = async (
  categoryId: string
): Promise<Category | null> => {
  try {
    const category = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      categoryId
    );

    return category as unknown as Category;
  } catch (error: any) {
    console.error('❌ Error fetching category:', error);
    return null;
  }
};

export const getCategoriesWithMenuCount = async (
  restaurantId: string
): Promise<CategoryWithMenuCount[]> => {
  try {
    const categories = await getRestaurantCategories(restaurantId, true);

    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const menuResponse = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.menuCollectionId,
          [
            Query.equal('restaurantId', restaurantId),
            Query.equal('categories', category.$id), // ← Use relationship field name
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

export const updateCategory = async (
  categoryId: string,
  params: UpdateCategoryParams
): Promise<Category> => {
  try {
    const updateData: any = {};

    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined)
      updateData.description = params.description;
    if (params.displayOrder !== undefined)
      updateData.displayOrder = params.displayOrder;
    if (params.isActive !== undefined) updateData.isActive = params.isActive;

    const category = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      categoryId,
      updateData
    );

    console.log('✅ Category updated:', categoryId);
    return category as unknown as Category;
  } catch (error: any) {
    console.error('❌ Error updating category:', error);
    throw new Error(error.message || 'Failed to update category');
  }
};

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

export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    const menuResponse = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      [Query.equal('categories', categoryId), Query.limit(1)] // ← Use relationship field name
    );

    if (menuResponse.total > 0) {
      throw new Error(
        'Cannot delete category with menu items. Please move or delete menu items first.'
      );
    }

    await updateCategory(categoryId, { isActive: false });

    console.log('✅ Category deleted:', categoryId);
  } catch (error: any) {
    console.error('❌ Error deleting category:', error);
    throw error;
  }
};

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
        Query.equal('categories', categoryId), // ← Use relationship field name
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

export const getUncategorizedMenu = async (
  restaurantId: string
): Promise<any[]> => {
  try {
    const response = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      [
        Query.equal('restaurantId', restaurantId),
        Query.isNull('categoryId'),
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
