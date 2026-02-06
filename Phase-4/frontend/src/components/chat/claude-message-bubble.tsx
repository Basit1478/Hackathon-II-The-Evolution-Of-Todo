import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface ClaudeMessageBubbleProps {
  content: string;
  timestamp?: string;
  className?: string;
}

export function ClaudeMessageBubble({ content, timestamp, className }: ClaudeMessageBubbleProps) {
  return (
    <div className={cn("flex items-start gap-3 pb-6", className)}>
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1">
        <div className="rounded-2xl rounded-tl-sm bg-primary-50 p-4 dark:bg-secondary-800">
          <p className="text-secondary-700 dark:text-secondary-300">{content}</p>
        </div>
        {timestamp && (
          <p className="mt-1.5 text-xs text-secondary-500">{timestamp}</p>
        )}
      </div>
    </div>
  );
}
