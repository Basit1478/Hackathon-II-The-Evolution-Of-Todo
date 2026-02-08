import { Copy, ThumbsUp, ThumbsDown, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import { useState } from "react";

interface ClaudeMessageBubbleProps {
  message: Message;
  isLast: boolean;
  onCopy?: (content: string) => void;
  onLike?: (id: string | number) => void;
  onDislike?: (id: string | number) => void;
}

export function ClaudeMessageBubble({
  message,
  isLast,
  onCopy,
  onLike,
  onDislike
}: ClaudeMessageBubbleProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);

  const handleCopy = () => {
    onCopy?.(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setDisliked(false);
      onLike?.(message.id);
    }
  };

  const handleDislike = () => {
    if (!disliked) {
      setDisliked(true);
      setLiked(false);
      onDislike?.(message.id);
    }
  };

  return (
    <div className={cn(
      "group mb-4 flex",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex max-w-[85%] gap-3",
        isUser && "flex-row-reverse"
      )}>
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-purple-600"
              : "bg-gradient-to-br from-blue-500 to-purple-600"
          )}>
            {isUser ? (
              <User className="h-4 w-4 text-white" />
            ) : (
              <Bot className="h-4 w-4 text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="flex flex-col gap-2">
          <div
            className={cn(
              "rounded-2xl px-4 py-3 shadow-sm",
              isUser
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            )}
          >
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
          </div>

          {/* Action Buttons - Only for Assistant */}
          {isAssistant && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                  copied && "text-green-600 dark:text-green-400"
                )}
                onClick={handleCopy}
                title={copied ? "Copied!" : "Copy"}
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                  liked && "text-blue-600 dark:text-blue-400"
                )}
                onClick={handleLike}
                title="Like"
              >
                <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                  disliked && "text-red-600 dark:text-red-400"
                )}
                onClick={handleDislike}
                title="Dislike"
              >
                <ThumbsDown className={cn("h-4 w-4", disliked && "fill-current")} />
              </Button>
            </div>
          )}

          {/* Timestamp - Optional */}
          {message.createdAt && (
            <div className={cn(
              "text-xs text-gray-500 dark:text-gray-400 px-1",
              isUser && "text-right"
            )}>
              {new Date(message.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}