import { checkoutSchema } from "@shared/schemas/order";
import { Router } from "express";
import { requireCustomer, type CustomerAuthRequest } from "../middleware/requireCustomer";
import { createOrderFromCheckout } from "../services/orders";

const router = Router();

router.post("/checkout", requireCustomer, async (req: CustomerAuthRequest, res) => {
  try {
    const parsed = checkoutSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos", issues: parsed.error.issues });
      return;
    }

    const order = await createOrderFromCheckout(req.customerUserId!, parsed.data);
    res.json({ success: true, order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao finalizar compra";
    const status =
      message.includes("Carrinho vazio") || message.includes("inválido") ? 400 : 500;
    res.status(status).json({ error: message });
  }
});

export default router;
