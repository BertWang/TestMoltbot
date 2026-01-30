# 🔬 Openclaw.ai 整合研究報告

**研究日期**: 2026-01-30  
**目標**: 整合 openclaw.ai AI 工具到 TestMoltbot 開發環境

---

## 📋 當前發現

### 1. 專案中的 "Clawdbot" 概念

根據專案文件分析：

```
CLAWDBOT_*.md 文件
├── 任務管理文件（規劃、清單）
├── Shell 腳本（CLAWDBOT_START.sh）
└── 監督日誌（MONITORING_LOG.md）
```

**結論**: 當前的 "Clawdbot" 主要是：
- 📝 **任務規劃文件系統**
- 🤖 可能指代外部 AI 工具（如 Claude 或 openclaw.ai）
- 📊 進度追蹤機制

### 2. 已有的 AI 架構支援

TestMoltbot 已建立完整的多 AI 提供商架構：

```typescript
// src/lib/ai-service/types.ts
export type AIProviderType = 
  | "gemini"    // ✅ 已實作
  | "openai"    // ✅ 已實作
  | "azure"     // ⏳ 待實作
  | "claude"    // ⏳ 待實作（這可能就是 openclaw.ai 的入口）
  | "custom";   // ⏳ 待實作
```

**架構優勢**:
- 統一的 `AIProviderInterface` 介面
- Factory 模式動態創建提供商
- 模組化處理管道
- MCP (Model Context Protocol) 支援

---

## 🎯 Openclaw.ai 整合方案

### 方案 A：作為 Claude Provider 實作（推薦）

由於專案已預留 `claude` 類型，可直接實作：

#### 步驟 1: 環境變數配置

```bash
# .env.local
CLAUDE_API_KEY=your-openclaw-or-claude-api-key
CLAUDE_API_BASE_URL=https://openclaw.ai/api/v1  # 如果使用 openclaw.ai
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

#### 步驟 2: 實作 ClaudeProvider

```typescript
// src/lib/ai-service/providers/claude.ts
import Anthropic from "@anthropic-ai/sdk";
import { AIProviderInterface, AIConfig, ProcessedNote, SuggestionResult } from "../types";
import { BaseProvider } from "./base";

export class ClaudeProvider extends BaseProvider implements AIProviderInterface {
  private client: Anthropic;
  private modelName: string;

  constructor(config: AIConfig) {
    super(config);
    
    this.client = new Anthropic({
      apiKey: config.apiKey,
      baseURL: config.baseUrl, // 支援 openclaw.ai 自訂端點
    });
    
    this.modelName = config.modelName || "claude-3-5-sonnet-20241022";
  }

  async processNote(filePath: string, mimeType: string): Promise<ProcessedNote> {
    // 讀取圖片並轉為 base64
    const imageBuffer = await fs.readFile(filePath);
    const base64Image = imageBuffer.toString("base64");

    const response = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `請執行以下步驟，並確保所有中文輸出為繁體中文：
1. **OCR**: 準確轉錄圖片中的文字
2. **Refinement**: 創建清晰的 Markdown 版本
3. **Analysis**: 生成簡短摘要（1-2 句）和 3-5 個標籤
4. **Confidence**: 估計信心分數（0.0 到 1.0）

請嚴格以 JSON 格式輸出：
{
  "rawOcr": "...",
  "refinedContent": "...",
  "summary": "...",
  "tags": ["tag1", "tag2"],
  "confidence": 0.95
}`
            },
          ],
        },
      ],
    });

    // 解析回應
    const textContent = response.content.find(c => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("Claude response format error");
    }

    const jsonStr = this.cleanJsonResponse(textContent.text);
    return JSON.parse(jsonStr) as ProcessedNote;
  }

  async generateSuggestions(text: string): Promise<SuggestionResult[]> {
    const response = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `請根據以下筆記內容，提供 3-5 條實用建議：

筆記內容：
${text}

請以 JSON 陣列格式輸出，每條建議包含：
- title: 建議標題
- description: 詳細說明
- type: "insight" | "action" | "tag" | "related"

範例：
[
  {
    "title": "改進結構",
    "description": "建議添加章節標題以提升可讀性",
    "type": "action"
  }
]`
        }
      ],
    });

    const textContent = response.content.find(c => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return [];
    }

    const jsonStr = this.cleanJsonResponse(textContent.text);
    return JSON.parse(jsonStr) as SuggestionResult[];
  }

  async generateTags(text: string): Promise<string[]> {
    const response = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `請為以下內容生成 3-5 個繁體中文標籤：\n\n${text}\n\n僅輸出 JSON 陣列格式：["標籤1", "標籤2"]`
        }
      ],
    });

    const textContent = response.content.find(c => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return [];
    }

    const jsonStr = this.cleanJsonResponse(textContent.text);
    return JSON.parse(jsonStr) as string[];
  }

  async generateSummary(text: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.modelName,
      max_tokens: 200,
      messages: [
        {
          role: "user",
          content: `請用繁體中文為以下內容生成 1-2 句摘要：\n\n${text}`
        }
      ],
    });

    const textContent = response.content.find(c => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("Failed to generate summary");
    }

    return textContent.text.trim();
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.messages.create({
        model: this.modelName,
        max_tokens: 10,
        messages: [{ role: "user", content: "ping" }],
      });
      return response.content.length > 0;
    } catch {
      return false;
    }
  }

  private cleanJsonResponse(text: string): string {
    // 移除 markdown 程式碼區塊標記
    return text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
      .trim();
  }
}
```

#### 步驟 3: 更新 Factory

```typescript
// src/lib/ai-service/factory.ts
import { ClaudeProvider } from "./providers/claude";

// 在 createProvider 方法中添加：
case "claude":
  provider = new ClaudeProvider(config);
  break;
```

#### 步驟 4: 安裝依賴

```bash
npm install @anthropic-ai/sdk
```

---

### 方案 B：MCP 整合（進階協作）

如果 openclaw.ai 支援 MCP (Model Context Protocol)：

#### 配置 MCP Server

```typescript
// src/lib/mcp-configs/openclaw-config.ts
import { MCPServerConfig } from "@/lib/ai-service/types";

export const openclawMCPConfig: MCPServerConfig = {
  name: "openclaw",
  command: "npx",
  args: ["-y", "@openclaw/mcp-server"], // 假設有此套件
  enabled: true,
  env: {
    OPENCLAW_API_KEY: process.env.OPENCLAW_API_KEY || "",
  },
  resourceHandlers: [
    {
      type: "ai-assistant",
      operations: [
        {
          name: "generate-code",
          description: "讓 openclaw.ai 生成程式碼",
          input: { type: "object", properties: { prompt: { type: "string" } } },
          output: { type: "string" },
        },
        {
          name: "review-code",
          description: "讓 openclaw.ai 審查程式碼",
          input: { type: "object", properties: { code: { type: "string" } } },
          output: { type: "object" },
        },
      ],
    },
  ],
};
```

#### 註冊 MCP Server

```typescript
// src/lib/mcp-server.ts
import { openclawMCPConfig } from "./mcp-configs/openclaw-config";

const mcpServer = new MCPServer();
mcpServer.registerServer(openclawMCPConfig);

// 使用範例
const result = await mcpServer.executeOperation(
  "ai-assistant",
  "generate-code",
  { prompt: "建立一個搜尋建議組件" }
);
```

---

### 方案 C：開發環境整合（IDE 層級）

#### GitHub Copilot + Openclaw.ai 協作

```typescript
// src/lib/ai-orchestrator.ts
/**
 * AI 協作編排器
 * 協調 GitHub Copilot (IDE) 和 Openclaw.ai (外部) 的工作分配
 */

export class AIOrchestrator {
  private copilotAvailable: boolean;
  private openclawClient: ClaudeProvider;

  constructor() {
    this.copilotAvailable = this.detectCopilot();
    this.openclawClient = new ClaudeProvider({
      provider: "claude",
      apiKey: process.env.CLAUDE_API_KEY || "",
      modelName: "claude-3-5-sonnet-20241022",
      baseUrl: process.env.CLAUDE_API_BASE_URL,
    });
  }

  /**
   * 智慧任務分配
   */
  async executeTask(task: DevelopmentTask): Promise<TaskResult> {
    const taskType = this.classifyTask(task);

    switch (taskType) {
      case "code-completion":
        // IDE 層級的即時補全 → GitHub Copilot 處理
        return this.delegateToCopilot(task);

      case "code-generation":
        // 完整功能實作 → Openclaw.ai 處理
        return this.delegateToOpenclaw(task);

      case "code-review":
        // 程式碼審查 → 兩者協作
        return this.collaborativeReview(task);

      case "refactoring":
        // 重構建議 → Openclaw.ai 規劃，Copilot 執行
        return this.collaborativeRefactor(task);

      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  private async delegateToOpenclaw(task: DevelopmentTask): Promise<TaskResult> {
    // 呼叫 openclaw.ai API
    const prompt = this.buildPrompt(task);
    const response = await this.openclawClient.generateSuggestions(prompt);
    
    return {
      source: "openclaw",
      result: response,
      timestamp: new Date(),
    };
  }

  private async collaborativeReview(task: DevelopmentTask): Promise<TaskResult> {
    // 1. Openclaw.ai 提供高層級審查
    const review = await this.openclawClient.generateSuggestions(task.code);
    
    // 2. GitHub Copilot 在 IDE 中實時高亮問題（需要 IDE 外掛支援）
    // 這部分由 IDE 自動處理
    
    return {
      source: "collaborative",
      result: review,
      timestamp: new Date(),
    };
  }

  private detectCopilot(): boolean {
    // 檢測 GitHub Copilot 是否在 IDE 中啟用
    return process.env.GITHUB_COPILOT === "true" || 
           typeof (globalThis as any).githubCopilot !== "undefined";
  }

  private classifyTask(task: DevelopmentTask): TaskType {
    // 根據任務特徵分類
    if (task.description.includes("建立") || task.description.includes("實作")) {
      return "code-generation";
    }
    if (task.description.includes("審查") || task.description.includes("檢視")) {
      return "code-review";
    }
    if (task.description.includes("重構") || task.description.includes("優化")) {
      return "refactoring";
    }
    return "code-completion";
  }

  private buildPrompt(task: DevelopmentTask): string {
    return `
任務類型: ${task.type}
描述: ${task.description}
上下文: ${task.context || "無"}
需求: ${task.requirements?.join(", ") || "無特殊需求"}

請提供詳細的實作建議或程式碼範例。
`;
  }
}

// 類型定義
interface DevelopmentTask {
  type: string;
  description: string;
  code?: string;
  context?: string;
  requirements?: string[];
}

interface TaskResult {
  source: "copilot" | "openclaw" | "collaborative";
  result: any;
  timestamp: Date;
}

type TaskType = "code-completion" | "code-generation" | "code-review" | "refactoring";
```

---

## 🚀 建議實施順序

### 階段 1: 基礎整合（1-2 小時）
1. ✅ 安裝 `@anthropic-ai/sdk`
2. ✅ 建立 `ClaudeProvider` 類別
3. ✅ 更新 Factory 支援 `claude` 類型
4. ✅ 測試基本 OCR 功能

### 階段 2: 功能驗證（1 小時）
1. ✅ 測試 `processNote()` - 圖片辨識
2. ✅ 測試 `generateSuggestions()` - AI 建議
3. ✅ 測試 `generateTags()` - 標籤生成
4. ✅ 比較 Gemini vs Claude 效能

### 階段 3: 環境切換（30 分鐘）
1. ✅ 建立管理介面選擇 AI 提供商
2. ✅ 支援動態切換（Gemini ↔ Claude）
3. ✅ 測試降級機制（Gemini 失敗 → Claude 備援）

### 階段 4: 進階協作（選配，2-3 小時）
1. ⏳ 實作 `AIOrchestrator` 協作編排
2. ⏳ 整合 MCP (如果 openclaw.ai 支援)
3. ⏳ 建立任務分配邏輯
4. ⏳ 效能監控與日誌

---

## 📊 預期效益

### 技術層面
- ✅ 多 AI 提供商冗餘（降低單點故障）
- ✅ 根據任務特性選擇最佳 AI
- ✅ 成本優化（Claude 較便宜的情境使用 Claude）

### 開發效率
- 🤖 **GitHub Copilot**: IDE 即時補全、重構建議
- 🧠 **Openclaw.ai/Claude**: 複雜任務規劃、程式碼審查、架構設計

### 工作流範例

```
使用者需求：「實作搜尋建議 UI」
    │
    ├─→ GitHub Copilot (IDE)
    │    ├─ 提供即時程式碼補全
    │    ├─ 生成組件模板
    │    └─ 內聯文件生成
    │
    └─→ Openclaw.ai (Claude)
         ├─ 規劃組件架構
         ├─ 生成完整實作
         ├─ 提供測試案例
         └─ 審查最終程式碼
```

---

## 🔍 待確認資訊

為了完成整合，需要確認：

1. **Openclaw.ai API 文件**
   - [ ] 端點 URL 格式
   - [ ] 認證方式（API Key / OAuth）
   - [ ] 支援的模型列表
   - [ ] 速率限制與定價

2. **功能支援**
   - [ ] 圖片辨識（Vision API）
   - [ ] JSON 格式輸出
   - [ ] 串流回應
   - [ ] 函數呼叫（Function Calling）

3. **MCP 支援**
   - [ ] 是否支援 Model Context Protocol
   - [ ] MCP Server 套件名稱
   - [ ] 支援的操作類型

---

## 📝 下一步行動

**立即可執行**（如果有 Claude API Key）:
```bash
# 1. 安裝依賴
npm install @anthropic-ai/sdk

# 2. 設定環境變數
echo "CLAUDE_API_KEY=sk-ant-xxx" >> .env.local

# 3. 建立 Claude Provider
# (使用上方提供的程式碼範本)

# 4. 測試
npm run dev
# 在管理面板切換到 Claude 提供商
```

**需要更多資訊時**:
- 訪問 openclaw.ai 官網查看 API 文件
- 確認是否需要特殊認證或白名單
- 了解與標準 Claude API 的差異

---

**報告完成時間**: 2026-01-30  
**建議優先級**: 🟢 可選（當前 Gemini 運作良好）  
**實施難度**: 🟡 中等（需要 API Key 和文件）
