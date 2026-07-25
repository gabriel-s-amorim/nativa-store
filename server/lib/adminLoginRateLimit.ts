/**
 * Rate limit simples em memória para /api/admin/login.
 * Em serverless (Vercel) o estado é por instância — ainda reduz força bruta.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const LOCKOUT_MS = 15 * 60 * 1000;

interface AttemptState {
  failures: number;
  windowStartedAt: number;
  lockedUntil: number;
}

const attemptsByKey = new Map<string, AttemptState>();

function prune(now: number) {
  if (attemptsByKey.size < 500) return;
  for (const [key, state] of Array.from(attemptsByKey.entries())) {
    if (state.lockedUntil < now && state.windowStartedAt + WINDOW_MS < now) {
      attemptsByKey.delete(key);
    }
  }
}

export function getClientIp(req: { ip?: string; headers: Record<string, unknown> }): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  if (Array.isArray(forwarded) && typeof forwarded[0] === "string") {
    return forwarded[0].split(",")[0]?.trim() || "unknown";
  }
  return req.ip?.trim() || "unknown";
}

export function checkAdminLoginRateLimit(key: string): {
  allowed: boolean;
  retryAfterSec?: number;
} {
  const now = Date.now();
  prune(now);

  const state = attemptsByKey.get(key);
  if (!state) {
    return { allowed: true };
  }

  if (state.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((state.lockedUntil - now) / 1000),
    };
  }

  if (now - state.windowStartedAt > WINDOW_MS) {
    attemptsByKey.delete(key);
    return { allowed: true };
  }

  if (state.failures >= MAX_ATTEMPTS) {
    state.lockedUntil = now + LOCKOUT_MS;
    return {
      allowed: false,
      retryAfterSec: Math.ceil(LOCKOUT_MS / 1000),
    };
  }

  return { allowed: true };
}

export function recordAdminLoginFailure(key: string): void {
  const now = Date.now();
  const state = attemptsByKey.get(key);

  if (!state || now - state.windowStartedAt > WINDOW_MS) {
    attemptsByKey.set(key, {
      failures: 1,
      windowStartedAt: now,
      lockedUntil: 0,
    });
    return;
  }

  state.failures += 1;
  if (state.failures >= MAX_ATTEMPTS) {
    state.lockedUntil = now + LOCKOUT_MS;
  }
}

export function clearAdminLoginFailures(key: string): void {
  attemptsByKey.delete(key);
}
