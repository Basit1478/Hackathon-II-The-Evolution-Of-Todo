"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ClaudeMessageBubble } from "@/components/chat/claude-message-bubble";
import { sendMessage, getMessages, getConversations } from "@/lib/api/chat";
import { getTasks } from "@/lib/api/task";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Task } from "@/types/chat";
import { Conversation } from "@/types/chat";
import { Send, Plus, Menu, Bot, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";

function ClaudeStyleChatContent() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userId = user?.id || "demo-user";

  useEffect(() => {
    if (user) {
      loadConversations();
      loadTasks();
      const savedConversationId = localStorage.getItem(`conversationId_${user.id}`);
      if (savedConversationId) {
        const id = parseInt(savedConversationId, 10);
        setConversationId(id);
        loadMessages(id);
      }
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const convs = await getConversations(userId);
      setConversations(convs);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const loadTasks = async () => {
    try {
      const userTasks = await getTasks(userId);
      setTasks(userTasks);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  const loadMessages = async (convId: number) => {
    try {
      const loadedMessages = await getMessages(userId, convId);
      setMessages(loadedMessages);
    } catch (err) {
      localStorage.removeItem(`conversationId_${userId}`);
      setConversationId(null);
    }
  };

  const handleSend = useCallback(async (content: string) => {
    if (!content.trim()) return;
    setError(null);
    setIsLoading(true);
    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    try {
      const response = await sendMessage(userId, conversationId, content);
      if (!conversationId) {
        setConversationId(response.conversation_id);
        localStorage.setItem(`conversationId_${userId}`, String(response.conversation_id));
        loadConversations();
      }
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.response,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setShowSuggestions(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, userId]);

  const handleNewChat = () => {
    setMessages([]);
    setConversationId(null);
    localStorage.removeItem(`conversationId_${userId}`);
    setShowSuggestions(true);
    setShowSidebar(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      handleSend(inputValue);
      setInputValue("");
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

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    setTimeout(() => { textareaRef.current?.focus(); }, 0);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 lg:translate-x-0 lg:static",
        showSidebar ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Chats
              </h2>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={handleNewChat} className="h-8 w-8" title="New Chat">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="h-8 w-8 lg:hidden">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length > 0 ? (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button key={conv.id} className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    conv.id === conversationId
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  )} onClick={() => {
                    setConversationId(conv.id);
                    localStorage.setItem(`conversationId_${userId}`, String(conv.id));
                    loadMessages(conv.id);
                    setShowSidebar(false);
                  }}>
                    <div className="font-medium text-sm truncate">Chat {conv.id}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showSidebar && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowSidebar(false)} />}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)} className="lg:hidden">
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

        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && showSuggestions ? (
            <div className="flex flex-col items-center justify-center h-full p-6">
              <div className="mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">How can I help you today?</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">Ask me anything about your tasks or schedule</p>
              <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3">
                {messageSuggestions.map((suggestion, index) => (
                  <button key={index} onClick={() => handleSuggestionClick(suggestion)} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all text-left">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <ClaudeMessageBubble key={message.id} message={message} isLast={index === messages.length - 1} onCopy={(content) => navigator.clipboard.writeText(content)} onLike={() => console.log('Liked message:', message.id)} onDislike={() => console.log('Disliked message:', message.id)} />
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

        <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <textarea ref={textareaRef} value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your message..." className="w-full resize-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 pr-12 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600" rows={1} disabled={isLoading} />
              <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-xl bg-blue-600 hover:bg-blue-700" disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">AI can make mistakes. Please verify important information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return <ClaudeStyleChatContent />;
}
