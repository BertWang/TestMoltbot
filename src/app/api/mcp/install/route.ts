import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const prismaClient = prisma as any;

/**
 * MCP 安裝端點
 * POST /api/mcp/install - 安裝 MCP 服務
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registryId, config } = body;

    if (!registryId) {
      return NextResponse.json(
        { error: "Missing registryId" },
        { status: 400 }
      );
    }

    // 獲取註冊表中的服務信息
    const registryService = await prismaClient.mCPServiceRegistry.findUnique({
      where: { id: registryId },
    });

    if (!registryService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // 檢查是否已安裝
    const existing = await prismaClient.mCPServiceConfig.findUnique({
      where: { name: registryService.name },
    });

    if (existing) {
      return NextResponse.json(
        { 
          error: "Service already installed",
          serviceId: existing.id,
          installed: true
        },
        { status: 409 }
      );
    }

    // 驗證必填字段
    let requiredFields: Record<string, boolean> = {};
    if (registryService.requiredFields) {
      try {
        requiredFields = JSON.parse(registryService.requiredFields);
      } catch (e) {
        console.warn("Failed to parse requiredFields:", e);
      }
    }

    const providedConfig = config || {};
    for (const [field, isRequired] of Object.entries(requiredFields)) {
      if (isRequired && !providedConfig[field]) {
        return NextResponse.json(
          { 
            error: `Missing required field: ${field}`,
            missingField: field,
            requiredFields: Object.keys(requiredFields),
          },
          { status: 400 }
        );
      }
    }

    // 創建服務配置
    const serviceConfig = await prismaClient.mCPServiceConfig.create({
      data: {
        name: registryService.name,
        type: registryService.type,
        enabled: true,
        endpoint: providedConfig.endpoint || null,
        authType: providedConfig.authType || "api_key",
        credentials: providedConfig.apiKey
          ? Buffer.from(JSON.stringify({ apiKey: providedConfig.apiKey })).toString("base64")
          : null,
        config: JSON.stringify(providedConfig),
        description: registryService.description || undefined,
        priority: 50,
        retryPolicy: "exponential",
        timeoutMs: 30000,
      },
    });

    // 更新註冊表中的安裝計數
    await prismaClient.mCPServiceRegistry.update({
      where: { id: registryId },
      data: { totalInstalls: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      serviceId: serviceConfig.id,
      serviceName: serviceConfig.name,
      message: `${registryService.displayName} 已成功安裝`,
      installed: true,
      installedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("MCP 安裝失敗:", error);
    return NextResponse.json(
      { 
        error: "Failed to install service",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
