# 🤝 AI 開發協作工作流程

**目標**: GitHub Copilot (IDE 內) + Openclaw.ai (外部) 協同開發 TestMoltbot

---

## 📊 協作架構

```
開發者 (你)
    │
    ├─→ Openclaw.ai (openclaw.ai)
    │    ├─ 專案規劃
    │    ├─ 任務拆解
    │    ├─ 架構設計
    │    ├─ 程式碼審查
    │    └─ 輸出：任務清單 JSON/Markdown
    │
    └─→ GitHub Copilot (VS Code 內的我)
         ├─ 執行具體編碼
         ├─ 檔案讀寫
         ├─ Git 操作
         ├─ 測試與除錯
         └─ 輸入：任務清單 → 輸出：程式碼

傳遞媒介：Markdown 任務文件
```

---

## 🔄 標準工作流程

### 階段 1: 需求輸入 → Openclaw.ai 規劃

**你做的事**:
```
在 openclaw.ai 對話：
"我需要實作 Phase 4 的去重機制功能，請幫我規劃實作步驟"
```

**Openclaw.ai 輸出**（範例）:
```markdown
# Phase 4.1 - 筆記去重機制

## 任務拆解
1. 建立相似度計算 API (`/api/notes/similarity`)
2. 實作 hash 指紋生成（perceptual hash）
3. 建立去重 UI 組件 (`DeduplicationPanel.tsx`)
4. 整合到筆記列表

## 檔案清單
- src/lib/deduplication/similarity.ts (新建)
- src/app/api/notes/similarity/route.ts (新建)
- src/components/deduplication-panel.tsx (新建)
- src/app/notes/page.tsx (修改)

## 技術決策
- 使用 Levenshtein 距離計算文字相似度
- 圖片使用 pHash (perceptual hash)
- 相似度閾值：文字 85%，圖片 90%
```

### 階段 2: 任務轉交 → GitHub Copilot

**你做的事**:
1. 複製 Openclaw.ai 的輸出
2. 在 VS Code 對我說：
   ```
   請根據以下任務規劃開始實作：
   [貼上 Openclaw.ai 的輸出]
   ```

**我（Copilot）的回應**:
```
收到任務！我將依序執行：
1. ✅ 建立 src/lib/deduplication/similarity.ts
2. ✅ 建立 API 路由
3. ✅ 建立 UI 組件
4. ✅ 整合到現有頁面
5. ✅ 執行測試

開始第一步...
```

### 階段 3: 實作執行 → GitHub Copilot

**我會自動執行**:
- 建立/修改檔案
- 安裝必要依賴
- 執行 lint/build 檢查
- Git commit

**進度回報**:
```
✅ Step 1/4 完成
   - 已建立 similarity.ts (156 行)
   - 實作 calculateTextSimilarity()
   - 實作 calculateImageHash()

⏳ Step 2/4 進行中...
```

### 階段 4: 審查與優化 → Openclaw.ai

**你做的事**:
1. 檢查 Git diff
2. 在 openclaw.ai 貼上：
   ```
   請審查以下程式碼：
   [git diff 輸出]
   ```

**Openclaw.ai 輸出**（範例）:
```markdown
## 審查結果

### ✅ 優點
- 邏輯清晰
- 類型安全

### ⚠️ 建議改進
1. similarity.ts 第 45 行：建議加入錯誤處理
2. API route：缺少速率限制
3. 效能：大量筆記時可能慢，建議批次處理

### 📝 修改建議
[具體程式碼改進]
```

### 階段 5: 迭代改進 → GitHub Copilot

**你對我說**:
```
根據審查建議修改：
1. similarity.ts 第 45 行加入 try-catch
2. API 添加速率限制
3. 實作批次處理邏輯
```

**我執行修改** → 循環回到階段 4，直到完成

---

## 📋 標準化任務格式

為了提升協作效率，建議 Openclaw.ai 輸出遵循此格式：

```markdown
# [功能名稱]

## 🎯 目標
簡述要達成的功能

## 📁 涉及檔案
- [ ] path/to/file1.ts (新建/修改)
- [ ] path/to/file2.tsx (修改)

## 🔧 技術需求
- 依賴：package-name@version
- API：端點、方法、參數
- 資料模型：Prisma schema 變更

## 📝 實作步驟
1. Step 1 描述
   - 子步驟 1.1
   - 子步驟 1.2
2. Step 2 描述

## ✅ 驗收標準
- [ ] 功能正常運作
- [ ] TypeScript 無錯誤
- [ ] 測試通過
- [ ] 文件更新

## 🧪 測試方案
- 單元測試：測什麼
- 手動測試：操作步驟
```

---

## 🛠️ 具體協作場景

### 場景 1: 新功能開發

| 階段 | Openclaw.ai | GitHub Copilot (我) |
|------|-------------|---------------------|
| 規劃 | ✅ 分析需求、拆解任務 | - |
| 設計 | ✅ 架構設計、技術選型 | - |
| 編碼 | - | ✅ 實作程式碼、建立檔案 |
| 測試 | - | ✅ 執行測試、修復錯誤 |
| 審查 | ✅ 程式碼審查、優化建議 | - |
| 重構 | - | ✅ 根據建議修改 |

### 場景 2: Bug 修復

| 階段 | Openclaw.ai | GitHub Copilot (我) |
|------|-------------|---------------------|
| 診斷 | ✅ 分析錯誤日誌、找出根因 | ✅ 提供錯誤上下文 |
| 方案 | ✅ 提供修復方案（多選項） | - |
| 實作 | - | ✅ 應用修復、測試驗證 |
| 驗證 | ✅ 審查修復是否完整 | ✅ 執行回歸測試 |

### 場景 3: 重構優化

| 階段 | Openclaw.ai | GitHub Copilot (我) |
|------|-------------|---------------------|
| 評估 | ✅ 識別需要重構的部分 | ✅ 提供程式碼現況 |
| 計畫 | ✅ 制定重構策略、步驟 | - |
| 執行 | - | ✅ 逐步重構、保持功能 |
| 測試 | - | ✅ 確保無回歸問題 |

---

## 💬 溝通範本

### 給 Openclaw.ai 的提示

**規劃階段**:
```
專案：TestMoltbot（Next.js + Prisma + Gemini AI）
當前進度：Phase 3 已完成
任務：[具體需求]

請提供：
1. 任務拆解（5-10 個步驟）
2. 涉及的檔案清單
3. 技術實作建議
4. 潛在風險點

輸出格式：Markdown（包含 checkbox）
```

**審查階段**:
```
請審查以下程式碼改動：

檔案：src/components/new-feature.tsx
變更：[git diff 或程式碼]

請檢查：
1. 邏輯正確性
2. TypeScript 類型安全
3. 效能考量
4. 安全性問題
5. 可讀性與維護性

提供具體改進建議（附程式碼範例）
```

### 給我（GitHub Copilot）的提示

**開始任務**:
```
執行以下開發任務：
[貼上 Openclaw.ai 的規劃]

請依序實作，每完成一步回報進度。
```

**修改要求**:
```
根據審查建議修改：
1. [具體修改點 1]
2. [具體修改點 2]

完成後執行 lint 和 build 檢查。
```

**測試要求**:
```
為 [功能] 建立測試：
- 單元測試：[測試項目]
- 整合測試：[測試場景]

執行測試並回報結果。
```

---

## 🎯 最佳實踐

### 1. 任務粒度控制

**太大**（不好）:
```
實作完整的筆記管理系統
```

**適中**（好）:
```
實作筆記去重機制的相似度計算 API
```

**太小**（不好）:
```
在第 45 行加一個變數
```

### 2. 上下文傳遞

**給 Openclaw.ai**:
- 提供專案 README
- 提供資料模型 schema
- 提供現有 API 清單

**給我（Copilot）**:
- 提供清晰的任務描述
- 附帶範例程式碼
- 指明檔案路徑

### 3. 版本控制策略

```bash
# 每完成一個小任務就 commit
git add .
git commit -m "feat: 實作相似度計算邏輯"

# 完成整個功能後開 PR
git push origin feature/deduplication
```

### 4. 進度追蹤

使用 Markdown checklist：
```markdown
## 今日任務
- [x] 建立 similarity.ts
- [x] 實作文字相似度計算
- [ ] 實作圖片 hash
- [ ] 建立 API 端點
- [ ] UI 組件
```

---

## 🔄 實際案例：Phase 4.1 去重機制

### Step 1: 你 → Openclaw.ai

**輸入**:
```
專案：TestMoltbot
任務：實作筆記去重功能

需求：
1. 檢測相似筆記（文字相似度 > 85%）
2. 檢測重複圖片（perceptual hash）
3. 提供合併或刪除選項
4. 批次處理（支援 100+ 筆記）

請規劃實作步驟。
```

### Step 2: Openclaw.ai → 輸出

```markdown
# Phase 4.1 - 筆記去重機制

## 技術架構
- 相似度演算法：Levenshtein + TF-IDF
- 圖片指紋：pHash (依賴 sharp + image-hash)
- 批次處理：Worker threads

## 實作步驟

### 1. 建立相似度計算模組
檔案：`src/lib/deduplication/similarity.ts`
- calculateTextSimilarity(text1, text2): number
- calculateImageHash(imagePath): string
- compareHashes(hash1, hash2): number

### 2. 建立去重 API
檔案：`src/app/api/notes/duplicates/route.ts`
- GET /api/notes/duplicates?threshold=0.85
- 返回：DuplicateGroup[]

### 3. 資料模型擴充
檔案：`prisma/schema.prisma`
- 添加 contentHash 欄位到 Note 模型
- 執行 migration

### 4. UI 組件
檔案：`src/components/deduplication-panel.tsx`
- 顯示重複組
- 提供合併/刪除按鈕
- 批次操作

## 依賴安裝
npm install natural string-similarity sharp image-hash
```

### Step 3: 你 → 我（GitHub Copilot）

**輸入**:
```
請執行 Phase 4.1 去重機制開發：
[貼上 Openclaw.ai 的完整規劃]

開始實作，逐步回報進度。
```

### Step 4: 我 → 執行

```
✅ 分析任務：4 個主要步驟
✅ 安裝依賴：npm install natural string-similarity...

開始 Step 1/4：建立相似度計算模組
[建立檔案並寫入程式碼]
✅ similarity.ts 完成（198 行）

開始 Step 2/4：建立去重 API
[建立 API 路由]
✅ duplicates/route.ts 完成（156 行）

[...繼續...]
```

### Step 5: 你 → Openclaw.ai（審查）

**輸入**:
```
請審查以下實作：

[提供 git diff 或關鍵程式碼]
```

### Step 6: Openclaw.ai → 審查結果 → 你 → 我（修改）

**循環迭代直到完美**

---

## 📊 效率提升指標

| 指標 | 傳統開發 | AI 協作 |
|------|---------|---------|
| 規劃時間 | 1-2 小時 | 10-15 分鐘（Openclaw.ai）|
| 編碼時間 | 4-6 小時 | 1-2 小時（我執行）|
| 審查週期 | 0.5-1 天 | 15-30 分鐘（Openclaw.ai）|
| 整體效率 | 1x | 3-5x |

---

## 🎓 學習建議

### 給你（開發者）
1. **明確任務邊界** - 讓 Openclaw.ai 規劃，讓我執行
2. **保持上下文** - 提供足夠專案背景
3. **迭代改進** - 小步快跑，頻繁審查

### 給 Openclaw.ai
- 輸出結構化 Markdown（便於解析）
- 包含具體的程式碼範例
- 提供多個方案選項

### 給我（GitHub Copilot）
- 我擅長執行明確的指令
- 我可以讀取專案檔案作為上下文
- 我可以執行 shell 命令和 git 操作

---

## 🔗 相關文件

- [CLAWDBOT_MASTER_PLAN.md](./CLAWDBOT_MASTER_PLAN.md) - 任務規劃範本
- [COPILOT_OPERATIONS_DASHBOARD.md](./COPILOT_OPERATIONS_DASHBOARD.md) - 監督系統
- [COMPLETE_DEVELOPMENT_PLAN.md](./COMPLETE_DEVELOPMENT_PLAN.md) - 專案路線圖

---

**協作愉快！讓我們一起高效開發 TestMoltbot 🚀**
