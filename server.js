import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";
import festivalRouter from "./server/api/festival.ts"; // ✅ Festival route

dotenv.config();

// -------------------------------
// 🧭 Setup paths
// -------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -------------------------------
// 🚀 App initialization
// -------------------------------
const app = express();

// ✅ Allow frontend requests (CORS fix)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://astroashupandit.com", // your Vite frontend
    ],
    credentials: true,
  })
);

app.use(express.json());

// -------------------------------
// 🧠 OpenAI client
// -------------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ======================================================
// 🔮 SHUBH MUHURAT APIs
// ======================================================
app.get("/api/muhurat/dates", async (req, res) => {
  const type = req.query.type || "general";
  console.log(`📅 Muhurat request for: ${type}`);

  try {
    // Mock data (replace with real data or API later)
    const data = [
      { date: "15 March 2025", description: `Auspicious day for ${type}` },
      { date: "27 April 2025", description: "Favorable planetary alignment" },
    ];
    res.json({ success: true, type, dates: data });
  } catch (error) {
    console.error("❌ Muhurat error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch muhurat dates" });
  }
});

app.get("/api/muhurat/details", async (req, res) => {
  const { type, date } = req.query;
  console.log(`🪔 Muhurat details for ${type} on ${date}`);

  try {
    const details = {
      success: true,
      type,
      date,
      timings: "06:45 AM – 10:30 AM, 02:15 PM – 05:00 PM",
      pujaSteps: "Sankalp, Kalash Sthapana, Deep Daan, Prasad Vitran",
    };
    res.json(details);
  } catch (error) {
    console.error("❌ Muhurat details error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch muhurat details" });
  }
});

// ======================================================
// ♓ Horoscope API
// ======================================================
app.get("/api/horoscope", async (req, res) => {
  try {
    const { sign, day } = req.query;
    if (!sign || !day)
      return res.status(400).json({ success: false, error: "Missing sign or day parameter." });

    const horoscopeText = `Your ${day} horoscope for ${sign} is: Today is a great day for new beginnings.`;
    res.json({ success: true, horoscope: horoscopeText });
  } catch (err) {
    console.error("Horoscope API Error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch horoscope." });
  }
});

// ======================================================
// 🧿 Numerology API
// ======================================================
app.post("/api/numerology", async (req, res) => {
  try {
    const { name, dob, birthTime, city, country } = req.body;

    const prompt = `
आप एक अनुभवी वैदिक अंक ज्योतिष विशेषज्ञ हैं।
नीचे दी गई जानकारी के आधार पर व्यक्ति का संपूर्ण विश्लेषण हिंदी में प्रस्तुत करें।

नाम: ${name}
जन्म तिथि: ${dob}
जन्म समय: ${birthTime || "अज्ञात"}
शहर: ${city}
देश: ${country}

उत्तर को निम्नलिखित संरचना में दें:
- शुभ अंक
- भाग्यांक
- शुभ रंग
- शुभ वर्ष
- शुभ दिन और तिथि
- किस देवता की उपासना करनी चाहिए
- क्या और कब दान करना चाहिए
- अनुशंसित मंत्र

🕉️ कृपया उत्तर आध्यात्मिक और संक्षिप्त रूप में दें, केवल हिंदी भाषा में।
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "आप हमेशा सभी उत्तर हिंदी भाषा में देंगे।" },
        { role: "user", content: prompt },
      ],
    });

    const analysis = completion.choices[0].message?.content?.trim() ?? "";
    res.json({ success: true, analysis });
  } catch (err) {
    console.error("Numerology Error:", err);
    res.status(500).json({ success: false, error: "Numerology generation failed." });
  }
});

// ======================================================
// 🏠 Vaastu API
// ======================================================
app.post("/api/vaastu", async (req, res) => {
  try {
    const { issue } = req.body;
    if (!issue) return res.status(400).json({ error: "No issue provided" });

    const prompt = `
You are an expert Indian astrologer and Vaastu Shastra consultant.
Explain in detail about "${issue}" — include:
1. Cause of the Vaastu dosh
2. Negative effects on life, health, or finance
3. Remedies and corrective measures using Puja, Mantra, Yantra, colors, and placement
4. Astrological connections and planetary influences
5. Things to avoid
Write in a spiritually insightful but simple tone. Use emojis for section headers.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = completion?.choices?.[0]?.message?.content?.trim() ?? "";
    res.json({ success: true, advice: text });
  } catch (err) {
    console.error("Vaastu Error:", err);
    res.status(500).json({ success: false, error: "Server Error", details: err.message });
  }
});

// ======================================================
// 📜 Panchang API
// ======================================================
app.get("/api/panchang", async (_req, res) => {
  try {
    const today = new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    });

    const prompt = `
You are an expert Hindu astrologer.
Generate today’s Hindu Panchang for ${today} for Indian Standard Time.
Return JSON with exact keys and realistic values.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a precise Hindu Panchang generator." },
        { role: "user", content: prompt },
      ],
    });

    let parsed;
    try {
      parsed = JSON.parse(completion.choices[0].message?.content?.trim() ?? "{}");
    } catch {
      const match = completion.choices[0].message?.content?.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { overview: "Error parsing Panchang data." };
    }

    res.json({ success: true, panchang: parsed });
  } catch (err) {
    console.error("Panchang Error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch Panchang" });
  }
});

// ======================================================
// 🎉 Festival API
// ======================================================
app.use("/api/festival", festivalRouter);

// ======================================================
// 🏡 Serve Frontend
// ======================================================
const frontendPath = path.join(__dirname, "dist");
app.use(express.static(frontendPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ======================================================
// 🚀 Start Server
// ======================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
