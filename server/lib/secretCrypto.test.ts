import { afterEach, describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "./secretCrypto";

describe("secretCrypto", () => {
  const previous = process.env.MERCADO_PAGO_ENCRYPTION_KEY;
  const previousBrevo = process.env.BREVO_ENCRYPTION_KEY;
  const previousMelhor = process.env.MELHOR_ENVIO_ENCRYPTION_KEY;

  afterEach(() => {
    process.env.MERCADO_PAGO_ENCRYPTION_KEY = previous;
    process.env.BREVO_ENCRYPTION_KEY = previousBrevo;
    process.env.MELHOR_ENVIO_ENCRYPTION_KEY = previousMelhor;
  });

  it("criptografa com nonce e recupera o segredo", () => {
    process.env.MERCADO_PAGO_ENCRYPTION_KEY =
      "chave-de-teste-com-mais-de-32-caracteres";
    const first = encryptSecret("APP_USR-token");
    const second = encryptSecret("APP_USR-token");
    expect(first).not.toBe(second);
    expect(decryptSecret(first)).toBe("APP_USR-token");
  });

  it("rejeita chave curta", () => {
    process.env.MERCADO_PAGO_ENCRYPTION_KEY = "curta";
    expect(() => encryptSecret("segredo")).toThrow(/32 caracteres/);
  });

  it("isola a chave Brevo sem alterar o padrão do Mercado Pago", () => {
    process.env.MERCADO_PAGO_ENCRYPTION_KEY =
      "chave-mercado-pago-com-mais-de-32-caracteres";
    process.env.BREVO_ENCRYPTION_KEY =
      "chave-brevo-separada-com-mais-de-32-caracteres";
    const encrypted = encryptSecret("xkeysib-segredo", "BREVO_ENCRYPTION_KEY");

    expect(decryptSecret(encrypted, "BREVO_ENCRYPTION_KEY")).toBe(
      "xkeysib-segredo"
    );
    expect(() => decryptSecret(encrypted)).toThrow();
  });

  it("criptografa credenciais Melhor Envio com chave própria", () => {
    process.env.MELHOR_ENVIO_ENCRYPTION_KEY =
      "chave-melhor-envio-com-mais-de-32-caracteres";
    const encrypted = encryptSecret(
      "client-secret-me",
      "MELHOR_ENVIO_ENCRYPTION_KEY"
    );
    expect(encrypted.startsWith("v1.")).toBe(true);
    expect(
      decryptSecret(encrypted, "MELHOR_ENVIO_ENCRYPTION_KEY")
    ).toBe("client-secret-me");
  });
});
