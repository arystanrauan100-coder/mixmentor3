import express from "express";
import { createServer } from "http";
import { openai } from "./client";
import { setupVite } from "./vite";
import { serveStatic } from "./static";

const app = express();
app.use(express.json());
app.set("trust proxy", 1);

app.post("/api/advice", async (req, res) => {
  try {
    const { topic, problem } = req.body;
    if (!topic || !problem) {
      return res.status(400).json({ message: "topic and problem are required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        {
          role: "system",
          content:
            "Ты профессиональный аудио-инженер и ментор по сведению звука. Давай точные, практичные советы на русском языке. Используй markdown для форматирования.",
        },
        {
          role: "user",
          content: `Тема: ${topic}\n\nПроблема: ${problem}`,
        },
      ],
    });

    const advice = completion.choices[0]?.message?.content ?? "";
    return res.json({ advice });
  } catch (err) {
    console.error("Error in /api/advice:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const STORY_SYSTEM_PROMPT = `Ты мастер драматических историй для YouTube. Твоя задача — создавать вирусные истории с максимальным удержанием аудитории.

ПРАВИЛА:
- Повествование строго от первого лица
- Разговорный живой язык, без глав и нумерации
- Каждая часть 2000-2500 слов
- Заканчивай КАЖДУЮ часть на сильном крючке (клиффхэнгере)
- Подходит для TTS-озвучки (без сложных символов)

ОБЯЗАТЕЛЬНЫЕ ЭЛЕМЕНТЫ:
- Сильное начало — шок или интрига с первых 3-5 строк
- Постепенное раскрытие тайны (НЕ всё сразу)
- Эмоциональный конфликт (страх, стыд, жадность, жалость, надежда)
- Неожиданные повороты каждые 10-15% текста
- Реалистичные диалоги
- Атмосфера тайны и скрытой правды

ЗАПРЕЩЕНО:
- Сухое повествование
- Быстрое раскрытие секрета
- Скучные описания
- Повторы одной мысли`;

app.post("/api/story/generate", async (req, res) => {
  try {
    const { topic, language = "ru", totalParts = 6, partNumber } = req.body;

    if (!topic || typeof topic !== "string" || topic.trim().length === 0) {
      return res.status(400).json({ message: "topic is required" });
    }
    if (typeof partNumber !== "number" || partNumber < 1 || partNumber > 10) {
      return res.status(400).json({ message: "partNumber must be between 1 and 10" });
    }

    const userMessage = `Тема: ${topic}\nЯзык: ${language}\nЧасть ${partNumber} из ${totalParts}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: STORY_SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    return res.json({ content });
  } catch (err) {
    console.error("Error in /api/story/generate:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const server = createServer(app);

(async () => {
  if (process.env.NODE_ENV === "development") {
    await setupVite(server, app);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT ?? 5000;
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
})();
