// SAGE Integration - Cache Utility
// Provides in-memory caching with TTL and metadata support

import { CacheSettings } from '../types/Config';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  metadata?: CacheMetadata;
}

export interface CacheMetadata {
  etag?: string;
  version?: string;
  [key: string]: any;
}

export interface CacheStats {
  total_entries: number;
  hits: number;
  misses: number;
  evictions: number;
  memory_usage_bytes: number;
}

/**
 * Simple in-memory cache with TTL support
 */
export class WarpCache {
  private cache = new Map<string, CacheEntry>();
  private settings: CacheSettings;
  private stats: CacheStats = {
    total_entries: 0,
    hits: 0,
    misses: 0,
    evictions: 0,
    memory_usage_bytes: 0,
  };

  constructor(settings: CacheSettings) {
    this.settings = settings;

    // Setup periodic cleanup if TTL is enabled
    if (settings.ttl_ms > 0) {
      setInterval(() => this.cleanup(), Math.min(settings.ttl_ms / 2, 30000));
    }
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    if (!this.settings.enabled) {
      return null;
    }

    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.evictions++;
      return null;
    }

    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, metadata?: CacheMetadata): void {
    if (!this.settings.enabled) {
      return;
    }

    // Check max entries limit
    if (this.settings.max_entries && this.cache.size >= this.settings.max_entries) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: this.settings.ttl_ms,
      metadata,
    };

    const wasExisting = this.cache.has(key);
    this.cache.set(key, entry);

    if (!wasExisting) {
      this.stats.total_entries++;
    }

    this.updateMemoryUsage();
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    const existed = this.cache.delete(key);
    if (existed) {
      this.stats.total_entries--;
      this.updateMemoryUsage();
    }
    return existed;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.total_entries = 0;
    this.stats.memory_usage_bytes = 0;
  }

  /**
   * Check if cache has key
   */
  has(key: string): boolean {
    if (!this.settings.enabled) {
      return false;
    }

    const entry = this.cache.get(key);
    if (!entry) {
      return false;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.evictions++;
      return false;
    }

    return true;
  }

  /**
   * Get metadata for a cache entry
   */
  getMetadata(key: string): CacheMetadata | null {
    const entry = this.cache.get(key);
    if (!entry || this.isExpired(entry)) {
      return null;
    }
    return entry.metadata || null;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateMemoryUsage();
    return { ...this.stats };
  }

  /**
   * Get all cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if an entry has expired
   */
  private isExpired(entry: CacheEntry): boolean {
    if (entry.ttl <= 0) {
      return false; // No expiration
    }

    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict the oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.total_entries--;
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    let evictedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        evictedCount++;
      }
    }

    this.stats.evictions += evictedCount;
    this.stats.total_entries -= evictedCount;

    if (evictedCount > 0) {
      this.updateMemoryUsage();
    }
  }

  /**
   * Update memory usage estimation
   */
  private updateMemoryUsage(): void {
    // Rough estimation of memory usage
    let totalSize = 0;

    for (const [key, entry] of this.cache.entries()) {
      // Estimate key size
      totalSize += key.length * 2; // Unicode characters are 2 bytes

      // Estimate data size (very rough)
      totalSize += this.estimateObjectSize(entry.data);

      // Estimate metadata size
      if (entry.metadata) {
        totalSize += this.estimateObjectSize(entry.metadata);
      }

      // Overhead for entry structure
      totalSize += 64; // Rough estimate for entry overhead
    }

    this.stats.memory_usage_bytes = totalSize;
  }

  /**
   * Rough estimation of object size in bytes
   */
  private estimateObjectSize(obj: any): number {
    if (obj === null || obj === undefined) {
      return 0;
    }

    if (typeof obj === 'string') {
      return obj.length * 2; // Unicode
    }

    if (typeof obj === 'number') {
      return 8; // 64-bit number
    }

    if (typeof obj === 'boolean') {
      return 4;
    }

    if (Array.isArray(obj)) {
      return obj.reduce((size, item) => size + this.estimateObjectSize(item), 0);
    }

    if (typeof obj === 'object') {
      return Object.entries(obj).reduce(
        (size, [key, value]) => size + key.length * 2 + this.estimateObjectSize(value),
        0
      );
    }

    return 0;
  }
}
