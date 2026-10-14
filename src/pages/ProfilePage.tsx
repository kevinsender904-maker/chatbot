import React, { useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { User, Activity, Edit2, Check, X, Shield, Globe, Calendar, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { profile, user, updateProfile, isConfigured } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile?.name || "");
  const [ageRange, setAgeRange] = useState(profile?.age_range || "25-34");
  const [language, setLanguage] = useState(profile?.language || "english");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (profile) {
      setName(profile.name);
      setAgeRange(profile.age_range);
      setLanguage(profile.language);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await updateProfile({
      name,
      age_range: ageRange,
      language,
    });

    setSaving(false);
    if (res.error) {
      setMessage(`Error: ${res.error}`);
    } else {
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    }
  };

  const getInitials = (n: string) => {
    if (!n) return "PT";
    return n
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto px-4 py-8 md:p-12 bg-[#F1F5F9]">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Your Profile</h1>
              <p className="text-slate-500 mt-2 text-sm">
                Managed securely with Supabase database (<code className="font-mono">profiles</code> table).
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 shadow-sm transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>

          {message && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-700">
              {message}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header Card */}
            <div className="p-8 flex flex-col md:flex-row items-center gap-6 border-b border-slate-100">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 font-bold rounded-2xl flex items-center justify-center text-2xl border border-blue-100 shadow-sm">
                {getInitials(profile?.name || name)}
              </div>
              <div className="text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{profile?.name || "Patient"}</h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      profile?.role === "admin"
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    Role: {profile?.role || "user"}
                  </span>
                </div>
                <div className="flex items-center justify-center md:justify-start gap-1.5 text-xs text-slate-500 mt-1.5 font-medium">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Email: {user?.email || "patient@healthcare.ai"} • Database ID:{" "}
                    <span className="font-mono text-[11px] text-slate-600">
                      {profile?.id ? profile.id.slice(0, 12) + "..." : "local-preview"}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Fields */}
            {!isEditing ? (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Full Name
                  </p>
                  <p className="text-sm text-slate-900 font-semibold">{profile?.name || "Patient"}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Age Range
                  </p>
                  <p className="text-sm text-slate-900 font-semibold">{profile?.age_range || "25-34"}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Preferred Language
                  </p>
                  <p className="text-sm text-slate-900 font-semibold capitalize">
                    {profile?.language || "english"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    System Role (<code className="font-mono">profiles.role</code>)
                  </p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">
                    {profile?.role === "admin" ? "Administrator (Full Access)" : "Patient User"}
                  </p>
                </div>

                <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
                    Medical Data Ownership
                  </p>
                  <p className="text-xs text-blue-900 leading-relaxed">
                    Under system policy, no sensitive medical diagnoses or records are retained beyond
                    the chat sessions and messages you personally create and own.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="p-8 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Age Range</label>
                    <select
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Under 18">Under 18</option>
                      <option value="18-24">18–24</option>
                      <option value="25-34">25–34</option>
                      <option value="35-49">35–49</option>
                      <option value="50-64">50–64</option>
                      <option value="65+">65+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="english">English</option>
                      <option value="spanish">Español</option>
                      <option value="french">Français</option>
                      <option value="german">Deutsch</option>
                      <option value="chinese">中文</option>
                      <option value="arabic">العربية</option>
                      <option value="hindi">हिन्दी</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
