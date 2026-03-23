import { db } from "./db";
import { messages } from "@shared/schema";
import { eq } from "drizzle-orm";

export const storage = {
  async getMessagesByChat(chatId: string) {
    return db.select().from(messages).where(eq(messages.chatId, chatId));
  },

  async createMessage(chatId: string, role: "user" | "assistant", content: string) {
    const [message] = await db.insert(messages).values({ chatId, role, content }).returning();
    return message;
  },
};
