"use client";

import { Bot, User } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  const isUser = role === "user";
  
  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className="flex flex-col max-w-[85%]">
        <div 
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser 
              ? "bg-blue-600 text-white rounded-br-md" 
              : "bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 rounded-tl-md"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
        </div>
        
        {timestamp && (
          <div 
            className={`px-2 mt-1 text-xs ${
              isUser 
                ? "text-gray-500 dark:text-gray-400 text-right" 
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {timestamp}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-sm">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}