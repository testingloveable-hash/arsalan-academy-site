import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper } from "lucide-react";

export const Route = createFileRoute("/_public/blog")({
  component: Blog,
  head: () => ({
    meta: [
      { title: "Blog & Study Tips — Arsalan Academy" },
      { name: "description", content: "English learning articles and study tips from Arsalan Academy." },
      { property: "og:title", content: "Blog & Study Tips — Arsalan Academy" },
      { property: "og:description", content: "English learning articles and study tips from Arsalan Academy." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Blog() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <p className="text-sm font-semibold uppercase tracking-wider text-[color:var(--brand-blue)]">Resources</p>
      <h1 className="mt-2 text-5xl font-bold text-[color:var(--brand-navy)]">Blog & study tips</h1>
      <Card className="mt-12 border-dashed p-14 text-center">
        <Newspaper className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
        <h2 className="text-lg font-semibold text-[color:var(--brand-navy)]">No articles published yet</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Study tips and exam guides from Sir Arsalan will appear here soon.
        </p>
        <Button asChild className="mt-6 bg-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue)]/90">
          <Link to="/courses">Explore Courses</Link>
        </Button>
      </Card>
    </div>
  );
}
