"use client";

import {
  Globe,
  PenTool,
  Zap,
  Image,
  Music,
  BarChart3,
  Search,
  Code,
  BookOpen,
  Sparkles,
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

export interface AIFunction {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  category: "content" | "analyze" | "create" | "tools";
}

export const AI_FUNCTIONS: AIFunction[] = [
  {
    id: "translate",
    name: "翻譯",
    icon: <Globe className="w-4 h-4" />,
    description: "翻譯文本到其他語言",
    category: "content",
  },
  {
    id: "rewrite",
    name: "改寫",
    icon: <PenTool className="w-4 h-4" />,
    description: "重寫並改進文本",
    category: "content",
  },
  {
    id: "expand",
    name: "擴展",
    icon: <Sparkles className="w-4 h-4" />,
    description: "擴展內容細節",
    category: "content",
  },
  {
    id: "summarize",
    name: "摘要",
    icon: <BookOpen className="w-4 h-4" />,
    description: "生成內容摘要",
    category: "analyze",
  },
  {
    id: "analyze",
    name: "分析",
    icon: <BarChart3 className="w-4 h-4" />,
    description: "深度分析內容",
    category: "analyze",
  },
  {
    id: "brainstorm",
    name: "腦力激盪",
    icon: <Zap className="w-4 h-4" />,
    description: "產生創意想法",
    category: "create",
  },
  {
    id: "generate-image",
    name: "圖片生成",
    icon: <Image className="w-4 h-4" />,
    description: "根據描述生成圖片",
    category: "create",
  },
  {
    id: "code",
    name: "代碼",
    icon: <Code className="w-4 h-4" />,
    description: "代碼生成與解析",
    category: "tools",
  },
  {
    id: "search",
    name: "搜索",
    icon: <Search className="w-4 h-4" />,
    description: "搜索相關信息",
    category: "tools",
  },
];

interface AIFunctionsMenuProps {
  onSelectFunction: (functionId: string) => void;
  selectedFunction?: string;
  compact?: boolean;
}

export function AIFunctionsMenu({
  onSelectFunction,
  selectedFunction,
  compact = false,
}: AIFunctionsMenuProps) {
  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-stone-600 hover:text-stone-900 h-8 w-8 p-0"
            title="AI 功能"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>AI 功能</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs font-semibold text-stone-500 py-2">
            內容
          </DropdownMenuLabel>
          {AI_FUNCTIONS.filter((f) => f.category === "content").map((func) => (
            <DropdownMenuItem
              key={func.id}
              onClick={() => onSelectFunction(func.id)}
              className={cn(
                "cursor-pointer",
                selectedFunction === func.id && "bg-blue-50"
              )}
            >
              <div className="flex items-center gap-2">
                {func.icon}
                <div className="flex flex-col">
                  <span className="text-sm">{func.name}</span>
                  <span className="text-xs text-stone-500">{func.description}</span>
                </div>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-semibold text-stone-500 py-2">
            分析
          </DropdownMenuLabel>
          {AI_FUNCTIONS.filter((f) => f.category === "analyze").map((func) => (
            <DropdownMenuItem
              key={func.id}
              onClick={() => onSelectFunction(func.id)}
              className={cn(
                "cursor-pointer",
                selectedFunction === func.id && "bg-blue-50"
              )}
            >
              <div className="flex items-center gap-2">
                {func.icon}
                <div className="flex flex-col">
                  <span className="text-sm">{func.name}</span>
                  <span className="text-xs text-stone-500">{func.description}</span>
                </div>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-semibold text-stone-500 py-2">
            工具
          </DropdownMenuLabel>
          {AI_FUNCTIONS.filter((f) => f.category === "tools").map((func) => (
            <DropdownMenuItem
              key={func.id}
              onClick={() => onSelectFunction(func.id)}
              className={cn(
                "cursor-pointer",
                selectedFunction === func.id && "bg-blue-50"
              )}
            >
              <div className="flex items-center gap-2">
                {func.icon}
                <div className="flex flex-col">
                  <span className="text-sm">{func.name}</span>
                  <span className="text-xs text-stone-500">{func.description}</span>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {AI_FUNCTIONS.map((func) => (
        <Button
          key={func.id}
          variant={selectedFunction === func.id ? "default" : "outline"}
          size="sm"
          className={cn(
            "h-auto py-2 px-3 flex flex-col items-center gap-1 text-xs",
            selectedFunction === func.id &&
              "bg-blue-500 text-white hover:bg-blue-600"
          )}
          onClick={() => onSelectFunction(func.id)}
        >
          {func.icon}
          <span className="font-medium">{func.name}</span>
        </Button>
      ))}
    </div>
  );
}
