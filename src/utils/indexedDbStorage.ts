import { HistorySnapshot } from '../types';

const DB_NAME = 'maket_generator_db';
const DB_VERSION = 1;
const STORE_NAME = 'app_state';
const STATE_RECORD_KEY = 'current_history_state';
const LEGACY_STORAGE_KEY = 'maket_generator_autosave_v2';

export interface SavedStateWrapper {
  history: HistorySnapshot[];
  historyIndex: number;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Initializes and returns a singleton IndexedDB connection.
 */
function openDb(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Saves history and current state into IndexedDB (supports gigabytes of data, no 5MB limit).
 */
export async function saveHistoryToDb(data: SavedStateWrapper): Promise<boolean> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, STATE_RECORD_KEY);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to save state to IndexedDB:', err);
    return false;
  }
}

/**
 * Loads history and state from IndexedDB. If empty, automatically checks and migrates legacy localStorage.
 */
export async function loadHistoryFromDb(): Promise<SavedStateWrapper | null> {
  try {
    const db = await openDb();
    const loadedData = await new Promise<SavedStateWrapper | null>((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(STATE_RECORD_KEY);

      request.onsuccess = () => {
        resolve((request.result as SavedStateWrapper) || null);
      };
      request.onerror = () => reject(request.error);
    });

    if (
      loadedData &&
      Array.isArray(loadedData.history) &&
      loadedData.history.length > 0 &&
      typeof loadedData.historyIndex === 'number'
    ) {
      return loadedData;
    }

    // Attempt migration from legacy localStorage if IndexedDB is empty
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (raw) {
          const parsed: SavedStateWrapper = JSON.parse(raw);
          if (
            parsed &&
            Array.isArray(parsed.history) &&
            parsed.history.length > 0 &&
            typeof parsed.historyIndex === 'number'
          ) {
            // Save into IndexedDB for future loads
            await saveHistoryToDb(parsed);
            return parsed;
          }
        }
      } catch (legacyErr) {
        console.warn('Could not migrate legacy localStorage state:', legacyErr);
      }
    }

    return null;
  } catch (err) {
    console.warn('Failed to load state from IndexedDB:', err);
    // Fallback to legacy localStorage if IndexedDB throws
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch {
        // ignore
      }
    }
    return null;
  }
}

/**
 * Clears saved state in IndexedDB.
 */
export async function clearHistoryFromDb(): Promise<boolean> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(STATE_RECORD_KEY);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Failed to clear state in IndexedDB:', err);
    return false;
  }
}
