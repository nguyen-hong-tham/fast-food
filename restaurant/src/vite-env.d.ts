/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string
  readonly VITE_APPWRITE_PROJECT_ID: string
  readonly VITE_APPWRITE_DATABASE_ID: string
  readonly VITE_APPWRITE_USERS_COLLECTION_ID: string
  readonly VITE_APPWRITE_RESTAURANTS_COLLECTION_ID: string
  readonly VITE_APPWRITE_MENU_COLLECTION_ID: string
  readonly VITE_APPWRITE_ORDERS_COLLECTION_ID: string
  readonly VITE_APPWRITE_ORDER_ITEMS_COLLECTION_ID: string
  readonly VITE_APPWRITE_PAYMENTS_COLLECTION_ID: string
  readonly VITE_APPWRITE_REVIEWS_COLLECTION_ID: string
  readonly VITE_APPWRITE_STORAGE_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
