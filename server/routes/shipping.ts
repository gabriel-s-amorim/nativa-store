import {
  checkoutShippingQuoteSchema,
  shippingQuoteSchema,
} from "@shared/schemas/melhorEnvio";
import { Router } from "express";
import { getClientIp } from "../lib/clientIp";
import { consumeDbRateLimit } from "../lib/dbRateLimit";
import {
  requireCustomer,
  type CustomerAuthRequest,
} from "../middleware/requireCustomer";
import {
  calculateShipping,
  createCheckoutShippingQuote,
  getPublicShippingConfig,
} from "../services/melhorEnvio";

const router = Router();

router.get("/config", async (_req, res) => {
  try {
    res.json(await getPublicShippingConfig());
  } catch {
    res.json({ freeShippingEnabled: true, freeShippingThreshold: 299 });
  }
});

router.post("/quote", async (req, res) => {
  try {
    const ip = getClientIp(req) ?? req.ip ?? "unknown";
    const rate = await consumeDbRateLimit({
      bucket: `shipping-quote:${ip}`,
      max: 30,
      windowMs: 10 * 60 * 1000,
    });
    if (!rate.allowed) {
      res.setHeader("Retry-After", String(rate.retryAfterSec ?? 600));
      res.status(429).json({
        error: "Muitas cotações. Aguarde alguns minutos e tente de novo.",
      });
      return;
    }

    const parsed = shippingQuoteSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos", issues: parsed.error.issues });
      return;
    }

    const result = await calculateShipping(parsed.data);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao calcular frete";
    const status =
      message.includes("não conectado") || message.includes("CEP de origem") ? 503 : 500;
    res.status(status).json({ error: message });
  }
});

router.post(
  "/checkout-quote",
  requireCustomer,
  async (req: CustomerAuthRequest, res) => {
    try {
      const parsed = checkoutShippingQuoteSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: "CEP inválido", issues: parsed.error.issues });
        return;
      }
      const result = await createCheckoutShippingQuote(
        req.customerUserId!,
        parsed.data.toPostalCode,
      );
      res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao calcular frete";
      const status = message.includes("Carrinho vazio") ? 400 : 500;
      res.status(status).json({ error: message });
    }
  },
);

export default router;
