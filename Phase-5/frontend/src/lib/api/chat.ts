import type { ChatRequest, ChatResponse, Message, Conversation } from "@/types/chat";
import { getAuthHeaders } from "./auth-headers";

// Frontend API URL - use NEXT_PUBLIC prefix for client-side access
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function sendMessage(userId: string, conversationId: number | null, message: string): Promise<ChatResponse> {
  const request: ChatRequest = { message };
  if (conversationId) request.conversation_id = conversationId;

  const response = await fetch(`${API_URL}/api/${userId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || "Failed to send message");
  }
  return response.json();
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const response = await fetch(`${API_URL}/api/${userId}/conversations`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch conversations");
  const data = await response.json();
  return data.map((conv: Record<string, string>) => ({
    id: conv.id,
    createdAt: conv.created_at,
    updatedAt: conv.updated_at
  }));
}

export async function getMessages(userId: string, conversationId: number): Promise<Message[]> {
  const response = await fetch(`${API_URL}/api/${userId}/conversations/${conversationId}/messages`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error("Failed to fetch messages");
  const data = await response.json();
  return data.map((msg: Record<string, string | number>) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.created_at
  }));
}