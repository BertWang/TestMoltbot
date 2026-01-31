import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * MCP 市場 API - 使用數據庫驅動
 * GET  - 瀏覽市場服務
 * POST - 安裝新服務
 */

// GET: 瀏覽市場或獲取已安裝服務
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    if (action === "installed") {
      // 返回已安裝的服務
      const installed = await prisma.mCPServiceConfig.findMany({
        select: {
          id: true,
          name: true,
          type: true,
          enabled: true,
          description: true,
          lastTestStatus: true,
          lastTestedAt: true,
        },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({
        success: true,
        installed,
        count: installed.length,
      });
    }

    // 瀏覽市場（支持搜索和分類）
    let where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const marketplace = await prisma.mCPServiceRegistry.findMany({
      where,
      orderBy: [{ totalInstalls: "desc" }, { rating: "desc" }],
    });

    // 獲取已安裝的服務集合
    const installedServices = await prisma.mCPServiceConfig.findMany({
      select: { name: true },
    });
    const installedNames = new Set(installedServices.map((s) => s.name));

    // 為每個市場服務添加安裝狀態和解析 JSON 字段
    const servicesWithStatus = marketplace.map((service) => ({
      ...service,
      isInstalled: installedNames.has(service.name),
      requiredFields: service.requiredFields
        ? JSON.parse(service.requiredFields)
        : {},
      optionalFields: service.optionalFields
        ? JSON.parse(service.optionalFields)
        : {},
    }));

    // 獲取類別列表
    const categories = await prisma.mCPServiceRegistry.findMany({
      where: { isActive: true },
      distinct: ["category"],
      select: { category: true },
    });

    return NextResponse.json({
      success: true,
      marketplace: servicesWithStatus,
      total: servicesWithStatus.length,
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    console.error("Get MCP marketplace error:", error);
    return NextResponse.json(
      { error: "Failed to get marketplace" },
      { status: 500 }
    );
  }
}

// POST: 安裝新服務
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { registryId, config } = body;

    if (!registryId || !config) {
      return NextResponse.json(
        { error: "Missing registryId or config" },
        { status: 400 }
      );
    }

    // 獲取註冊表中的服務信息
    const registryService = await prisma.mCPServiceRegistry.findUnique({
      where: { id: registryId },
    });

    if (!registryService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // 檢查是否已安裝
    const existing = await prisma.mCPServiceConfig.findUnique({
      where: { name: registryService.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Service already installed" },
        { status: 409 }
      );
    }

    // 驗證必填字段
    const requiredFields = registryService.requiredFields
      ? JSON.parse(registryService.requiredFields)
      : {};

    for (const [field, required] of Object.entries(requiredFields)) {
      if (required && !config[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // 創建服務配置
    const serviceConfig = await prisma.mCPServiceConfig.create({
      data: {
        name: registryService.name,
        type: registryService.type,
        enabled: true,
        endpoint: config.endpoint || null,
        authType: config.authType || "api_key",
        credentials: config.apiKey
          ? Buffer.from(config.apiKey).toString("base64")
          : null,
        config: JSON.stringify(config),
        description: registryService.description,
      },
    });

    // 更新註冊表中的安裝計數
    await prisma.mCPServiceRegistry.update({
      where: { id: registryId },
      data: { totalInstalls: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      serviceId: serviceConfig.id,
      message: "Service installed successfully",
    });
  } catch (error) {
    console.error("安裝 MCP 服務失敗:", error);
    return NextResponse.json(
      { error: "Failed to install service" },
      { status: 500 }
    );
  }
}
