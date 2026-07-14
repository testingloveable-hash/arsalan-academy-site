import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ListVideo, Users, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

function Overview() {
  const courses = useStore((s) => s.courses);
  const lessons = useStore((s) => s.lessons);

  const stats = [
    { label: "Total Courses", value: courses.length, icon: BookOpen, href: "/admin/courses" },
    { label: "Total Lessons", value: lessons.length, icon: ListVideo, href: "/admin/lessons" },
    { label: "Active Students", value: 0, icon: Users, href: "/admin/students", hint: "Placeholder" },
    { label: "Extra Time Requests", value: 0, icon: Mail, href: "/admin/limits", hint: "Via email" },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-sm text-muted-foreground">Quick snapshot of your academy.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} to={s.href}>
            <Card className="p-5 transition-shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <s.icon className="h-6 w-6 text-[color:var(--brand-blue)]" />
                {"hint" in s && s.hint && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.hint}</span>}
              </div>
              <p className="mt-4 text-3xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold">Quick actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/admin/courses" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Add a course</Link>
          <Link to="/admin/lessons" className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-accent">Add a lesson</Link>
          <Link to="/admin/testimonials" className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-accent">Add testimonial</Link>
          <Link to="/admin/settings" className="rounded-md border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-accent">Edit site copy</Link>
        </div>
      </Card>

      <Card className="border-dashed p-6">
        <h3 className="font-semibold">Phase 2 preview</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Student accounts, real-time practice tracking, and automated extra-time requests will appear here once
          the login system is enabled.
        </p>
      </Card>
    </div>
  );
}