import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { Lock, Unlock, Bot, ClipboardList, PlayCircle, Calendar, Clock, User, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { enrollInCourse, listMyEnrollments, listMyProgress } from "@/lib/enrollments.functions";

export const Route = createFileRoute("/_public/courses/$courseId")({
  component: CourseDetail,
  head: () => ({
    meta: [
      { title: "Course Details — Arsalan Academy" },
      { name: "description", content: "View Arsalan Academy course details, schedule, curriculum, enrollment status, and lesson access." },
      { property: "og:title", content: "Course Details — Arsalan Academy" },
      { property: "og:description", content: "View course details, schedule, curriculum, enrollment status, and lesson access at Arsalan Academy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function CourseDetail() {
  const { courseId } = Route.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const course = useStore((s) => s.courses.find((c) => c.id === courseId));
  const allLessons = useStore((s) => s.lessons);
  const lessons = useMemo(
    () => allLessons.filter((l) => l.courseId === courseId).sort((a, b) => a.day - b.day),
    [allLessons, courseId],
  );
  const email = useStore((s) => s.settings.email);
  const { session, role } = useAuth();
  const isStudent = !!session && role !== "admin";

  const enrollFn = useServerFn(enrollInCourse);
  const listEnrollmentsFn = useServerFn(listMyEnrollments);
  const listProgressFn = useServerFn(listMyProgress);

  const enrollmentsQ = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => listEnrollmentsFn({}),
    enabled: isStudent,
  });
  const progressQ = useQuery({
    queryKey: ["my-progress", courseId],
    queryFn: () => listProgressFn({ data: { courseId } }),
    enabled: isStudent,
  });

  if (!course) throw notFound();

  const enrolled = !!enrollmentsQ.data?.some((e) => e.course_id === courseId);
  const completedIds = new Set((progressQ.data ?? []).map((p) => p.lesson_id));
  const nextLesson = lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0];

  async function handleEnroll() {
    if (!session) {
      nav({ to: "/login" });
      return;
    }
    if (role === "admin") {
      toast.info("Admins don't need to enroll.");
      return;
    }
    try {
      await enrollFn({ data: { courseId } });
      await qc.invalidateQueries({ queryKey: ["my-enrollments"] });
      toast.success("Enrolled! You can now start the course.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Enrollment failed");
    }
  }

  const isLessonUnlocked = (index: number) => {
    if (!isStudent) return index === 0; // preview first for guests/admins
    if (!enrolled) return index === 0;
    // Sequential unlock: unlocked if previous completed, or it's the first
    if (index === 0) return true;
    return completedIds.has(lessons[index - 1].id);
  };

  return (
    <div>
      <section className="border-b bg-gradient-to-br from-[color:var(--brand-navy)] to-[color:var(--brand-navy)]/80 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
          <Link to="/courses" className="text-sm text-white/60 hover:text-white">← All courses</Link>
          <Badge className="mt-4 bg-[color:var(--brand-blue)] text-white hover:bg-[color:var(--brand-blue)]">{course.category}</Badge>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold md:text-5xl">{course.title}</h1>
          <p className="mt-4 max-w-2xl text-white/80">{course.description}</p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> Arsalan Munir</span>
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {course.daysLabel} · {course.daysPerWeek}/wk</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.dailyTimeLimit} min daily practice</span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:grid-cols-3 md:px-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold text-[color:var(--brand-navy)]">What you'll learn</h2>
          <ul className="mt-4 grid gap-2 text-sm text-foreground/80 md:grid-cols-2">
            {["Confident spoken English","Grammar mastered through practice","Exam techniques & timing","Writing structure & clarity","Listening & comprehension","Real feedback on your work"].map((x) => (
              <li key={x} className="flex gap-2"><span className="text-[color:var(--brand-blue)]">✓</span>{x}</li>
            ))}
          </ul>

          <h2 className="mt-12 text-2xl font-bold text-[color:var(--brand-navy)]">Curriculum</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {enrolled
              ? "Complete each lesson to unlock the next one."
              : "Preview the first lesson free. Enroll to unlock the full curriculum."}
          </p>
          <div className="mt-4">
            {lessons.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground">Lessons will appear here soon.</Card>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {lessons.map((l, i) => {
                  const unlocked = isLessonUnlocked(i);
                  const completed = completedIds.has(l.id);
                  return (
                    <AccordionItem key={l.id} value={l.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex flex-1 items-center gap-3 text-left">
                          {completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : unlocked ? (
                            <Unlock className="h-4 w-4 text-[color:var(--brand-blue)]" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="text-xs font-mono text-muted-foreground">Day {l.day}</span>
                          <span className="font-medium">{l.title}</span>
                          {i === 0 && !enrolled && (
                            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">Free preview</Badge>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap items-center gap-3 pl-7 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5" /> Video lesson</span>
                          {l.chatbotEnabled && <span className="flex items-center gap-1"><Bot className="h-3.5 w-3.5 text-[color:var(--brand-blue)]" /> AI chat practice</span>}
                          {l.quizEnabled && <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5 text-[color:var(--brand-blue)]" /> Quiz</span>}
                          {unlocked ? (
                            <Button asChild size="sm" className="ml-auto bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">
                              <Link to="/practice/$lessonId" params={{ lessonId: l.id }}>
                                {completed ? "Review lesson" : "Open lesson →"}
                              </Link>
                            </Button>
                          ) : (
                            <span className="ml-auto italic">Complete previous lesson to unlock</span>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="overflow-hidden py-0">
            <img src={course.thumbnail} alt={course.title} className="aspect-video w-full object-cover" />
            <div className="space-y-3 p-5">
              <p className="text-3xl font-bold text-[color:var(--brand-navy)]">{course.price}</p>

              {isStudent && enrolled ? (
                <>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Enrolled</Badge>
                  {nextLesson && (
                    <Button asChild className="w-full bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">
                      <Link to="/practice/$lessonId" params={{ lessonId: nextLesson.id }}>Continue Learning →</Link>
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    onClick={handleEnroll}
                    disabled={enrollmentsQ.isLoading}
                    className="w-full bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90"
                  >
                    {session ? "Enroll Now" : "Sign in to Enroll"}
                  </Button>
                  {lessons[0] && (
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/practice/$lessonId" params={{ lessonId: lessons[0].id }}>Preview first lesson</Link>
                    </Button>
                  )}
                  <a href={`mailto:${email}?subject=Enrollment: ${encodeURIComponent(course.title)}`} className="block text-center text-xs text-muted-foreground hover:text-primary">
                    Or contact us to enroll manually
                  </a>
                </>
              )}

              <div className="border-t pt-3 text-xs text-muted-foreground">
                <div className="flex justify-between py-1"><span>Level</span><span className="font-medium text-foreground">{course.level}</span></div>
                <div className="flex justify-between py-1"><span>Schedule</span><span className="font-medium text-foreground">{course.daysLabel}</span></div>
                <div className="flex justify-between py-1"><span>Daily practice</span><span className="font-medium text-foreground">{course.dailyTimeLimit} min</span></div>
                <div className="flex justify-between py-1"><span>Start date</span><span className="font-medium text-foreground">{course.startDate}</span></div>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
