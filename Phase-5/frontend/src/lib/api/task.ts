import type { Task, TaskFilters } from "@/types/task";
import { getAuthHeaders } from "./auth-headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  tags?: string[];
  due_date?: string;
  recurring?: "daily" | "weekly" | "monthly";
  reminders?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: "pending" | "completed";
  priority?: "low" | "medium" | "high";
  tags?: string[];
  due_date?: string;
  recurring?: "daily" | "weekly" | "monthly";
  reminders?: string[];
}

function mapTask(task: Record<string, any>): Task {
  return {
    id: task.id.toString(),
    user_id: task.user_id || "",
    title: task.title,
    description: task.description || null,
    status: task.status || "pending",
    priority: task.priority || "medium",
    tags: task.tags || [],
    due_date: task.due_date || null,
    recurring: task.recurring || null,
    reminders: task.reminders || [],
    created_at: task.created_at || new Date().toISOString(),
    updated_at: task.updated_at || new Date().toISOString(),
  };
}

export async function getTasks(
  userId: string,
  filters?: TaskFilters
): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters) {
    if (filters.status && filters.status !== "all")
      params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.tag) params.set("tag", filters.tag);
    if (filters.search) params.set("search", filters.search);
    if (filters.sort_by) params.set("sort_by", filters.sort_by);
    if (filters.sort_order) params.set("sort_order", filters.sort_order);
  }

  const qs = params.toString();
  const url = `${API_URL}/api/${userId}/tasks${qs ? `?${qs}` : ""}`;

  const response = await fetch(url, { headers: getAuthHeaders() });
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to fetch tasks");
  }
  const data = await response.json();
  return data.map(mapTask);
}

export async function createTask(
  userId: string,
  task: CreateTaskRequest
): Promise<Task> {
  const response = await fetch(`${API_URL}/api/${userId}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to create task");
  }

  return mapTask(await response.json());
}

export async function updateTask(
  userId: string,
  taskId: string,
  task: UpdateTaskRequest
): Promise<Task> {
  const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to update task");
  }

  return mapTask(await response.json());
}

export async function completeTask(
  userId: string,
  taskId: string
): Promise<Task> {
  const response = await fetch(
    `${API_URL}/api/${userId}/tasks/${taskId}/complete`,
    { method: "POST", headers: getAuthHeaders() }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to complete task");
  }

  return mapTask(await response.json());
}

export async function deleteTask(
  userId: string,
  taskId: string
): Promise<void> {
  const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to delete task");
  }
}
