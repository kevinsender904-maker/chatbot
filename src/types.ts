export type UserRole = "user" | "admin";

export interface Profile {
  id: string;
  name: string;
  age_range: string;
  language: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRecord {
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "model" | "assistant";
  content: string;
  created_at: string;
}

export interface HealthTipHistory {
  id: string;
  user_id: string;
  tip_id: string;
  tip_title: string;
  category?: string;
  bookmarked: boolean;
  viewed_at: string;
}

export interface AnonymousLog {
  id: string;
  event: string;
  severity: "info" | "warn" | "error" | "critical";
  latency_ms?: number;
  created_at: string;
}

export interface SupabaseHealthStatus {
  configured: boolean;
  reachable: boolean;
  url?: string;
  latency_ms?: number;
  error?: string;
  message?: string;
}
