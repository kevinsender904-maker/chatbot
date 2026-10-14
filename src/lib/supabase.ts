import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Client credentials from Vite environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== "https://your-project-id.supabase.co" &&
    supabaseAnonKey !== "your-anon-key-here" &&
    supabaseUrl.startsWith("http")
  );
};

// Create real client if credentials provided, or fallback client for offline/preview
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : createClient(
      supabaseUrl || "https://placeholder-offline-project.supabase.co",
      supabaseAnonKey || "placeholder-anon-key",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

/**
 * Report anonymous operational telemetry to the backend worker.
 * STRICT PRIVACY REQUIREMENT:
 * No PII, no message text, no user ID, no symptom descriptions.
 */
export async function logAnonymousMetric(
  event: string,
  severity: "info" | "warn" | "error" | "critical" = "info",
  latencyMs?: number
): Promise<void> {
  try {
    await fetch("/api/logs/anonymous", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: String(event).slice(0, 100),
        severity,
        latency_ms: typeof latencyMs === "number" ? Math.round(latencyMs) : undefined,
      }),
    });
  } catch {
    // Fail silently so telemetry never interrupts user flow
  }
}
