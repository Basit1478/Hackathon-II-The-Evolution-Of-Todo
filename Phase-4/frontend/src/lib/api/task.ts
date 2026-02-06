import type { Task } from "@/types/chat";

// Frontend API URL - use NEXT_PUBLIC prefix for client-side access
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export async function getTasks(userId: string): Promise<Task[]> {
  const response = await fetch(`${API_URL}/api/${userId}/tasks`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to fetch tasks");
  }
  const data = await response.json();
  return data.map((task: Record<string, any>) => ({
    id: task.id.toString(),
    title: task.title,
    description: task.description || '',
    status: task.status || 'pending',
    priority: task.priority || 'medium',
    dueDate: task.due_date || task.dueDate || '',
    createdAt: task.created_at || task.createdAt || new Date().toISOString()
  }));
}

export async function createTask(userId: string, task: CreateTaskRequest): Promise<Task> {
  const response = await fetch(`${API_URL}/api/${userId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to create task");
  }

  const data = await response.json();
  return {
    id: data.id.toString(),
    title: data.title,
    description: data.description || '',
    status: data.status || 'pending',
    priority: data.priority || 'medium',
    dueDate: data.due_date || data.dueDate || '',
    createdAt: data.created_at || data.createdAt || new Date().toISOString()
  };
}

export async function updateTask(userId: string, taskId: string, task: UpdateTaskRequest): Promise<Task> {
  const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to update task");
  }

  const data = await response.json();
  return {
    id: data.id.toString(),
    title: data.title,
    description: data.description || '',
    status: data.status || 'pending',
    priority: data.priority || 'medium',
    dueDate: data.due_date || data.dueDate || '',
    createdAt: data.created_at || data.createdAt || new Date().toISOString()
  };
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/${userId}/tasks/${taskId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to delete task");
  }
}
