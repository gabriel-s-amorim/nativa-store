import { Router } from "express";
import {
  getPublishedPageBySlug,
  listPublishedPages,
} from "../services/contentPages";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const pages = await listPublishedPages();
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=120, stale-while-revalidate=600",
    );
    res.json(pages);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao listar páginas",
    });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const slug = String(req.params.slug ?? "").trim();
    if (!slug) {
      res.status(400).json({ error: "Slug inválido" });
      return;
    }

    const page = await getPublishedPageBySlug(slug);
    if (!page) {
      res.status(404).json({ error: "Página não encontrada" });
      return;
    }

    res.setHeader(
      "Cache-Control",
      "public, max-age=60, s-maxage=120, stale-while-revalidate=600",
    );
    res.json(page);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao carregar página",
    });
  }
});

export default router;
