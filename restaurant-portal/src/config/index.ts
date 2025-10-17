// Environment variables
export const config = {
  appwrite: {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '',
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '',
    // Collections
    usersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || '',
    restaurantsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_RESTAURANTS_COLLECTION_ID || '',
    menuCollectionId: process.env.NEXT_PUBLIC_APPWRITE_MENU_COLLECTION_ID || '',
    ordersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ORDERS_COLLECTION_ID || '',
    orderItemsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_ORDER_ITEMS_COLLECTION_ID || '',
    paymentsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_PAYMENTS_COLLECTION_ID || '',
    reviewsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_REVIEWS_COLLECTION_ID || '',
    // Storage
    storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID || '',
  }
}
