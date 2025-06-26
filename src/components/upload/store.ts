export const initDB = (
  dbName: string,
  version: number,
  onUpgrade: (db: IDBDatabase) => void
) => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, version);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('chunks')) {
        db.createObjectStore('chunks', { keyPath: ['hash', 'index'] });
      }
      onUpgrade(db);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveChunk = (db: IDBDatabase, chunk: Blob, hash: string) => {};
