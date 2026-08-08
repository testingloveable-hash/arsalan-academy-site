import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Login — Arsalan Academy" }] }),
});

function LoginPage() {
  const nav = useNavigate();
  const { session, role, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session && role) {
      nav({ to: role === "admin" ? "/admin" : "/dashboard", replace: true });
    }
  }, [loading, session, role, nav]);

  // Fallback: if session exists but role hasn't loaded yet, load it explicitly.
  useEffect(() => {
    if (!loading && session && !role) {
      supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          const r = (data as { role?: string } | null)?.role;
          nav({ to: r === "admin" ? "/admin" : "/dashboard", replace: true });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, session, role]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("[Login] signInWithPassword error:", error);
      setBusy(false);
      setErr(`${error.message}${error.status ? ` (status ${error.status})` : ""}`);
      return;
    }
    if (!data.user) {
      setBusy(false);
      setErr("Login succeeded but no user was returned.");
      return;
    }
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    setBusy(false);
    if (profileErr) {
      console.error("[Login] profile fetch error:", profileErr);
      setErr(`Signed in, but failed to load profile: ${profileErr.message}`);
      return;
    }
    console.log("[Login] profile:", profile);
    if (profile?.role === "admin") nav({ to: "/admin", replace: true });
    else nav({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 flex justify-center"><Logo className="h-12 w-auto" /></div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to continue your learning.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && <p className="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
          <Button type="submit" disabled={busy} className="w-full bg-primary hover:bg-primary/90">
            {busy ? "Signing in…" : "Login"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-primary hover:underline">Sign Up</Link>
        </p>
      </Card>
    </div>
  );
}
