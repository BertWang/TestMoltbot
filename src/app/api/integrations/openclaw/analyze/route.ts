import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();

    // 本地分析 - 可以替換成真實的 openclaw.ai API 調用
    const analysis = {
      recommendations: generateRecommendations(config),
      issues: generateIssues(config),
      optimizations: generateOptimizations(config),
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed" },
      { status: 500 }
    );
  }
}

function generateRecommendations(config: any): string[] {
  const recommendations: string[] = [];

  if (config.aiProvider === "gemini") {
    if (config.modelName === "gemini-2.0-flash-exp") {
      recommendations.push(
        "✓ 使用最新的 Gemini 2.0 Flash Experimental - 最佳性能和功能"
      );
    } else if (config.modelName?.includes("gemini-2.0")) {
      recommendations.push("✓ Gemini 2.0 模型提供出色的性能");
    }
  }

  if (config.enabledIntegrationsCount > 0) {
    recommendations.push(
      `✓ 已啟用 ${config.enabledIntegrationsCount} 個整合服務`
    );
  }

  if (!recommendations.length) {
    recommendations.push("✓ 系統配置基本完成");
  }

  return recommendations;
}

function generateIssues(config: any): Array<any> {
  const issues: Array<any> = [];

  if (!config.aiProvider) {
    issues.push({
      severity: "error",
      message: "未配置 AI 提供商",
      suggestion: "前往 AI 設定頁面選擇一個 AI 提供商（推薦使用 Gemini）",
    });
  }

  if (!config.modelName) {
    issues.push({
      severity: "warning",
      message: "未選擇 AI 模型",
      suggestion: "選擇一個模型以啟用 AI 功能（推薦 gemini-2.0-flash-exp）",
    });
  }

  if (config.integrationsCount === 0) {
    issues.push({
      severity: "info",
      message: "未配置任何整合服務",
      suggestion:
        "添加 MCP 伺服器或 Notion 整合以擴展系統功能。從簡單的文件系統整合開始。",
    });
  }

  if (
    config.integrationsCount > 0 &&
    config.enabledIntegrationsCount === 0
  ) {
    issues.push({
      severity: "warning",
      message: `配置了 ${config.integrationsCount} 個整合但都未啟用`,
      suggestion: "啟用至少一個整合服務以開始使用高級功能",
    });
  }

  // 檢查模型是否為舊版本
  if (
    config.modelName &&
    config.modelName.includes("gemini-1.5")
  ) {
    issues.push({
      severity: "info",
      message: `當前使用 ${config.modelName}`,
      suggestion:
        "考慮升級到 Gemini 2.0 Flash 以獲得更好的性能和新功能",
    });
  }

  return issues;
}

function generateOptimizations(config: any): Array<any> {
  const optimizations: Array<any> = [];

  optimizations.push({
    category: "性能",
    current: "標準響應",
    recommended: "啟用 Stream 模式以改善大型響應的響應時間",
  });

  optimizations.push({
    category: "用戶體驗",
    current: "基本聊天",
    recommended: "啟用 Deep Think 模式用於複雜問題分析",
  });

  optimizations.push({
    category: "可訪問性",
    current: "文本模式",
    recommended: "啟用 TTS（文本轉語音）以改善可訪問性",
  });

  if (config.integrationsCount < 2) {
    optimizations.push({
      category: "功能擴展",
      current: `${config.integrationsCount} 個整合`,
      recommended: "添加更多 MCP 伺服器以解鎖更多功能（如 Web、數據庫、搜尋）",
    });
  }

  return optimizations;
}
