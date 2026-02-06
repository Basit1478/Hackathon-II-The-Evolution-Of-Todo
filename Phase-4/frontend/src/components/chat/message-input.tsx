"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MessageInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MessageInput({ onSend, placeholder = "Type your message...", disabled = false }: MessageInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSend(inputValue);
      setInputValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sticky bottom-0 border-t border-secondary-200 bg-white p-4 dark:border-secondary-700 dark:bg-secondary-900">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
          disabled={disabled}
        />
        <Button type="submit" size="icon" disabled={!inputValue.trim() || disabled}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
