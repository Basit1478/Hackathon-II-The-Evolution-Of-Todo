"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ClaudeMessageBubble } from "./claude-message-bubble";
import { MessageBubble } from "./message-bubble";
import { TypingIndicator } from "./typing-indicator";
import { sendMessage } from "@/lib/api/chat";
import { useAuth } from "@/context/AuthContext";

interface ClaudeStyleChatProps {
  userId?: string;
  conversationId?: number | null;
  onNewConversation?: (conversationId: number) => void;
}

export function ClaudeStyleChat({ userId: propUserId, conversationId: propConversationId, onNewConversation }: ClaudeStyleChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string; timestamp: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Use either the provided userId or the authenticated user's id
  const userId = propUserId || user?.id;

  // If conversationId is provided, load existing messages
  useEffect(() => {
    if (propConversationId) {
      // In a real implementation, you would fetch existing messages here
      // For now, we'll just clear messages to start fresh
      setMessages([]);
    }
  }, [propConversationId]);

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !userId) return;

    // Add user message to UI immediately
    const userMessage = {
      role: "user" as const,
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Call the backend API to get the assistant's response
      const response = await sendMessage(userId, propConversationId || null, inputValue);
      
      // Update conversation ID if this is a new conversation
      if (propConversationId === null && onNewConversation) {
        onNewConversation(response.conversation_id);
      }

      // Add assistant message to UI
      const assistantMessage = {
        role: "assistant" as const,
        content: response.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message to UI
      const errorMessage = {
        role: "assistant" as const,
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">TaskMaster AI</h2>
          </div>
          
          {messages.length === 0 ? (
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-2 text-sm text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                <Bot className="h-4 w-4" />
                How can I help you manage your tasks?
              </div>
            </div>
          ) : (
            messages.map((message, index) =>
              message.role === "user" ? (
                <MessageBubble key={index} content={message.content} timestamp={message.timestamp} />
              ) : (
                <ClaudeMessageBubble key={index} content={message.content} timestamp={message.timestamp} />
              )
            )
          )}
          
          {isLoading && (
            <div className="flex items-start gap-3 pb-6">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="rounded-2xl rounded-tl-sm bg-primary-50 p-4 dark:bg-secondary-800">
                  <TypingIndicator />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="sticky bottom-0 border-t border-secondary-200 bg-white p-4 dark:border-secondary-700 dark:bg-secondary-900/90">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Describe what you want to do..."
              className="pr-12"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              disabled={!inputValue.trim() || isLoading || !userId}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-2 text-center text-xs text-secondary-500">
            Describe your tasks naturally. I'll manage them for you.
          </p>
        </div>
      </div>
    </div>
  );
}
