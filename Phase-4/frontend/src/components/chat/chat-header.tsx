import { Bot, MessageSquare, Settings } from "lucide-react";

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
}

export function ChatHeader({ title = "AI Assistant", subtitle = "Always here to help" }: ChatHeaderProps) {
  return (
    <header className="border-b border-secondary-200 bg-white p-4 dark:border-secondary-700 dark:bg-secondary-900">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-secondary-900 dark:text-white">{title}</h1>
            <p className="text-sm text-secondary-500">{subtitle}</p>
          </div>
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800">
          <Settings className="h-5 w-5 text-secondary-500" />
        </button>
      </div>
    </header>
  );
}
