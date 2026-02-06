import { ClaudeMessageBubble } from "./claude-message-bubble";
import { MessageBubble } from "./message-bubble";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mx-auto max-w-3xl">
        {messages.map((message) =>
          message.role === "user" ? (
            <MessageBubble
              key={message.id}
              content={message.content}
              timestamp={message.timestamp}
            />
          ) : (
            <ClaudeMessageBubble
              key={message.id}
              content={message.content}
              timestamp={message.timestamp}
            />
          )
        )}
      </div>
    </div>
  );
}
