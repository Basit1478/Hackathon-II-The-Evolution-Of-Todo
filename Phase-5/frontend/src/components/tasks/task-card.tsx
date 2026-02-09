"use client";

import type { Task } from "@/types/task";
import { PriorityBadge } from "./priority-badge";
import { TagChips } from "./tag-chips";
import { CheckCircle2, Calendar, Repeat, Trash2 } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

export function TaskCard({ task, onComplete, onDelete }: TaskCardProps) {
  const overdue = task.status !== "completed" && isOverdue(task.due_date);

  return (
    <div
      className={`flex items-start gap-4 p-6 rounded-xl border bg-white dark:bg-gray-800 hover:shadow-lg transition-all ${
        overdue
          ? "border-red-300 dark:border-red-800"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Complete button */}
      <button
        onClick={() => task.status !== "completed" && onComplete?.(task.id)}
        disabled={task.status === "completed"}
        className="mt-1 flex-shrink-0"
      >
        {task.status === "completed" ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
        ) : (
          <div className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600 hover:border-emerald-400 transition-colors" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <h3
          className={`text-lg font-semibold ${
            task.status === "completed"
              ? "line-through text-gray-500 dark:text-gray-400"
              : "text-gray-900 dark:text-white"
          }`}
        >
          {task.title}
        </h3>

        {task.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} />

          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
              task.status === "completed"
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {task.status}
          </span>

          {task.due_date && (
            <span
              className={`text-xs flex items-center gap-1 ${
                overdue
                  ? "text-red-600 dark:text-red-400 font-medium"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <Calendar className="h-3 w-3" />
              {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}

          {task.recurring && (
            <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1">
              <Repeat className="h-3 w-3" />
              {task.recurring}
            </span>
          )}
        </div>

        <TagChips tags={task.tags} />
      </div>

      {/* Delete button */}
      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          className="mt-1 flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
