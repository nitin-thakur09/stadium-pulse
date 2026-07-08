import { NODES } from './data';

/**
 * In-memory rate limiter: tracks request timestamps per IP.
 * Allows up to MAX_REQUESTS within WINDOW_MS milliseconds.
 *
 * NOTE: This implementation is process-local (single-instance).
 * For multi-replica deployments, replace with a Redis-backed solution.
 */
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10;

// Map<ip, timestamps[]>
const rateLimitStore = new Map<string, number[]>();

/**
 * Checks whether the given IP address has exceeded the rate limit.
 *
 * @param ip - The client IP address (from x-forwarded-for or socket).
 * @returns true if the request is allowed, false if the limit is exceeded.
 */
export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Retrieve or initialize timestamps for this IP
  const timestamps = rateLimitStore.get(ip) ?? [];

  // Evict timestamps outside the current window
  const recent = timestamps.filter((t) => t > windowStart);

  if (recent.length >= MAX_REQUESTS) {
    // Update the map with pruned timestamps (no new entry added)
    rateLimitStore.set(ip, recent);
    return false;
  }

  // Record this request and persist
  recent.push(now);
  rateLimitStore.set(ip, recent);
  return true;
}

/**
 * Validates that a node ID exists in the known NODES map and strips any
 * surrounding whitespace to prevent injection or path-traversal attacks.
 *
 * @param nodeId - The raw node ID string provided by the AI tool call.
 * @returns The sanitized node ID string, or null if invalid.
 */
export function validateAndSanitizeNodeId(nodeId: unknown): string | null {
  if (typeof nodeId !== 'string') return null;

  // Trim whitespace
  const sanitized = nodeId.trim();

  // Only allow known node IDs — reject anything not in the static NODES map
  if (!Object.prototype.hasOwnProperty.call(NODES, sanitized)) {
    return null;
  }

  return sanitized;
}
