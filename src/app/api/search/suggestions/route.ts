import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/search/suggestions
 * 返回搜尋建議，包括：
 * 1. 最常用的標籤（從所有筆記中提取）
 * 2. 最近的摘要關鍵字
 */
export async function GET() {
  try {
    // 獲取最近完成的筆記（最多 50 筆）
    const recentNotes = await prisma.note.findMany({
      where: {
        status: "COMPLETED",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      select: {
        tags: true,
        summary: true,
      },
    });

    // 統計標籤頻率
    const tagFrequency = new Map<string, number>();
    recentNotes.forEach((note) => {
      if (note.tags) {
        const tags = note.tags.split(',').map(t => t.trim()).filter(Boolean);
        tags.forEach((tag) => {
          tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
        });
      }
    });

    // 取得最熱門的標籤（前 10 個）
    const popularTags = Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    // 從摘要中提取關鍵字（簡單實現：取最近的摘要前幾個字）
    const recentSummaries = recentNotes
      .filter((note) => note.summary && note.summary.length > 5)
      .slice(0, 5)
      .map((note) => {
        const summary = note.summary || "";
        // 提取摘要的前 20 個字符作為建議
        return summary.substring(0, 20).trim();
      })
      .filter((s) => s.length > 0);

    // 返回建議列表
    const suggestions = [
      ...popularTags,
      ...recentSummaries,
    ].filter((v, i, a) => a.indexOf(v) === i) // 去重
      .slice(0, 10); // 限制最多 10 個建議

    return NextResponse.json({
      suggestions,
      popularTags: popularTags.slice(0, 5), // 返回前 5 個熱門標籤
    });
  } catch (error) {
    console.error("Suggestions API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
