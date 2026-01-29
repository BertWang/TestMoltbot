import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";
import { revalidatePath } from 'next/cache';

export async function DELETE(request: NextRequest) {
  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Missing or invalid note IDs" }, { status: 400 });
    }

    let deletedCount = 0;
    for (const id of ids) {
      // 1. 查找筆記以獲取圖片路徑
      const note = await prisma.note.findUnique({
        where: { id },
      });

      if (note) {
        // 2. 從資料庫刪除筆記記錄
        await prisma.note.delete({
          where: { id },
        });

        // 3. 刪除對應的圖片檔案
        if (note.fileKey) {
          const filePath = path.join(process.cwd(), "public/uploads", note.fileKey);
          try {
            await unlink(filePath);
            console.log(`Deleted image file: ${filePath}`);
          } catch (fileError) {
            console.warn(`Failed to delete image file ${filePath}:`, fileError);
            // 即使檔案刪除失敗，資料庫記錄也應該刪除，所以不影響主流程
          }
        }
        deletedCount++;
      }
    }

    // 重新驗證首頁和所有筆記頁面的數據
    revalidatePath('/');
    revalidatePath('/notes');

    return NextResponse.json({ success: true, deletedCount });

  } catch (error) {
    console.error("Batch Delete Notes Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
