type OfflineQueueItem<T> = {
  id: string;
  createdAt: number;
  payload: T;
};

const isBrowser = typeof window !== 'undefined';
const storageKey = (name: string) => `arogyaai-offline-${name}`;

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getOfflineQueue<T>(name: string): OfflineQueueItem<T>[] {
  if (!isBrowser) return [];
  const stored = safeParse<OfflineQueueItem<T>[]>(window.localStorage.getItem(storageKey(name)));
  return Array.isArray(stored) ? stored : [];
}

export function addOfflineQueueItem<T>(name: string, payload: T) {
  if (!isBrowser) return;
  const items = getOfflineQueue<T>(name);
  items.push({
    id: `${name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
    payload,
  });
  window.localStorage.setItem(storageKey(name), JSON.stringify(items));
}

export function removeOfflineQueueItem(name: string, id: string) {
  if (!isBrowser) return;
  const items = getOfflineQueue<any>(name).filter((item) => item.id !== id);
  window.localStorage.setItem(storageKey(name), JSON.stringify(items));
}

export function clearOfflineQueue(name: string) {
  if (!isBrowser) return;
  window.localStorage.removeItem(storageKey(name));
}

export async function processOfflineQueue<T>(
  name: string,
  handler: (payload: T) => Promise<boolean>
): Promise<number> {
  if (!isBrowser) return 0;
  const items = getOfflineQueue<T>(name);
  let remaining = items.length;

  for (const item of items) {
    try {
      const success = await handler(item.payload);
      if (success) {
        removeOfflineQueueItem(name, item.id);
        remaining -= 1;
      }
    } catch {
      // Keep item for retry later
    }
  }

  return remaining;
}
