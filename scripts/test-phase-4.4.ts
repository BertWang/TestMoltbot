#!/usr/bin/env node

/**
 * Phase 4.4 API 測試腳本
 * 驗證所有新的後台管理 API 端點
 * 
 * 用法: npx ts-node scripts/test-phase-4.4.ts
 */

import http from "http";

const BASE_URL = "http://localhost:3000/api";
let testsPassed = 0;
let testsFailed = 0;

// 彩色輸出
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
};

function log(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

// HTTP 請求包裝
async function makeRequest(
  method: string,
  path: string,
  body?: any
): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on("error", reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

// 測試函數
async function test(
  name: string,
  method: string,
  path: string,
  body?: any,
  expectedStatus: number = 200
) {
  try {
    const { status, data } = await makeRequest(method, path, body);

    if (status === expectedStatus) {
      log(colors.green, `✅ ${name}`);
      testsPassed++;
      return data;
    } else {
      log(
        colors.red,
        `❌ ${name} - Expected ${expectedStatus}, got ${status}`
      );
      testsFailed++;
      return null;
    }
  } catch (error) {
    log(colors.red, `❌ ${name} - ${error}`);
    testsFailed++;
    return null;
  }
}

// 主測試函數
async function runTests() {
  log(colors.blue, "\n🧪 Phase 4.4 API 測試套件\n");

  // === 模型管理 API 測試 ===
  log(colors.yellow, "📦 測試模型管理 API");

  // 獲取可用模型
  const models = await test(
    "獲取可用模型列表",
    "GET",
    "/settings/model?action=versions"
  );

  if (models?.models) {
    log(colors.blue, `   找到 ${Object.keys(models.models).length} 個模型`);
  }

  // 獲取當前模型
  await test("獲取當前模型配置", "GET", "/settings/model?action=current");

  // 模型對比
  await test(
    "對比模型版本",
    "GET",
    "/settings/model?action=compare&model1=gemini-3.0-pro&model2=gemini-2.5-flash"
  );

  // 選擇模型
  await test(
    "選擇 Gemini 2.5 模型",
    "POST",
    "/settings/model",
    {
      action: "select",
      model: "gemini-2.5-flash",
    }
  );

  // 更新參數
  await test(
    "更新模型參數",
    "POST",
    "/settings/model",
    {
      action: "update-params",
      params: {
        temperature: 1.5,
        topK: 50,
        topP: 0.9,
        maxTokens: 10000,
      },
    }
  );

  // === OCR 提供商 API 測試 ===
  log(colors.yellow, "\n🔍 測試 OCR 提供商 API");

  // 獲取 OCR 提供商
  const ocr = await test(
    "獲取 OCR 提供商列表",
    "GET",
    "/settings/ocr?action=providers"
  );

  if (ocr?.providers) {
    log(colors.blue, `   找到 ${Object.keys(ocr.providers).length} 個提供商`);
  }

  // 獲取當前 OCR 配置
  await test("獲取當前 OCR 配置", "GET", "/settings/ocr?action=current");

  // OCR 提供商對比
  await test(
    "對比 OCR 提供商",
    "GET",
    "/settings/ocr?action=compare&provider1=gemini&provider2=mineru"
  );

  // 選擇 OCR 提供商
  await test(
    "選擇 MinerU OCR",
    "POST",
    "/settings/ocr",
    {
      action: "select",
      provider: "mineru",
    }
  );

  // 測試 OCR 連接
  await test(
    "測試 OCR 連接",
    "POST",
    "/settings/ocr",
    {
      action: "test-connection",
      provider: "paddle",
    }
  );

  // === MCP 市場 API 測試 ===
  log(colors.yellow, "\n📦 測試 MCP 市場 API");

  // 瀏覽市場
  const market = await test("瀏覽 MCP 市場", "GET", "/mcp/marketplace");

  if (market?.marketplace) {
    log(colors.blue, `   找到 ${market.marketplace.length} 個服務`);
  }

  // 搜索服務
  const searchResult = await test(
    "搜索 Notion 服務",
    "GET",
    "/mcp/marketplace?search=notion"
  );

  if (searchResult?.marketplace) {
    log(colors.blue, `   搜索結果: ${searchResult.marketplace.length} 項`);
  }

  // 按分類篩選
  const categoryResult = await test(
    "篩選數據庫分類",
    "GET",
    "/mcp/marketplace?category=數據庫"
  );

  if (categoryResult?.marketplace) {
    log(colors.blue, `   分類結果: ${categoryResult.marketplace.length} 項`);
  }

  // 獲取已安裝服務
  await test("獲取已安裝的 MCP 服務", "GET", "/mcp/marketplace?action=installed");

  // 安裝服務
  await test(
    "安裝 Notion MCP",
    "POST",
    "/mcp/marketplace",
    {
      action: "install",
      serviceId: "notion-mcp",
    }
  );

  // 獲取服務詳情
  await test(
    "獲取 Notion MCP 詳情",
    "GET",
    "/mcp/marketplace?action=detail&id=notion-mcp"
  );

  // 測試服務
  await test(
    "測試 Web Search 服務",
    "POST",
    "/mcp/marketplace",
    {
      action: "test",
      serviceId: "web-search-mcp",
    }
  );

  // 卸載服務
  await test(
    "卸載 Notion MCP",
    "DELETE",
    "/mcp/marketplace",
    {
      serviceId: "notion-mcp",
    }
  );

  // === 測試摘要 ===
  log(colors.yellow, "\n📊 測試摘要\n");
  log(colors.green, `✅ 通過: ${testsPassed}`);
  if (testsFailed > 0) {
    log(colors.red, `❌ 失敗: ${testsFailed}`);
  }

  const total = testsPassed + testsFailed;
  const percentage = Math.round((testsPassed / total) * 100);

  if (testsFailed === 0) {
    log(colors.green, `\n🎉 所有測試通過！(${percentage}%)\n`);
    process.exit(0);
  } else {
    log(colors.red, `\n⚠️  部分測試失敗 (${percentage}% 通過)\n`);
    process.exit(1);
  }
}

// 檢查服務器連接
async function checkServer() {
  log(colors.blue, "🔗 檢查服務器連接...");
  try {
    const { status } = await makeRequest("GET", "/settings/model");
    if (status) {
      log(colors.green, "✅ 服務器連接正常\n");
      return true;
    }
  } catch {
    log(
      colors.red,
      "❌ 無法連接到服務器。請確保 Next.js dev 服務器在運行:"
    );
    log(colors.yellow, "   npm run dev\n");
    process.exit(1);
  }
}

// 運行測試
(async () => {
  await checkServer();
  await runTests();
})();
