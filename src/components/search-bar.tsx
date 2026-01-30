"use client";

import { useState, useCallback, useTransition, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { SearchSuggestions } from "./search-suggestions";

interface SearchResult {
  id: string;
  imageUrl: string;
  refinedContent: string | null;
  summary: string | null;
  tags: string | null;
  status: string;
  createdAt: Date;
}

interface SearchBarProps {
  onSearch?: (results: SearchResult[]) => void;
  onClear?: () => void;
  showResults?: boolean;
}

export function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setIsOpen(false);
        onClear?.();
        return;
      }

      startTransition(async () => {
        try {
          const response = await fetch(
            `/api/search?query=${encodeURIComponent(searchQuery)}`
          );
          if (!response.ok) throw new Error("搜尋失敗");

          const searchResults: SearchResult[] = await response.json();
          onSearch?.(searchResults);
          setIsOpen(false); // 關閉建議面板

          if (searchResults.length === 0) {
            toast.info("未找到相關筆記", {
              description: `沒有筆記符合 "${searchQuery}"`,
            });
          }
        } catch (error) {
          console.error("Search error:", error);
          toast.error("搜尋失敗", { description: "請稍後重試" });
        }
      });
    },
    [onSearch, onClear]
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    // 打開建議面板
    if (value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      onClear?.();
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    setSelectedIndex(-1);
    onClear?.();
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
    // 執行搜尋
    if (suggestion.length >= 2) {
      handleSearch(suggestion);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => prev + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(-1, prev - 1));
        break;
      case "Enter":
        e.preventDefault();
        if (query.trim()) {
          handleSearch(query);
          setIsOpen(false);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleKeyNavigate = (direction: "up" | "down") => {
    if (direction === "down") {
      setSelectedIndex((prev) => prev + 1);
    } else {
      setSelectedIndex((prev) => Math.max(-1, prev - 1));
    }
  };

  return (
    <div className="relative w-full">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-md flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-stone-400" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="搜尋筆記內容、摘要、標籤..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            className="pl-9 pr-9 bg-white border-stone-200 focus:border-stone-400"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={isOpen}
          />
          {query && (
            <button
              onClick={handleClear}
              disabled={isPending}
              className="absolute right-3 text-stone-400 hover:text-stone-600 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          )}

          {/* 搜尋建議組件 */}
          <SearchSuggestions
            query={query}
            isOpen={isOpen}
            onSelectSuggestion={handleSelectSuggestion}
            onClose={() => setIsOpen(false)}
            selectedIndex={selectedIndex}
            onKeyNavigate={handleKeyNavigate}
          />
        </div>
        {/* 提示文本放在搜尋框旁邊 */}
        {!query && (
          <span className="text-xs text-stone-400 whitespace-nowrap">
            輸入關鍵字或按 ↓ 查看建議
          </span>
        )}
      </div>
    </div>
  );
}
