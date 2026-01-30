#!/bin/bash

# 🐛 Copilot Bug 修正和故障排除系統
# 自動檢測、診斷和修正常見問題

ISSUE_LOG="/tmp/copilot-issues.log"

# 初始化
echo "[$(date)] 🐛 Bug 修正系統啟動" > "$ISSUE_LOG"

# ==================== Bug 檢測函數 ====================

check_build_errors() {
    echo "[$(date)] 🔍 檢查構建錯誤..." >> "$ISSUE_LOG"
    
    # 運行類型檢查
    npx tsc --noEmit 2>/tmp/tsc-errors.log
    if [ $? -ne 0 ]; then
        ERRORS=$(cat /tmp/tsc-errors.log | head -5)
        echo "[$(date)] 🔴 TypeScript 錯誤檢測到:" >> "$ISSUE_LOG"
        echo "$ERRORS" >> "$ISSUE_LOG"
        return 1
    fi
    return 0
}

check_eslint() {
    echo "[$(date)] 🔍 檢查 ESLint..." >> "$ISSUE_LOG"
    
    npm run lint 2>/tmp/lint-errors.log
    if [ $? -ne 0 ]; then
        echo "[$(date)] ⚠️  ESLint 警告/錯誤檢測到" >> "$ISSUE_LOG"
        cat /tmp/lint-errors.log | head -10 >> "$ISSUE_LOG"
        return 1
    fi
    return 0
}

check_dev_server() {
    echo "[$(date)] 🔍 檢查 Dev 伺服器..." >> "$ISSUE_LOG"
    
    if ! curl -s http://localhost:3000 > /dev/null; then
        echo "[$(date)] 🔴 Dev 伺服器無響應" >> "$ISSUE_LOG"
        
        # 嘗試重啟
        pkill -f "next dev"
        sleep 1
        npm run dev > /tmp/dev-server.log 2>&1 &
        sleep 3
        
        if curl -s http://localhost:3000 > /dev/null; then
            echo "[$(date)] ✅ Dev 伺服器已重啟並恢復" >> "$ISSUE_LOG"
            return 0
        else
            echo "[$(date)] 🔴 Dev 伺服器重啟失敗" >> "$ISSUE_LOG"
            return 1
        fi
    fi
    echo "[$(date)] ✅ Dev 伺服器正常" >> "$ISSUE_LOG"
    return 0
}

check_database() {
    echo "[$(date)] 🔍 檢查數據庫連接..." >> "$ISSUE_LOG"
    
    # 嘗試 Prisma 查詢
    npx prisma db push --skip-generate 2>/tmp/db-errors.log
    if [ $? -ne 0 ]; then
        echo "[$(date)] ⚠️  數據庫問題檢測到" >> "$ISSUE_LOG"
        cat /tmp/db-errors.log | head -5 >> "$ISSUE_LOG"
        return 1
    fi
    echo "[$(date)] ✅ 數據庫連接正常" >> "$ISSUE_LOG"
    return 0
}

check_git_conflicts() {
    echo "[$(date)] 🔍 檢查 Git 衝突..." >> "$ISSUE_LOG"
    
    if git status | grep -i "conflict" > /dev/null; then
        echo "[$(date)] 🔴 Git 衝突檢測到" >> "$ISSUE_LOG"
        git status >> "$ISSUE_LOG"
        return 1
    fi
    echo "[$(date)] ✅ 無 Git 衝突" >> "$ISSUE_LOG"
    return 0
}

# ==================== Bug 修正函數 ====================

fix_node_modules() {
    echo "[$(date)] 🔧 修復: 重新安裝 node_modules" >> "$ISSUE_LOG"
    rm -rf node_modules package-lock.json
    npm install >> "$ISSUE_LOG" 2>&1
    echo "[$(date)] ✅ node_modules 已重新安裝" >> "$ISSUE_LOG"
}

fix_prisma() {
    echo "[$(date)] 🔧 修復: 重新生成 Prisma 客戶端" >> "$ISSUE_LOG"
    npx prisma generate >> "$ISSUE_LOG" 2>&1
    npx prisma db push --skip-generate >> "$ISSUE_LOG" 2>&1
    echo "[$(date)] ✅ Prisma 已重新生成" >> "$ISSUE_LOG"
}

fix_build_cache() {
    echo "[$(date)] 🔧 修復: 清除構建緩存" >> "$ISSUE_LOG"
    rm -rf .next .turbo
    echo "[$(date)] ✅ 構建緩存已清除" >> "$ISSUE_LOG"
}

fix_env() {
    echo "[$(date)] 🔧 修復: 檢查環境變數" >> "$ISSUE_LOG"
    if [ ! -f ".env.local" ]; then
        echo "[$(date)] ⚠️  .env.local 不存在，已跳過" >> "$ISSUE_LOG"
    else
        echo "[$(date)] ✅ .env.local 存在" >> "$ISSUE_LOG"
    fi
}

# ==================== 主診斷函數 ====================

diagnose_and_fix() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║          🐛 Copilot Bug 檢測和修正系統                      ║"
    echo "║          $(date '+%Y-%m-%d %H:%M:%S')                          ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    ISSUES_FOUND=0
    
    # 執行所有檢查
    echo "🔍 Step 1: 檢查 TypeScript..."
    if ! check_build_errors; then
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        echo "   ⚠️  TypeScript 有問題"
    fi
    
    echo "🔍 Step 2: 檢查 ESLint..."
    if ! check_eslint; then
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        echo "   ⚠️  ESLint 有問題"
    fi
    
    echo "🔍 Step 3: 檢查 Dev 伺服器..."
    if ! check_dev_server; then
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        echo "   🔴 Dev 伺服器有問題"
        echo "   🔧 嘗試修復..."
        fix_build_cache
    fi
    
    echo "🔍 Step 4: 檢查數據庫..."
    if ! check_database; then
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        echo "   ⚠️  數據庫有問題"
        echo "   🔧 嘗試修復..."
        fix_prisma
    fi
    
    echo "🔍 Step 5: 檢查 Git..."
    if ! check_git_conflicts; then
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
        echo "   🔴 Git 有衝突"
    fi
    
    echo ""
    echo "════════════════════════════════════════════════════════════"
    if [ $ISSUES_FOUND -eq 0 ]; then
        echo "✅ 系統健康，無問題檢測到"
    else
        echo "⚠️  檢測到 $ISSUES_FOUND 個問題，部分已自動修復"
        echo "📝 詳細日誌: tail -50 $ISSUE_LOG"
    fi
    echo "════════════════════════════════════════════════════════════"
    echo ""
}

# ==================== 主程序 ====================

case "$1" in
    "check")
        check_build_errors
        check_eslint
        check_dev_server
        check_database
        check_git_conflicts
        ;;
    "fix")
        fix_node_modules
        fix_prisma
        fix_build_cache
        fix_env
        ;;
    "diagnose")
        diagnose_and_fix
        ;;
    *)
        echo "用法: ./copilot-bugfix.sh [check|fix|diagnose]"
        ;;
esac
