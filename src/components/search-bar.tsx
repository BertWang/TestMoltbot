"use client";

import { useState, useCallback, useTransition } from "react";
import { Search, X, Loader2, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
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

export function SearchBar({ onSearch, onClear, showResults = false }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setIsOpen(false);
        setResults([]);
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
          setResults(searchResults);
          onSearch?.(searchResults);
          setIsOpen(true);

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
    if (value.length >= 2) {
      handleSearch(value);
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    setResults([]);
    onClear?.();
  };

  // 鍵盤導航處理
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedSuggestionIndex((prev) => prev + 1);
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedSuggestionIndex((prev) => Math.max(0, prev - 1));
          break;
        case "Enter":
          event.preventDefault();
          // 選中當前建議後執行搜尋
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [isOpen]
  );

  // 建議導航
  const handleKeyNavigate = useCallback(
    (direction: "up" | "down") => {
      if (direction === "down") {
        setSelectedSuggestionIndex((prev) => prev + 1);
      } else {
        setSelectedSuggestionIndex((prev) => Math.max(0, prev - 1));
      }
    },
    []
  );

  // 選擇建議項
  const handleSelectSuggestion = useCallback(
    (suggestion: string) => {
      setQuery(suggestion);
      handleSearch(suggestion);
      setIsOpen(false);
    },
    [handleSearch]
  );

  // 保存當前搜尋
  const handleSaveSearch = useCallback(
    async (name?: string, description?: string) => {
      if (!name?.trim() || !query.trim()) {
        toast.error("請輸入搜尋名稱");
        return;
      }

      try {
        const response = await fetch("/api/search/saved", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            query: query,
            description: description || null,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save search");
        }

        toast.success("搜尋已保存");
      } catch (err) {
        console.error("Save search error:", err);
        toast.error("保存失敗");
      }
    },
    [query]
  );

  return (
    <div className="relative w-full">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-md flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-stone-400" />
          <Input
            type="text"
            placeholder="搜尋筆記內容、摘要、標籤..."
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => query && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            className="pl-9 pr-9 bg-white border-stone-200 focus:border-stone-400"
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
          
          {/* 搜尋建議面板 */}
          <SearchSuggestions
            query={query}
            isOpen={isOpen}
            onSelectSuggestion={handleSelectSuggestion}
            onClose={() => setIsOpen(false)}
            selectedIndex={selectedSuggestionIndex}
            onKeyNavigate={handleKeyNavigate}
          />
        </div>
        {/* 保存和提示文本 */}
        <div className="flex items-center gap-2">
          {query && (
            <button
              onClick={() => {
                const name = prompt("搜尋名稱:");
                if (name?.trim()) {
                  const description = prompt("搜尋描述 (可選):");
                  handleSaveSearch(name, description || undefined);
                }
              }}
              className="p-1.5 text-stone-600 hover:text-blue-500 hover:bg-stone-100 rounded transition-colors"
              title="保存此搜尋"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
          {!query && (
            <span className="text-xs text-stone-400 whitespace-nowrap">輸入 2 個字符開始搜尋</span>
          )}
        </div>
      </div>
    </div>
  );
}
