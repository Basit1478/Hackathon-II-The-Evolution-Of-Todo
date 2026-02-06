export function TypingIndicator() {
  return (
    <div className="flex items-center">
      <div className="flex gap-1">
        <div className="h-2 w-2 animate-pulse rounded-full bg-secondary-400"></div>
        <div className="h-2 w-2 animate-pulse rounded-full bg-secondary-400 delay-75"></div>
        <div className="h-2 w-2 animate-pulse rounded-full bg-secondary-400 delay-150"></div>
      </div>
      <span className="ml-2 text-sm text-secondary-500">Thinking...</span>
    </div>
  );
}
