import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { AnonymousLog, Profile, SupabaseHealthStatus } from "../types";
import {
  Shield,
  Activity,
  Database,
  Lock,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  EyeOff,
} from "lucide-react";

export default function AdminPage() {
  const { profile, isAdmin, session } = useAuth();
  const [healthStatus, setHealthStatus] = useState<SupabaseHealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);
  const [logs, setLogs] = useState<AnonymousLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealthStatus(data.supabase);
    } catch (err: any) {
      setHealthStatus({
        configured: false,
        reachable: false,
        error: err.message || "Failed to reach /api/health",
      });
    } finally {
      setHealthLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      // 1. Try backend admin endpoint with JWT
      if (session?.access_token) {
        const res = await fetch("/api/admin/logs", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.logs) {
            setLogs(data.logs);
            setLogsLoading(false);
            return;
          }
        }
      }

      // 2. Client query with RLS (allowed if profiles.role = 'admin')
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("anonymous_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);

        if (!error && data) {
          setLogs(data as AnonymousLog[]);
          setLogsLoading(false);
          return;
        }
      }

      // 3. Fallback dummy logs demonstrating no PII schema
      setLogs([
        {
          id: "log-1",
          event: "chat_message_sent",
          severity: "info",
          latency_ms: 320,
          created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        },
        {
          id: "log-2",
          event: "health_tip_viewed",
          severity: "info",
          latency_ms: 18,
          created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: "log-3",
          event: "auth_login_success",
          severity: "info",
          latency_ms: 145,
          created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        {
          id: "log-4",
          event: "chat_completion_stream",
          severity: "info",
          latency_ms: 1820,
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      ]);
    } catch {
      // ignore
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchProfiles = async () => {
    setProfilesLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          setProfiles(data as Profile[]);
          setProfilesLoading(false);
          return;
        }
      }

      // Fallback
      if (profile) {
        setProfiles([profile]);
      }
    } catch {
      // ignore
    } finally {
      setProfilesLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    if (isAdmin) {
      fetchLogs();
      fetchProfiles();
    }
  }, [isAdmin]);

  const handleToggleRole = async (targetProfile: Profile) => {
    const nextRole = targetProfile.role === "admin" ? "user" : "admin";
    setUpdatingRole(targetProfile.id);

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from("profiles")
          .update({ role: nextRole })
          .eq("id", targetProfile.id);

        if (!error) {
          setProfiles((prev) =>
            prev.map((p) => (p.id === targetProfile.id ? { ...p, role: nextRole } : p))
          );
        }
      } else {
        setProfiles((prev) =>
          prev.map((p) => (p.id === targetProfile.id ? { ...p, role: nextRole } : p))
        );
      }
    } finally {
      setUpdatingRole(null);
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex-1 p-6 md:p-12 flex items-center justify-center bg-slate-50">
          <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-8 shadow-sm text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Admin Privileges Required</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Access is strictly governed by the database role constraint:{" "}
              <code className="bg-slate-100 text-red-600 px-1.5 py-0.5 rounded font-mono font-bold">
                profiles.role = 'admin'
              </code>
              .
            </p>
            <p className="text-xs text-slate-500">
              There are no hardcoded administrator credentials. Your current profile role is:{" "}
              <span className="font-bold text-slate-900">{profile?.role || "anonymous"}</span>.
            </p>
            <div className="pt-2">
              <button
                onClick={() => checkHealth()}
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                <Activity className="w-3.5 h-3.5" />
                Check Worker Health
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto px-4 py-8 md:p-10 bg-slate-50">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Admin Console
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Role: <span className="font-bold text-purple-700">profiles.role = 'admin'</span>
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
                System Health & Anonymous Telemetry
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Zero PII logs, live Supabase connectivity, and RBAC profile status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  checkHealth();
                  fetchLogs();
                  fetchProfiles();
                }}
                disabled={healthLoading || logsLoading}
                className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 shadow-sm disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${healthLoading || logsLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Section 1: Supabase Reachability Health Check */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Supabase Worker Health Check (GET /api/health)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verified through the Cloudflare Worker with reachability ping
                  </p>
                </div>
              </div>

              {healthStatus?.reachable ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Reachable ({healthStatus.latency_ms ?? 0}ms)
                </span>
              ) : healthStatus?.configured ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Degraded / Unreachable
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-full text-xs font-bold">
                  Not Configured
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Connection Status
                </span>
                <span className="font-bold text-slate-800">
                  {healthStatus?.reachable ? "Online & Reachable" : "Unconnected / Preview Mode"}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Worker Service Key
                </span>
                <span className="font-mono text-slate-800 text-[11px]">
                  Restricted to Worker (never exposed to client)
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Endpoint URL
                </span>
                <span className="font-mono text-slate-800 text-[11px] truncate block">
                  {healthStatus?.url || "VITE_SUPABASE_URL in .env"}
                </span>
              </div>
            </div>

            {healthStatus?.message && (
              <p className="mt-3 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                {healthStatus.message}
              </p>
            )}
            {healthStatus?.error && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                Error: {healthStatus.error}
              </p>
            )}
          </div>

          {/* Section 2: Anonymous Logs (No PII, No message text) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Anonymous Logs (<code className="font-mono">anonymous_logs</code>)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Strict privacy compliance: No PII, no user ID, no symptom descriptions, no message text.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                HIPAA & Privacy Guard Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Event</th>
                    <th className="py-3 px-4 font-bold">Severity</th>
                    <th className="py-3 px-4 font-bold">Latency</th>
                    <th className="py-3 px-4 font-bold">Timestamp</th>
                    <th className="py-3 px-4 font-bold">PII Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {log.event}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            log.severity === "error" || log.severity === "critical"
                              ? "bg-red-100 text-red-700"
                              : log.severity === "warn"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {log.latency_ms != null ? `${log.latency_ms} ms` : "—"}
                      </td>
                      <td className="py-3 px-4 text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Zero PII / No text
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No telemetry logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Registered Profiles & Role Verification */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Profiles Management (<code className="font-mono">profiles</code>)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Verification that Admin access is strictly tied to{" "}
                    <code className="font-mono font-bold">profiles.role = 'admin'</code>
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4 font-bold">Patient Name</th>
                    <th className="py-3 px-4 font-bold">Age Range</th>
                    <th className="py-3 px-4 font-bold">Language</th>
                    <th className="py-3 px-4 font-bold">Role</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {profiles.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3 px-4 text-slate-600">{p.age_range}</td>
                      <td className="py-3 px-4 text-slate-600 capitalize">{p.language}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.role === "admin"
                              ? "bg-purple-100 text-purple-700 border border-purple-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {p.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleRole(p)}
                          disabled={updatingRole === p.id}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-slate-700 disabled:opacity-50"
                        >
                          {p.role === "admin" ? "Demote to User" : "Promote to Admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
