import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/Logo";
import { LogOut, Download, Timer, Mail, Award } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  ssr: false,
  head: () => ({ meta: [{ title: "My Dashboard — Arsalan Academy" }, { name: "robots", content: "noindex" }] }),
});

function Dashboard() {
  const nav = useNavigate();
  const { session, role, fullName, loading, signOut } = useAuth();
  const courses = useStore((s) => s.courses);
  const certificates = useStore((s) => s.certificates);
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    if (loading) return;
    if (!session) nav({ to: "/login", replace: true });
    else if (role === "admin") nav({ to: "/admin", replace: true });
  }, [loading, session, role, nav]);

  // Mock enrollment: first 3 courses
  const myCourses = useMemo(() => courses.slice(0, 3).map((c, i) => ({
    ...c,
    progress: [65, 30, 10][i] ?? 0,
    timeUsed: [8, 5, 2][i] ?? 0,
  })), [courses]);

  const myCerts = useMemo(
    () => certificates.filter((c) => c.studentName.toLowerCase() === fullName.toLowerCase()),
    [certificates, fullName],
  );

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
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((c) => {
              const remaining = Math.max(0, c.dailyTimeLimit - c.timeUsed);
              const subject = encodeURIComponent("Extra Practice Time Request");
              const body = encodeURIComponent(
                `Hello,\n\nMy name is ${fullName || session.user.email}. I would like to request additional daily practice time for the course "${c.title}".\n\nThank you,\n${fullName}`,
              );
              return (
                <Card key={c.id} className="flex flex-col p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--brand-blue)]">{c.category}</p>
                  <h3 className="mt-1 font-semibold">{c.title}</h3>
                  <div className="mt-4 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span><span>{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} />
                  </div>
                  <div className="mt-4 flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
                    <Timer className="h-4 w-4 text-[color:var(--brand-blue)]" />
                    <span><b>{remaining} min</b> practice time left today</span>
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <a href={`mailto:${settings.email}?subject=${subject}&body=${body}`}>
                      <Mail className="mr-2 h-4 w-4" /> Need More Time?
                    </a>
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">My Certificates</h2>
          {myCerts.length === 0 ? (
            <Card className="mt-4 border-dashed p-6 text-center text-sm text-muted-foreground">
              <Award className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              No certificates yet. Complete a course to earn one!
            </Card>
          ) : (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {myCerts.map((c) => (
                <Card key={c.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-semibold">{c.courseTitle}</p>
                    <p className="text-xs text-muted-foreground">{c.number} · {c.completionDate}</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/certificates"><Download className="mr-2 h-4 w-4" /> PDF</Link>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
