# AI 協作交流目錄

此目錄用於 Clawdbot 和 GitHub Copilot 之間的任務交流。

## 檔案規範

### 1. `task-from-clawdbot.md`
**用途**: Clawdbot 輸出任務規劃  
**格式**: Markdown with checklist  
**由誰寫入**: Clawdbot（或你手動）

### 2. `copilot-progress.md`
**用途**: GitHub Copilot 報告執行進度  
**格式**: Markdown with status  
**由誰寫入**: GitHub Copilot（我）

### 3. `review-from-clawdbot.md`
**用途**: Clawdbot 的審查意見  
**格式**: Markdown with suggestions  
**由誰寫入**: Clawdbot（或你手動）

### 4. `current-task.json`
**用途**: 當前任務的結構化資料  
**格式**: JSON  
**結構**:
```json
{
  "taskId": "phase-4-deduplication",
  "status": "in-progress",
  "assignedTo": "copilot",
  "createdBy": "clawdbot",
  "steps": [
    {
      "id": 1,
      "description": "建立相似度計算模組",
      "status": "completed",
      "files": ["src/lib/deduplication/similarity.ts"]
    },
    {
      "id": 2,
      "description": "建立 API 端點",
      "status": "in-progress",
      "files": ["src/app/api/notes/duplicates/route.ts"]
    }
  ],
  "lastUpdate": "2026-01-30T12:00:00Z"
}
```

## 工作流程

```
1. Clawdbot 規劃
   → 寫入 task-from-clawdbot.md
   → 更新 current-task.json (status: pending)

2. 你通知 Copilot
   → "執行 .ai-collaboration/task-from-clawdbot.md"

3. Copilot 執行
   → 讀取任務
   → 執行編碼
   → 更新 copilot-progress.md
   → 更新 current-task.json (status: in-progress/completed)

4. 你請求 Clawdbot 審查
   → clawdbot agent --message "審查 .ai-collaboration/copilot-progress.md"
   → Clawdbot 寫入 review-from-clawdbot.md

5. 你通知 Copilot 修改
   → "根據 review-from-clawdbot.md 進行修改"

6. 循環 3-5 直到完成
```

## Clawdbot 指令範例

```bash
# 規劃任務
clawdbot agent --message "規劃 TestMoltbot Phase 4 去重功能，輸出 Markdown 格式" > .ai-collaboration/task-from-clawdbot.md

# 審查程式碼
clawdbot agent --message "審查以下進度報告：$(cat .ai-collaboration/copilot-progress.md)" > .ai-collaboration/review-from-clawdbot.md

# 提供建議
clawdbot agent --message "根據 git diff 提供優化建議：$(git diff HEAD~1)" > .ai-collaboration/review-from-clawdbot.md
```

## GitHub Copilot 指令範例

```
# 執行任務
"執行 .ai-collaboration/task-from-clawdbot.md 中的任務，完成後更新進度報告"

# 根據審查修改
"根據 .ai-collaboration/review-from-clawdbot.md 的建議進行修改"

# 報告狀態
"更新 copilot-progress.md，報告當前進度"
```

## 目錄結構

```
.ai-collaboration/
├── README.md                    (本檔案)
├── task-from-clawdbot.md       (Clawdbot → Copilot)
├── copilot-progress.md         (Copilot → Clawdbot)
├── review-from-clawdbot.md     (Clawdbot → Copilot)
├── current-task.json           (狀態追蹤)
└── archive/                    (已完成任務)
    ├── 2026-01-30-phase4-task1.md
    └── ...
```
