import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

/**
 * MCP 市場和服務管理 API
 * 支持瀏覽、安裝和管理 MCP 服務
 */

// MCP 市場項目
const MCP_MARKETPLACE = {
  "notion-mcp": {
    name: "Notion MCP",
    category: "數據庫",
    description: "完整的 Notion 數據庫訪問和同步功能",
    status: "stable",
    users: "5K+",
    rating: 4.8,
    version: "2.0.1",
    icon: "📊",
    author: "OpenClaw",
    repository: "https://github.com/openclaw/notion-mcp",
    features: ["數據庫查詢", "頁面創建", "屬性更新"],
    dependencies: [],
  },
  "web-search-mcp": {
    name: "Web Search MCP",
    category: "搜索",
    description: "實時網頁搜索和內容提取",
    status: "stable",
    users: "3K+",
    rating: 4.6,
    version: "1.5.0",
    icon: "🔍",
    author: "OpenClaw",
    repository: "https://github.com/openclaw/web-search-mcp",
    features: ["搜索", "內容提取", "實時更新"],
    dependencies: [],
  },
  "file-system-mcp": {
    name: "File System MCP",
    category: "文件",
    description: "安全的文件系統訪問和管理",
    status: "stable",
    users: "2K+",
    rating: 4.7,
    version: "1.3.2",
    icon: "📁",
    author: "OpenClaw",
    repository: "https://github.com/openclaw/file-system-mcp",
    features: ["文件讀取", "文件寫入", "目錄列表"],
    dependencies: [],
  },
  "database-mcp": {
    name: "Database MCP",
    category: "數據庫",
    description: "通用數據庫連接和查詢",
    status: "beta",
    users: "1K+",
    rating: 4.5,
    version: "0.8.0",
    icon: "🗄️",
    author: "OpenClaw",
    repository: "https://github.com/openclaw/database-mcp",
    features: ["SQL 查詢", "連接管理", "事務支持"],
    dependencies: ["sqlite3"],
  },
  "memory-mcp": {
    name: "Memory MCP",
    category: "存儲",
    description: "長期記憶和知識管理",
    status: "experimental",
    users: "500+",
    rating: 4.3,
    version: "0.5.0",
    icon: "🧠",
    author: "OpenClaw",
    repository: "https://github.com/openclaw/memory-mcp",
    features: ["記憶存儲", "檢索", "向量化"],
    dependencies: ["embeddings"],
  },
  "slack-mcp": {
    name: "Slack MCP",
    category: "通訊",
    description: "Slack 集成和消息管理",
    status: "beta",
    users: "800+",
    rating: 4.4,
    version: "0.7.0",
    icon: "💬",
    author: "OpenClaw",
    repository: "https://github.com/openclaw/slack-mcp",
    features: ["發送消息", "頻道管理", "用戶提及"],
    dependencies: [],
  },
};

// 已安裝的 MCP 服務
const getInstalledMCP = async (): Promise<string[]> => {
  try {
    const configPath = path.join(process.cwd(), ".mcp-installed.json");
    const content = await fs.readFile(configPath, "utf-8");
    const config = JSON.parse(content);
    return config.installed || [];
  } catch {
    return [];
  }
};

// 保存已安裝的 MCP 服務
const saveInstalledMCP = async (installed: string[]): Promise<void> => {
  const configPath = path.join(process.cwd(), ".mcp-installed.json");
  await fs.writeFile(
    configPath,
    JSON.stringify({ installed, updatedAt: new Date().toISOString() }, null, 2)
  );
};

// GET: 瀏覽市場或獲取已安裝服務
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");
    const search = searchParams.get("search")?.toLowerCase();
    const category = searchParams.get("category");

    if (action === "installed") {
      // 返回已安裝的服務
      const installed = await getInstalledMCP();
      const installedDetails = installed.map((id) => ({
        id,
        ...MCP_MARKETPLACE[id as keyof typeof MCP_MARKETPLACE],
      }));

      return NextResponse.json({
        success: true,
        installed: installedDetails,
        count: installed.length,
      });
    }

    if (action === "detail") {
      // 返回某個服務的詳細信息
      const id = searchParams.get("id");
      if (!id || !MCP_MARKETPLACE[id as keyof typeof MCP_MARKETPLACE]) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      const installed = await getInstalledMCP();
      return NextResponse.json({
        success: true,
        service: {
          id,
          ...MCP_MARKETPLACE[id as keyof typeof MCP_MARKETPLACE],
          isInstalled: installed.includes(id),
        },
      });
    }

    // 瀏覽市場（支持搜索和分類）
    let marketplace = Object.entries(MCP_MARKETPLACE).map(([id, data]) => ({
      id,
      ...data,
    }));

    if (category) {
      marketplace = marketplace.filter((item) => item.category === category);
    }

    if (search) {
      marketplace = marketplace.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.description.toLowerCase().includes(search)
      );
    }

    const installed = await getInstalledMCP();
    marketplace = marketplace.map((item) => ({
      ...item,
      isInstalled: installed.includes(item.id),
    }));

    return NextResponse.json({
      success: true,
      marketplace,
      total: marketplace.length,
      categories: ["數據庫", "搜索", "文件", "通訊", "存儲"],
    });
  } catch (error) {
    console.error("Get MCP marketplace error:", error);
    return NextResponse.json(
      { error: "Failed to get marketplace" },
      { status: 500 }
    );
  }
}

// POST: 安裝或測試 MCP 服務
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, serviceId, config } = body;

    if (action === "install") {
      // 安裝服務
      if (
        !serviceId ||
        !MCP_MARKETPLACE[serviceId as keyof typeof MCP_MARKETPLACE]
      ) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      const installed = await getInstalledMCP();
      if (installed.includes(serviceId)) {
        return NextResponse.json(
          { error: "Service already installed" },
          { status: 400 }
        );
      }

      installed.push(serviceId);
      await saveInstalledMCP(installed);

      return NextResponse.json({
        success: true,
        message: `${MCP_MARKETPLACE[serviceId as keyof typeof MCP_MARKETPLACE].name} installed successfully`,
        serviceId,
        installedAt: new Date().toISOString(),
      });
    }

    if (action === "uninstall") {
      // 卸載服務
      if (!serviceId) {
        return NextResponse.json(
          { error: "Missing serviceId" },
          { status: 400 }
        );
      }

      let installed = await getInstalledMCP();
      if (!installed.includes(serviceId)) {
        return NextResponse.json(
          { error: "Service not installed" },
          { status: 400 }
        );
      }

      installed = installed.filter((id) => id !== serviceId);
      await saveInstalledMCP(installed);

      return NextResponse.json({
        success: true,
        message: `Service uninstalled successfully`,
        serviceId,
      });
    }

    if (action === "test") {
      // 測試服務
      if (!serviceId) {
        return NextResponse.json(
          { error: "Missing serviceId" },
          { status: 400 }
        );
      }

      const service = MCP_MARKETPLACE[serviceId as keyof typeof MCP_MARKETPLACE];
      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      // 模擬測試結果
      const testResult = {
        serviceId,
        status: "success",
        message: `${service.name} connection test passed`,
        latency: Math.random() * 500 + 50,
        features: service.features,
      };

      return NextResponse.json({
        success: true,
        result: testResult,
      });
    }

    return NextResponse.json(
      { error: "Unknown action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("MCP operation error:", error);
    return NextResponse.json(
      { error: "Failed to process MCP operation" },
      { status: 500 }
    );
  }
}

// DELETE: 卸載 MCP 服務
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: "Missing serviceId" },
        { status: 400 }
      );
    }

    let installed = await getInstalledMCP();
    if (!installed.includes(serviceId)) {
      return NextResponse.json(
        { error: "Service not installed" },
        { status: 400 }
      );
    }

    installed = installed.filter((id) => id !== serviceId);
    await saveInstalledMCP(installed);

    return NextResponse.json({
      success: true,
      message: "Service uninstalled",
      serviceId,
    });
  } catch (error) {
    console.error("MCP delete error:", error);
    return NextResponse.json(
      { error: "Failed to uninstall service" },
      { status: 500 }
    );
  }
}
