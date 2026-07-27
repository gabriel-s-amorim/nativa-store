import { Router } from "express";
import { getStoreSettings } from "../services/storeSettings";

const router = Router();

/** Configurações públicas de contato e redes (sem segredos). */
router.get("/", async (_req, res) => {
  try {
    const settings = await getStoreSettings();
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=120, stale-while-revalidate=600",
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao carregar configurações",
    });
  }
});

export default router;
