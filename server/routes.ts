import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  app.get("/api/products", async (_req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    const result = insertProductSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    const product = await storage.addProduct(result.data);
    res.json(product);
  });

  return createServer(app);
}
