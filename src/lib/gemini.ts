import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Function to convert file to GenerativePart
function fileToGenerativePart(path: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

export interface ProcessedNote {
  rawOcr: string;
  refinedContent: string;
  summary: string;
  tags: string[];
  confidence: number;
}

export async function processNoteWithGemini(filePath: string, mimeType: string = "image/jpeg"): Promise<ProcessedNote> {
  const imagePart = fileToGenerativePart(filePath, mimeType);

  const prompt = `
  You are an expert archivist digitizing handwritten notes.
  Please perform the following steps on the provided image:
  1. **OCR**: Transcribe the text exactly as written, preserving original line breaks.
  2. **Refinement**: Create a clean, corrected version in Markdown format. Fix spelling errors, improve punctuation, and organize headers/lists if implied by the layout.
  3. **Analysis**: Generate a brief summary (1-2 sentences) and extraction 3-5 relevant tags.
  4. **Confidence**: Estimate a confidence score (0.0 to 1.0) based on legibility.

  Output strictly in valid JSON format without code blocks:
  {
    "rawOcr": "...",
    "refinedContent": "...",
    "summary": "...",
    "tags": ["tag1", "tag2"],
    "confidence": 0.95
  }
  `;

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Clean up markdown code blocks if present
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(jsonStr) as ProcessedNote;
  } catch (error) {
    console.error("Error interacting with Gemini:", error);
    throw error;
  }
}
