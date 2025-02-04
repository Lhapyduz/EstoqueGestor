import { pgTable, text, serial, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: numeric("quantity").notNull(),
  price: numeric("price").notNull(),
});

export const insertProductSchema = createInsertSchema(products)
  .pick({
    name: true,
    quantity: true,
    price: true,
  })
  .extend({
    quantity: z.number().min(1, "Quantity must be at least 1"),
    price: z.number().min(0.01, "Price must be greater than 0"),
  });

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
