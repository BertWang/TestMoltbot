import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * 模型配置管理 API
 * 支持 Gemini 最新版本和參數配置
 */

// 支持的 Gemini 模型列表
const AVAILABLE_MODELS = {
  "gemini-3.0-pro": {
    name: "Gemini 3.0 Pro",
    status: "beta",
    tier: "premium",
    releaseDate: "2025-02-13",
    features: ["多模態", "高性能", "長上下文"],
    maxTokens: 1000000,
  },
  "gemini-2.5-flash": {
    name: "Gemini 2.5 Flash",
    status: "stable",
    tier: "standard",
    releaseDate: "2025-01-15",
    features: ["快速", "經濟", "可靠"],
    maxTokens: 1000000,
  },
  "gemini-2.0-flash-exp": {
    name: "Gemini 2.0 Flash (Exp)",
    status: "experimental",
    tier: "beta",
    releaseDate: "2024-12-15",
    features: ["新功能", "前沿", "不穩定"],
    maxTokens: 1000000,
  },
  "gemini-2.0-flash": {
    name: "Gemini 2.0 Flash",
    status: "stable",
    tier: "standard",
    releaseDate: "2024-11-01",
    features: ["穩定", "經濟", "可靠"],
    maxTokens: 1000000,
  },
  "gemini-1.5-pro": {
    name: "Gemini 1.5 Pro",
    status: "stable",
    tier: "premium",
    releaseDate: "2024-06-01",
    features: ["高性能", "長上下文", "穩定"],
    maxTokens: 1000000,
  },
  "gemini-1.5-flash": {
    name: "Gemini 1.5 Flash",
    status: "stable",
    tier: "standard",
    releaseDate: "2024-05-01",
    features: ["快速", "經濟", "輕量"],
    maxTokens: 1000000,
  },
};

// 默認模型參數
const DEFAULT_MODEL_PARAMS = {
  temperature: 1,
  topK: 40,
  topP: 0.95,
  maxTokens: 8192,
};

// GET: 獲取可用模型列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    if (action === "versions") {
      // 返回所有可用模型版本
      return NextResponse.json({
        success: true,
        models: AVAILABLE_MODELS,
        total: Object.keys(AVAILABLE_MODELS).length,
      });
    }

    if (action === "current") {
      // 返回當前選定的模型
      const adminSettings = await prisma.adminSettings.findUnique({
        where: { id: "singleton" },
      });

      return NextResponse.json({
        success: true,
        current: {
          model: adminSettings?.modelName || "gemini-2.0-flash-exp",
          params: adminSettings?.config
            ? JSON.parse(adminSettings.config)
            : DEFAULT_MODEL_PARAMS,
        },
      });
    }

    if (action === "compare") {
      // 對比兩個模型
      const model1 = searchParams.get("model1");
      const model2 = searchParams.get("model2");

      if (!model1 || !model2) {
        return NextResponse.json(
          { error: "Missing model parameters" },
          { status: 400 }
        );
      }

      const m1 = AVAILABLE_MODELS[model1 as keyof typeof AVAILABLE_MODELS];
      const m2 = AVAILABLE_MODELS[model2 as keyof typeof AVAILABLE_MODELS];

      if (!m1 || !m2) {
        return NextResponse.json(
          { error: "Model not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        comparison: {
          model1: { id: model1, ...m1 },
          model2: { id: model2, ...m2 },
          differences: {
            status: m1.status !== m2.status,
            tier: m1.tier !== m2.tier,
            releaseDate: m1.releaseDate !== m2.releaseDate,
            features: m1.features.length !== m2.features.length,
          },
        },
      });
    }

    // 默認返回所有模型
    return NextResponse.json({
      success: true,
      models: AVAILABLE_MODELS,
    });
  } catch (error) {
    console.error("Get models error:", error);
    return NextResponse.json(
      { error: "Failed to get models" },
      { status: 500 }
    );
  }
}

// POST: 選擇模型或更新參數
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, model, params } = body;

    if (action === "select") {
      // 選擇模型
      if (!model || !AVAILABLE_MODELS[model as keyof typeof AVAILABLE_MODELS]) {
        return NextResponse.json(
          { error: "Invalid model" },
          { status: 400 }
        );
      }

      const updated = await prisma.adminSettings.upsert({
        where: { id: "singleton" },
        update: {
          modelName: model,
          aiProvider: "gemini",
        },
        create: {
          id: "singleton",
          modelName: model,
          aiProvider: "gemini",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Model switched to ${model}`,
        settings: updated,
      });
    }

    if (action === "update-params") {
      // 更新模型參數
      if (!params) {
        return NextResponse.json(
          { error: "Missing params" },
          { status: 400 }
        );
      }

      // 驗證參數範圍
      const validParams = {
        temperature: Math.max(0, Math.min(2, params.temperature ?? 1)),
        topK: Math.max(1, Math.min(100, params.topK ?? 40)),
        topP: Math.max(0, Math.min(1, params.topP ?? 0.95)),
        maxTokens: Math.max(1, Math.min(1000000, params.maxTokens ?? 8192)),
      };

      const updated = await prisma.adminSettings.upsert({
        where: { id: "singleton" },
        update: {
          config: JSON.stringify(validParams),
        },
        create: {
          id: "singleton",
          config: JSON.stringify(validParams),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Parameters updated",
        params: validParams,
      });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Update model error:", error);
    return NextResponse.json(
      { error: "Failed to update model" },
      { status: 500 }
    );
  }
}

// PUT: 批量更新配置
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, params } = body;

    const updated = await prisma.adminSettings.upsert({
      where: { id: "singleton" },
      update: {
        modelName: model || undefined,
        config: params ? JSON.stringify(params) : undefined,
      },
      create: {
        id: "singleton",
        modelName: model || "gemini-2.0-flash-exp",
        config: params ? JSON.stringify(params) : JSON.stringify(DEFAULT_MODEL_PARAMS),
      },
    });

    return NextResponse.json({
      success: true,
      settings: updated,
    });
  } catch (error) {
    console.error("Update config error:", error);
    return NextResponse.json(
      { error: "Failed to update config" },
      { status: 500 }
    );
  }
}
