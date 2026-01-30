# 🚀 Phase 4.4 實施指南

## 快速開始（5 分鐘）

### 1️⃣ 查看新管理面板

```bash
# 啟動開發服務器（如已啟動則跳過）
npm run dev

# 在瀏覽器中訪問
http://localhost:3000/admin-new
```

**你會看到**:
- 📊 概覽標籤：4 個配置卡片 + openclaw.ai 建議
- 🧠 模型標籤：Gemini 3.0/2.5/2.0 版本選擇
- 🔍 OCR 標籤：3 個 OCR 提供商對比
- 📦 MCP 標籤：市場瀏覽和安裝界面

---

## 📋 實施清單

### Step 1: 導航菜單整合（5 分鐘）

編輯 [src/components/app-sidebar.tsx](src/components/app-sidebar.tsx)：

```typescript
// 在主菜單中添加新項目
{
  title: "智能管理",
  url: "/admin-new",
  icon: <Settings className="w-4 h-4" />,
  badge: "新",
  description: "由 openclaw.ai 驅動"
}
```

✅ **完成後**: 側邊欄會顯示"智能管理"菜單項

---

### Step 2: 模型選擇 API 集成（15 分鐘）

已完成！API 位置：[src/app/api/settings/model/route.ts](src/app/api/settings/model/route.ts)

**測試 API**:

```bash
# 獲取可用模型
curl http://localhost:3000/api/settings/model?action=versions

# 選擇模型
curl -X POST http://localhost:3000/api/settings/model \
  -H "Content-Type: application/json" \
  -d '{"action":"select","model":"gemini-2.5-flash"}'

# 更新模型參數
curl -X POST http://localhost:3000/api/settings/model \
  -H "Content-Type: application/json" \
  -d '{
    "action":"update-params",
    "params":{
      "temperature":1.5,
      "topK":50,
      "topP":0.9,
      "maxTokens":10000
    }
  }'
```

✅ **期望結果**: 
- 返回所有 6 個可用模型
- 成功切換到選定模型
- 參數驗證和保存

---

### Step 3: OCR 提供商管理（15 分鐘）

已完成！API 位置：[src/app/api/settings/ocr/route.ts](src/app/api/settings/ocr/route.ts)

**測試 API**:

```bash
# 獲取 OCR 提供商
curl http://localhost:3000/api/settings/ocr?action=providers

# 選擇 OCR 提供商
curl -X POST http://localhost:3000/api/settings/ocr \
  -H "Content-Type: application/json" \
  -d '{
    "action":"select",
    "provider":"mineru"
  }'

# 測試 OCR 配置
curl -X POST http://localhost:3000/api/settings/ocr \
  -H "Content-Type: application/json" \
  -d '{
    "action":"test",
    "provider":"paddle",
    "testFilePath":"public/uploads/sample.png"
  }'
```

✅ **期望結果**:
- 顯示 4 個 OCR 提供商選項
- 保存提供商選擇到 `.ocr-config.json`
- 返回測試結果

---

### Step 4: MCP 市場集成（20 分鐘）

已完成！API 位置：[src/app/api/mcp/marketplace/route.ts](src/app/api/mcp/marketplace/route.ts)

**測試 API**:

```bash
# 瀏覽市場
curl http://localhost:3000/api/mcp/marketplace

# 搜索服務
curl "http://localhost:3000/api/mcp/marketplace?search=notion"

# 按分類篩選
curl "http://localhost:3000/api/mcp/marketplace?category=數據庫"

# 安裝服務
curl -X POST http://localhost:3000/api/mcp/marketplace \
  -H "Content-Type: application/json" \
  -d '{"action":"install","serviceId":"notion-mcp"}'

# 獲取已安裝服務
curl http://localhost:3000/api/mcp/marketplace?action=installed

# 卸載服務
curl -X DELETE http://localhost:3000/api/mcp/marketplace \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"notion-mcp"}'
```

✅ **期望結果**:
- 瀏覽 6 個 MCP 服務
- 搜索和分類篩選工作正常
- 安裝/卸載服務到 `.mcp-installed.json`

---

## 🔌 前端集成（進行中）

### Step 5: 連接 Enhanced Admin Panel 到 API

編輯 [src/components/enhanced-admin-panel.tsx](src/components/enhanced-admin-panel.tsx)：

**添加模型選擇處理**:

```typescript
// 在 EnhancedAdminPanel 組件中添加
const handleModelSelect = async (modelId: string) => {
  try {
    const response = await fetch('/api/settings/model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'select',
        model: modelId
      })
    });
    
    if (response.ok) {
      toast.success(`切換到 ${modelId}`);
      setSelectedModel(modelId);
    }
  } catch (error) {
    console.error('Failed to select model:', error);
  }
};
```

**添加 OCR 選擇處理**:

```typescript
const handleOCRSelect = async (provider: string) => {
  try {
    const response = await fetch('/api/settings/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'select',
        provider: provider
      })
    });
    
    if (response.ok) {
      toast.success(`切換到 ${provider}`);
      setSelectedOCR(provider);
    }
  } catch (error) {
    console.error('Failed to select OCR:', error);
  }
};
```

**添加 MCP 市場加載**:

```typescript
useEffect(() => {
  const loadMCPMarketplace = async () => {
    try {
      const response = await fetch('/api/mcp/marketplace');
      const data = await response.json();
      setMCPItems(data.marketplace);
    } catch (error) {
      console.error('Failed to load MCP marketplace:', error);
    }
  };
  
  loadMCPMarketplace();
}, []);
```

---

## 🧪 測試清單

### 功能測試

- [ ] **模型管理**
  - [ ] 顯示所有 6 個模型版本
  - [ ] 選擇不同模型
  - [ ] 調整模型參數
  - [ ] 參數驗證（溫度範圍 0-2）
  - [ ] 模型持久化存儲

- [ ] **OCR 提供商**
  - [ ] 顯示 4 個提供商卡片
  - [ ] 對比功能工作
  - [ ] 切換提供商
  - [ ] 測試配置功能
  - [ ] 配置文件保存

- [ ] **MCP 市場**
  - [ ] 瀏覽 6 個服務
  - [ ] 搜索功能
  - [ ] 分類篩選
  - [ ] 安裝服務
  - [ ] 卸載服務
  - [ ] 已安裝列表更新

### UI/UX 測試

- [ ] **響應式設計**
  - [ ] 桌面版本 (1920px)
  - [ ] 平板版本 (768px)
  - [ ] 移動版本 (375px)

- [ ] **交互**
  - [ ] 選項卡切換流暢
  - [ ] 按鈕悬停效果
  - [ ] 加載狀態指示
  - [ ] 錯誤提示明確

- [ ] **視覺設計**
  - [ ] 顏色一致性
  - [ ] 排版清晰
  - [ ] 圖標正確
  - [ ] 間距合理

---

## 📊 Phase 4.4 進度

```
┌─────────────────────────────────────────┐
│ Phase 4.4 實施進度 (1-2 週目標)          │
├─────────────────────────────────────────┤
│ 後端 API 實現          ████████████ 100% │
│ UI 組件設計            ████████████ 100% │
│ 集成工作               ████░░░░░░░░  40% │
│ 測試和優化             ░░░░░░░░░░░░   0% │
│ 文檔完成               ████████████ 100% │
├─────────────────────────────────────────┤
│ 總進度                 ████████░░░░  68% │
└─────────────────────────────────────────┘

本週目標:
✅ API 端點完成
✅ UI 組件完成
🔄 集成工作進行中
🔄 測試準備中
```

---

## 🔄 下一步（Phase 4.5 預告）

### 戰略改進（2-3 週）

```markdown
Week 1 (本週末):
- [ ] 完成 Step 5 集成工作
- [ ] 全面測試所有 API
- [ ] UI 優化和 bug 修復
- [ ] 發佈 Phase 4.4 beta

Week 2:
- [ ] 模型參數微調工具完善
- [ ] 配置預設管理
- [ ] API 統計儀表板

Week 3:
- [ ] 全網測試功能
- [ ] Notion 整合完整實現
- [ ] 發佈 Phase 4.5 正式版

預期成果:
✅ 完整的管理儀表板
✅ 模型和提供商完全可配置
✅ MCP 生態完整集成
✅ API 監控和統計
```

---

## 🆘 故障排查

### API 404 錯誤

**問題**: `GET /api/settings/model` 返回 404

**解決方案**:
1. 確認文件位置: `/workspaces/TestMoltbot/src/app/api/settings/model/route.ts`
2. 檢查 Next.js 是否已重新啟動
3. 清除 `.next` 並重新構建: `rm -rf .next && npm run dev`

### 模型參數保存失敗

**問題**: 參數更新後沒有保存

**解決方案**:
1. 檢查 `AdminSettings` 在 Prisma schema 中是否定義
2. 運行遷移: `npx prisma migrate dev`
3. 檢查數據庫文件權限

### MCP 市場搜索不工作

**問題**: 搜索功能無結果

**解決方案**:
1. 檢查搜索字符串是否轉為小寫: `search?.toLowerCase()`
2. 確認市場數據結構正確
3. 檢查瀏覽器控制台錯誤

---

## 📞 需要幫助？

查看這些文檔:
- [BACKEND_OPTIMIZATION_ROADMAP.md](BACKEND_OPTIMIZATION_ROADMAP.md) - 完整的優化路線圖
- [PHASE_4_3_COMPLETION.md](PHASE_4_3_COMPLETION.md) - 前一階段完成報告
- [PROJECT_STATUS.md](PROJECT_STATUS.md) - 項目整體狀態

---

**更新於**: 2025-02-13  
**作者**: openclaw.ai 智能分析系統  
**版本**: Phase 4.4  
**狀態**: 🚀 就緒實施
