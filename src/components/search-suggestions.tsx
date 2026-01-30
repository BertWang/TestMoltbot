"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Clock, Tag, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchSuggestionsProps {
  query: string;
  isOpen: boolean;
  onSelectSuggestion: (suggestion: string) => void;
  onClose: () => void;
  selectedIndex: number;
  onKeyNavigate: (direction: "up" | "down") => void;
}

interface SuggestionsData {
  suggestions: string[];
  popularTags: string[];
}

export function SearchSuggestions({
  query,
  isOpen,
  onSelectSuggestion,
  onClose,
  selectedIndex,
  onKeyNavigate,
}: SearchSuggestionsProps) {
  const [suggestionsData, setSuggestionsData] = useState<SuggestionsData>({
    suggestions: [],
    popularTags: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 獲取搜尋建議
  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/search/suggestions");
      if (!response.ok) {
        throw new Error("無法獲取建議");
      }
      const data: SuggestionsData = await response.json();
      setSuggestionsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知錯誤");
      console.error("Failed to fetch suggestions:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 當組件打開時獲取建議
  useEffect(() => {
    if (isOpen && suggestionsData.suggestions.length === 0) {
      fetchSuggestions();
    }
  }, [isOpen, fetchSuggestions, suggestionsData.suggestions.length]);

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 根據輸入查詢過濾建議
  const filteredSuggestions = query.trim()
    ? suggestionsData.suggestions.filter((s) =>
        s.toLowerCase().includes(query.toLowerCase())
      )
    : suggestionsData.suggestions;

  // 熱門標籤（僅在沒有查詢時顯示）
  const showPopularTags = !query.trim() && suggestionsData.popularTags.length > 0;

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
      role="listbox"
      aria-label="搜尋建議"
    >
      {isLoading && (
        <div className="p-4 text-center text-stone-500 text-sm">
          載入建議中...
        </div>
      )}

      {error && (
        <div className="p-4 text-center text-red-500 text-sm">{error}</div>
      )}

      {!isLoading && !error && (
        <>
          {/* 過濾後的建議列表 */}
          {filteredSuggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-2">
                <Clock className="w-3 h-3" />
                建議搜尋
              </div>
              {filteredSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  role="option"
                  aria-selected={selectedIndex === index}
                  onClick={() => onSelectSuggestion(suggestion)}
                  onMouseEnter={() => {
                    // 當滑鼠懸停時，更新選中索引
                    if (selectedIndex !== index) {
                      onKeyNavigate("down"); // 簡單實現：每次懸停都導航
                    }
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-stone-50 transition-colors flex items-center gap-2",
                    selectedIndex === index && "bg-stone-100"
                  )}
                >
                  <TrendingUp className="w-4 h-4 text-stone-400" />
                  <span className="flex-1 truncate">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {/* 熱門標籤 */}
          {showPopularTags && (
            <div className="py-2 border-t border-stone-100">
              <div className="px-4 py-2 text-xs font-semibold text-stone-500 uppercase tracking-wide flex items-center gap-2">
                <Tag className="w-3 h-3" />
                熱門標籤
              </div>
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {suggestionsData.popularTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => onSelectSuggestion(tag)}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 hover:bg-stone-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 空狀態 */}
          {filteredSuggestions.length === 0 && !showPopularTags && (
            <div className="p-4 text-center text-stone-500 text-sm">
              沒有相關建議
            </div>
          )}
        </>
      )}
    </div>
  );
}
