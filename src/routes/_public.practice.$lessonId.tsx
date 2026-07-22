import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { PlayCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { PracticePanel } from "@/components/PracticePanel";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { issueCertificateForCompletion } from "@/lib/certificates.functions";

export const Route = createFileRoute("/_public/practice/$lessonId")({
  component: PracticeDemo,
});

function PracticeDemo() {
  const { lessonId } = Route.useParams();
  const lesson = useStore((s) => s.lessons.find((l) => l.id === lessonId));
  const lessons = useStore((s) => s.lessons);
  const course = useStore((s) => s.courses.find((c) => c.id === lesson?.courseId));
  const email = useStore((s) => s.settings.email);
  const { session, role } = useAuth();
  const issueCert = useServerFn(issueCertificateForCompletion);
  const firedRef = useRef(false);

  const isFinalLesson = useMemo(() => {
    if (!lesson || !course) return false;
    const courseLessons = lessons.filter((l) => l.courseId === course.id);
    const maxDay = Math.max(...courseLessons.map((l) => l.day));
    return lesson.day === maxDay;
  }, [lesson, course, lessons]);

  if (!lesson || !course) throw notFound();

  const onQuizComplete = async (score: number, total: number) => {
    if (!isFinalLesson) return;
    if (score !== total || total === 0) return;
    if (firedRef.current) return;
    if (!session || role === "admin") return;
    firedRef.current = true;
    try {
      const res = await issueCert({
        data: { courseId: course.id, courseCode: course.code || "GEN", courseTitle: course.title },
      });
      toast.success(
        res.alreadyIssued
          ? `Certificate ${res.number} re-sent to your email.`
          : `Certificate ${res.number} issued and emailed to you!`,
      );
    } catch (e: unknown) {
      firedRef.current = false;
      const msg = e instanceof Error ? e.message : "Could not issue certificate";
      console.error("[Certificate auto-issue] failed:", e);
      toast.error(msg);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <Link to="/courses/$courseId" params={{ courseId: course.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to {course.title}
      </Link>
      <div className="mt-3">
        <p className="text-xs font-mono uppercase tracking-wider text-[color:var(--brand-blue)]">Day {lesson.day} · Demo Lesson{isFinalLesson ? " · Final" : ""}</p>
        <h1 className="mt-1 text-3xl font-bold text-[color:var(--brand-navy)] md:text-4xl">{lesson.title}</h1>
      </div>

      <Card className="mt-6 overflow-hidden py-0">
        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[color:var(--brand-navy)] to-[color:var(--brand-blue)] text-white">
          <div className="text-center">
            <PlayCircle className="mx-auto h-20 w-20 opacity-80" />
            <p className="mt-3 text-sm text-white/80">Video lesson placeholder — real video plugs in here</p>
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-bold text-[color:var(--brand-navy)]">Practice this lesson</h2>
        <p className="text-sm text-muted-foreground">
          {isFinalLesson
            ? "Pass this final quiz to earn your course certificate — it will be emailed to you automatically."
            : "Reinforce what you just watched. Choose chat practice or a quick quiz."}
        </p>
        <div className="mt-4">
          <PracticePanel lesson={lesson} timeLimit={course.dailyTimeLimit} adminEmail={email} onQuizComplete={onQuizComplete} />
        </div>
      </div>
    </div>
  );
}
