import { couponSchema } from "@shared/schemas/coupon";
import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  createCoupon,
  deleteCoupon,
  getCouponById,
  listAllCoupons,
  updateCoupon,
} from "../services/coupons";

const router = Router();

router.get("/", requireAdmin, async (_req, res) => {
  try {
    const coupons = await listAllCoupons();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao carregar cupons",
    });
  }
});

router.get("/:id", requireAdmin, async (req, res) => {
  try {
    const coupon = await getCouponById(req.params.id);
    res.json(coupon);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar cupom";
    const status = message.includes("não encontrado") ? 404 : 500;
    res.status(status).json({ error: message });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const parsed = couponSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos", issues: parsed.error.issues });
      return;
    }

    const coupon = await createCoupon(parsed.data);
    res.status(201).json(coupon);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar cupom";
    const status = message.includes("Já existe") ? 409 : 500;
    res.status(status).json({ error: message });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const parsed = couponSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos", issues: parsed.error.issues });
      return;
    }

    const coupon = await updateCoupon(req.params.id, parsed.data);
    res.json(coupon);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar cupom";
    const status = message.includes("não encontrado")
      ? 404
      : message.includes("Já existe")
        ? 409
        : 500;
    res.status(status).json({ error: message });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    await deleteCoupon(req.params.id);
    res.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir cupom";
    const status = message.includes("não encontrado") ? 404 : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
