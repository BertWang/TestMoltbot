import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey!);

async function list() {
  const modelResponse = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
  // Wait, I can't call listModels on the model instance.
  // I need to use the direct API or fetch via curl if SDK doesn't expose it easily.
  // SDK usually doesn't expose listModels?
  // Actually it does on the genAI instance? No.
  
  // Let's just try curl.
}
// Ignoring script, will use curl.
