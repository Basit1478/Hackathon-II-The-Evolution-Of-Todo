import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  timestamp?: string;
  className?: string;
}

export function MessageBubble({ content, timestamp, className }: MessageBubbleProps) {
  return (
    <div className={cn("flex justify-end pb-6", className)}>
      <div className="flex max-w-[80%] flex-col items-end">
        <div className="rounded-2xl rounded-tr-sm bg-primary-500 p-4 text-white dark:bg-primary-600">
          <p>{content}</p>
        </div>
        {timestamp && (
          <p className="mt-1.5 text-xs text-secondary-500">{timestamp}</p>
        )}
      </div>
    </div>
  );
}
