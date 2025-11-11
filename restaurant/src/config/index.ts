// Environment variables - Vite uses import.meta.env instead of process.env
export const config = {
  appwrite: {
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID || '',
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
    // Collections
    usersCollectionId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || '',
    restaurantsCollectionId: import.meta.env.VITE_APPWRITE_RESTAURANTS_COLLECTION_ID || '',
    categoriesCollectionId: import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID || 'categories',
    menuCollectionId: import.meta.env.VITE_APPWRITE_MENU_COLLECTION_ID || '',
    ordersCollectionId: import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID || '',
    orderItemsCollectionId: import.meta.env.VITE_APPWRITE_ORDER_ITEMS_COLLECTION_ID || '',
    paymentsCollectionId: import.meta.env.VITE_APPWRITE_PAYMENTS_COLLECTION_ID || '',
    reviewsCollectionId: import.meta.env.VITE_APPWRITE_REVIEWS_COLLECTION_ID || '',
    dronesCollectionId: import.meta.env.VITE_APPWRITE_DRONES_COLLECTION_ID || '',
    // Storage
    storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID || '',
  }
}
