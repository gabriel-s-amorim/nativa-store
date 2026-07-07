import express from "express";
import productsRouter from "./routes/products";

export function createApiApp() {
  const app = express();

  app.use(express.json());
  app.use("/api/products", productsRouter);

  return app;
}
