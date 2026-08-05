type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Simple in-memory fixed-window rate limiter, keyed by an arbitrary string
 * (e.g. `"signup:" + ip`). Good enough to blunt basic brute-force/abuse on a
 * low-to-medium traffic app.
 *
 * Caveat: state lives in a single serverless function instance's memory, not
 * a shared store, so under high traffic across many instances this is a
 * best-effort throttle rather than a hard guarantee. For stronger protection
 * at scale, swap this for a shared store (e.g. Upstash Redis) behind the
 * same function signature.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}
