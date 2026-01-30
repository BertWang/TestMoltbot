"use client";

import { useState, useCallback, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

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

  return (
    <div className="relative w-full max-w-md">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-stone-400" />
        <Input
          type="text"
          placeholder="搜尋筆記內容、摘要、標籤..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => query && setIsOpen(true)}
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
      </div>

      {/* 搜尋提示 */}
      {!query && (
        <div className="absolute top-12 left-0 right-0 mt-2 p-3 bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-600 text-center z-10">
          輸入 2 個字符或以上開始搜尋
        </div>
      )}
    </div>
  );
}
