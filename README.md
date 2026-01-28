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
* **數據層 (Data Layer)**: PostgreSQL (元數據) + Object Storage (圖片實體)。
* **AI 處理層 (Processing Layer)**: OCR Provider (Azure/Google) + LLM Provider (OpenAI)。

***

## 3. 詳細資料流設計 (Data Pipeline)
這是一個從「圖片」到「知識」的流水線設計。

### 階段一：攝取 (Ingestion)
1. **用戶動作**：在前端拖曳上傳 10 張筆記圖片。
2. **前端處理**：
   * 產生臨時預覽圖 (Thumbnail)。
   * 檢查檔案大小與格式。
3. **後端接收 (Server Action)**：
   * 將圖片上傳至 **Cloudflare R2 (Object Storage)**。
   * 在資料庫 `Note` 表中建立 10 筆記錄，狀態設為 `PENDING`。
   * **觸發事件**：發送 `process.note` 事件至任務隊列 (Inngest/Trigger.dev)。
   * **立即回應**：告知前端「上傳成功，開始處理」，UI 顯示進度條。

### 階段二：處理 (Processing - Background Worker)
此階段在背景執行，用戶無需在此頁面等待。

1. **任務 A：視覺辨識 (OCR)**
   * Worker 監聽到 `process.note`。
   * 呼叫 Azure AI Document Intelligence API。
   * 獲取原始文字 (Raw Text) 與段落座標。
   * *存檔*：更新 DB `raw_ocr_text` 欄位。

2. **任務 B：語意重構 (LLM Refinement)**
   * 將 raw_ocr_text 發送至 **GPT-4o-mini**。
   * **Prompt 指令**：「你是一個筆記整理助手。請修正以下 OCR 文字的錯別字、標點與排版，並輸出為標準 Markdown。請自動偵測內容主題，生成 3 個相關標籤 (Tags)。」
   * *存檔*：更新 DB `refined_content` 與 `tags` 欄位。

3. **狀態更新**：將 DB 狀態更新為 `COMPLETED`。

### 階段三：展示與歸檔 (Presentation)
1. **用戶回訪**：用戶進入 Dashboard。
2. **數據獲取**：Server Component 讀取 DB，顯示已完成的筆記列表。
3. **雙欄校對**：用戶點擊筆記，左側看原圖，右側編輯 Markdown。

***

## 4. 資料庫模型設計 (Schema Design)
使用 Prisma 定義，確保資料關聯性。

```prisma
// 核心模型設計

// 1. 資料夾/專案 (用於分類筆記)
model Collection {
  id          String   @id @default(cuid())
  name        String
  description String?
  userId      String   // 多用戶擴充預留
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  notes       Note[]   // 關聯：一個資料夾有多個筆記
}

// 2. 筆記本體
model Note {
  id             String   @id @default(cuid())

  // 檔案資訊
  imageUrl       String   // R2/S3 的公開 URL
  fileKey        String   // 用於刪除檔案的 Key

  // 處理內容
  rawOcrText     String?  @db.Text  // 原始 OCR 結果 (除錯用)
  refinedContent String?  @db.Text  // AI 修正後的 Markdown (顯示用)
  summary        String?            // AI 自動生成的摘要 (選配)
  tags           String[]           // AI 自動生成的標籤

  // 狀態管理
  status         NoteStatus @default(PENDING)
  errorMessage   String?            // 若失敗，記錄原因

  // 關聯
  collectionId   String?
  collection     Collection? @relation(fields: [collectionId], references: [id])

  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

// 狀態枚舉
enum NoteStatus {
  PENDING     // 等待處理
  PROCESSING  // OCR/AI 運算中
  COMPLETED   // 完成
  FAILED      // 失敗 (如圖片模糊、API 錯誤)
}
```

***

## 5. 功能模組開發清單

### A. 基礎建設 (Infrastructure)
- [ ] **Storage Service**: 封裝上傳/刪除邏輯 (S3 Client)。
- [ ] **DB Service**: Prisma Client 初始化與 CRUD 封裝。
- [ ] **Queue Service**: 設定 Inngest 或 Trigger.dev 的環境變數與 Client。

### B. 核心功能 (Core Features)
- [ ] **Upload Action**: 處理 Multipart/form-data，驗證檔案，寫入 DB。
- [ ] **OCR Worker**: 串接 Azure/Google Vision API，處理 Retry 機制。
- [ ] **AI Worker**: 串接 OpenAI API，編寫 System Prompt (提示詞工程)。

### C. 前端介面 (UI Components)
- [ ] **CollectionSidebar**: 側邊欄導航 (Server Component)。
- [ ] **UploadZone**: 支援拖曳、預覽、進度顯示的 Client Component。
- [ ] **NoteListTable**: 支援搜尋、篩選狀態的資料表格。
- [ ] **SplitEditor**: 左圖右文的編輯器 (推薦使用 `@mdxeditor/editor` 或 tiptap)。

***

## 6. 開發流程建議 (Roadmap)
1. **Phase 1: 骨架搭建**
   * 完成 Prisma Schema 定義。
   * 實作「圖片上傳至 R2 並寫入 DB」的最小可行性路徑 (MVP)。
2. **Phase 2: 處理核心**
   * 串接 OCR API，先在 Server Action 中同步執行 (測試用)。
   * 引入 Queue 機制，將 OCR 轉為異步背景執行。
3. **Phase 3: AI 賦能**
   * 加入 LLM 修正層。
   * 優化 Prompt，確保 Markdown 格式穩定。
4. **Phase 4: 介面完善**
   * 實作 Dashboard 與 SplitEditor。
   * 加入搜尋與分類功能。

這份規劃將複雜的「AI 筆記識別」拆解為可執行的工程步驟，確保你在開發時不會迷失方向。
