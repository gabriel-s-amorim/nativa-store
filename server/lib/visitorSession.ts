import crypto from "node:crypto";
import type { Response } from "express";
import {
  VISITOR_SESSION_COOKIE,
  VISITOR_SESSION_MAX_AGE_MS,
} from "@shared/const/analytics";

export function generateVisitorSessionId(): string {
  return crypto.randomUUID();
}

export function getVisitorSessionFromCookie(
  cookies: Record<string, string | undefined>,
): string | null {
  const value = cookies[VISITOR_SESSION_COOKIE];
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function setVisitorSessionCookie(res: Response, sessionId: string): void {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(VISITOR_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: VISITOR_SESSION_MAX_AGE_MS,
    path: "/",
  });
}
