"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/types/chat";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { Bot } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  showWelcome?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}

export function MessageList({ 
  messages, 
  isLoading, 
  showWelcome = false,
  onSuggestionClick 
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const suggestions = [
    "What tasks do I have pending?",
    "Show me my high priority tasks",
    "Help me plan my day",
    "Summarize my tasks for this week"
  ];

  // Show welcome screen if no messages
  if (messages.length === 0 && !isLoading && showWelcome) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <Bot className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          How can I help you today?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
          Ask me anything about your tasks or schedule
        </p>

        {onSuggestionClick && (
          <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick(suggestion)}
                className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all text-left group"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {suggestion}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble 
            key={message.id} 
            role={message.role} 
            content={message.content}
            timestamp={message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            }) : undefined}
          />
        ))}
        
        {isLoading && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}