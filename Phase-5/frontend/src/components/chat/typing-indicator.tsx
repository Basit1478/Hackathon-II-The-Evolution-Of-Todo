"use client";

import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 px-4 py-3 shadow-sm">
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" style={{ animationDelay: '0s' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" style={{ animationDelay: '0.2s' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 dark:bg-gray-500" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}