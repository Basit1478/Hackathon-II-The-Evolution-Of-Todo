"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Plus, Menu, Bot, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClaudeMessageBubble } from "./claude-message-bubble";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";

interface ClaudeStyleChatProps {
  messages: Message[];
  onSend: (content: string) => void;
  isLoading: boolean;
  onNewChat: () => void;
  userName?: string;
  conversations?: Array<{ id: number; title?: string; updatedAt: string }>;
  currentConversationId?: number | null;
  onConversationSelect?: (id: number) => void;
}

export function ClaudeStyleChat({
  messages,
  onSend,
  isLoading,
  onNewChat,
  userName,
  conversations = [],
  currentConversationId,
  onConversationSelect
}: ClaudeStyleChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      setShowSuggestions(false);
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSend(inputValue);
      setInputValue("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputValue]);

  const messageSuggestions = [
    "What tasks do I have pending?",
    "Show me my high priority tasks",
    "Help me plan my day",
    "Summarize my tasks for this week"
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 lg:translate-x-0 lg:static",
        showSidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Chats</h2>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onNewChat}
                  className="h-8 w-8"
                  title="New Chat"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="h-8 w-8 lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length > 0 ? (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-colors",
                      conv.id === currentConversationId
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    )}
                    onClick={() => {
                      onConversationSelect?.(conv.id);
                      setShowSidebar(false);
                    }}
                  >
                    <div className="font-medium text-sm truncate">
                      {conv.title || `Chat ${conv.id}`}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-medium text-white">
                {userName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {userName || 'Guest'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Free Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSidebar(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Always here to help</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && showSuggestions ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
                Ask me anything about your tasks or schedule
              </p>

              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                {messageSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all text-left"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <ClaudeMessageBubble
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                  onCopy={(content) => navigator.clipboard.writeText(content)}
                  onLike={(id) => console.log('Liked message:', id)}
                  onDislike={(id) => console.log('Disliked message:', id)}
                />
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Bot className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="w-full resize-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600"
                rows={1}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
              AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}