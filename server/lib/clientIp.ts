import type { Request } from "express";

/** Extrai o IP do cliente (Vercel/proxy via x-forwarded-for). */
export function getClientIp(req: Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return normalizeIp(first);
  }

  if (Array.isArray(forwarded) && forwarded[0]) {
    const first = forwarded[0].split(",")[0]?.trim();
    if (first) return normalizeIp(first);
  }

  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) {
    return normalizeIp(realIp.trim());
  }

  const remote = req.socket.remoteAddress;
  if (remote) return normalizeIp(remote);

  return null;
}

/** Normaliza IPv6-mapeado (::ffff:1.2.3.4 → 1.2.3.4). */
function normalizeIp(ip: string): string {
  if (ip.startsWith("::ffff:")) {
    return ip.slice(7);
  }
  return ip;
}
