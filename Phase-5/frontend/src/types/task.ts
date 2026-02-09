export type Priority = "high" | "medium" | "low";
export type RecurringInterval = "daily" | "weekly" | "monthly";
export type TaskStatus = "pending" | "completed";
export type SortBy = "date" | "priority" | "name";
export type SortOrder = "asc" | "desc";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  tags: string[];
  due_date: string | null;
  recurring: RecurringInterval | null;
  reminders: string[];
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status?: TaskStatus | "all";
  priority?: Priority;
  tag?: string;
  search?: string;
  sort_by?: SortBy;
  sort_order?: SortOrder;
}
