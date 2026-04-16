type CacheEntry<T> = {
  expiresAt: number;
  staleUntil: number;
  value: T;
};

const store = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();

export async function getOrSetCache<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = store.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) return pending;

  const request = loader()
    .then((value) => {
      store.set(key, {
        value,
        expiresAt: now + ttlSeconds * 1000,
        staleUntil: now + ttlSeconds * 1000 * 5
      });
      return value;
    })
    .catch((error) => {
      if (cached && cached.staleUntil > Date.now()) return cached.value;
      throw error;
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  const value = await request;

  return value;
}

export function clearCache(key?: string) {
  if (key) {
    store.delete(key);
    return;
  }

  store.clear();
  inFlight.clear();
}
