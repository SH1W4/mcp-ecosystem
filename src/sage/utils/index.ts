// SAGE Integration - Utilities Index
// Re-exports all utility modules

export { Logger, LogLevel, LogEntry } from './Logger';
export { WarpCache, CacheEntry, CacheMetadata, CacheStats } from './Cache';

// Utility functions
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const createUniqueId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const formatTimestamp = (date: Date = new Date()): string => date.toISOString();

export const calculateHash = (data: any): string => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
};
