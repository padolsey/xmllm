// Type declarations for the `xmllm/mainCache` subpath (the LLM response cache).

export interface CacheEntry<T = unknown> {
  value: T;
  time: number;
  size: number;
  expires?: number;
}

export interface CacheConfig {
  maxSize?: number;
  maxEntries?: number;
  persistInterval?: number;
  ttl?: number;
  maxEntrySize?: number;
  cacheDir?: string;
  cacheFilename?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
}

export function get<T = unknown>(key: string): Promise<CacheEntry<T> | null>;
export function set<T = unknown>(key: string, value: T, ttl?: number): Promise<CacheEntry<T> | null>;
export function del(key: string): Promise<void>;
export const stats: CacheStats;
export function getStats(): Promise<(CacheStats & {
  entryCount: number;
  totalSize: number;
  largestEntry: { key?: string; size: number };
  maxSize?: number;
  maxEntries?: number;
}) | null>;
export function clearExpired(): Promise<number | undefined>;
export function configure(options: { cache?: CacheConfig }): void;
export function cleanup(): Promise<void>;
export function checkMemoryPressure(): Promise<void>;
export function getConfig(): CacheConfig;
export function resetConfig(): void;
export function getCacheInstance(): Promise<unknown>;
export function setFileOps(mockFileOps: unknown): void;
export function setLogger(logger: unknown): void;
export const defaultFileOps: unknown;
export const fileOperations: unknown;

// Test/internal helpers (exported, but not part of the stable surface).
export function _reset(): Promise<void>;
export function _setModified(value: boolean): void;
