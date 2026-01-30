import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const suggestions = [
      {
        id: "model-upgrade",
        title: "升級 AI 模型",
        description: "切換到 Gemini 2.0 Flash 以獲得最佳性能",
        priority: "high",
        action: "前往 AI 設定",
      },
      {
        id: "enable-integrations",
        title: "啟用 MCP 整合",
        description: "連接 MCP 伺服器以擴展功能",
        priority: "medium",
        action: "前往整合設定",
      },
      {
        id: "enable-stream",
        title: "啟用 Stream 模式",
        description: "改善大型回應的性能",
        priority: "medium",
        action: "前往聊天設定",
      },
      {
        id: "enable-deep-think",
        title: "啟用 Deep Think",
        description: "用於複雜問題的深度分析",
        priority: "low",
        action: "前往 AI 助手",
      },
      {
        id: "add-mcp-servers",
        title: "添加更多 MCP 伺服器",
        description: "支持文件、Web、數據庫和搜尋功能",
        priority: "medium",
        action: "前往整合設定",
      },
    ];

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json(
      { error: "Failed to generate suggestions" },
      { status: 500 }
    );
  }
}
