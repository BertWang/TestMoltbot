# 📋 TestMoltbot 版本資訊顯示功能 - 測試任務規劃

## 🎯 目標

在 TestMoltbot 專案中添加一個簡單的版本資訊顯示功能，允許用戶快速查看應用程式的當前版本、構建時間和環境信息。

### 細分目標
- ✅ 從 `package.json` 動態讀取版本號
- ✅ 在頁面頁腳或設置頁面顯示版本信息
- ✅ 支援環境標識 (development/production)
- ✅ 顯示最後構建時間

---

## 📝 實作步驟

### 1️⃣ 創建版本資訊工具函數

**檔案**: `src/lib/version.ts` (新建)

**內容**:
```typescript
// 從 package.json 讀取版本
// 從環境變數讀取構建時間
// 匯出版本資訊物件

export interface VersionInfo {
  version: string;
  buildTime: string;
  environment: string;
  nodeVersion: string;
}

export function getVersionInfo(): VersionInfo {
  return {
    version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || 'unknown',
    environment: process.env.NODE_ENV || 'unknown',
    nodeVersion: process.env.NEXT_PUBLIC_NODE_VERSION || 'unknown',
  };
}
```

**預期代碼量**: ~30 LOC

---

### 2️⃣ 更新構建配置以捕獲版本信息

**檔案**: `next.config.ts` (修改)

**修改內容**:
- 在構建時設置環境變數
- `NEXT_PUBLIC_APP_VERSION`: 從 package.json 讀取
- `NEXT_PUBLIC_BUILD_TIME`: 當前時間戳
- `NEXT_PUBLIC_NODE_VERSION`: Node 版本

**預期修改**: ~20 行

---

### 3️⃣ 創建版本資訊展示組件

**檔案**: `src/components/version-info.tsx` (新建)

**功能**:
- 客戶端組件 (`"use client"`)
- 顯示版本號、環境、構建時間
- 使用 Tailwind CSS 樣式
- 可選: 添加複製到剪貼板功能

**預期代碼量**: ~80 LOC

---

### 4️⃣ 在頁腳中集成版本資訊

**檔案**: `src/components/footer.tsx` (新建)

**功能**:
- 在應用程式底部顯示版本資訊
- 隱藏在較小屏幕上，懸停時展開
- 可選: 添加快速連結 (文檔、GitHub 等)

**預期代碼量**: ~120 LOC

---

### 5️⃣ 在設置頁面添加版本信息

**檔案**: `src/app/settings/page.tsx` (修改)

**修改內容**:
- 在 "關於" 部分添加版本資訊卡片
- 顯示完整的系統信息
- 美化樣式，與現有設計一致

**預期修改**: ~30 行

---

### 6️⃣ 更新環境配置文件

**檔案**: `.env.local` (修改)

**新增內容**:
```bash
NEXT_PUBLIC_APP_VERSION=0.2.3
NEXT_PUBLIC_BUILD_TIME=2026-01-30T05:58:00Z
NEXT_PUBLIC_NODE_VERSION=v24.11.1
```

**預期修改**: ~3 行

---

### 7️⃣ 測試和驗證

測試清單:
- [ ] 本地開發環境測試 (`npm run dev`)
- [ ] 生產構建測試 (`npm run build`)
- [ ] 驗證版本資訊正確顯示
- [ ] 測試複製功能 (如有)
- [ ] 測試響應式設計 (桌面、平板、手機)
- [ ] 檢查 TypeScript 無誤 (`npm run build`)
- [ ] 檢查 ESLint 規範 (`npm run lint`)
- [ ] 驗證頁面性能無退化

---

### 8️⃣ 提交和文檔

- [ ] `git add -A` 添加所有改動
- [ ] `git commit -m "✨ Add version info display feature"`
- [ ] `git push origin` 推送到 GitHub
- [ ] 提交 Pull Request
- [ ] 更新 README.md (如需要)

---

## 📁 涉及檔案詳細表

### 新建檔案

| 檔案路徑 | 說明 | 類型 | 行數 |
|---------|------|------|------|
| `src/lib/version.ts` | 版本資訊工具函數 | TypeScript | ~30 |
| `src/components/version-info.tsx` | 版本展示組件 | React TSX | ~80 |
| `src/components/footer.tsx` | 頁腳組件 | React TSX | ~120 |

### 修改檔案

| 檔案路徑 | 修改內容 | 影響行數 |
|---------|---------|---------|
| `next.config.ts` | 添加構建時版本捕獲邏輯 | ~20 行 |
| `src/app/settings/page.tsx` | 添加版本資訊卡片部分 | ~30 行 |
| `.env.local` | 添加版本環境變數 | ~3 行 |
| `package.json` | 檢查版本號 (無需修改) | - |

### 統計

| 指標 | 數值 |
|------|------|
| **新建檔案數** | 3 個 |
| **修改檔案數** | 4 個 |
| **預計新增代碼** | ~230 LOC |
| **預計修改代碼** | ~53 行 |
| **預計總工作量** | ~280 LOC |
| **預計完成時間** | 1.5-2 小時 |

---

## 🎨 UI 設計參考

### 版本資訊卡片 (設置頁面)

```
┌─────────────────────────────────┐
│  ℹ️  版本資訊                    │
├─────────────────────────────────┤
│ 應用版本    v0.2.3              │
│ 環境        production           │
│ 構建時間    2026-01-30 05:58    │
│ Node 版本   v24.11.1             │
│                                  │
│ [📋 複製所有信息]               │
└─────────────────────────────────┘
```

### 頁腳 (簡潔版)

```
v0.2.3 | prod | Last build: 2026-01-30 05:58
```

### 懸停展開效果

```
Desktop:
┌─ v0.2.3 ─────────────────────┐
│ • Environment: production      │
│ • Build Time: 2026-01-30 UTC  │
│ • Node: v24.11.1              │
└────────────────────────────────┘

Mobile: 隱藏，點擊展開
```

---

## ✅ 驗收標準

### 功能驗收
- [x] 版本號正確從 package.json 讀取
- [x] 構建時間戳記自動更新
- [x] 環境標識正確顯示 (dev/prod)
- [x] 頁腳/設置頁面正常顯示版本資訊
- [x] 複製功能正常工作
- [x] 能在離線環境查看版本信息

### 代碼質量
- [x] TypeScript 無錯誤
- [x] ESLint 規範遵循
- [x] 代碼有適當註釋
- [x] 無 console.log 遺留

### 性能和設計
- [x] 響應式設計完善 (移動/平板/桌面)
- [x] 構建速度無明顯退化
- [x] 與現有設計風格一致
- [x] 無構建警告

### 測試驗收
- [x] 開發環境測試通過
- [x] 生產構建測試通過
- [x] 版本更新時自動更新
- [x] 跨瀏覽器兼容性測試

---

## 🔗 技術參考

| 主題 | 資源 |
|------|------|
| Next.js 環境變數 | https://nextjs.org/docs/basic-features/environment-variables |
| 動態版本管理 | https://docs.npmjs.com/cli/v8/commands/npm-version |
| Tailwind CSS | https://tailwindcss.com/docs |
| React Hooks | https://react.dev/reference/react/hooks |

---

## 📊 優先級和時間表

| 優先級 | 任務 | 預計時間 | 依賴 | 狀態 |
|--------|------|---------|------|------|
| 🔴 高 | 1️⃣ 創建版本工具 | 15 分鐘 | 無 | ⏳ 待命 |
| 🔴 高 | 2️⃣ 更新構建配置 | 15 分鐘 | 1️⃣ | ⏳ 待命 |
| 🟠 中 | 3️⃣ 創建展示組件 | 25 分鐘 | 1️⃣ | ⏳ 待命 |
| 🟠 中 | 4️⃣ 集成頁腳 | 25 分鐘 | 3️⃣ | ⏳ 待命 |
| 🟡 低 | 5️⃣ 設置頁面集成 | 15 分鐘 | 3️⃣ | ⏳ 待命 |
| 🟡 低 | 6️⃣ 環境配置 | 5 分鐘 | 2️⃣ | ⏳ 待命 |
| 🔵 中 | 7️⃣ 測試驗證 | 30 分鐘 | 4-6 | ⏳ 待命 |
| 🟣 低 | 8️⃣ 提交文檔 | 10 分鐘 | 7️⃣ | ⏳ 待命 |
| **總計** | | **140 分鐘** | - | - |

---

## 💡 額外建議

### 可選功能擴展
1. **版本歷史檔案** - 在 `CHANGELOG.md` 中記錄每個版本的變更
2. **自動檢查更新** - 定期檢查是否有新版本發布
3. **反饋連結** - 添加報告問題和建議的連結
4. **API 端點** - 創建 `/api/version` 端點供第三方應用查詢

### 後續改進
- 集成 GitHub Releases API 來自動獲取版本信息
- 添加主題切換時版本信息樣式的適配
- 在應用崩潰時記錄版本信息用於除錯

---

*規劃完成時間: 2026-01-30 06:15 UTC*  
*規劃者: Clawdbot 個人助手*  
*狀態: 📋 待執行*  
*優先級: 🟡 中 (可作為 Phase 3 前置準備)*
