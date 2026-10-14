import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured, logAnonymousMetric } from "../lib/supabase";
import { Profile } from "../types";

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  age_range: string;
  language: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isConfigured: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (params: SignUpParams) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<Profile, "name" | "age_range" | "language">>) => Promise<{ error: string | null }>;
  signInDemo: (role: "user" | "admin") => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PREVIEW_STORAGE_KEY = "health_app_preview_auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const fetchProfile = async (userId: string, userMeta?: any): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (data) {
        return data as Profile;
      }

      if (error && error.code !== "PGRST116") {
        console.warn("Could not query profiles table:", error.message);
      }

      // If profile record doesn't exist yet, insert a default one
      const newProfile: Profile = {
        id: userId,
        name: userMeta?.name || "Patient",
        age_range: userMeta?.age_range || "25-34",
        language: userMeta?.language || "english",
        role: (userMeta?.role as "user" | "admin") || "user",
      };

      const { data: inserted, error: insertError } = await supabase
        .from("profiles")
        .upsert(newProfile)
        .select()
        .single();

      if (inserted && !insertError) {
        return inserted as Profile;
      }
      return newProfile;
    } catch (err) {
      console.error("Error in fetchProfile:", err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    if (isConfigured) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          const prof = await fetchProfile(session.user.id, session.user.user_metadata);
          if (mounted) setProfile(prof);
        }
        if (mounted) setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          if (!mounted) return;
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            const prof = await fetchProfile(session.user.id, session.user.user_metadata);
            if (mounted) setProfile(prof);
          } else {
            if (mounted) setProfile(null);
          }
          if (mounted) setLoading(false);
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Offline/Preview Fallback
      try {
        const saved = sessionStorage.getItem(PREVIEW_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setUser(parsed.user);
          setProfile(parsed.profile);
        }
      } catch {}
      setLoading(false);
      return () => {
        mounted = false;
      };
    }
  }, [isConfigured]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    if (!isConfigured) {
      // In preview mode without Supabase credentials
      const dummyId = "demo-" + Math.random().toString(36).substring(2, 9);
      const isDemoAdmin = email.toLowerCase().includes("admin");
      const demoProfile: Profile = {
        id: dummyId,
        name: email.split("@")[0] || "Demo User",
        age_range: "25-34",
        language: "english",
        role: isDemoAdmin ? "admin" : "user",
      };
      const demoUser = { id: dummyId, email } as User;
      setUser(demoUser);
      setProfile(demoProfile);
      try {
        sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify({ user: demoUser, profile: demoProfile }));
      } catch {}
      await logAnonymousMetric("user_login_preview", "info");
      return { error: null };
    }

    try {
      const startTime = performance.now();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        await logAnonymousMetric("auth_login_error", "warn");
        return { error: error.message };
      }

      if (data.user) {
        const prof = await fetchProfile(data.user.id, data.user.user_metadata);
        setProfile(prof);
        await logAnonymousMetric("auth_login_success", "info", performance.now() - startTime);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to sign in" };
    }
  };

  const signUp = async ({
    email,
    password,
    name,
    age_range,
    language,
  }: SignUpParams): Promise<{ error: string | null }> => {
    if (!isConfigured) {
      const dummyId = "demo-" + Math.random().toString(36).substring(2, 9);
      const demoProfile: Profile = {
        id: dummyId,
        name,
        age_range,
        language,
        role: "user",
      };
      const demoUser = { id: dummyId, email } as User;
      setUser(demoUser);
      setProfile(demoProfile);
      try {
        sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify({ user: demoUser, profile: demoProfile }));
      } catch {}
      await logAnonymousMetric("user_register_preview", "info");
      return { error: null };
    }

    try {
      const startTime = performance.now();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            age_range,
            language,
            role: "user",
          },
        },
      });

      if (error) {
        await logAnonymousMetric("auth_register_error", "warn");
        return { error: error.message };
      }

      if (data.user) {
        // Explicitly create profile record
        const newProfile: Profile = {
          id: data.user.id,
          name,
          age_range,
          language,
          role: "user",
        };

        await supabase.from("profiles").upsert(newProfile);
        setProfile(newProfile);
        await logAnonymousMetric("auth_register_success", "info", performance.now() - startTime);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "Failed to create account" };
    }
  };

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    try {
      sessionStorage.removeItem(PREVIEW_STORAGE_KEY);
    } catch {}
    await logAnonymousMetric("user_logout", "info");
  };

  const updateProfile = async (
    updates: Partial<Pick<Profile, "name" | "age_range" | "language">>
  ): Promise<{ error: string | null }> => {
    if (!profile) return { error: "No profile loaded" };

    const updatedProfile: Profile = {
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isConfigured && user) {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) {
        return { error: error.message };
      }
    }

    setProfile(updatedProfile);
    if (!isConfigured) {
      try {
        sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify({ user, profile: updatedProfile }));
      } catch {}
    }
    await logAnonymousMetric("profile_updated", "info");
    return { error: null };
  };

  const signInDemo = (role: "user" | "admin") => {
    const dummyId = `demo-${role}-${Math.random().toString(36).substring(2, 7)}`;
    const demoProfile: Profile = {
      id: dummyId,
      name: role === "admin" ? "Health Admin" : "Alex Patient",
      age_range: "25-34",
      language: "english",
      role,
    };
    const demoUser = {
      id: dummyId,
      email: `${role}@example.health`,
    } as User;

    setUser(demoUser);
    setProfile(demoProfile);
    try {
      sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify({ user: demoUser, profile: demoProfile }));
    } catch {}
    logAnonymousMetric(`demo_${role}_session`, "info");
  };

  // Strictly check profiles.role = 'admin' (NO hardcoded credentials)
  const isAdmin = profile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isConfigured,
        isAdmin,
        signIn,
        signUp,
        signOut,
        updateProfile,
        signInDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
