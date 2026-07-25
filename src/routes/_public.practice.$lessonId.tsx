import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { PlayCircle, ArrowLeft, CheckCircle2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PracticePanel } from "@/components/PracticePanel";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { issueCertificateForCompletion } from "@/lib/certificates.functions";
import { listMyEnrollments, listMyProgress, markLessonComplete } from "@/lib/enrollments.functions";

export const Route = createFileRoute("/_public/practice/$lessonId")({
  component: PracticeDemo,
});

function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return null;
  }
}

function PracticeDemo() {
  const { lessonId } = Route.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const lesson = useStore((s) => s.lessons.find((l) => l.id === lessonId));
  const lessons = useStore((s) => s.lessons);
  const course = useStore((s) => s.courses.find((c) => c.id === lesson?.courseId));
  const email = useStore((s) => s.settings.email);
  const { session, role } = useAuth();
  const isStudent = !!session && role !== "admin";
  const issueCert = useServerFn(issueCertificateForCompletion);
  const markCompleteFn = useServerFn(markLessonComplete);
  const listEnrollmentsFn = useServerFn(listMyEnrollments);
  const listProgressFn = useServerFn(listMyProgress);
  const firedRef = useRef(false);
  const [marking, setMarking] = useState(false);

  const enrollmentsQ = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => listEnrollmentsFn({}),
    enabled: isStudent,
  });
  const progressQ = useQuery({
    queryKey: ["my-progress", course?.id],
    queryFn: () => listProgressFn({ data: { courseId: course!.id } }),
    enabled: isStudent && !!course,
  });

  const courseLessons = useMemo(
    () => (course ? lessons.filter((l) => l.courseId === course.id).sort((a, b) => a.day - b.day) : []),
    [lessons, course],
  );
  const lessonIndex = courseLessons.findIndex((l) => l.id === lessonId);

  const isFinalLesson = useMemo(() => {
    if (!lesson || !course || courseLessons.length === 0) return false;
    return lesson.id === courseLessons[courseLessons.length - 1].id;
  }, [lesson, course, courseLessons]);

  if (!lesson || !course) throw notFound();

  const enrolled = !!enrollmentsQ.data?.some((e) => e.course_id === course.id);
  const completedIds = new Set((progressQ.data ?? []).map((p) => p.lesson_id));
  const isCompleted = completedIds.has(lesson.id);
  const isFreePreview = lessonIndex === 0;
  const previousCompleted = lessonIndex <= 0 || completedIds.has(courseLessons[lessonIndex - 1]?.id);

  // Gate: non-enrolled students (or guests) may only view the first lesson.
  // Enrolled students must complete previous lesson to unlock.
  const locked = (() => {
    if (role === "admin") return false;
    if (!enrolled) return !isFreePreview;
    return !previousCompleted;
  })();

  const embedUrl = toEmbedUrl(lesson.videoUrl);

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

  async function handleMarkComplete() {
    if (!isStudent) {
      toast.info("Sign in as a student to save progress.");
      return;
    }
    if (!enrolled) {
      toast.info("Enroll in the course to track your progress.");
      return;
    }
    setMarking(true);
    try {
      await markCompleteFn({ data: { courseId: course.id, lessonId: lesson.id } });
      await qc.invalidateQueries({ queryKey: ["my-progress", course.id] });
      toast.success("Lesson marked complete!");
      const next = courseLessons[lessonIndex + 1];
      if (next) nav({ to: "/practice/$lessonId", params: { lessonId: next.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save progress");
    } finally {
      setMarking(false);
    }
  }

  if (locked) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 text-center">
        <Lock className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold text-[color:var(--brand-navy)]">This lesson is locked</h1>
        <p className="mt-2 text-muted-foreground">
          {!enrolled
            ? "Enroll in this course to unlock all lessons."
            : "Complete the previous lesson first to unlock this one."}
        </p>
        <Button asChild className="mt-6 bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">
          <Link to="/courses/$courseId" params={{ courseId: course.id }}>Back to course</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <Link to="/courses/$courseId" params={{ courseId: course.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to {course.title}
      </Link>
      <div className="mt-3">
        <p className="text-xs font-mono uppercase tracking-wider text-[color:var(--brand-blue)]">
          Day {lesson.day} · Lesson {lessonIndex + 1} of {courseLessons.length}
          {isFinalLesson ? " · Final" : ""}
          {!enrolled && isFreePreview ? " · Free Preview" : ""}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-[color:var(--brand-navy)] md:text-4xl">{lesson.title}</h1>
      </div>

      <Card className="mt-6 overflow-hidden py-0">
        {embedUrl ? (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={lesson.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-[color:var(--brand-navy)] to-[color:var(--brand-blue)] text-white">
            <div className="text-center">
              <PlayCircle className="mx-auto h-20 w-20 opacity-80" />
              <p className="mt-3 text-sm text-white/80">Video coming soon</p>
            </div>
          </div>
        )}
      </Card>

      {(lesson.chatbotEnabled || lesson.quizEnabled) && (
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
      )}

      {isStudent && enrolled && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-sm">
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="font-medium">You've completed this lesson.</span>
              </>
            ) : (
              <span className="text-muted-foreground">When you're done with the video and practice, mark it complete.</span>
            )}
          </div>
          <Button
            onClick={handleMarkComplete}
            disabled={marking || isCompleted}
            className="bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90"
          >
            {isCompleted ? "Completed" : marking ? "Saving…" : "Mark lesson complete"}
          </Button>
        </div>
      )}

      {!enrolled && (
        <div className="mt-8 rounded-lg border bg-[color:var(--brand-blue)]/5 p-4 text-center text-sm">
          <p className="text-muted-foreground">Enjoying the preview?</p>
          <Button asChild className="mt-2 bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">
            <Link to="/courses/$courseId" params={{ courseId: course.id }}>Enroll to unlock all lessons →</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
