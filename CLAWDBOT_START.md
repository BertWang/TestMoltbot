# 🤖 Clawdbot 初始化工作指令

**發送時間**: 2025-01-30 04:20 UTC  
**優先級**: 🔴 立即執行  
**目標**: Phase 2.1 - 搜尋建議 UI 實現

---

## ⚡ 快速開始 (Copy & Paste)

```bash
# 1. 進入項目
cd /workspaces/TestMoltbot

# 2. 確認構建正常
npm run build

# 3. 簽出新分支
git checkout -b feature/search-suggestions-ui

# 4. 開始開發
# [參考 CLAWDBOT_TASKS.md Phase 2.1 部分]

# 5. 完成後驗證
./scripts/validate-build.sh

# 6. 推送並創建 PR
git push origin feature/search-suggestions-ui
```

---

## 📖 工作文檔速查

| 需要 | 查看文檔 | 位置 |
|------|----------|------|
| 📋 詳細任務說明 | CLAWDBOT_TASKS.md | Phase 2.1 |
| 📊 實時監控狀態 | CLAWDBOT_MONITORING.md | 全文 |
| 🔧 系統配置 | AI_MODULE_MCP_CONFIGURATION.md | 全文 |
| 📚 開發計劃 | COMPLETE_DEVELOPMENT_PLAN.md | 全文 |
| 📝 API 文檔 | src/app/api/search/suggestions/route.ts | 代碼 |

---

## 🎯 Phase 2.1 核心任務

### 任務 1: 創建 SearchSuggestions 組件

**文件**: `src/components/search-suggestions.tsx`

**需要實現**:
```typescript
// 1. Suggestion 接口
interface Suggestion {
  type: 'note' | 'tag' | 'quick-search';
  id: string;
  title: string;
  subtitle?: string;
}

// 2. 組件結構
export function SearchSuggestions(props: Props) {
  // 分組渲染 (notes, tags, quick-searches)
  // 鍵盤導航 (↑↓ Enter Escape)
  // Framer Motion 動畫
}
```

**參考**: CLAWDBOT_TASKS.md - 有完整代碼示例

---

### 任務 2: 更新 SearchBar 組件

**文件**: `src/components/search-bar.tsx`

**需要添加**:
- 建議狀態管理 (useState)
- 防抖邏輯 (300ms 延遲)
- API 調用邏輯
- 鍵盤事件處理
- SearchSuggestions 組件集成

**參考**: CLAWDBOT_TASKS.md - 有完整代碼示例

---

## ✅ 驗收標準

完成後檢查清單:

- [ ] 組件類型正確 (TypeScript)
- [ ] 鍵盤導航工作 (↑↓ Enter Escape)
- [ ] 防抖有效 (API 調用適當減少)
- [ ] 3 種建議類型顯示
- [ ] 選擇建議後搜尋執行
- [ ] 無構建錯誤
- [ ] 無 ESLint 警告
- [ ] 響應式設計測試通過

---

## 🔍 測試流程

```bash
# 1. 本地構建測試
npm run build

# 2. 類型檢查
npm run tsc --noEmit

# 3. 風格檢查
npm run lint

# 4. 開發服務器測試
npm run dev
# 訪問 http://localhost:3001/notes
# 在搜尋欄輸入 2+ 字符，驗證建議顯示

# 5. 自動驗證
./scripts/validate-build.sh
```

---

## 📡 反饋和支持

### 遇到問題？

1. **檢查文檔**
   - CLAWDBOT_TASKS.md - Phase 2.1
   - AI_MODULE_MCP_CONFIGURATION.md

2. **查看代碼範例**
   - src/app/api/search/suggestions/route.ts (API)
   - src/components/search-bar.tsx (現有實現)

3. **運行驗證**
   ```bash
   ./scripts/validate-build.sh
   ```

4. **檢查 git 日誌**
   ```bash
   git log --oneline -10
   git diff HEAD~1
   ```

---

## 💡 開發建議

### 使用 API 時
```typescript
// API 端點已準備
GET /api/search/suggestions?query={query}

// 響應格式:
{
  "success": true,
  "suggestions": [
    { "type": "note", "id": "...", "title": "..." },
    { "type": "tag", "id": "...", "title": "..." }
  ]
}
```

### 防抖實現
```typescript
import { debounce } from "lodash"; // 或自建

const debouncedSearch = debounce(async (query) => {
  // API 調用
}, 300);
```

### 鍵盤導航模式
```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowUp': // 向上移動
    case 'ArrowDown': // 向下移動
    case 'Enter': // 選擇
    case 'Escape': // 關閉
  }
};
```

---

## 🚀 預期時間表

```
任務 1 (SearchSuggestions):  1-2 小時
任務 2 (SearchBar 集成):     1-2 小時
測試和修復:                  30-60 分鐘
PR 準備:                     15-30 分鐘
────────────────────────────
總計:                        3-5 小時
```

---

## 📊 完成後

### Clawdbot 應該做:
1. ✅ 運行驗證: `./scripts/validate-build.sh`
2. ✅ 提交代碼: `git add -A && git commit`
3. ✅ 推送分支: `git push origin feature/search-suggestions-ui`
4. ✅ 更新監控: 在 CLAWDBOT_MONITORING.md 記錄完成

### Copilot 將進行:
1. 📋 代碼審查
2. 🧪 測試驗證
3. 💬 合併反饋
4. ✅ PR 批准

---

## 🎯 下一步計劃

**Phase 2.1 完成後 →**

- Phase 2.2: 搜尋歷史 UI (2-3 小時)
- Phase 2.3: 保存搜尋 UI (2-3 小時)

**總體進度**:
```
Phase 2:  7-10 小時 (UI 實現)
Phase 3:  6-8 小時  (AI 功能)
Phase 4:  8-10 小時 (部署)
────────────────────
總計:     21-28 小時
```

---

## 💬 溝通約定

- **狀態更新**: 每個 commit 後更新 CLAWDBOT_MONITORING.md
- **錯誤報告**: 遇到構建/類型錯誤時立即報告
- **代碼提交**: 標準 Conventional Commits 格式
- **PR 審查**: 等待 Copilot 反饋

---

**🚀 準備好了嗎？開始吧！**

```bash
cd /workspaces/TestMoltbot
git checkout -b feature/search-suggestions-ui
# 參考 CLAWDBOT_TASKS.md 開始開發
```

**預期完成**: 2025-01-30 08:00-09:00 UTC
