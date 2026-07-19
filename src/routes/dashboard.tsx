import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { LogOut, BookOpen, Award } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  ssr: false,
  head: () => ({ meta: [{ title: "My Dashboard — Arsalan Academy" }, { name: "robots", content: "noindex" }] }),
});

function Dashboard() {
  const nav = useNavigate();
  const { session, role, fullName, loading, signOut } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!session) nav({ to: "/login", replace: true });
    else if (role === "admin") nav({ to: "/admin", replace: true });
  }, [loading, session, role, nav]);

  async function handleLogout() {
    await signOut();
    nav({ to: "/login", replace: true });
  }

  if (loading || !session || role === "admin") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <Link to="/"><Logo className="h-10 w-auto" /></Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground md:inline">{session.user.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <h1 className="text-3xl font-bold">Welcome, {fullName || session.user.email}!</h1>
        <p className="mt-1 text-muted-foreground">Here's your learning at a glance.</p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">My Courses</h2>
          <Card className="mt-4 border-dashed p-8 text-center text-sm text-muted-foreground">
            <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            You are not enrolled in any courses yet.
          </Card>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">My Certificates</h2>
          <Card className="mt-4 border-dashed p-8 text-center text-sm text-muted-foreground">
            <Award className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            You don't have any certificates yet.
          </Card>
        </section>
      </main>
    </div>
  );
}
