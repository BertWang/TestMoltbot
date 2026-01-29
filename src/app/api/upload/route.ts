import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { processNoteWithGemini } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    console.log("Received upload request. File:", file?.name, "Type:", file?.type, "Size:", file?.size);

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded or empty file" }, { status: 400 });
    }

    // 1. 儲存檔案到本地 (public/uploads)
    const buffer = Buffer.from(await file.arrayBuffer());
    // 檔名處理：加上時間戳記避免重複，並移除空格
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${safeName}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    // 確保目錄存在
    await mkdir(uploadDir, { recursive: true });
    
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    
    const publicUrl = `/uploads/${filename}`;

    // 2. 在資料庫建立 PENDING 記錄
    const note = await prisma.note.create({
      data: {
        imageUrl: publicUrl,
        fileKey: filename,
        status: "PROCESSING", // 立即開始處理
        tags: "", // 初始化為空字串，因為 Schema 中是必填
      },
    });

    // 3. 觸發 AI 處理 (在真實生產環境應放入 Queue，這裡為演示直接 await 或非同步執行)
    // 為了即時回饋，我們這裡選擇 await (用戶需等待 AI)，或者可以 fire-and-forget
    // 考慮到體驗，我們先 await 讓用戶看到結果，若太慢後續可改為背景處理
    
    try {
      const aiResult = await processNoteWithGemini(filepath, file.type || "image/jpeg");
      
      // 4. 更新資料庫
      const updatedNote = await prisma.note.update({
        where: { id: note.id },
        data: {
          rawOcrText: aiResult.rawOcr,
          refinedContent: aiResult.refinedContent,
          summary: aiResult.summary,
          tags: aiResult.tags.join(","),
          confidence: aiResult.confidence,
          ocrProvider: "gemini-2.0-flash",
          status: "COMPLETED",
        },
      });

      return NextResponse.json({ success: true, noteId: updatedNote.id });

    } catch (aiError) {
      console.error("AI Processing Error:", aiError);
      // 更新為失敗狀態
      await prisma.note.update({
        where: { id: note.id },
        data: { 
            status: "FAILED",
            errorMessage: aiError instanceof Error ? aiError.message : "Unknown AI Error"
        }
      });
      return NextResponse.json({ error: "AI processing failed", noteId: note.id }, { status: 500 });
    }

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
