"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Star, Trash2, Edit2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  description?: string;
  filters?: string;
  createdAt: string;
  updatedAt: string;
}

interface SavedSearchesProps {
  onSelectSearch?: (query: string, filters?: string) => void;
  currentQuery?: string;
}

export function SavedSearches({
  onSelectSearch,
  currentQuery,
}: SavedSearchesProps) {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // 獲取已保存的搜尋
  const fetchSavedSearches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/search/saved");

      if (!response.ok) {
        throw new Error("Failed to fetch saved searches");
      }

      const data = await response.json();
      setSavedSearches(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      console.error("Fetch saved searches error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavedSearches();
  }, [fetchSavedSearches]);

  // 保存當前搜尋
  const handleSaveSearch = useCallback(async () => {
    if (!formData.name.trim() || !currentQuery?.trim()) {
      toast.error("請輸入搜尋名稱和查詢條件");
      return;
    }

    try {
      const url = editingId
        ? `/api/search/saved?id=${editingId}`
        : "/api/search/saved";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          query: currentQuery,
          description: formData.description || null,
        }),
      });

      if (!response.ok) {
        throw new Error(
          editingId ? "Failed to update search" : "Failed to save search"
        );
      }

      const newSearch = await response.json();

      if (editingId) {
        setSavedSearches((prev) =>
          prev.map((item) => (item.id === editingId ? newSearch : item))
        );
        toast.success("搜尋已更新");
      } else {
        setSavedSearches((prev) => [newSearch, ...prev]);
        toast.success("搜尋已保存");
      }

      // 重置表單
      setFormData({ name: "", description: "" });
      setEditingId(null);
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Save search error:", err);
      toast.error(
        err instanceof Error ? err.message : "保存失敗"
      );
    }
  }, [formData, currentQuery, editingId]);

  // 快速保存搜尋（使用 prompt）
  const handleQuickSaveSearch = useCallback(async (name: string, description?: string) => {
    if (!name.trim() || !currentQuery?.trim()) {
      toast.error("請輸入搜尋名稱和查詢條件");
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
          query: currentQuery,
          description: description?.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save search");
      }

      const newSearch = await response.json();
      setSavedSearches((prev) => [newSearch, ...prev]);
      toast.success("搜尋已保存");
    } catch (err) {
      console.error("Save search error:", err);
      toast.error(
        err instanceof Error ? err.message : "保存失敗"
      );
    }
  }, [currentQuery]);

  // 編輯搜尋
  const handleEditSearch = useCallback((search: SavedSearch) => {
    setEditingId(search.id);
    setFormData({
      name: search.name,
      description: search.description || "",
    });
    setIsDialogOpen(true);
  }, []);

  // 刪除搜尋
  const handleDeleteSearch = useCallback(async (id: string) => {
    if (!confirm("確定要刪除此搜尋嗎？")) {
      return;
    }

    try {
      const response = await fetch(`/api/search/saved?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete search");
      }

      setSavedSearches((prev) => prev.filter((item) => item.id !== id));
      toast.success("搜尋已刪除");
    } catch (err) {
      console.error("Delete search error:", err);
      toast.error("刪除失敗");
    }
  }, []);

  // 應用搜尋
  const handleApplySearch = useCallback(
    (search: SavedSearch) => {
      if (onSelectSearch) {
        const filters = search.filters ? JSON.parse(search.filters) : undefined;
        onSelectSearch(search.query, search.filters);
      }
    },
    [onSelectSearch]
  );

  if (loading) {
    return (
      <div className="py-4 px-4 text-center text-sm text-gray-400">
        加載中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 px-4 text-center text-sm text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
      {/* 標題和添加按鈕 */}
      <div className="flex items-center justify-between px-4 py-2 mb-2">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            已保存搜尋
          </span>
        </div>

        {/* 保存當前搜尋按鈕 */}
        {currentQuery && (
          <button
            onClick={() => {
              const name = prompt("搜尋名稱:");
              if (name?.trim()) {
                const description = prompt("搜尋描述 (可選):");
                handleQuickSaveSearch(name, description || undefined);
              }
            }}
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
            title="保存當前搜尋"
          >
            <Plus className="w-3 h-3" />
            保存
          </button>
        )}
      </div>

      {/* 已保存搜尋列表 */}
      {savedSearches.length > 0 ? (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {savedSearches.map((search) => (
            <div
              key={search.id}
              className="flex items-start gap-3 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors cursor-pointer"
              onClick={() => handleApplySearch(search)}
            >
              {/* 搜尋內容 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {search.name}
                </p>
                {search.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {search.description}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                  {search.query}
                </p>
              </div>

              {/* 操作按鈕 */}
              <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSearch(search);
                  }}
                  className="text-gray-400 hover:text-blue-500 transition-colors"
                  title="編輯"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSearch(search.id);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="刪除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 px-4 text-center text-sm text-gray-400">
          暫無已保存搜尋
        </div>
      )}
    </div>
  );
}
