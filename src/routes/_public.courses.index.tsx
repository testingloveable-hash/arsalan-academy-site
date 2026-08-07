import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CATEGORIES, useStore, type Category } from "@/lib/store";

export const Route = createFileRoute("/_public/courses/")({
  component: CoursesPage,
  head: () => ({ meta: [{ title: "Courses — Arsalan Academy" }, { name: "description", content: "Browse IELTS, TOEFL, O & A Level English, Functional English, and Teachers' Training courses." }] }),
});

function CoursesPage() {
  const courses = useStore((s) => s.courses);
  const [filter, setFilter] = useState<Category | "All">("All");
  const filtered = filter === "All" ? courses : courses.filter((c) => c.category === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--brand-blue)]">Catalog</p>
        <h1 className="mt-2 text-5xl font-bold text-[color:var(--brand-navy)]">All Courses</h1>
        <p className="mt-4 text-muted-foreground">Structured, CELTA-informed programs with daily practice built in.</p>
      </div>
      <div className="mt-8 flex flex-wrap gap-2">
        {(["All", ...CATEGORIES] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === c ? "border-[color:var(--brand-blue)] bg-[color:var(--brand-blue)] text-white" : "border-border bg-white hover:border-[color:var(--brand-blue)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed bg-white p-12 text-center">
          <h2 className="text-xl font-semibold text-[color:var(--brand-navy)]">No courses available yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            {courses.length === 0
              ? "New programmes are being prepared. Please check back soon or get in touch to register your interest."
              : "No courses match this category right now."}
          </p>
          <Button asChild className="mt-6 bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">
            <Link to="/contact">Contact us</Link>
          </Button>
        </div>
      ) : (
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <Card key={c.id} className="flex flex-col overflow-hidden py-0 transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="aspect-video overflow-hidden bg-muted">
              <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-[color:var(--brand-blue)]/10 text-[color:var(--brand-blue)]">{c.category}</Badge>
                <span className="text-xs text-muted-foreground">{c.level}</span>
              </div>
              <h3 className="text-lg font-semibold text-[color:var(--brand-navy)]">{c.title}</h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-auto flex items-center justify-between border-t pt-3 text-xs">
                <span className="text-muted-foreground">{c.daysLabel} · {c.daysPerWeek}/wk</span>
                <span className="font-semibold">{c.price}</span>
              </div>
              <Button asChild className="bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">
                <Link to="/courses/$courseId" params={{ courseId: c.id }}>View Course</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}