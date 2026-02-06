export interface Message {
  id: number | string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRequest {
  conversation_id?: number;
  message: string;
}

export interface ChatResponse {
  conversation_id: number;
  response: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
}
