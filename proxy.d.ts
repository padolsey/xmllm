// Type declarations for the `xmllm/proxy` subpath (default proxy server).

export interface ProxyCacheConfig {
  maxSize?: number;
  maxEntries?: number;
  maxEntrySize?: number;
  persistInterval?: number;
  ttl?: number;
  cacheDir?: string;
  cacheFilename?: string;
}

export interface ProxyServerConfig {
  /** Port to listen on (default 3124, or process.env.PORT). */
  port?: number;
  /** CORS allow-list. A string, an array of origins, or '*'. */
  corsOrigins?: string | string[];
  /** Max accepted request body size in bytes (default 1048576). */
  maxRequestSize?: number;
  /** Per-request timeout in ms (100–300000). */
  timeout?: number;
  debug?: boolean;
  verbose?: boolean;
  globalRequestsPerMinute?: number;
  globalTokensPerMinute?: number;
  globalTokensPerHour?: number;
  globalRequestsPerHour?: number;
  rateLimitMessage?: string;
  /** Whether/where to bind; `false` creates the server without listening. */
  listen?: boolean | { port?: number; host?: string };
  errorMessages?: Record<string, string>;
  /** Override the default route paths. */
  paths?: { stream?: string; limits?: string };
  cache?: ProxyCacheConfig;
  [key: string]: unknown;
}

/**
 * Creates (and, unless disabled, starts) the default xmllm proxy server, which
 * exposes a Server-Sent-Events streaming endpoint for browser clients.
 */
export default function createServer(config?: ProxyServerConfig): import('http').Server;
