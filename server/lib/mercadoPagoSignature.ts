import { createHmac, timingSafeEqual } from "node:crypto";

export function validateMercadoPagoSignature(params: {
  dataId?: string;
  requestId?: string;
  signature?: string;
  secret: string;
  now?: number;
}): boolean {
  if (!params.signature || !params.secret) return false;
  const parts = Object.fromEntries(
    params.signature.split(",").map(part => {
      const [key, value] = part.trim().split("=", 2);
      return [key, value];
    })
  );
  if (!parts.ts || !parts.v1) return false;
  const timestampRaw = Number(parts.ts);
  const timestampMs =
    timestampRaw < 1_000_000_000_000 ? timestampRaw * 1000 : timestampRaw;
  if (
    !Number.isFinite(timestampMs) ||
    Math.abs((params.now ?? Date.now()) - timestampMs) > 5 * 60 * 1000
  )
    return false;
  let manifest = params.dataId ? `id:${params.dataId.toLowerCase()};` : "";
  if (params.requestId) manifest += `request-id:${params.requestId};`;
  manifest += `ts:${parts.ts};`;
  const expected = createHmac("sha256", params.secret)
    .update(manifest)
    .digest("hex");
  const received = String(parts.v1);
  return (
    expected.length === received.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(received))
  );
}
