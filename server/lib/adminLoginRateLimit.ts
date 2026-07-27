/**
 * Rate limit de login admin persistido no Postgres (compartilhado entre
 * instâncias serverless na Vercel).
 */

import type { Request } from "express";
import { getClientIp as extractClientIp } from "./clientIp";
import { supabase } from "./supabase";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function failureBucket(key: string): string {
  return `admin-login:${key}`;
}

export function getClientIp(req: {
  ip?: string;
  headers: Record<string, unknown>;
  socket?: { remoteAddress?: string };
}): string {
  const ip = extractClientIp(req as Request);
  return ip || req.ip?.trim() || "unknown";
}

export async function checkAdminLoginRateLimit(key: string): Promise<{
  allowed: boolean;
  retryAfterSec?: number;
}> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await supabase
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("bucket", failureBucket(key))
    .gte("created_at", since);

  if (error) {
    console.error("admin login rate check failed:", error.message);
    return { allowed: true };
  }

  if ((count ?? 0) >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil(WINDOW_MS / 1000),
    };
  }

  return { allowed: true };
}

export async function recordAdminLoginFailure(key: string): Promise<void> {
  const { error } = await supabase.from("rate_limit_events").insert({
    bucket: failureBucket(key),
  });
  if (error) {
    console.error("admin login failure record failed:", error.message);
  }
}

export async function clearAdminLoginFailures(key: string): Promise<void> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { error } = await supabase
    .from("rate_limit_events")
    .delete()
    .eq("bucket", failureBucket(key))
    .gte("created_at", since);
  if (error) {
    console.error("admin login clear failed:", error.message);
  }
}
