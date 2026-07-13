import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { validateMercadoPagoSignature } from "./mercadoPagoSignature";

describe("validateMercadoPagoSignature", () => {
  it("valida HMAC e normaliza o ID para minúsculas", () => {
    const ts = 1_750_000_000_000;
    const secret = "webhook-secret";
    const manifest = `id:ord123;request-id:req-1;ts:${ts};`;
    const hash = createHmac("sha256", secret).update(manifest).digest("hex");
    expect(
      validateMercadoPagoSignature({
        dataId: "ORD123",
        requestId: "req-1",
        signature: `ts=${ts},v1=${hash}`,
        secret,
        now: ts,
      })
    ).toBe(true);
  });

  it("rejeita assinatura expirada ou adulterada", () => {
    expect(
      validateMercadoPagoSignature({
        dataId: "ORD123",
        signature: "ts=1,v1=invalid",
        secret: "secret",
        now: 500_000,
      })
    ).toBe(false);
  });

  it("omite o ID do manifesto quando ele não veio na URL", () => {
    const ts = 1_750_000_000_000;
    const secret = "webhook-secret";
    const manifest = `request-id:req-simulator;ts:${ts};`;
    const hash = createHmac("sha256", secret).update(manifest).digest("hex");
    expect(
      validateMercadoPagoSignature({
        requestId: "req-simulator",
        signature: `ts=${ts},v1=${hash}`,
        secret,
        now: ts,
      })
    ).toBe(true);
  });

  it("aceita timestamp do simulador expresso em segundos", () => {
    const ts = 1_750_000_000;
    const secret = "webhook-secret";
    const manifest = `id:ord123;request-id:req-seconds;ts:${ts};`;
    const hash = createHmac("sha256", secret).update(manifest).digest("hex");
    expect(
      validateMercadoPagoSignature({
        dataId: "ORD123",
        requestId: "req-seconds",
        signature: `ts=${ts},v1=${hash}`,
        secret,
        now: ts * 1000,
      })
    ).toBe(true);
  });
});
