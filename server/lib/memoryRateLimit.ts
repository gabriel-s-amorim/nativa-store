/**
 * Rate limit em memória para endpoints de baixo risco (ex.: analytics).
 * Em serverless o estado é por instância — ainda reduz spam óbvio.
 */

interface BucketState {
  count: number;
  windowStartedAt: number;
}

const buckets = new Map<string, BucketState>();

function prune(now: number, windowMs: number) {
  if (buckets.size < 1000) return;
  for (const [key, state] of Array.from(buckets.entries())) {
    if (now - state.windowStartedAt > windowMs) {
      buckets.delete(key);
    }
  }
}

export function consumeMemoryRateLimit(options: {
  key: string;
  max: number;
  windowMs: number;
}): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  prune(now, options.windowMs);

  const state = buckets.get(options.key);
  if (!state || now - state.windowStartedAt > options.windowMs) {
    buckets.set(options.key, { count: 1, windowStartedAt: now });
    return { allowed: true };
  }

  if (state.count >= options.max) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil(
        (state.windowStartedAt + options.windowMs - now) / 1000
      ),
    };
  }

  state.count += 1;
  return { allowed: true };
}
