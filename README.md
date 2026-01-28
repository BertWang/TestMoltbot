# 系統架構設計規劃書 (System Design Document)

這是一份針對 「智慧筆記批次掃描與歸檔系統」 的完整架構與流程設計文件。這份規劃書將作為開發前的藍圖，確保前後端邏輯清晰且具備擴充性。

## 1. 系統核心目標
構建一個基於 Next.js App Router 的全端應用，解決「大量紙本/手寫筆記數位化」的痛點。

核心價值在於：
1. **批次處理**：一次上傳多張圖片，後台自動排隊處理，不阻塞介面。
2. **雙重轉譯**：結合 **OCR (視覺識別) 與 LLM (語意修正)**，將破碎的辨識文字轉化為可閱讀的 Markdown 筆記。
3. **結構化歸檔**：將圖片與轉譯後的文案自動整合至目錄結構，形成個人知識庫。

***

## 2. 系統架構圖 (System Architecture)
我們採用 **事件驅動 (Event-Driven)** 架構來處理耗時的 OCR 任務，避免 Next.js Serverless Function 超時。

### 邏輯分層
* **展示層 (Presentation Layer)**: Next.js (React Server Components + Client Components)。
* **服務層 (Service Layer)**: Next.js Server Actions (作為 API Gateway) + 異步任務隊列 (Job Queue)。
* **數據層 (Data Layer)**: PostgreSQL/SQLite (元數據) + Object Storage (圖片實體)。
* **AI 處理層 (Processing Layer)**: OCR Provider (Gemini 2.0 Flash) + LLM Provider (Gemini)。

***

## 3. 詳細資料流設計 (Data Pipeline)
這是一個從「圖片」到「知識」的流水線設計。

### 階段一：攝取 (Ingestion)
1. **用戶動作**：在前端拖曳上傳 10 張筆記圖片。
2. **前端處理**：
   * 產生臨時預覽圖 (Thumbnail)。
   * 檢查檔案大小與格式 (支援 JPG/PNG/PDF)。
3. **後端接收 (Server Action)**：
   * 將圖片上傳至本地或雲端儲存 (`/uploads`)。
   * 在資料庫 `Note` 表中建立記錄，狀態設為 `PENDING`。
   * **觸發事件**：啟動 AI 處理流程。
   * **立即回應**：告知前端「上傳成功，開始處理」，UI 顯示進度條。

### 階段二：處理 (Processing - AI Pipeline)
1. **任務 A：多模態識別 (Gemini 2.0 Flash)**
   * 輸入圖片與 Prompt。
   * 執行 OCR (文字辨識) + 語意修正 (Markdown 格式化) + 自動摘要 + 標籤生成。
   * 產出 JSON 格式結果。

2. **任務 B：資料清洗與儲存**
   * 解析 JSON，寫入 `Note` 資料表的 `rawOcrText` (原始), `refinedContent` (修正後), `tags`, `summary` 欄位。
   * 計算 `confidence` 信心分數。
   * 狀態更新為 `COMPLETED`。

### 階段三：展示與歸檔 (Presentation)
1. **用戶回訪**：用戶進入 Dashboard。
2. **數據獲取**：Server Component 讀取 DB，顯示已完成的筆記列表。
3. **雙欄校對 (Split Editor)**：用戶點擊筆記，左側看原圖 (支援縮放)，右側編輯 Markdown (支援即時預覽)。

***

## 4. 資料庫模型設計 (Schema Design)
使用 Prisma 定義，確保資料關聯性。

*(參考 `prisma/schema.prisma` 實作檔案)*

***

## 5. 前端設計規範 (Design System: Digital Zen)
結合「frontend-design」與「ui-ux-pro-max」技能，採用 "Digital Zen" 設計語言。

* **核心風格 (Tone)**: **Organic & Refined (有機與精緻)**。結合傳統紙張的質感與現代科技的俐落。
* **色彩系統 (Colors)**: 
    * `Stone`: 暖灰基底，減少視覺疲勞。
    * `Paper White`: 內容區塊背景。
    * `Ink Black`: 文字主要顏色。
    * `Accent`: 來自 "AI" 的螢光提示色 (用於標籤或狀態)。
* **排版 (Typography)**: 
    * 標題：襯線體 (Serif) - 營造閱讀筆記的經典感。
    * 內文：無襯線體 (Sans) - 確保數位閱讀的清晰度。
* **佈局 (Layout)**: 
    * **AppSidebar**: 全局左側導航。
    * **Split View**: 核心編輯體驗，左圖右文。

***

## 6. 功能模組開發清單與狀態

### A. 基礎建設 (Infrastructure)
- [x] **Project Init**: Next.js 15, TypeScript, Tailwind v4。
- [x] **DB Service**: Prisma + SQLite 初始化完成。
- [x] **AI Core**: Google Gemini 2.0 Flash 串接完成 (`src/lib/gemini.ts`)。
- [x] **Testing**: End-to-End 流程測試通過 (`scripts/test-pipeline.ts`)。

### B. 核心功能 (Core Features)
- [ ] **Upload Action**: 處理圖片上傳與資料庫寫入。
- [ ] **AI Integration**: 將測試過的 AI 腳本整合進 Next.js API Route。
- [ ] **Calibration Mode**: 實作「原文對照」與「手動校正」功能。

### C. 前端介面 (UI Components)
- [x] **UI Lib**: shadcn/ui 安裝完成 (Sidebar, Button, Input, etc.)。
- [ ] **AppLayout**: 實作數位禪意風格的主佈局。
- [ ] **UploadZone**: 支援拖曳、預覽的互動區塊。
- [ ] **Dashboard**: 筆記列表與狀態管理。
- [ ] **SplitEditor**: 雙欄校對編輯器。

***

## 7. 開發流程建議 (Roadmap)
1. **Phase 1: 骨架搭建 (已完成)**
   * 專案初始化、DB 建置、AI 核心測試。
2. **Phase 2: 前端實作 (進行中)**
   * 實作 AppSidebar, Dashboard, UploadZone。
   * 確認 UI 風格符合 "Digital Zen"。
3. **Phase 3: 整合與互動**
   * 串接前端上傳至後端 AI 處理。
   * 實作即時狀態更新。
4. **Phase 4: 優化與完善**
   * 引入校對模式 (Calibration)。
   * 增加搜尋、分類、標籤管理。

這份規劃書將隨著開發進度持續更新，作為專案進化的依據。
