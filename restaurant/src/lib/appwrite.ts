import { Client, Account, Databases, Storage, Query, ID } from 'appwrite';
import { config } from '@/config';

// Initialize Appwrite client
export const client = new Client()
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId);

// Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Export Query and ID for convenience
export { Query, ID };

// Helper functions
export const getFilePreview = (fileId: string) => {
  return storage.getFilePreview(
    config.appwrite.storageId,
    fileId,
    400, // width
    400, // height
    'center', // gravity
    80, // quality
  );
};

export const getFileView = (fileId: string) => {
  return storage.getFileView(config.appwrite.storageId, fileId);
};
