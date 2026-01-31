import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function initMCPRegistry() {
  console.log("🚀 初始化 MCP 服務註冊表...");

  const services = [
    {
      name: "openclaw",
      displayName: "OpenClaw AI 分析",
      description: "高級內容分析和深度洞察，支持多語言",
      category: "analysis",
      type: "openclaw",
      version: "1.0.0",
      logo: "https://openclaw.ai/logo.png",
      requiredFields: JSON.stringify({ apiKey: true }),
      optionalFields: JSON.stringify({ model: false, maxTokens: false }),
      documentation: "https://docs.openclaw.ai",
      homepage: "https://openclaw.ai",
      repositoryUrl: "https://github.com/openclaw/openclaw",
      totalInstalls: 1200,
      rating: 4.8,
      reviews: 45,
    },
    {
      name: "brave_search",
      displayName: "Brave 搜尋",
      description: "實時 Web 搜尋結果，隱私優先",
      category: "search",
      type: "brave",
      version: "1.0.0",
      logo: "https://brave.com/logo.png",
      requiredFields: JSON.stringify({ apiKey: true }),
      optionalFields: JSON.stringify({ region: false, safeSearch: false }),
      documentation: "https://api.search.brave.com",
      homepage: "https://brave.com",
      repositoryUrl: "https://github.com/brave/brave-search-api",
      totalInstalls: 800,
      rating: 4.6,
      reviews: 32,
    },
    {
      name: "github",
      displayName: "GitHub 集成",
      description: "訪問 GitHub repositories、issues 和代碼",
      category: "integration",
      type: "github",
      version: "1.0.0",
      logo: "https://github.com/favicon.ico",
      requiredFields: JSON.stringify({ token: true }),
      optionalFields: JSON.stringify({
        organization: false,
        repositories: false,
      }),
      documentation: "https://docs.github.com/rest",
      homepage: "https://github.com",
      repositoryUrl: "https://github.com/octokit/octokit.js",
      totalInstalls: 2100,
      rating: 4.9,
      reviews: 78,
    },
    {
      name: "slack",
      displayName: "Slack 集成",
      description: "與 Slack 工作區集成，發送消息和通知",
      category: "integration",
      type: "slack",
      version: "1.0.0",
      logo: "https://slack.com/logo.png",
      requiredFields: JSON.stringify({ webhookUrl: true }),
      optionalFields: JSON.stringify({
        channel: false,
        botName: false,
        emoji: false,
      }),
      documentation: "https://api.slack.com",
      homepage: "https://slack.com",
      repositoryUrl: "https://github.com/slackapi/bolt-js",
      totalInstalls: 1500,
      rating: 4.7,
      reviews: 56,
    },
    {
      name: "notion",
      displayName: "Notion 集成",
      description: "連接 Notion 數據庫，創建和更新頁面",
      category: "integration",
      type: "notion",
      version: "1.0.0",
      logo: "https://notion.so/logo.png",
      requiredFields: JSON.stringify({ apiKey: true, databaseId: true }),
      optionalFields: JSON.stringify({ workspaceId: false }),
      documentation: "https://developers.notion.com",
      homepage: "https://notion.so",
      repositoryUrl: "https://github.com/makenotion/notion-sdk-js",
      totalInstalls: 950,
      rating: 4.5,
      reviews: 28,
    },
    {
      name: "google_search",
      displayName: "Google 自定義搜尋",
      description: "Google Custom Search API，精確搜尋結果",
      category: "search",
      type: "google_search",
      version: "1.0.0",
      logo: "https://google.com/logo.png",
      requiredFields: JSON.stringify({
        apiKey: true,
        searchEngineId: true,
      }),
      optionalFields: JSON.stringify({
        resultSize: false,
        fileType: false,
      }),
      documentation: "https://developers.google.com/custom-search",
      homepage: "https://google.com",
      repositoryUrl: "https://github.com/googleapis/google-api-nodejs-client",
      totalInstalls: 700,
      rating: 4.4,
      reviews: 22,
    },
  ];

  try {
    for (const service of services) {
      // 檢查是否已存在
      const existing = await prisma.mCPServiceRegistry.findUnique({
        where: { name: service.name },
      });

      if (!existing) {
        await prisma.mCPServiceRegistry.create({ data: service as any });
        console.log(`✅ 建立服務: ${service.displayName}`);
      } else {
        console.log(`⏭️  服務已存在: ${service.displayName}`);
      }
    }

    console.log("\n✨ MCP 服務註冊表初始化完成！");
    console.log(`📊 總共 ${services.length} 個服務已加入市場`);
  } catch (error) {
    console.error("❌ 初始化失敗:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 執行初始化
initMCPRegistry().catch((error) => {
  console.error(error);
  process.exit(1);
});
