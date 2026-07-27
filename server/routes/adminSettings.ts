import { storeSettingsSchema } from "@shared/schemas/storeSettings";
import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  getStoreSettings,
  updateStoreSettings,
} from "../services/storeSettings";

const router = Router();

router.get("/", requireAdmin, async (_req, res) => {
  try {
    res.json(await getStoreSettings());
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao carregar",
    });
  }
});

router.put("/", requireAdmin, async (req, res) => {
  const parsed = storeSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Dados inválidos", issues: parsed.error.issues });
    return;
  }

  try {
    res.json(await updateStoreSettings(parsed.data));
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao salvar",
    });
  }
});

export default router;
