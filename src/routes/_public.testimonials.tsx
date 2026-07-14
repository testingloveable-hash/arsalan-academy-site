import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_public/testimonials")({
  component: Page,
  head: () => ({ meta: [{ title: "Success Stories — Arsalan Academy" }] }),
});

function Page() {
  const testimonials = useStore((s) => s.testimonials);
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--brand-blue)]">Testimonials</p>
      <h1 className="mt-2 text-5xl font-bold text-[color:var(--brand-navy)]">Success stories</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">Words from students who trained with us.</p>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <Card key={t.id} className="p-6">
            <div className="flex gap-1 text-[color:var(--brand-blue)]">{"★".repeat(t.rating)}</div>
            <p className="mt-3 text-sm leading-relaxed text-foreground/80">"{t.quote}"</p>
            <p className="mt-4 text-sm font-semibold text-[color:var(--brand-navy)]">{t.name}</p>
            <p className="text-xs text-muted-foreground">{t.course}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}