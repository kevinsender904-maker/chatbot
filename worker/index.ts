import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { processMedicalPipeline, SYSTEM_INSTRUCTION } from "../src/services/medicalPipeline";

export interface Fetcher {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

export interface Env {
  GEMINI_API_KEY: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_GATEWAY_ID?: string;
  CLOUDFLARE_AI_GATEWAY_URL?: string;
  AI_GATEWAY_URL?: string;
  CF_AIG_TOKEN?: string;
  CLOUDFLARE_AI_GATEWAY_TOKEN?: string;
  ASSETS?: Fetcher;
}

export function resolveSupabaseWorkerConfig(env: Env): {
  url?: string;
  serviceKey?: string;
  anonKey?: string;
} {
  const url =
    env.SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    (typeof process !== "undefined"
      ? process.env?.SUPABASE_URL || process.env?.VITE_SUPABASE_URL
      : undefined);

  const serviceKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    (typeof process !== "undefined"
      ? process.env?.SUPABASE_SERVICE_ROLE_KEY
      : undefined);

  const anonKey =
    env.VITE_SUPABASE_ANON_KEY ||
    (typeof process !== "undefined"
      ? process.env?.VITE_SUPABASE_ANON_KEY
      : undefined);

  return { url, serviceKey, anonKey };
}

export function resolveAiGatewayConfig(env: Env): {
  baseUrl?: string;
  headers: Record<string, string>;
} {
  let baseUrl: string | undefined = undefined;

  const url =
    env.AI_GATEWAY_URL ||
    env.CLOUDFLARE_AI_GATEWAY_URL ||
    (typeof process !== "undefined"
      ? process.env?.AI_GATEWAY_URL || process.env?.CLOUDFLARE_AI_GATEWAY_URL
      : undefined);

  if (url) {
    baseUrl = url;
  } else {
    const accountId =
      env.CLOUDFLARE_ACCOUNT_ID ||
      (typeof process !== "undefined" ? process.env?.CLOUDFLARE_ACCOUNT_ID : undefined);
    const gatewayId =
      env.CLOUDFLARE_GATEWAY_ID ||
      (typeof process !== "undefined" ? process.env?.CLOUDFLARE_GATEWAY_ID : undefined);
    if (accountId && gatewayId) {
      baseUrl = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/google-ai-studio`;
    }
  }

  const token =
    env.CF_AIG_TOKEN ||
    env.CLOUDFLARE_AI_GATEWAY_TOKEN ||
    (typeof process !== "undefined"
      ? process.env?.CF_AIG_TOKEN || process.env?.CLOUDFLARE_AI_GATEWAY_TOKEN
      : undefined);
  const headers: Record<string, string> = {
    "User-Agent": "aistudio-build-cf-worker",
  };

  if (token) {
    headers["cf-aig-authorization"] = `Bearer ${token}`;
  }

  return { baseUrl, headers };
}

const app = new Hono<{ Bindings: Env }>();

// 1. Connection Health Check verifying Supabase reachability
app.get("/api/health", async (c) => {
  const { url, serviceKey, anonKey } = resolveSupabaseWorkerConfig(c.env);

  const isConfigured = Boolean(
    url &&
    url !== "https://your-project-id.supabase.co" &&
    url.startsWith("http")
  );

  if (!isConfigured || !url) {
    return c.json({
      status: "healthy",
      service: "healthcare-ai-worker",
      supabase: {
        configured: false,
        reachable: false,
        message: "Supabase environment variables not configured. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
    });
  }

  // Verify real reachability against Supabase
  const startTime = Date.now();
  try {
    const key = serviceKey || anonKey || "";
    // Ping Supabase auth health or rest root endpoint
    const pingHeaders: Record<string, string> = {};
    if (key) {
      pingHeaders["apikey"] = key;
      pingHeaders["Authorization"] = `Bearer ${key}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/health`, {
      headers: pingHeaders,
      signal: controller.signal,
    }).catch(async () => {
      // Fallback ping to rest endpoint
      return await fetch(`${url.replace(/\/+$/, "")}/rest/v1/`, {
        headers: pingHeaders,
        signal: controller.signal,
      });
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (res.ok || res.status === 200 || res.status === 401) {
      // 200 or 401 (active gateway requiring auth) confirms reachability
      return c.json({
        status: "healthy",
        service: "healthcare-ai-worker",
        supabase: {
          configured: true,
          reachable: true,
          url,
          latency_ms: latencyMs,
          http_status: res.status,
        },
      });
    } else {
      return c.json({
        status: "degraded",
        service: "healthcare-ai-worker",
        supabase: {
          configured: true,
          reachable: false,
          url,
          latency_ms: latencyMs,
          http_status: res.status,
          error: `Supabase returned HTTP ${res.status}`,
        },
      });
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return c.json({
      status: "degraded",
      service: "healthcare-ai-worker",
      supabase: {
        configured: true,
        reachable: false,
        url,
        latency_ms: latencyMs,
        error: err.name === "AbortError" ? "Connection timeout after 3500ms" : (err.message || "Network unreachable"),
      },
    });
  }
});

// 2. Anonymous Telemetry Endpoint
// STRICT PRIVACY REQUIREMENT:
// "anonymous_logs(event, severity, latency_ms, created_at - no PII, no message text)"
// "Do not store sensitive medical data beyond chat history that the user owns."
app.post("/api/logs/anonymous", async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const { event, severity, latency_ms } = body;

  if (!event || typeof event !== "string") {
    return c.json({ error: "Valid event string required" }, 400);
  }

  // Disallow forbidden fields that could contain PII or message text
  const forbiddenKeys = [
    "message",
    "content",
    "text",
    "prompt",
    "email",
    "name",
    "user_id",
    "userId",
    "symptom",
    "diagnosis",
  ];

  for (const key of forbiddenKeys) {
    if (key in body) {
      delete body[key];
    }
  }

  const validSeverities = ["info", "warn", "error", "critical"];
  const sanitizedSeverity = validSeverities.includes(severity) ? severity : "info";
  const sanitizedLatency = typeof latency_ms === "number" ? Math.max(0, Math.round(latency_ms)) : null;
  const sanitizedEvent = event.slice(0, 100);

  const { url, serviceKey } = resolveSupabaseWorkerConfig(c.env);

  if (url && serviceKey) {
    try {
      const supabaseAdmin = createClient(url, serviceKey, {
        auth: { persistSession: false },
      });

      await supabaseAdmin.from("anonymous_logs").insert({
        event: sanitizedEvent,
        severity: sanitizedSeverity,
        latency_ms: sanitizedLatency,
      });
    } catch (err) {
      console.warn("Failed to write to anonymous_logs in Supabase:", err);
    }
  }

  return c.json({ logged: true, event: sanitizedEvent });
});

// 3. Admin Logs Endpoint (protected by profiles.role = 'admin')
app.get("/api/admin/logs", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Missing or invalid authorization header" }, 401);
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const { url, serviceKey } = resolveSupabaseWorkerConfig(c.env);

  if (!url || !serviceKey) {
    return c.json({
      logs: [],
      message: "Supabase service key not configured in Worker bindings.",
    });
  }

  try {
    const supabaseAdmin = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });

    // 1. Verify user JWT
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return c.json({ error: "Invalid authentication token" }, 401);
    }

    // 2. Check profiles table for role = 'admin' (NO hardcoded credentials)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || profile?.role !== "admin") {
      return c.json({ error: "Forbidden: Admin role required (profiles.role = 'admin')" }, 403);
    }

    // 3. Fetch anonymous logs
    const { data: logs, error: logsError } = await supabaseAdmin
      .from("anonymous_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (logsError) {
      return c.json({ error: logsError.message }, 500);
    }

    return c.json({ logs });
  } catch (err: any) {
    return c.json({ error: err.message || "Failed to retrieve logs" }, 500);
  }
});

// 4. Chat endpoint matching exact SSE contract
app.post("/api/chat", async (c) => {
  const apiKey =
    c.env.GEMINI_API_KEY ||
    (typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : undefined);

  if (!apiKey) {
    return c.json(
      { error: "Gemini API key is not configured in Worker environment bindings." },
      500
    );
  }

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON request body." }, 400);
  }

  const { messages, profile } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return c.json({ error: "Messages array is required." }, 400);
  }

  return streamSSE(c, async (stream) => {
    try {
      const { baseUrl, headers } = resolveAiGatewayConfig(c.env);

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          ...(baseUrl ? { baseUrl } : {}),
          headers,
        },
      });

      const { formattedMessages } = processMedicalPipeline(messages, profile);

      const responseStream = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: formattedMessages,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          await stream.writeSSE({
            data: JSON.stringify({ text: chunk.text }),
          });
        }
      }

      await stream.writeSSE({
        data: "[DONE]",
      });
    } catch (error: any) {
      console.error("Error in Cloudflare Worker Gemini chat:", error);
      let errorMessage = "An error occurred while connecting to the AI service.";

      try {
        let parsedError = error;
        if (typeof error?.message === "string" && error.message.includes("{")) {
          try {
            const inner = JSON.parse(error.message);
            if (inner.error?.message) {
              parsedError = inner.error;
            }
          } catch {}
        }

        const status = parsedError.status || error.status;
        const msg = parsedError.message || error.message;

        if (status === 429 || (msg && (msg.includes("429") || msg.includes("Quota exceeded")))) {
          errorMessage = "Rate limit exceeded. Please wait a moment before trying again.";
        } else if (status === 503 || (msg && msg.includes("503"))) {
          errorMessage =
            "The AI service is currently experiencing high demand. Please try again in a few moments.";
        } else if (msg) {
          errorMessage =
            typeof msg === "string" && !msg.startsWith("{")
              ? msg
              : "An unexpected AI service error occurred.";
        }
      } catch {}

      await stream.writeSSE({
        data: JSON.stringify({ error: errorMessage }),
      });
      await stream.writeSSE({
        data: "[DONE]",
      });
    }
  });
});

// Fallback to static assets binding when served via Cloudflare Workers Static Assets
app.all("*", (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text("Not Found", 404);
});

export default app;
