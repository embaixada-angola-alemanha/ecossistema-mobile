import { useState, useEffect, useCallback } from 'react';
import { OfflineCache } from '@services/offline-cache';
import { SyncQueue } from '@services/sync-queue';
import { SyncProcessor } from '@services/sync-processor';

/**
 * Hook to track online/offline state and pending sync operations.
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Check initial state
    OfflineCache.isOnline().then(setIsOnline);
    SyncQueue.count().then(setPendingCount);

    // Subscribe to connectivity changes
    const unsubscribe = OfflineCache.onConnectivityChange((online) => {
      setIsOnline(online);
      if (online) {
        // Refresh pending count after sync
        setTimeout(() => SyncQueue.count().then(setPendingCount), 2000);
      }
    });

    return () => unsubscribe();
  }, []);

  const triggerSync = useCallback(async () => {
    const result = await SyncProcessor.processNow();
    const count = await SyncQueue.count();
    setPendingCount(count);
    return result;
  }, []);

  return { isOnline, pendingCount, triggerSync };
}

/**
 * Hook for cache-first data loading with offline fallback.
 * Fetches from network when online, falls back to cache when offline.
 */
export function useCachedQuery<T>(
  cacheKey: string,
  fetcher: () => Promise<T>,
  ttl = 30 * 60 * 1000
) {
  const [data, setData] = useState<T | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const online = await OfflineCache.isOnline();

    if (online) {
      try {
        const freshData = await fetcher();
        await OfflineCache.set(cacheKey, freshData, ttl);
        setData(freshData);
        setIsStale(false);
        setIsLoading(false);
        return;
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Fetch failed'));
        // Fall through to cache
      }
    }

    // Offline or fetch failed: try cache
    const cached = await OfflineCache.getStale<T>(cacheKey);
    if (cached) {
      setData(cached.data);
      setIsStale(cached.isStale);
    }
    setIsLoading(false);
  }, [cacheKey, fetcher, ttl]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, isStale, isLoading, error, refresh };
}
