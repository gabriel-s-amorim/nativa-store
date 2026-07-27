import { contentPageSchema } from "@shared/schemas/contentPage";
import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin";
import {
  getPageBySlug,
  listAllPages,
  updatePage,
} from "../services/contentPages";

const router = Router();

router.get("/", requireAdmin, async (_req, res) => {
  try {
    res.json(await listAllPages());
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao listar páginas",
    });
  }
});

router.get("/:slug", requireAdmin, async (req, res) => {
  try {
    const slug = String(req.params.slug ?? "").trim();
    if (!slug) {
      res.status(400).json({ error: "Slug inválido" });
      return;
    }
    res.json(await getPageBySlug(slug));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar";
    res.status(message === "Página não encontrada" ? 404 : 500).json({ error: message });
  }
});

router.put("/:slug", requireAdmin, async (req, res) => {
  const slug = String(req.params.slug ?? "").trim();
  if (!slug) {
    res.status(400).json({ error: "Slug inválido" });
    return;
  }

  const parsed = contentPageSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Dados inválidos", issues: parsed.error.issues });
    return;
  }

  try {
    res.json(await updatePage(slug, parsed.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar";
    res.status(message === "Página não encontrada" ? 404 : 500).json({ error: message });
  }
});

export default router;
