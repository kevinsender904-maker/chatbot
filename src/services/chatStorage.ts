import { supabase, isSupabaseConfigured, logAnonymousMetric } from "../lib/supabase";
import { ChatSession, ChatMessageRecord, Message } from "../types";

const LOCAL_SESSIONS_KEY = "health_app_local_chat_sessions";
const LOCAL_MESSAGES_KEY = "health_app_local_chat_messages";

export async function createChatSession(
  userId: string,
  title: string = "New Health Inquiry"
): Promise<ChatSession> {
  const startTime = performance.now();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: userId,
          title,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating chat session in Supabase:", error);
        throw error;
      }

      await logAnonymousMetric(
        "chat_session_created",
        "info",
        performance.now() - startTime
      );
      return data as ChatSession;
    } catch (e) {
      console.warn("Falling back to local session store:", e);
    }
  }

  // Fallback / Offline / Preview
  const localSession: ChatSession = {
    id: "session-" + Math.random().toString(36).substring(2, 9),
    user_id: userId,
    title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const raw = sessionStorage.getItem(LOCAL_SESSIONS_KEY);
    const list: ChatSession[] = raw ? JSON.parse(raw) : [];
    list.unshift(localSession);
    sessionStorage.setItem(LOCAL_SESSIONS_KEY, JSON.stringify(list));
  } catch {}

  await logAnonymousMetric("chat_session_created_local", "info");
  return localSession;
}

export async function fetchUserChatSessions(userId: string): Promise<ChatSession[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching sessions:", error);
      } else if (data) {
        return data as ChatSession[];
      }
    } catch (e) {
      console.warn("Error querying sessions from Supabase:", e);
    }
  }

  try {
    const raw = sessionStorage.getItem(LOCAL_SESSIONS_KEY);
    if (raw) {
      const list: ChatSession[] = JSON.parse(raw);
      return list.filter((s) => s.user_id === userId);
    }
  } catch {}

  return [];
}

export async function saveChatMessage(
  sessionId: string,
  userId: string,
  role: "user" | "model" | "assistant",
  content: string
): Promise<ChatMessageRecord | null> {
  // CRITICAL PRIVACY: Telemetry only logs message event, NEVER content/PII!
  const startTime = performance.now();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          user_id: userId,
          role,
          content,
        })
        .select()
        .single();

      if (error) {
        console.error("Error saving chat message to Supabase:", error);
      } else {
        // Update session timestamp
        await supabase
          .from("chat_sessions")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", sessionId);

        await logAnonymousMetric(
          "chat_message_persisted",
          "info",
          performance.now() - startTime
        );
        return data as ChatMessageRecord;
      }
    } catch (e) {
      console.warn("Could not save to Supabase:", e);
    }
  }

  // Fallback
  const record: ChatMessageRecord = {
    id: "msg-" + Math.random().toString(36).substring(2, 9),
    session_id: sessionId,
    user_id: userId,
    role,
    content,
    created_at: new Date().toISOString(),
  };

  try {
    const raw = sessionStorage.getItem(LOCAL_MESSAGES_KEY);
    const list: ChatMessageRecord[] = raw ? JSON.parse(raw) : [];
    list.push(record);
    sessionStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(list));
  } catch {}

  await logAnonymousMetric("chat_message_persisted_local", "info");
  return record;
}

export async function fetchSessionMessages(
  sessionId: string,
  userId: string
): Promise<Message[]> {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching chat messages:", error);
      } else if (data && data.length > 0) {
        return data.map((d: ChatMessageRecord) => ({
          id: d.id,
          role: d.role === "assistant" ? "model" : (d.role as "user" | "model"),
          content: d.content,
          timestamp: new Date(d.created_at),
        }));
      }
    } catch (e) {
      console.warn("Error querying messages from Supabase:", e);
    }
  }

  try {
    const raw = sessionStorage.getItem(LOCAL_MESSAGES_KEY);
    if (raw) {
      const list: ChatMessageRecord[] = JSON.parse(raw);
      return list
        .filter((m) => m.session_id === sessionId)
        .map((d) => ({
          id: d.id,
          role: d.role === "assistant" ? "model" : (d.role as "user" | "model"),
          content: d.content,
          timestamp: new Date(d.created_at),
        }));
    }
  } catch {}

  return [];
}

export async function deleteChatSession(
  sessionId: string,
  userId: string
): Promise<boolean> {
  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId)
        .eq("user_id", userId);

      if (!error) {
        await logAnonymousMetric("chat_session_deleted", "info");
        return true;
      }
    } catch (e) {
      console.error("Error deleting session:", e);
    }
  }

  try {
    const raw = sessionStorage.getItem(LOCAL_SESSIONS_KEY);
    if (raw) {
      const list: ChatSession[] = JSON.parse(raw);
      sessionStorage.setItem(
        LOCAL_SESSIONS_KEY,
        JSON.stringify(list.filter((s) => s.id !== sessionId))
      );
    }
  } catch {}

  await logAnonymousMetric("chat_session_deleted_local", "info");
  return true;
}
