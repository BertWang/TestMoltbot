"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Zap, CheckCircle, Circle, AlertCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MCPServer {
  id: string;
  name: string;
  description: string;
  status: "connected" | "disconnected" | "error";
  enabled: boolean;
}

const DEFAULT_MCP_SERVERS: MCPServer[] = [
  {
    id: "filesystem",
    name: "文件系統",
    description: "訪問本地文件系統",
    status: "connected",
    enabled: true,
  },
  {
    id: "web",
    name: "網頁瀏覽",
    description: "瀏覽和提取網頁內容",
    status: "connected",
    enabled: false,
  },
  {
    id: "database",
    name: "數據庫",
    description: "查詢和分析數據",
    status: "disconnected",
    enabled: false,
  },
  {
    id: "search",
    name: "搜索",
    description: "搜索網絡和本地內容",
    status: "connected",
    enabled: false,
  },
];

interface MCPMenuProps {
  onSelectServer?: (serverId: string) => void;
}

export function MCPMenu({ onSelectServer }: MCPMenuProps) {
  const [servers, setServers] = useState<MCPServer[]>(DEFAULT_MCP_SERVERS);
  const [openServers, setOpenServers] = useState<Set<string>>(new Set());

  const toggleServer = (serverId: string) => {
    setServers((prev) =>
      prev.map((s) =>
        s.id === serverId ? { ...s, enabled: !s.enabled } : s
      )
    );
    onSelectServer?.(serverId);
  };

  const enabledCount = servers.filter((s) => s.enabled).length;

  const statusIcon = (status: MCPServer["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-3.5 h-3.5 text-green-500" />;
      case "disconnected":
        return <Circle className="w-3.5 h-3.5 text-stone-400" />;
      case "error":
        return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "text-xs gap-2",
            enabledCount > 0 && "border-blue-300 bg-blue-50"
          )}
        >
          <Zap className="w-3.5 h-3.5" />
          MCP ({enabledCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Model Context Protocol</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            已啟用 {enabledCount}/{servers.length}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-64 overflow-y-auto space-y-1">
          {servers.map((server) => (
            <button
              key={server.id}
              onClick={() => toggleServer(server.id)}
              className={cn(
                "w-full px-3 py-2.5 text-left text-sm rounded-md transition-colors flex items-start gap-2 hover:bg-stone-100",
                server.enabled && "bg-blue-50 border border-blue-200"
              )}
            >
              <div className="flex items-center gap-2 flex-1 mt-0.5">
                {statusIcon(server.status)}
                <input
                  type="checkbox"
                  checked={server.enabled}
                  onChange={() => {}}
                  className="w-4 h-4"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-xs text-stone-900">
                  {server.name}
                </p>
                <p className="text-[11px] text-stone-500">{server.description}</p>
                <p className="text-[10px] text-stone-400 mt-1">
                  狀態: {server.status === "connected" ? "已連接" : server.status === "disconnected" ? "未連接" : "錯誤"}
                </p>
              </div>
            </button>
          ))}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer flex items-center gap-2 text-xs">
          <Plus className="w-3.5 h-3.5" />
          <span>添加自定義 MCP</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
