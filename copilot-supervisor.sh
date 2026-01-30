#!/bin/bash

# 🔍 Copilot 實時監督和 Bug 修正系統
# 持續監控: Git 變化 + 構建狀態 + Dev 伺服器 + Clawdbot 進度

LOG_FILE="/tmp/copilot-supervision.log"
GIT_LOG="/tmp/git-checkpoint.log"
BUILD_LOG="/tmp/build-checkpoint.log"

# 初始化日誌
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔍 Copilot 監督系統啟動" > "$LOG_FILE"
git log --oneline -1 > "$GIT_LOG"
echo "last-build: $(date +%s)" > "$BUILD_LOG"

# 持續監控函數
monitor_continuous() {
    while true; do
        TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
        
        # 1️⃣  檢查 Git 新變化
        CURRENT_HEAD=$(git log --oneline -1 2>/dev/null)
        LAST_HEAD=$(cat "$GIT_LOG" 2>/dev/null)
        
        if [ "$CURRENT_HEAD" != "$LAST_HEAD" ]; then
            echo "[$TIMESTAMP] 🔄 檢測到新提交: $CURRENT_HEAD" >> "$LOG_FILE"
            echo "$CURRENT_HEAD" > "$GIT_LOG"
            
            # 自動構建和測試
            echo "[$TIMESTAMP] 🔨 觸發構建檢查..." >> "$LOG_FILE"
            npm run build >> "$LOG_FILE" 2>&1
            BUILD_RESULT=$?
            
            if [ $BUILD_RESULT -eq 0 ]; then
                echo "[$TIMESTAMP] ✅ 構建成功" >> "$LOG_FILE"
            else
                echo "[$TIMESTAMP] 🔴 構建失敗! 代碼: $BUILD_RESULT" >> "$LOG_FILE"
            fi
        fi
        
        # 2️⃣  檢查 Dev 伺服器
        if ! pgrep -f "next dev" > /dev/null; then
            echo "[$TIMESTAMP] ⚠️  Dev 伺服器已停止，重新啟動..." >> "$LOG_FILE"
            npm run dev > /tmp/dev-server.log 2>&1 &
        fi
        
        # 3️⃣  檢查 Clawdbot 進程
        if ! pgrep -f "clawdbot" > /dev/null; then
            echo "[$TIMESTAMP] ⚠️  Clawdbot 進程停止" >> "$LOG_FILE"
        fi
        
        # 4️⃣  檢查日誌中的錯誤
        if tail -50 /tmp/dev-server.log 2>/dev/null | grep -i "error" > /dev/null; then
            echo "[$TIMESTAMP] 🐛 檢測到錯誤，需要調查" >> "$LOG_FILE"
        fi
        
        # 等待 30 秒後再檢查
        sleep 30
    done
}

# 如果參數是 "start"，啟動監督
if [ "$1" = "start" ]; then
    monitor_continuous &
    MONITOR_PID=$!
    echo "✅ 監督系統已啟動 (PID: $MONITOR_PID)"
    echo "$MONITOR_PID" > /tmp/copilot-monitor.pid
fi
