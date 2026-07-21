import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookOpen, Award, LogOut, ArrowRight } from "lucide-react";

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

  const displayName = fullName || session.user.email?.split("@")[0] || "Student";

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
        {/* Welcome hero */}
        <section className="border-b bg-gradient-to-br from-[color:var(--brand-navy)] to-[color:var(--brand-blue)] text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-white/70">Student Dashboard</p>
              <h1 className="mt-1 text-3xl font-bold md:text-4xl">Welcome, {displayName}!</h1>
              <p className="mt-2 text-sm text-white/80">Track your courses, certificates, and daily practice.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="secondary" className="bg-white text-[color:var(--brand-navy)] hover:bg-white/90">
                <Link to="/courses">Explore Courses <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" onClick={handleLogout} className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          <section>
            <div className="flex items-end justify-between">
              <h2 className="text-xl font-semibold">My Courses</h2>
              <Link to="/courses" className="text-sm font-medium text-primary hover:underline">Browse catalog →</Link>
            </div>
            <Card className="mt-4 border-dashed p-10 text-center">
              <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">You are not enrolled in any courses yet.</p>
              <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
                <Link to="/courses">Explore Courses</Link>
              </Button>
            </Card>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">My Certificates</h2>
            <Card className="mt-4 border-dashed p-10 text-center">
              <Award className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">You don't have any certificates yet.</p>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
