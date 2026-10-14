import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Stethoscope,
  MessageSquare,
  HeartPulse,
  User,
  Settings,
  Shield,
  LogIn,
  LogOut,
  Database,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AuthModal } from "./AuthModal";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { profile, user, isAdmin, signOut, isConfigured } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  const navItems = [
    { name: "Chat", path: "/chat", icon: MessageSquare },
    { name: "Tips", path: "/tips", icon: HeartPulse },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ name: "Admin Portal", path: "/admin", icon: Shield });
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#1E293B] font-sans flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 shadow-sm flex justify-between items-center shrink-0">
        <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-slate-900">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span>
            HealthCare <span className="text-blue-600">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg bg-slate-50"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthModalMode("signin");
                setAuthModalOpen(true);
              }}
              className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 min-h-screen shrink-0">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-tight text-slate-900">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span>
              HealthCare <span className="text-blue-600">AI</span>
            </span>
          </Link>
          <div className="flex items-center justify-between mt-2">
            <p className="text-slate-400 text-xs font-medium tracking-wide uppercase">
              Virtual Assistant
            </p>
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isConfigured
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}
            >
              <Database className="w-2.5 h-2.5" />
              {isConfigured ? "Supabase Live" : "Supabase Ready"}
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 pb-2">
          {user ? (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {profile?.name || user.email?.split("@")[0] || "Patient"}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => signOut()}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="mt-2 flex items-center justify-between">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    profile?.role === "admin"
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {profile?.role === "admin" ? "Admin" : "Patient"}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">{profile?.language || "EN"}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
              <p className="text-xs text-slate-600 font-medium">Have an account?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAuthModalMode("signin");
                    setAuthModalOpen(true);
                  }}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode("signup");
                    setAuthModalOpen(true);
                  }}
                  className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            const isAdminItem = item.path === "/admin";
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? isAdminItem
                      ? "bg-purple-50 text-purple-700 font-semibold border-l-2 border-purple-600 pl-3"
                      : "bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600 pl-3"
                    : isAdminItem
                    ? "text-purple-600 hover:bg-purple-50/60 font-medium"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive
                      ? isAdminItem
                        ? "text-purple-600"
                        : "text-blue-600"
                      : isAdminItem
                      ? "text-purple-600"
                      : "opacity-80"
                  }`}
                />
                <span className="text-xs font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Medical disclaimer footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0"></div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Not for emergencies. Call 911 immediately if you need urgent care.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-60px)] md:h-screen w-full overflow-hidden">
        {children}
      </main>

      {/* Mobile Bottom Tab Navigation */}
      <nav className="md:hidden bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] shrink-0 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-blue-500"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "fill-blue-50" : ""}`} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </div>
  );
}
