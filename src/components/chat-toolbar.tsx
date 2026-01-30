"use client";

import {
  Brain,
  Zap,
  Settings,
  Volume2,
  Tag,
  Paperclip,
  Smile,
  ToggleLeft,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ChatToolbarProps {
  onToggleDeepThink?: (enabled: boolean) => void;
  onToggleTTS?: (enabled: boolean) => void;
  onToggleStream?: (enabled: boolean) => void;
  deepThinkEnabled?: boolean;
  ttsEnabled?: boolean;
  streamEnabled?: boolean;
}

export function ChatToolbar({
  onToggleDeepThink,
  onToggleTTS,
  onToggleStream,
  deepThinkEnabled = false,
  ttsEnabled = false,
  streamEnabled = true,
}: ChatToolbarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-stone-200 flex-wrap">
      {/* 主工具 */}
      <div className="flex items-center gap-1 mr-2">
        {/* 深度思考 */}
        <Button
          variant={deepThinkEnabled ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 px-2.5 text-xs gap-1.5",
            deepThinkEnabled && "bg-purple-500 text-white hover:bg-purple-600"
          )}
          onClick={() => onToggleDeepThink?.(!deepThinkEnabled)}
          title="啟用深度思考模式"
        >
          <Brain className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">深度思考</span>
        </Button>

        {/* TTS */}
        <Button
          variant={ttsEnabled ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 px-2.5 text-xs gap-1.5",
            ttsEnabled && "bg-green-500 text-white hover:bg-green-600"
          )}
          onClick={() => onToggleTTS?.(!ttsEnabled)}
          title="啟用文字轉語音"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">語音</span>
        </Button>

        {/* 流式輸出 */}
        <Button
          variant={streamEnabled ? "default" : "ghost"}
          size="sm"
          className={cn(
            "h-8 px-2.5 text-xs gap-1.5",
            streamEnabled && "bg-blue-500 text-white hover:bg-blue-600"
          )}
          onClick={() => onToggleStream?.(!streamEnabled)}
          title="流式顯示 AI 回應"
        >
          <Zap className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">流式</span>
        </Button>
      </div>

      {/* 高級功能 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-stone-600 hover:text-stone-900"
            title="更多選項"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel className="text-xs">輸入選項</DropdownMenuLabel>
          <DropdownMenuItem className="text-xs gap-2">
            <Paperclip className="w-3.5 h-3.5" />
            <span>附加檔案</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-xs gap-2">
            <Smile className="w-3.5 h-3.5" />
            <span>表情符號</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs">標籤</DropdownMenuLabel>
          <DropdownMenuItem className="text-xs gap-2">
            <Tag className="w-3.5 h-3.5" />
            <span>添加標籤</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs">快捷鍵</DropdownMenuLabel>
          <div className="px-2 py-1.5 text-[11px] text-stone-600 space-y-1">
            <p>
              <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-xs">
                Enter
              </kbd>{" "}
              - 發送
            </p>
            <p>
              <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-xs">
                Shift+Enter
              </kbd>{" "}
              - 換行
            </p>
            <p>
              <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-xs">
                Ctrl+/
              </kbd>{" "}
              - 命令
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 設定 */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 text-stone-600 hover:text-stone-900 ml-auto"
        title="設定"
      >
        <Settings className="w-4 h-4" />
      </Button>
    </div>
  );
}
