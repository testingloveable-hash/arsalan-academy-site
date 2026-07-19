import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  ssr: false,
  head: () => ({ meta: [{ title: "Sign Up — Arsalan Academy" }] }),
});

function SignupPage() {
  const nav = useNavigate();
  const { session, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) nav({ to: "/dashboard", replace: true });
  }, [loading, session, nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (password !== confirm) { setErr("Passwords do not match."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    nav({ to: "/dashboard", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 flex justify-center"><Logo className="h-12 w-auto" /></div>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start learning with Arsalan Academy.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          {err && <p className="rounded bg-destructive/10 px-3 py-2 text-sm text-destructive">{err}</p>}
          <Button type="submit" disabled={busy} className="w-full bg-primary hover:bg-primary/90">
            {busy ? "Creating account…" : "Sign Up"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">Login</Link>
        </p>
      </Card>
    </div>
  );
}
