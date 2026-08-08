import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookOpen, LogOut, ArrowRight, PlayCircle, Award } from "lucide-react";
import { useStore } from "@/lib/store";
import { listMyEnrollments } from "@/lib/enrollments.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
  ssr: false,
  head: () => ({ meta: [{ title: "My Dashboard — Arsalan Academy" }, { name: "robots", content: "noindex" }] }),
});

function Dashboard() {
  const nav = useNavigate();
  const { session, role, fullName, loading, signOut } = useAuth();
  const allCourses = useStore((s) => s.courses);
  const allLessons = useStore((s) => s.lessons);
  const email = useStore((s) => s.settings.email);
  const listEnrollmentsFn = useServerFn(listMyEnrollments);

  useEffect(() => {
    if (loading) return;
    if (!session) nav({ to: "/login", replace: true });
    else if (role === "admin") nav({ to: "/admin", replace: true });
  }, [loading, session, role, nav]);

  const enrollmentsQ = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => listEnrollmentsFn({}),
    enabled: !!session && role !== "admin",
  });

  const enrolledCourseIds = (enrollmentsQ.data ?? []).map((e) => e.course_id);

  const progressQ = useQuery({
    queryKey: ["my-progress-all", enrolledCourseIds],
    queryFn: async () => {
      if (enrolledCourseIds.length === 0) return [] as { lesson_id: string; course_id: string }[];
      const { data, error } = await supabase
        .from("lesson_progress")
        .select("lesson_id, course_id")
        .in("course_id", enrolledCourseIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: enrolledCourseIds.length > 0,
  });

  const certificatesQ = useQuery({
    queryKey: ["my-certificates", session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("id, number, course_title, completion_date")
        .order("issued_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as { id: string; number: string; course_title: string; completion_date: string }[];
    },
    enabled: !!session && role !== "admin",
  });


  async function handleLogout() {
    await signOut();
    nav({ to: "/login", replace: true });
  }

  if (loading || !session || role === "admin") {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  const displayName = fullName || session.user.email?.split("@")[0] || "Student";
  const enrolledCourses = allCourses.filter((c) => enrolledCourseIds.includes(c.id));

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/30">
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

            {enrollmentsQ.isLoading ? (
              <Card className="mt-4 p-10 text-center text-sm text-muted-foreground">Loading your courses…</Card>
            ) : enrolledCourses.length === 0 ? (
              <Card className="mt-4 border-dashed p-10 text-center">
                <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">You are not enrolled in any courses yet.</p>
                <Button asChild className="mt-4 bg-primary hover:bg-primary/90">
                  <Link to="/courses">Explore Courses</Link>
                </Button>
              </Card>
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {enrolledCourses.map((c) => {
                  const courseLessons = allLessons.filter((l) => l.courseId === c.id).sort((a, b) => a.day - b.day);
                  const completedForCourse = (progressQ.data ?? []).filter((p) => p.course_id === c.id).length;
                  const pct = courseLessons.length > 0 ? Math.round((completedForCourse / courseLessons.length) * 100) : 0;
                  const nextLesson = courseLessons.find((l) => !(progressQ.data ?? []).some((p) => p.lesson_id === l.id)) ?? courseLessons[0];
                  const mailto = `mailto:${email}?subject=${encodeURIComponent("Extra Practice Time Request")}&body=${encodeURIComponent(`Hi Arsalan Academy,\n\nI am ${displayName} and I am enrolled in "${c.title}". I would like to request additional daily practice time.\n\nThank you!`)}`;
                  return (
                    <Card key={c.id} className="flex flex-col overflow-hidden py-0">
                      <div className="aspect-video overflow-hidden bg-muted">
                        <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <h3 className="font-semibold text-[color:var(--brand-navy)]">{c.title}</h3>
                        <div>
                          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{completedForCourse}/{courseLessons.length} lessons · {pct}%</span>
                          </div>
                          <Progress value={pct} />
                        </div>
                        <p className="text-xs text-muted-foreground">Daily practice: {c.dailyTimeLimit} min</p>
                        <div className="mt-auto flex flex-wrap gap-2">
                          {nextLesson && (
                            <Button asChild size="sm" className="bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">
                              <Link to="/practice/$lessonId" params={{ lessonId: nextLesson.id }}>
                                <PlayCircle className="mr-1 h-4 w-4" /> Continue Learning
                              </Link>
                            </Button>
                          )}
                          <Button asChild size="sm" variant="outline">
                            <Link to="/courses/$courseId" params={{ courseId: c.id }}>View course</Link>
                          </Button>
                          <Button asChild size="sm" variant="ghost">
                            <a href={mailto}>Need More Time?</a>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-semibold">My Certificates</h2>
            {certificatesQ.isLoading ? (
              <Card className="mt-4 p-10 text-center text-sm text-muted-foreground">Loading certificates…</Card>
            ) : (certificatesQ.data ?? []).length === 0 ? (
              <Card className="mt-4 border-dashed p-10 text-center">
                <Award className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  No certificates yet. Finish a course to earn your first one.
                </p>
              </Card>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {(certificatesQ.data ?? []).map((c) => (
                  <Card key={c.id} className="flex items-center gap-4 p-5">
                    <Award className="h-8 w-8 shrink-0 text-[color:var(--brand-blue)]" />
                    <div>
                      <p className="font-semibold text-[color:var(--brand-navy)]">{c.course_title}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.number} · Completed {c.completion_date}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

      </main>
      <Footer />
    </div>
  );
}
