import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_public/blog")({
  component: Blog,
  head: () => ({ meta: [{ title: "Blog — Arsalan Academy" }] }),
});

const posts = [
  { title: "5 Tips to Boost Your IELTS Speaking Score", excerpt: "Simple techniques that examiners actually reward.", date: "Jul 2026", tag: "IELTS" },
  { title: "How Daily Practice Beats Cramming for TOEFL", excerpt: "Why 20 minutes a day trumps 4-hour weekend sessions.", date: "Jun 2026", tag: "TOEFL" },
  { title: "O Level English: Structuring a Directed Writing Response", excerpt: "A template that works for letters, reports, and articles.", date: "Jun 2026", tag: "O Level" },
  { title: "Speak With Confidence: 3 Habits to Kill Hesitation", excerpt: "Small daily rituals that transform your fluency.", date: "May 2026", tag: "Functional English" },
];

function Blog() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--brand-blue)]">Resources</p>
      <h1 className="mt-2 text-5xl font-bold text-[color:var(--brand-navy)]">Blog & study tips</h1>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {posts.map((p) => (
          <Card key={p.title} className="p-6 transition-shadow hover:shadow-lg">
            <p className="text-xs font-semibold uppercase text-[color:var(--brand-blue)]">{p.tag} · {p.date}</p>
            <h3 className="mt-2 text-xl font-semibold text-[color:var(--brand-navy)]">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.excerpt}</p>
            <p className="mt-4 text-sm font-medium text-[color:var(--brand-blue)]">Read more →</p>
          </Card>
        ))}
      </div>
    </div>
  );
}