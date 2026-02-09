"use client";

import type { SortBy, SortOrder } from "@/types/task";
import { ArrowUpDown } from "lucide-react";

interface SortControlsProps {
  sortBy: SortBy | "";
  sortOrder: SortOrder;
  onSortByChange: (value: SortBy | "") => void;
  onSortOrderChange: (value: SortOrder) => void;
}

export function SortControls({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
}: SortControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowUpDown className="h-4 w-4 text-gray-400" />
      <select
        value={sortBy}
        onChange={(e) => onSortByChange(e.target.value as SortBy | "")}
        className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Sort by...</option>
        <option value="date">Date</option>
        <option value="priority">Priority</option>
        <option value="name">Name</option>
      </select>
      <button
        onClick={() => onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")}
        className="text-xs px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        {sortOrder === "asc" ? "Asc" : "Desc"}
      </button>
    </div>
  );
}
