import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from "@google/generative-ai";
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
  請執行以下步驟，並確保所有中文輸出（包括摘要與標籤）為繁體中文。

  1. **OCR**: 準確轉錄圖片中的文字，保留原始換行符。
  2. **Refinement**: 創建一個清晰、校正後的 Markdown 版本。修正拼寫錯誤、改進標點符號，並根據佈局組織標題/列表。
  3. **Analysis**: 生成一個簡短的摘要（1-2 句話）和 3-5 個相關標籤。
  4. **Confidence**: 根據文字的清晰度，估計一個信心分數（0.0 到 1.0）。

  請嚴格以有效的 JSON 格式輸出，不要包含程式碼區塊：
  {
    "rawOcr": "...",
    "refinedContent": "...",
    "summary": "...",
    "tags": ["tag1", "tag2"],
    "confidence": 0.95
  }
  `;

  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
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
        const fallbackRawOcr = text.substring(0, Math.min(200, text.length));
        const fallbackRefinedContent = fallbackRawOcr;
        const fallbackSummary = "AI 內容解析失敗";
        const fallbackTags = ["failed-parse"];
        const fallbackConfidence = 0.1; 
        
        return {
          rawOcr: fallbackRawOcr,
          refinedContent: fallbackRefinedContent,
          summary: fallbackSummary,
          tags: fallbackTags,
          confidence: fallbackConfidence,
        };
      }
    } catch (error) {
      if (error instanceof GoogleGenerativeAIFetchError && error.status === 429) {
        retries++;
        const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000; // Exponential backoff
        console.warn(`Gemini API rate limit hit. Retrying in ${delay / 1000}s... (Attempt ${retries}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Other errors are re-thrown immediately
      }
    }
  }
  throw new Error("Gemini API processing failed after multiple retries due to rate limits.");
}