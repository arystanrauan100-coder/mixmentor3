import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const adviceRequests = pgTable("advice_requests", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  problem: text("problem").notNull(),
  advice: text("advice").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: text("chat_id").notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAdviceRequestSchema = createInsertSchema(adviceRequests).pick({
  topic: true,
  problem: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  chatId: true,
  role: true,
  content: true,
});

export type InsertAdviceRequest = z.infer<typeof insertAdviceRequestSchema>;
export type AdviceRequest = typeof adviceRequests.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
