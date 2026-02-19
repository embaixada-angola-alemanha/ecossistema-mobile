import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

const CACHE_PREFIX = '@cache:';
const CACHE_META_KEY = '@cache:__meta__';

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheMeta {
  keys: string[];
  totalSize: number;
}

export const OfflineCache = {
  /**
   * Store data in local cache with a TTL (in milliseconds).
   * Default TTL: 30 minutes.
   */
  async set<T>(key: string, data: T, ttl = 30 * 60 * 1000): Promise<void> {
    const cacheKey = CACHE_PREFIX + key;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(entry));
    await OfflineCache.trackKey(key);
  },

  /**
   * Retrieve cached data. Returns null if expired or not found.
   */
  async get<T>(key: string): Promise<T | null> {
    const cacheKey = CACHE_PREFIX + key;
    const raw = await AsyncStorage.getItem(cacheKey);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const isExpired = Date.now() - entry.timestamp > entry.ttl;

    if (isExpired) {
      await AsyncStorage.removeItem(cacheKey);
      return null;
    }

    return entry.data;
  },

  /**
   * Get cached data even if expired (for offline fallback).
   */
  async getStale<T>(key: string): Promise<{ data: T; isStale: boolean } | null> {
    const cacheKey = CACHE_PREFIX + key;
    const raw = await AsyncStorage.getItem(cacheKey);
    if (!raw) return null;

    const entry: CacheEntry<T> = JSON.parse(raw);
    const isStale = Date.now() - entry.timestamp > entry.ttl;

    return { data: entry.data, isStale };
  },

  /**
   * Remove a specific cache entry.
   */
  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  },

  /**
   * Clear all cached data.
   */
  async clear(): Promise<void> {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
    if (cacheKeys.length > 0) {
      await AsyncStorage.multiRemove(cacheKeys);
    }
  },

  /**
   * Check current network connectivity.
   */
  async isOnline(): Promise<boolean> {
    const state: NetInfoState = await NetInfo.fetch();
    return state.isConnected === true && state.isInternetReachable !== false;
  },

  /**
   * Subscribe to connectivity changes.
   */
  onConnectivityChange(callback: (isOnline: boolean) => void): () => void {
    return NetInfo.addEventListener((state) => {
      callback(state.isConnected === true && state.isInternetReachable !== false);
    });
  },

  /** Track cache keys for cleanup */
  async trackKey(key: string): Promise<void> {
    const raw = await AsyncStorage.getItem(CACHE_META_KEY);
    const meta: CacheMeta = raw ? JSON.parse(raw) : { keys: [], totalSize: 0 };
    if (!meta.keys.includes(key)) {
      meta.keys.push(key);
      await AsyncStorage.setItem(CACHE_META_KEY, JSON.stringify(meta));
    }
  },

  /** Evict expired entries */
  async evictExpired(): Promise<number> {
    const raw = await AsyncStorage.getItem(CACHE_META_KEY);
    if (!raw) return 0;

    const meta: CacheMeta = JSON.parse(raw);
    let evicted = 0;

    for (const key of meta.keys) {
      const cached = await OfflineCache.get(key);
      if (cached === null) {
        evicted++;
      }
    }

    return evicted;
  },
};
