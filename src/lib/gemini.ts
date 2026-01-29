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
  2. **Refinement**: Create a clean, corrected version in Markdown format. Fix spelling errors, improve punctuation, and organize headers/lists if implied by the layout. 請確保所有中文輸出為繁體中文。
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
    
    // 清理 markdown code blocks 和其他可能影響 JSON 解析的字符
    // 移除開頭和結尾的 ```json / ```
    let jsonStr = text.replace(/```json\n/g, "").replace(/```/g, "").trim();
    // 移除其他非預期控制字符（例如 null 字符等）
    jsonStr = jsonStr.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    
    try {
      return JSON.parse(jsonStr) as ProcessedNote;
    } catch (parseError) {
      console.error("Error parsing Gemini JSON response:", parseError);
      console.error("Raw Gemini text:", text);
      // 如果解析失敗，嘗試從原始文本中提取部分資訊
      // 這是一個簡易的 fallback，真實場景可能需要更複雜的解析邏輯
      const fallbackRawOcr = text.substring(0, Math.min(200, text.length));
      const fallbackRefinedContent = fallbackRawOcr;
      const fallbackSummary = "AI 內容解析失敗";
      const fallbackTags = ["failed-parse"];
      const fallbackConfidence = 0.1; // 低信心分數
      
      return {
        rawOcr: fallbackRawOcr,
        refinedContent: fallbackRefinedContent,
        summary: fallbackSummary,
        tags: fallbackTags,
        confidence: fallbackConfidence,
      };
    }
  } catch (error) {
    console.error("Error interacting with Gemini:", error);
    throw error;
  }
}
