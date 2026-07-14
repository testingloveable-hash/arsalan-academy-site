import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PlayCircle, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PracticePanel } from "@/components/PracticePanel";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_public/practice/$lessonId")({
  component: PracticeDemo,
});

function PracticeDemo() {
  const { lessonId } = Route.useParams();
  const lesson = useStore((s) => s.lessons.find((l) => l.id === lessonId));
  const course = useStore((s) => s.courses.find((c) => c.id === lesson?.courseId));
  const email = useStore((s) => s.settings.email);

  if (!lesson || !course) throw notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <Link to="/courses/$courseId" params={{ courseId: course.id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to {course.title}
      </Link>
      <div className="mt-3">
        <p className="text-xs font-mono uppercase tracking-wider text-[color:var(--brand-blue)]">Day {lesson.day} · Demo Lesson</p>
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
        <p className="text-sm text-muted-foreground">Reinforce what you just watched. Choose chat practice or a quick quiz.</p>
        <div className="mt-4">
          <PracticePanel lesson={lesson} timeLimit={course.dailyTimeLimit} adminEmail={email} />
        </div>
      </div>
    </div>
  );
}