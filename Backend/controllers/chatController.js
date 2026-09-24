import { GoogleGenerativeAI } from "@google/generative-ai";

export const askChatbot = async (req, res) => {
  try {
    const prompt = req.body.message;

    if (!prompt || !prompt.trim()) {
      return res.json({ reply: "Please type a message." });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("Gemini Error: GEMINI_API_KEY is not defined in environment variables.");
      return res.json({ reply: "API key is not configured on the server." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // List of models to try in order
    const candidateModels = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-pro"
    ];

    let lastError = null;
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (text) {
          console.log(`✅ Gemini response generated successfully using model: ${modelName}`);
          return res.json({ reply: text });
        }
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed: ${err.message || err}`);
      }
    }

    // If candidate models failed, query available models for this key to aid debugging
    try {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
      );
      const listData = await listRes.json();
      console.error(
        "Available models for this API key:",
        listData.models?.map((m) => m.name) || listData
      );
    } catch (listErr) {
      console.error("Could not fetch models list:", listErr.message || listErr);
    }

    console.error("All candidate Gemini models failed. Last error:", lastError);
    res.json({ reply: "AI is temporarily unavailable." });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.json({ reply: "AI is temporarily unavailable." });
  }
};