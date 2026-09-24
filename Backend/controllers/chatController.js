import { GoogleGenerativeAI } from "@google/generative-ai";

export const askChatbot = async (req, res) => {
  try {
    const prompt = req.body.message;

    if (!prompt || !prompt.trim()) {
      return res.json({ reply: "Please type a message." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ✅ CORRECT
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.json({ reply: "AI is temporarily unavailable." }); // always return reply
  }
};