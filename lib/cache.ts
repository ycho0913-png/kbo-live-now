type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const store = new Map<string, CacheEntry<unknown>>();

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

  const value = await loader();
  store.set(key, {
    value,
    expiresAt: now + ttlSeconds * 1000
  });

  return value;
}

export function clearCache(key?: string) {
  if (key) {
    store.delete(key);
    return;
  }

  store.clear();
}
