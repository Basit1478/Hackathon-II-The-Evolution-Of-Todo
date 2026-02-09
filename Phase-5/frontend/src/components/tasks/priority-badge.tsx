import type { Priority } from "@/types/task";

const config: Record<Priority, { label: string; className: string }> = {
  high: {
    label: "High",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
  medium: {
    label: "Medium",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  low: {
    label: "Low",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, className } = config[priority] || config.medium;
  return (
    <span
      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${className}`}
    >
      {label}
    </span>
  );
}
