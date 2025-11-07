/**
 * Category Type Definitions
 * Shared across mobile, admin, and restaurant apps
 */

export interface Category {
  $id: string;
  name: string;
  description?: string;
  restaurantId: string;
  displayOrder: number;
  isActive: boolean;
  $createdAt: string;
  $updatedAt: string;
}

export interface CreateCategoryParams {
  name: string;
  description?: string;
  restaurantId: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryParams {
  name?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface CategoryWithMenuCount extends Category {
  menuCount: number;
}
