import {
  ANALYTICS_EXCLUDE_COOKIE,
  ANALYTICS_EXCLUDE_COOKIE_MAX_AGE_MS,
  ANALYTICS_EXCLUDE_COOKIE_VALUE,
} from "@shared/const/analytics";
import type { Request, Response } from "express";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "./adminAuth";
import { getClientIp } from "./clientIp";
import { shouldUseSecureCookies } from "./cookieSecure";

function parseExcludeIps(): Set<string> {
  const raw = process.env.ANALYTICS_EXCLUDE_IPS?.trim() ?? "";
  if (!raw) return new Set();

  return new Set(
    raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((ip) => (ip.startsWith("::ffff:") ? ip.slice(7) : ip)),
  );
}

export function hasAnalyticsExcludeCookie(
  cookies: Record<string, string | undefined> | undefined,
): boolean {
  return cookies?.[ANALYTICS_EXCLUDE_COOKIE] === ANALYTICS_EXCLUDE_COOKIE_VALUE;
}

export function hasValidAdminSession(
  cookies: Record<string, string | undefined> | undefined,
): boolean {
  const token = cookies?.[ADMIN_COOKIE_NAME];
  if (!token) return false;
  return verifyAdminToken(token);
}

export function isExcludedClientIp(req: Request): boolean {
  const excluded = parseExcludeIps();
  if (excluded.size === 0) return false;

  const ip = getClientIp(req);
  if (!ip) return false;

  return excluded.has(ip);
}

/** Não grava page-view se for admin, cookie de exclusão ou IP na lista. */
export function shouldExcludeAnalytics(req: Request): boolean {
  const cookies = (req.cookies ?? {}) as Record<string, string | undefined>;
  if (hasValidAdminSession(cookies)) return true;
  if (hasAnalyticsExcludeCookie(cookies)) return true;
  if (isExcludedClientIp(req)) return true;
  return false;
}

export function setAnalyticsExcludeCookie(res: Response): void {
  res.cookie(ANALYTICS_EXCLUDE_COOKIE, ANALYTICS_EXCLUDE_COOKIE_VALUE, {
    httpOnly: false,
    secure: shouldUseSecureCookies(),
    sameSite: "lax",
    maxAge: ANALYTICS_EXCLUDE_COOKIE_MAX_AGE_MS,
    path: "/",
  });
}

export function clearAnalyticsExcludeCookie(res: Response): void {
  res.clearCookie(ANALYTICS_EXCLUDE_COOKIE, { path: "/" });
}
