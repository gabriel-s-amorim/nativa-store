import crypto from "node:crypto";
import type { Response } from "express";
import { CART_SESSION_COOKIE, CART_SESSION_MAX_AGE_MS } from "@shared/const/cart";
import { shouldUseSecureCookies } from "./cookieSecure";

export function generateCartSessionId(): string {
  return crypto.randomUUID();
}

export function getCartSessionFromCookie(cookies: Record<string, string | undefined>): string | null {
  const value = cookies[CART_SESSION_COOKIE];
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function setCartSessionCookie(res: Response, sessionId: string): void {
  res.cookie(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: "lax",
    maxAge: CART_SESSION_MAX_AGE_MS,
    path: "/",
  });
}

export function clearCartSessionCookie(res: Response): void {
  res.cookie(CART_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
