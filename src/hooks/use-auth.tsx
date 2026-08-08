import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "student";

interface AuthState {
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  fullName: string;
  /** true while session OR profile/role is still resolving */
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

/** Fetch the profile row, retrying briefly in case the signup trigger hasn't run yet. */
export async function fetchProfile(userId: string, attempts = 4) {
  for (let i = 0; i < attempts; i++) {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", userId)
      .maybeSingle();
    if (!error && data) return data as { full_name: string | null; role: string | null };
    await new Promise((r) => setTimeout(r, 300 * (i + 1)));
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [fullName, setFullName] = useState("");
  const [sessionLoading, setSessionLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  async function loadRoleAndProfile(userId: string) {
    setProfileLoading(true);
    try {
      const profile = await fetchProfile(userId);
      if (profile) {
        setRole(profile.role === "admin" ? "admin" : "student");
        setFullName(profile.full_name ?? "");
      }
    } finally {
      setProfileLoading(false);
    }
  }

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        setProfileLoading(true);
        setTimeout(() => void loadRoleAndProfile(sess.user.id), 0);
      } else {
        setRole(null);
        setFullName("");
        setProfileLoading(false);
      }
    });
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (data.session?.user) await loadRoleAndProfile(data.session.user.id);
      setSessionLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthState = {
    session,
    user: session?.user ?? null,
    role,
    fullName,
    loading: sessionLoading || profileLoading,
    signOut: async () => {
      await supabase.auth.signOut();
      setRole(null);
      setFullName("");
    },
    refresh: async () => {
      if (session?.user) await loadRoleAndProfile(session.user.id);
    },
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
