import crypto from "node:crypto";
import jwt from "jsonwebtoken";

export const ADMIN_COOKIE_NAME = "nativa_admin_token";
/** Sessão admin: 12h (reduzido de 7d para limitar janela de abuso se o cookie vazar). */
export const ADMIN_COOKIE_MAX_AGE_MS = 12 * 60 * 60 * 1000;
const TOKEN_TTL = "12h";
const TOKEN_ISSUER = "nativa-store";
const TOKEN_AUDIENCE = "nativa-admin";

function getJwtSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET?.trim();
  if (!secret) {
    throw new Error("Configure ADMIN_JWT_SECRET no arquivo .env");
  }
  return secret;
}

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) {
    throw new Error("Configure ADMIN_PASSWORD no arquivo .env");
  }
  return password;
}

/** Comparação em tempo constante para evitar timing attacks na senha do admin. */
export function checkAdminPassword(candidate: string): boolean {
  const expected = getAdminPassword();
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  if (candidateBuffer.length !== expectedBuffer.length) {
    // Ainda executa timingSafeEqual (em buffers de mesmo tamanho) para não vazar o tamanho da senha pelo tempo de resposta.
    crypto.timingSafeEqual(expectedBuffer, expectedBuffer);
    return false;
  }

  return crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
}

export function signAdminToken(): string {
  return jwt.sign({ role: "admin" }, getJwtSecret(), {
    expiresIn: TOKEN_TTL,
    issuer: TOKEN_ISSUER,
    audience: TOKEN_AUDIENCE,
  });
}

export function verifyAdminToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
    return (
      typeof payload === "object" &&
      payload !== null &&
      (payload as { role?: string }).role === "admin"
    );
  } catch {
    return false;
  }
}
