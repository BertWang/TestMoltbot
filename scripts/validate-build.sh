#!/bin/bash

# TestMoltbot 自動驗證腳本 - 用於 Clawdbot 開發流程
# 用法: ./scripts/validate-build.sh

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     TestMoltbot 自動驗證系統 - Clawdbot 開發工具           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 統計變量
PASSED=0
FAILED=0
WARNINGS=0

# 測試函數
run_test() {
  local TEST_NAME=$1
  local COMMAND=$2
  
  echo -n "⏳ $TEST_NAME ... "
  
  if eval "$COMMAND" > /tmp/test_output.log 2>&1; then
    echo -e "${GREEN}✅ 通過${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ 失敗${NC}"
    echo "   錯誤詳情:"
    tail -10 /tmp/test_output.log | sed 's/^/   /'
    ((FAILED++))
  fi
}

# 檢查 Git 狀態
echo "${BLUE}[1/5] Git 狀態檢查${NC}"
echo "─────────────────────────────────────────────────────────────"
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "當前分支: $CURRENT_BRANCH"
echo "最新提交: $(git log -1 --oneline)"
echo ""

# Node 環境檢查
echo "${BLUE}[2/5] Node 環境檢查${NC}"
echo "─────────────────────────────────────────────────────────────"
run_test "Node.js 版本" "node --version"
run_test "npm 版本" "npm --version"
run_test "npm 依賴安裝" "npm list next > /dev/null 2>&1"
echo ""

# TypeScript 檢查
echo "${BLUE}[3/5] TypeScript 類型檢查${NC}"
echo "─────────────────────────────────────────────────────────────"
run_test "TypeScript 編譯檢查" "npm run tsc -- --noEmit"
echo ""

# 構建檢查
echo "${BLUE}[4/5] Next.js 構建檢查${NC}"
echo "─────────────────────────────────────────────────────────────"
run_test "生產構建" "npm run build"
echo ""

# ESLint 檢查
echo "${BLUE}[5/5] 代碼風格檢查${NC}"
echo "─────────────────────────────────────────────────────────────"
run_test "ESLint 檢查" "npm run lint"
echo ""

# 總結
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                     驗證結果總結                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}✅ 通過: $PASSED${NC}"
echo -e "${RED}❌ 失敗: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 所有檢查通過！代碼準備就緒。${NC}"
  echo ""
  echo "後續步驟:"
  echo "1. 推送分支: git push origin $CURRENT_BRANCH"
  echo "2. 創建 PR"
  echo "3. 等待 Copilot 審查"
  exit 0
else
  echo -e "${RED}⚠️  發現 $FAILED 個錯誤，請修復後重新運行。${NC}"
  exit 1
fi
