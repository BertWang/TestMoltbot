# 📋 第 2 階段 - MCP 市場功能詳細規劃

## 🎯 項目概述

**目標**: 實現完整的 MCP (Model Context Protocol) 市場功能
- 瀏覽可用的 MCP 服務
- 安裝和管理 MCP 服務
- 配置已安裝的服務
- 實時健康檢查

**預計耗時**: 5-8 小時
**複雜度**: 🟠 中等 (需要理解 MCP 架構)

---

## 📐 架構設計

### 1. 數據模型

```prisma
// 現有模型 (已在 schema.prisma 中)
model MCPServiceConfig {
  id           String   @id @default(cuid())
  name         String   @unique
  type         String   // openclaw, brave_search, github, slack 等
  enabled      Boolean  @default(false)
  endpoint     String?
  authType     String?  // api_key, oauth, jwt, basic
  credentials  String?  // 加密的認證憑證
  config       String?  // 服務特定配置
  priority     Int      @default(0)
  isRequired   Boolean  @default(false)
  
  // 性能和測試
  lastTestedAt DateTime?
  lastTestStatus String?
  lastTestError  String?
  
  // 元數據
  description  String?
}

// 需要新增的模型
model MCPServiceRegistry {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  description String
  category    String   // search, analysis, integration, automation 等
  type        String   // openclaw, brave, github, slack, notion 等
  version     String
  logo        String?  // URL to icon
  
  // 安裝和使用
  totalInstalls    Int @default(0)
  rating           Float? // 0-5
  reviews          Int @default(0)
  
  // 配置要求
  requiredFields   String? // JSON: {apiKey: true, endpoint: false}
  optionalFields   String? // JSON: {apiKey: false}
  
  // 文檔和資源
  documentation   String?
  homepage        String?
  repositoryUrl   String?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

### 2. API 設計

```
GET  /api/mcp/marketplace         - 獲取所有可用服務
GET  /api/mcp/marketplace/[type]  - 按類別過濾
GET  /api/mcp/installed           - 獲取已安裝服務
POST /api/mcp/install             - 安裝新服務
PUT  /api/mcp/[id]               - 更新服務配置
DELETE /api/mcp/[id]              - 卸載服務
POST /api/mcp/[id]/test           - 測試連接
POST /api/mcp/[id]/health         - 健康檢查
```

### 3. UI 組件

```
/app/mcp-marketplace/
├─ page.tsx                      - 市場主頁
├─ components/
│  ├─ marketplace-browser.tsx    - 服務瀏覽器
│  ├─ service-card.tsx          - 單個服務卡片
│  ├─ service-details.tsx       - 詳情模態框
│  ├─ installed-services.tsx    - 已安裝列表
│  └─ service-config.tsx        - 配置編輯器
```

---

## 📝 實施步驟 (3-4 小時)

### 第 1 步: 數據庫遷移 (30 分鐘)

```bash
# 1. 新增 MCPServiceRegistry 模型到 schema.prisma
# 2. 生成遷移
npx prisma migrate dev --name add_mcp_service_registry

# 3. 初始化服務目錄 (6 個預設服務)
npx ts-node scripts/init-mcp-registry.ts
```

**服務目錄預設內容**:
```json
[
  {
    "name": "openclaw",
    "displayName": "OpenClaw AI 分析",
    "category": "analysis",
    "description": "高級內容分析和深度洞察",
    "requiredFields": {"apiKey": true}
  },
  {
    "name": "brave_search",
    "displayName": "Brave 搜尋",
    "category": "search",
    "description": "實時 Web 搜尋結果"
  },
  {
    "name": "github",
    "displayName": "GitHub 集成",
    "category": "integration",
    "description": "訪問 GitHub repositories 和代碼"
  },
  // ... 更多
]
```

### 第 2 步: API 端點 (1 小時)

**POST /api/mcp/install**
```typescript
// 請求
{
  registryId: string,      // 來自 MCPServiceRegistry
  config: Record<string, any>  // API 金鑰、端點等
}

// 響應
{
  success: boolean,
  serviceId: string,
  config: MCPServiceConfig
}
```

**GET /api/mcp/installed**
```typescript
// 返回已安裝的服務列表，包括健康狀態
[
  {
    id: string,
    name: string,
    enabled: boolean,
    status: "active" | "error" | "unconfigured",
    lastTestedAt: Date,
    lastTestError: string | null
  }
]
```

**POST /api/mcp/[id]/test**
```typescript
// 測試連接，返回健康狀況
{
  healthy: boolean,
  responseTime: number,    // ms
  lastError: string | null,
  message: string
}
```

### 第 3 步: 前端組件 (1.5 小時)

**marketplace-browser.tsx** (400 行)
```tsx
// 功能:
// - 服務網格展示 (3 列響應式)
// - 類別篩選 (Tabs: All, Search, Analysis, Integration)
// - 搜尋功能
// - 排序 (熱度、評分、新增)
// - 安裝按鈕

// 狀態:
// - services: 從 API 獲取
// - filters: 選中的類別
// - searchQuery: 搜尋字符串
// - installedIds: Set<string> 已安裝的ID
```

**service-details.tsx** (300 行)
```tsx
// 功能:
// - 全屏模態框顯示詳情
// - 描述、功能、要求
// - 配置表單 (動態生成)
// - 安裝/卸載按鈕
// - 文檔連結

// 表單生成:
// - 根據 requiredFields / optionalFields 動態創建
// - 密碼字段用於 API 金鑰
// - 端點 URL 字段
```

**installed-services.tsx** (250 行)
```tsx
// 功能:
// - 已安裝服務卡片列表
// - 狀態指示器 (綠色/紅色/灰色)
// - 啟用/禁用開關
// - 編輯配置
// - 測試連接按鈕
// - 卸載按鈕

// 狀態:
// - testingId: 正在測試的服務
// - editingId: 正在編輯的服務
```

### 第 4 步: 集成到設置 (1 小時)

```tsx
// 修改 settings-wizard.tsx
<TabsList className="grid w-full grid-cols-6">
  {/* 現有標籤 ... */}
  <TabsTrigger value="mcp" className="flex items-center gap-2">
    <Zap className="w-4 h-4" />
    <span className="hidden sm:inline">MCP 市場</span>
  </TabsTrigger>
</TabsList>

<TabsContent value="mcp" className="space-y-4">
  <Tabs value={mcpTab} onValueChange={setMcpTab}>
    <TabsList>
      <TabsTrigger value="browser">瀏覽服務</TabsTrigger>
      <TabsTrigger value="installed">已安裝</TabsTrigger>
    </TabsList>
    
    <TabsContent value="browser">
      <MCPMarketplaceBrowser />
    </TabsContent>
    
    <TabsContent value="installed">
      <InstalledServices />
    </TabsContent>
  </Tabs>
</TabsContent>
```

---

## 🔧 文件清單

### 新建文件

1. **prisma/schema.prisma** (新增模型)
   - MCPServiceRegistry

2. **scripts/init-mcp-registry.ts** (100 行)
   - 初始化 6 個 MCP 服務

3. **src/app/api/mcp/route.ts** (200 行)
   - GET /api/mcp/installed
   - POST /api/mcp/install

4. **src/app/api/mcp/[id]/route.ts** (150 行)
   - PUT /api/mcp/[id] (更新配置)
   - DELETE /api/mcp/[id] (卸載)

5. **src/app/api/mcp/[id]/test/route.ts** (80 行)
   - POST /api/mcp/[id]/test (健康檢查)

6. **src/app/api/mcp/marketplace/route.ts** (100 行)
   - GET /api/mcp/marketplace (獲取所有服務)

7. **src/components/mcp-marketplace-browser.tsx** (400 行)
   - 市場瀏覽 UI

8. **src/components/installed-services.tsx** (250 行)
   - 已安裝服務管理

9. **src/components/service-details-modal.tsx** (300 行)
   - 服務詳情和安裝

### 修改文件

1. **src/components/settings-wizard.tsx**
   - 新增 MCP 標籤頁
   - 導入 MCP 組件

2. **prisma/schema.prisma**
   - 新增 MCPServiceRegistry 模型

---

## 📊 預期結果

### 功能檢查表
- ✅ 瀏覽所有 MCP 服務
- ✅ 按類別篩選
- ✅ 搜尋服務
- ✅ 查看服務詳情
- ✅ 安裝新服務
- ✅ 配置已安裝服務
- ✅ 測試連接
- ✅ 卸載服務
- ✅ 禁用/啟用服務

### 用戶體驗流程

```
1. 用戶打開設置 → MCP 市場標籤
   ↓
2. 瀏覽可用服務 (預設 6 個)
   ├─ OpenClaw AI 分析
   ├─ Brave 搜尋
   ├─ GitHub 集成
   └─ ...
   ↓
3. 點擊服務卡片 → 查看詳情
   ├─ 描述和功能
   ├─ 配置要求 (API 金鑰、端點等)
   └─ 安裝按鈕
   ↓
4. 填寫配置並安裝
   ↓
5. 在「已安裝」標籤頁中管理
   ├─ 查看狀態
   ├─ 測試連接
   ├─ 編輯配置
   └─ 卸載
```

---

## ⚠️ 注意事項

### 安全性
- [ ] API 金鑰必須加密存儲
- [ ] 不在日誌中記錄敏感信息
- [ ] 驗證端點 URL (防止 SSRF)

### 性能
- [ ] 健康檢查異步執行（不阻塞 UI）
- [ ] 緩存服務列表（5 分鐘刷新）
- [ ] 分頁加載已安裝服務

### 錯誤處理
- [ ] 連接失敗時提供清晰的錯誤信息
- [ ] 配置驗證 (必填欄位檢查)
- [ ] 網路超時設定 (30 秒)

---

## 🚀 快速開始命令

```bash
# 1. 新增遷移
npx prisma migrate dev --name add_mcp_service_registry

# 2. 初始化服務
npx ts-node scripts/init-mcp-registry.ts

# 3. 驗證編譯
npm run build

# 4. 開始開發
npm run dev

# 5. 測試 API
curl http://localhost:3000/api/mcp/marketplace
curl http://localhost:3000/api/mcp/installed
```

---

## 📈 分解任務

| 任務 | 耗時 | 依賴 | 優先級 |
|------|------|------|--------|
| 數據庫遷移 | 30min | - | 🔴 1 |
| 初始化腳本 | 20min | 遷移 | 🔴 1 |
| API 端點 | 1h | 遷移 | 🔴 1 |
| UI 組件 | 1.5h | API | 🟠 2 |
| 設置集成 | 30min | UI | 🟠 2 |
| 測試驗證 | 1h | 全部 | 🟡 3 |

**總計**: 5-6 小時

---

## ✅ 完成條件

1. ✅ 所有 API 端點實現
2. ✅ TypeScript 編譯無誤
3. ✅ UI 組件可正常顯示
4. ✅ 安裝/卸載功能可用
5. ✅ 健康檢查正常工作
6. ✅ 已集成到設置頁面
7. ✅ 提交到 Git

---

## 📞 技術參考

### MCP 服務類型

```
search      - 搜尋和信息檢索
  ├─ brave_search
  └─ google_search

analysis    - 內容分析和洞察
  ├─ openclaw
  └─ sentiment_analysis

integration - 第三方服務集成
  ├─ github
  ├─ slack
  ├─ notion
  └─ jira

automation  - 工作流自動化
  ├─ zapier
  └─ ifttt
```

### 配置要求示例

```json
{
  "brave_search": {
    "requiredFields": ["apiKey"],
    "optionalFields": ["customEngine"]
  },
  
  "github": {
    "requiredFields": ["token"],
    "optionalFields": ["organizations", "repositories"]
  },
  
  "slack": {
    "requiredFields": ["webhookUrl"],
    "optionalFields": ["channel", "botName"]
  }
}
```

---

**預計完成時間**: 5-8 小時  
**難度級別**: 🟠 中等  
**優先級**: 🔴 高優先  

準備好開始嗎? 🚀

