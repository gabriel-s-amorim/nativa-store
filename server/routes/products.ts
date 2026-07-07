import { Router } from "express";
import { getProductBySlug, listProducts } from "../services/products";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const products = await listProducts(category);
    res.json(products);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao carregar produtos",
    });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const product = await getProductBySlug(req.params.slug);

    if (!product) {
      res.status(404).json({ error: "Produto não encontrado" });
      return;
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : "Erro ao carregar produto",
    });
  }
});

export default router;
