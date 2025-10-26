import express from "express";
import OpenAI from "openai";

const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.get("/generate", async (req, res) => {
  const { festival } = req.query;

  if (!festival || typeof festival !== "string") {
    return res.status(400).json({ error: "Festival name is required" });
  }

  try {
    const prompt = `
आपको हिंदी में एक भारतीय त्यौहार का विवरण बनाना है। 
त्यौहार: ${festival}
उत्पन्न विवरण में शामिल करें:
1. संक्षिप्त कहानी
2. पूजा विधि
3. समय
4. क्या खाएं
5. क्या करें
6. क्यों मनाएं
7. सभी जानकारी हिंदी में, सरल भाषा में
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1200,
    });

    const content = response.choices[0]?.message?.content ?? "";

    res.json({ content });
  } catch (err: unknown) {
    console.error(err);
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

export default router;
