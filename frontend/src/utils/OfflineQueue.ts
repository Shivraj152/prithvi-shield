const DB_NAME = 'PrithviOfflineDB';
const STORE_NAME = 'citizen_reports';

export interface OfflineReport {
  id?: number;
  description: string;
  longitude: number;
  latitude: number;
  photo_url?: string;
  created_at: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineReport(report: Omit<OfflineReport, 'id'>): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(report);
    
    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineReports(): Promise<OfflineReport[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteOfflineReport(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function syncOfflineReports(token: string, apiBaseUrl: string): Promise<number> {
  const reports = await getOfflineReports();
  if (reports.length === 0) return 0;

  console.log(`[Offline Sync] Found ${reports.length} pending reports. Commencing sync...`);
  let syncedCount = 0;

  for (const report of reports) {
    try {
      const response = await fetch(`${apiBaseUrl}/citizen-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: report.description,
          longitude: report.longitude,
          latitude: report.latitude,
          photo_url: report.photo_url
        })
      });

      if (response.ok) {
        if (report.id !== undefined) {
          await deleteOfflineReport(report.id);
          syncedCount++;
        }
      } else {
        console.warn(`[Offline Sync] Failed to upload report ${report.id}, server returned code ${response.status}`);
      }
    } catch (err) {
      console.error(`[Offline Sync] Connection failure during report sync:`, err);
      break; // Stop syncing if server is unreachable
    }
  }

  return syncedCount;
}
