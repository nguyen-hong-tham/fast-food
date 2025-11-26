import { Client, Account, Databases, Storage, Query, ID,ImageGravity } from "appwrite";
import { config } from "@/config";

// Prefix cho multi-restaurant
const RESTAURANT_PREFIX = "restaurant_";

if (typeof window !== "undefined") {
  if (!(window.localStorage as any).__restaurantPatched) {
    const originalSet = window.localStorage.setItem.bind(window.localStorage);
    const originalGet = window.localStorage.getItem.bind(window.localStorage);
    const originalRemove = window.localStorage.removeItem.bind(window.localStorage);

    // Appwrite session keys cần prefix
    const shouldPrefix = (key: string) =>
      key.startsWith("cookieFallback") ||
      key.startsWith("a_session") ||
      key.startsWith("appwrite");

    window.localStorage.setItem = function (key: string, value: string) {
      if (shouldPrefix(key)) {
        return originalSet(RESTAURANT_PREFIX + key, value);
      }
      return originalSet(key, value);
    };

    window.localStorage.getItem = function (key: string) {
      if (shouldPrefix(key)) {
        return originalGet(RESTAURANT_PREFIX + key);
      }
      return originalGet(key);
    };

    window.localStorage.removeItem = function (key: string) {
      if (shouldPrefix(key)) {
        return originalRemove(RESTAURANT_PREFIX + key);
      }
      return originalRemove(key);
    };

    (window.localStorage as any).__restaurantPatched = true;
  }
}

// Init client sau khi patch localStorage
export const client = new Client()
  .setEndpoint(config.appwrite.endpoint)
  .setProject(config.appwrite.projectId);

// Services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { Query, ID };

// Helpers
export const getFilePreview = (fileId: string) => {
  return storage.getFilePreview(
    config.appwrite.storageId,
    fileId,
    400,
    400,
     ImageGravity.Center,
    80
  );
};

export const getFileView = (fileId: string) => {
  return storage.getFileView(config.appwrite.storageId, fileId);
};
