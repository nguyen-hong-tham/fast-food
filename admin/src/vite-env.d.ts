/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APPWRITE_ENDPOINT: string
  readonly VITE_APPWRITE_PROJECT_ID: string
  readonly VITE_APPWRITE_DATABASE_ID: string
  readonly VITE_APPWRITE_BUCKET_ID: string
  readonly VITE_APPWRITE_USER_COLLECTION_ID: string
  readonly VITE_APPWRITE_ORDERS_COLLECTION_ID: string
  readonly VITE_APPWRITE_MENU_COLLECTION_ID: string
  readonly VITE_APPWRITE_CATEGORIES_COLLECTION_ID: string
  readonly VITE_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID: string
  readonly VITE_APPWRITE_MENU_CUSTOMIZATIONS_COLLECTION_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
