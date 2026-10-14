import React, { useState } from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Globe, Shield, Database, User, Check, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { profile, updateProfile, isConfigured } = useAuth();
  const [language, setLanguage] = useState(profile?.language || "english");
  const [savingLanguage, setSavingLanguage] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (profile?.language) {
      setLanguage(profile.language);
    }
  }, [profile?.language]);

  const handleLanguageChange = async (newLang: string) => {
    setLanguage(newLang);
    setSavingLanguage(true);
    setStatusMessage(null);

    const res = await updateProfile({ language: newLang });
    setSavingLanguage(false);

    if (res.error) {
      setStatusMessage(`Failed to save: ${res.error}`);
    } else {
      setStatusMessage(`Language set to ${newLang.toUpperCase()} and persisted in Supabase.`);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto px-4 py-8 md:p-12 bg-[#F1F5F9]">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Manage your language preference and profile configuration (stored in Supabase).
            </p>
          </div>

          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {statusMessage}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 divide-y divide-slate-100 overflow-hidden">
            {/* Preferences */}
            <div className="p-6 md:p-8 space-y-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">
                Preferences
              </h2>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Preferred Language</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select your language preference for medical guidance (persisted in Supabase).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    disabled={savingLanguage}
                    aria-label="Preferred Language"
                    className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block px-3 py-2 outline-none cursor-pointer"
                  >
                    <option value="english">EN - English</option>
                    <option value="spanish">ES - Español</option>
                    <option value="french">FR - Français</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Profile Management Link */}
            <div className="p-6 md:p-8 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                Profile Management
              </h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Basic Info & Demographics</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Name: <span className="font-semibold text-slate-700">{profile?.name || "Patient"}</span> • Age Range: <span className="font-semibold text-slate-700">{profile?.age_range || "25-34"}</span>
                    </p>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Manage Profile
                </Link>
              </div>
            </div>

            {/* Privacy & Data */}
            <div className="p-6 md:p-8 space-y-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wide">
                Privacy & Data Security
              </h2>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Privacy Guard</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      No sensitive medical data is stored beyond chat history that you own.
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 text-slate-600 rounded-lg flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Database Connection</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Backend: {isConfigured ? "Supabase Live" : "Local Preview Mode"}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {profile?.id ? profile.id.slice(0, 10) + "..." : "local-user"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
