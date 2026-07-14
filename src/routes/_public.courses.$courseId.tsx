import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Lock, Unlock, Bot, ClipboardList, PlayCircle, Calendar, Clock, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_public/courses/$courseId")({
  component: CourseDetail,
});

function CourseDetail() {
  const { courseId } = Route.useParams();
  const course = useStore((s) => s.courses.find((c) => c.id === courseId));
  const lessons = useStore((s) => s.lessons.filter((l) => l.courseId === courseId).sort((a, b) => a.day - b.day));
  const email = useStore((s) => s.settings.email);

  if (!course) throw notFound();

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
          <p className="mt-1 text-sm text-muted-foreground">Lessons unlock day-by-day. Practice follows each video.</p>
          <div className="mt-4">
            {lessons.length === 0 ? (
              <Card className="p-6 text-sm text-muted-foreground">Lessons will appear here soon.</Card>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {lessons.map((l, i) => {
                  const locked = i > 0;
                  return (
                    <AccordionItem key={l.id} value={l.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex flex-1 items-center gap-3 text-left">
                          {locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Unlock className="h-4 w-4 text-[color:var(--brand-blue)]" />}
                          <span className="text-xs font-mono text-muted-foreground">Day {l.day}</span>
                          <span className="font-medium">{l.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap items-center gap-3 pl-7 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5" /> Video lesson</span>
                          {l.chatbotEnabled && <span className="flex items-center gap-1"><Bot className="h-3.5 w-3.5 text-[color:var(--brand-blue)]" /> AI chat practice</span>}
                          {l.quizEnabled && <span className="flex items-center gap-1"><ClipboardList className="h-3.5 w-3.5 text-[color:var(--brand-blue)]" /> Quiz</span>}
                          {!locked && (
                            <Button asChild size="sm" className="ml-auto bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">
                              <Link to="/practice/$lessonId" params={{ lessonId: l.id }}>Try lesson demo →</Link>
                            </Button>
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
              <Button asChild className="w-full bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">
                <a href={`mailto:${email}?subject=Enrollment: ${encodeURIComponent(course.title)}`}>Enroll now</a>
              </Button>
              {lessons[0] && (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/practice/$lessonId" params={{ lessonId: lessons[0].id }}>Try free demo lesson</Link>
                </Button>
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