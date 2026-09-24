import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const key = process.env.GEMINI_API_KEY;

if (!key) {
  console.log("❌ API key is missing!");
  process.exit(1);
}

async function testAPI() {
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ✅ CORRECT FORMAT
    const result = await model.generateContent("Say hello");

    const response = await result.response;
    const text = response.text();

    console.log("✅ API is working!");
    console.log("Response:", text);
  } catch (err) {
    console.error("❌ Gemini API error:", err.message || err);
  }
}

testAPI();